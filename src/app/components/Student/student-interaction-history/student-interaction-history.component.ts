import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from 'src/app/services/auth.service';
import { SharedService } from 'src/app/services/shared.service';
import { StudentService } from 'src/app/services/student.service';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import { Message, User } from 'src/app/shared/interfaces/psql.interface';
import { StudentAppeal } from 'src/app/shared/interfaces/student.interface';

@Component({
  selector: 'app-student-interaction-history',
  templateUrl: './student-interaction-history.component.html',
  styleUrls: ['./student-interaction-history.component.scss'],
})
export class StudentInteractionHistoryComponent {
  @Output() customTitleChange: EventEmitter<string> =
    new EventEmitter<string>();
  @Input() appeal_id: number;
  @Input() student_id: number;
  @Input() currentAppeal: StudentAppeal;
  @ViewChild('chat-item') chatItem: ElementRef;
  @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;

  session: Session;
  loading: boolean = true;
  studentUserId: string;
  chatInputMessage: string = '';
  messageCount: number = 0;
  fromGrader = false;
  isUser: Boolean;
  appealId: number;
  messages!: Message[];
  professor: User;
  student: User;

  studentAppeals!: StudentAppeal[];
  loadStudentAppeals = false;

  constructor(
    private route: ActivatedRoute,
    private authService: SupabaseService,
    private studentService: StudentService,
    private sharedService: SharedService
  ) {}
  async ngOnInit() {
    const session = (await this.authService.getSession()) as Session;
    const user = session.user;
    this.appealId = this.route.snapshot.params['appealId'];
    const appealId = this.appealId;
    console.log({ appealId });
    // this.studentUserId = (await this.authService.getUserId()) as string;
    this.student = await this.sharedService.getUserInfo(user.id);
    this.studentAppeals = await this.studentService.fetchStudentAppeals(
      user.id
    );

    this.currentAppeal = this.studentAppeals[0];
    this.professor = await this.sharedService.getUserInfo(
      this.currentAppeal.professor_id
    );
    this.messages = await this.sharedService.fetchStudentMessages(
      this.currentAppeal.appeal_id,
      this.student.id,
      this.professor.id
    );
    console.log(this.currentAppeal);
    this.loadStudentAppeals = true;
    this.messageCount = this.messages.length;
    this.loading = false;
    console.log(this.messages);
    this.handleMessageUpdates();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  useTemplate() {}

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  /**
   * subscription to database changes
   * filters on appeals
   */
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

  /**
   * Select appeal from left
   * @param appeal
   */
  async selectAppeal(appeal: any) {
    // Copy the selected appeal's data into the form fields
    this.currentAppeal = appeal;
    this.handleMessageUpdates();

    //this.sender.id = this.currentAppeal.student_id;
    this.messages = await this.sharedService.fetchStudentMessages(
      this.currentAppeal.appeal_id,
      this.student.id,
      this.professor.id
    );
    console.log(this.currentAppeal);
  }

  /**
   * Submit student appeal to database
   */
  async sendMessage(
    message: string,
    notification: boolean = false
  ): Promise<void> {
    const now = getTimestampTz(new Date());

    try {
      const professorID = this.professor.id;
      const studentID = this.student.id;

      await this.sharedService.insertMessage(
        this.currentAppeal.appeal_id,
        studentID, //sender id: student
        professorID, //recipientid : professor
        now,
        message,
        this.fromGrader,
        `${this.student.first_name} ${this.student.last_name}`,
        `${this.professor.first_name} ${this.professor.last_name}`
      );
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
}
