import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { GraderService } from 'src/app/services/grader.service';
import { SharedService } from 'src/app/services/shared.service';
import {
  Message,
  Professor,
  Course,
  Grader,
} from 'src/app/shared/interfaces/psql.interface';
import {
  GraderAppeal,
  StudentAppeal,
} from 'src/app/shared/interfaces/student.interface';
@Component({
  selector: 'app-grader-interaction-history',
  templateUrl: './grader-interaction-history.component.html',
  styleUrls: ['./grader-interaction-history.component.scss'],
})
export class GraderInteractionHistoryComponent {
  @Output() customTitleChange: EventEmitter<string> =
    new EventEmitter<string>();
  @Input() appeal_id: number;
  @Input() student_id: number;
  @Input() currentAppeal: GraderAppeal;
  @ViewChild('chat-item') chatItem: ElementRef;
  @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;

  session: Session;
  user: User;
  grader: Grader;
  noAppealsMessage: string = '';
  chatInputMessage: string = '';
  messageCount: number = 0;
  fromGrader = true;
  noAppeals = true;
  isUser: Boolean;
  appealId: number;
  courseId: number;
  messages!: Message[];
  messageLoaded = false;
  currentProfessor: string | null = '';
  currentCourse: Course | null;

  professor: Professor;
  studentAppeals!: StudentAppeal[];
  graderAppeals!: GraderAppeal[];
  professors!: Professor[];
  professorIds: [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private graderService: GraderService,
    private sharedService: SharedService
  ) {
    this.route.params.subscribe((params) => {
      this.appealId = +params['id']; // Convert the parameter to a number
      this.courseId = +params['id'];
    });
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
        this.grader = {
          id: this.user.id,
          first_name: this.user.user_metadata['first_name'],
          last_name: this.user.user_metadata['last_name'],
          email: this.user.email as string,
        };
      }
    });
  }
  async ngOnInit() {
    const isGrader = await this.graderService.isGrader(this.grader.id);
    if (!isGrader) {
      this.noAppeals = true;
      this.noAppealsMessage = 'You are not assigned as a grader to any courses';
    } else {
      // if navigated from course dashboard, only get the appeals for that course
      if (this.courseId) {
        this.graderAppeals = await this.graderService.fetchCourseGraderAppeals(
          this.grader.id,
          this.courseId
        );

        this.currentCourse = await this.sharedService.getCourse(this.courseId);
      }
      // otherwise, get all assigned appeals from all courses the grader is grading
      else {
        console.log(this.grader.id);
        this.graderAppeals = await this.graderService.fetchAllGraderAppeals(
          this.grader.id
        );
        console.log(this.graderAppeals, 'FROM GRADER IHC');
      }
      console.log(this.graderAppeals);
      this.noAppeals = this.graderAppeals.length === 0 ? true : false;

      // grader has appeals
      if (!this.noAppeals) {
        this.currentAppeal =
          this.graderAppeals.find(
            (appeal) => appeal.appeal_id === this.appealId
          ) || this.graderAppeals[0];

        if (this.currentAppeal) {
          this.messages = await this.sharedService.fetchMessages(
            this.currentAppeal.appeal_id
          );
          console.log('messages', this.messages);
        } else {
          this.currentAppeal = this.graderAppeals[0];
          this.messages = await this.sharedService.fetchMessages(
            this.currentAppeal.appeal_id
          );
        }
        const { sender_id, recipient_id } = this.messages[0];
        const pid = sender_id === this.grader.id ? recipient_id : sender_id;
        this.professor = await this.sharedService.getProfessor(pid);
        this.messageLoaded = true;
        this.messageCount = this.messages.length;
        this.handleMessageUpdates();
      }
      // grader has no appeals
      else {
        console.log("Grader doesn't have any appeals");
        this.noAppealsMessage = 'You have not been assigned to any appeals';
      }
      console.log(this.messages);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  handleMessageUpdates() {
    console.log('current appeal is: ', this.currentAppeal.appeal_id);
    this.sharedService
      .getTableChanges(
        'Messages',
        `message-channel`,
        `appeal_id=eq.${this.currentAppeal.appeal_id}`
      )
      .subscribe(async (update: any) => {
        console.log({ update });
        // if insert or update event, get new row
        // if delete event, get deleted row ID
        const record = update.new?.id ? update.new : update.old;
        // INSERT or DELETE
        const event = update.eventType;
        if (!record) return;
        // new student inserted
        if (event === 'INSERT') {
          // get new message
          const record: Message = update.new;
          // show new message
          this.messages.push(record);
        }
      });
  }

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  async selectAppeal(appeal: GraderAppeal) {
    try {
      this.currentAppeal = appeal;
      // change filter
      this.handleMessageUpdates();
      console.log(this.currentAppeal.appeal_id);
      this.messages = await this.sharedService.fetchMessages(
        this.currentAppeal.appeal_id
      );
    } catch (e) {
      console.log({ e });
    }
  }

  /**
   * Submit student appeal to database
   */
  async sendMessage(
    message: string,
    notification: boolean = false
  ): Promise<void> {
    if (notification === true) {
      message = 'Notification:' + message;
    }
    try {
      await this.sharedService.insertMessage(
        this.currentAppeal.appeal_id,
        this.grader.id, //sender id: grader
        this.professor.id, //recipientid : professor??
        new Date(),
        this.chatInputMessage,
        this.fromGrader,
        `${this.grader.first_name} ${this.grader.last_name}`,
        `${this.professor.first_name} ${this.professor.last_name}`
      );

      this.chatInputMessage = '';
      this.scrollToBottom();
    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
    console.log(this.messages);
  }

  formatTimestamp(timestamp: Date): { date: string; time: string } {
    const d = new Date(timestamp);
    const date = d.toDateString();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format

    const time = `${formattedHours}:${minutes
      .toString()
      .padStart(2, '0')} ${ampm}`;
    return { date, time };
  }
}
