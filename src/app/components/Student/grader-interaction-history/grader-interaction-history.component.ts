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
import { SupabaseService } from 'src/app/services/auth.service';
import { GraderService } from 'src/app/services/grader.service';
import { SharedService } from 'src/app/services/shared.service';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import {
  Message,
  Professor,
  Course,
  Student,
} from 'src/app/shared/interfaces/psql.interface';
import {
  GraderAppeal,
  StudentAppeal,
} from 'src/app/shared/interfaces/student.interface';
import { PROFESSOR_UUID } from 'src/app/shared/strings';
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
  noAppealsMessage: string = '';
  chatInputMessage: string = '';
  messageCount: number = 0;
  fromGrader = true;
  noAppeals = true;
  isUser: Boolean;
  appealId: number;
  courseId: number;
  messages!: Message[];
  currentProfessor: string | null = '';
  currentCourse: Course | null;
  grader: any;
  professor: any;
  studentAppeals!: StudentAppeal[];
  graderAppeals!: GraderAppeal[];
  professors!: Professor[];
  professorIds: [];

  constructor(
    private route: ActivatedRoute,
    private authService: SupabaseService,
    private graderService: GraderService,
    private sharedService: SharedService
  ) {
    this.route.params.subscribe((params) => {
      this.appealId = +params['id']; // Convert the parameter to a number
      this.courseId = +params['id'];
    });
  }
  async ngOnInit() {
    this.session = (await this.authService.getSession()) as Session;
    // get auth user info from auth session
    this.user = this.session.user;
    this.grader = this.user;
    console.log(this.grader);

    const isGrader = await this.graderService.isGrader(this.user.id);
    if (!isGrader) {
      this.noAppeals = true;
      this.noAppealsMessage = 'You are not assigned as a grader to any courses';
    } else {
      // if navigated from course dashboard, only get the appeals for that course
      if (this.courseId) {
        this.graderAppeals = await this.graderService.fetchCourseGraderAppeals(
          this.user.id,
          this.courseId
        );
        this.currentCourse = await this.sharedService.getCourse(this.courseId);
      }
      // otherwise, get all assigned appeals from all courses the grader is grading
      else {
        this.graderAppeals = await this.graderService.fetchAllGraderAppeals(
          this.user.id
        );
      }

      this.graderAppeals.forEach((item) => {
        console.log({ item });
      });
      // this.professors = await this.graderService.fetchProfessors();
      const professors = this.professors;
      console.log({ professors });
      this.professorIds;
      console.log(this.graderAppeals);
      console.log(this.professors);

      // show appeals if they exist, otherwise display message
      if (this.graderAppeals.length > 0) {
        console.log(this.graderAppeals[0]);
        //await this.selectAppeal(this.graderAppeals[0]);
        this.currentAppeal = this.graderAppeals[0];
        //select current appeal based on id from url. Otherwise, set to first appeal
        // if (this.currentAppeal) {
        //   //if appeal exists, find messages for it
        //   this.selectAppeal(this.currentAppeal);
        // } else {
        //   this.selectAppeal(this.graderAppeals[0]);
        // }
        //this.messageCount = this.messages.length;

        console.log(this.messages);
        this.noAppeals = false;
      } else {
        this.noAppeals = true;
        this.noAppealsMessage = `No appeals assigned for ${this.currentCourse?.prefix}-${this.currentCourse?.code}`;
      }
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  async selectAppeal(appeal: GraderAppeal) {
    try {
      this.currentAppeal = appeal;
      console.log(this.currentAppeal.appeal_id);
      this.messages = await this.sharedService.fetchMessages(
        this.currentAppeal.appeal_id
      );

      console.log(this.messages[0].sender_id);
      console.log(this.grader.id);
      // Find the first message that doesn't match the grader
      let firstNonGraderMessage = this.messages.find(
        (message) => message.sender_id !== this.grader.id
      );

      if (
        firstNonGraderMessage !== undefined &&
        firstNonGraderMessage.sender_id !== undefined
      ) {
        console.log('Assign prof');
        try {
          this.professor = await this.sharedService.getUserInfo(
            firstNonGraderMessage.sender_id
          );
        } catch (e) {
          console.log('No professor found' + e);
        }
      } else {
        console.log('No non-grader messages found.');
      }
      console.log(this.professor);
      console.log(this.messages);
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
        this.user.id, //sender id: grader
        PROFESSOR_UUID, //recipientid : professor??
        new Date(),
        this.chatInputMessage,
        this.fromGrader
      );
      this.localSendMessage(message);
      this.chatInputMessage = '';
      this.scrollToBottom();
    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
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

  localSendMessage(message: string) {
    this.messages.push({
      message_id: 1 + this.messageCount, //TODO make id better system
      created_at: getTimestampTz(new Date()),
      sender_id: this.grader.id,
      recipient_id: PROFESSOR_UUID, //todo fix... professor?
      appeal_id: this.currentAppeal.appeal_id,
      message_text: this.chatInputMessage,
      from_grader: this.fromGrader,
      sender_name: '',
      recipient_name: '',
    });
  }
}
