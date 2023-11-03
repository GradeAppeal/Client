import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Message } from 'src/app/shared/interfaces/psql.interface';
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

  chatInputMessage: string = '';
  messageCount: number = 0;
  fromGrader = false;
  isUser: Boolean;
  appealId: number;
  messages!: Message[];
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

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {
    this.route.params.subscribe((params) => {
      this.appealId = +params['id']; // Convert the parameter to a number
    });
  }
  async ngOnInit() {
    this.studentAppeals = await this.supabase.fetchStudentAppeals(1);
    console.log(this.studentAppeals);
    this.selectAppeal(
      this.studentAppeals.find(
        (appeal) => appeal.appeal_id === this.appealId
      ) || this.studentAppeals[0]
    );
    if (this.currentAppeal) {
      //if appeal exists, find messages for it
      this.selectAppeal(this.currentAppeal);
    } else {
      this.selectAppeal(this.studentAppeals[0]);
    }
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
    this.messages = await this.supabase.fetchMessages(
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
    if (notification === true) {
      message = 'Notification:' + message;
    }
    try {
      console.log(this.professor.id);
      console.log(this.student.id);
      await this.supabase.insertMessages(
        this.currentAppeal.appeal_id,
        this.student.id, //sender id: student
        this.professor.id, //recipientid : professor
        now,
        this.chatInputMessage,
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
