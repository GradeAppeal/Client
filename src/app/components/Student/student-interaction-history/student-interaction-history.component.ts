import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { SupabaseService } from 'src/app/services/auth.service';
import { SharedService } from 'src/app/services/shared.service';
import { StudentService } from 'src/app/services/student.service';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import { Message } from 'src/app/shared/interfaces/psql.interface';
import { StudentAppeal } from 'src/app/shared/interfaces/student.interface';
import { STUDENT_UUID } from 'src/app/shared/strings';
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

  studentUserId: string;
  chatInputMessage: string = '';
  messageCount: number = 0;
  fromGrader = false;
  isUser: Boolean;
  appealId: number;
  messages!: Message[];
  user = {
    //student
    id: 3,
    email: 'abc123@gmail.com',
  };
  sender = {
    //professor
    id: 0,
    email: 'ccc1233@gmail.com',
  };

  studentAppeals!: StudentAppeal[];
  loadStudentAppeals = false;

  constructor(
    private authService: SupabaseService,
    private studentService: StudentService,
    private sharedService: SharedService
  ) {}
  async ngOnInit() {
    this.studentUserId = (await this.authService.getUserId()) as string;
    this.studentAppeals = await this.studentService.fetchStudentAppeals(
      STUDENT_UUID
    );
    if (this.currentAppeal) {
      //this.sender.id = this.current_appeal.student_id;
      this.messages = await this.sharedService.fetchMessages(
        this.currentAppeal.appeal_id
      );
    } else {
      this.currentAppeal = this.studentAppeals[0];
      this.messages = await this.sharedService.fetchMessages(
        this.currentAppeal.appeal_id
      );
    }
    this.loadStudentAppeals = true;
    this.messageCount = this.messages.length;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  useTemplate() {}

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  // Function to select an appeal
  async selectAppeal(appeal: any) {
    // Copy the selected appeal's data into the form fields
    this.currentAppeal = appeal;
    //this.sender.id = this.currentAppeal.student_id;
    this.messages = await this.sharedService.fetchMessages(
      this.currentAppeal.appeal_id
    );
    console.log(this.currentAppeal);
  }

  /**
   * Submit student appeal to database
   */
  async sendMessage(): Promise<void> {
    const now = getTimestampTz(new Date());

    try {
      let professor_user_id = await this.sharedService.getUserId(
        this.currentAppeal.professor_id,
        'professor'
      );
      console.log(professor_user_id);
      console.log(this.user.id);
      await this.sharedService.insertMessages(
        this.currentAppeal.appeal_id,
        this.user.id, //sender id: student
        professor_user_id, //recipientid : professor
        now,
        this.chatInputMessage,
        this.fromGrader
      );
      console.log('Sent to database!');
      this.messages.push({
        id: 1 + this.messageCount, //TODO make id better system
        created_at: getTimestampTz(new Date()),
        sender_id: this.user.id,
        recipient_id: professor_user_id,
        appeal_id: this.currentAppeal.appeal_id,
        message_text: this.chatInputMessage,
        from_grader: this.fromGrader,
      });

      this.chatInputMessage = '';
      this.scrollToBottom();
      console.log(this.messages);
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
