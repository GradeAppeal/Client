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

  chatInputMessage: string = '';
  messageCount: number = 0;
  fromGrader = true;
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
  graderAppeals!: GraderAppeal[];

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {
    this.route.params.subscribe((params) => {
      this.appealId = +params['id']; // Convert the parameter to a number
      console.log(this.appealId);
    });
  }
  async ngOnInit() {
    this.graderAppeals = await this.supabase.fetchGraderAppeals(1);
    console.log(this.graderAppeals);
    this.currentAppeal =
      this.graderAppeals.find((appeal) => appeal.appeal_id === this.appealId) ||
      this.graderAppeals[0];
    if (this.currentAppeal) {
      //this.sender.id = this.currentAppeal.student_id;
      this.messages = await this.supabase.fetchMessages(
        this.currentAppeal.appeal_id
      );
    } else {
      this.currentAppeal = this.graderAppeals[0];
      this.messages = await this.supabase.fetchMessages(
        this.currentAppeal.appeal_id
      );
    }
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
    this.messages = await this.supabase.fetchMessages(
      this.currentAppeal.appeal_id
    );
    console.log(this.currentAppeal);
  }

  /**
   * Submit student appeal to database
   */
  async sendMessage(): Promise<void> {
    const now = getTimestampTz(new Date());
    const student_user_id = 10; //TODO fix this
    try {
      console.log(this.user.id);
      // await this.supabase.insertMessages(
      //   this.currentAppeal.appeal_id,
      //   this.user.id, //sender id: grader
      //   student_user_id, //recipientid : student
      //   now,
      //   this.chatInputMessage,
      //   this.fromGrader
      // );
      await this.supabase.insertMessages(
        15,
        this.user.id, //sender id: grader
        10, //recipientid : student
        now,
        this.chatInputMessage,
        this.fromGrader
      );
      console.log('Sent to database!');
      this.messages.push({
        id: 1 + this.messageCount, //TODO make id better system
        created_at: getTimestampTz(new Date()),
        sender_id: this.user.id,
        recipient_id: student_user_id,
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
