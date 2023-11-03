import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  professor: string;
  student: string;
  student = {
    //student
    id: 3,
    email: 'abc123@gmail.com',
    name: 'Sample',
  };
  professor = {
    //professor
    id: 0,
    email: 'ccc1233@gmail.com',
    name: 'Sample',
  };

  studentAppeals!: StudentAppeal[];
  loadStudentAppeals = false;

  constructor(
    private route: ActivatedRoute,
    private authService: SupabaseService,
    private studentService: StudentService,
    private sharedService: SharedService
  ) {}
  async ngOnInit() {
    this.appealId = this.route.snapshot.params['appealId'];
    const appealId = this.appealId;
    console.log({ appealId });
    this.studentUserId = (await this.authService.getUserId()) as string;
    this.studentAppeals = await this.studentService.fetchStudentAppeals(
      STUDENT_UUID
    );

    this.currentAppeal = this.studentAppeals[0];
    this.professor = `${this.currentAppeal.professor_first_name} ${this.currentAppeal.professor_last_name}`;
    this.student = await this.sharedService.getUserName(STUDENT_UUID);
    this.messages = await this.sharedService.fetchMessages(
      this.currentAppeal.appeal_id
    );

    this.loadStudentAppeals = true;
    this.messageCount = this.messages.length;
    this.professor.id = await this.supabase.getUserId(
      this.currentAppeal.professor_id,
      'professor'
    );
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
  async sendMessage(
    message: string,
    notification: boolean = false
  ): Promise<void> {
    const now = getTimestampTz(new Date());

    try {
      const professorID = this.currentAppeal.professor_id;
      const studentID = this.studentUserId;
      // let professor_user_id = await this.sharedService.getUserId(
      //   this.currentAppeal.professor_id,
      //   'professor'
      // );
      // console.log(professor_user_id);
      // console.log(this.user.id);
      await this.sharedService.insertMessages(
        this.currentAppeal.appeal_id,
        studentID, //sender id: student
        professorID, //recipientid : professor
        now,
        this.chatInputMessage,
        this.fromGrader
        this.fromGrader
      );
      console.log('Sent to database!');
      this.localSendMessage(message);
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
  localSendMessage(message: string) {
    this.messages.push({
      id: 1 + this.messageCount, //TODO make id better system
      created_at: getTimestampTz(new Date()),
      sender_id: this.student.id,
      recipient_id: this.professor.id,
      appeal_id: this.currentAppeal.appeal_id,
      message_text: message,
      from_grader: this.fromGrader,
      sender_name: '',
      recipient_name: '',
    });
  }
}
