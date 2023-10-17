import {
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Message } from 'src/app/shared/interfaces/psql.interface';
@Component({
  selector: 'app-professor-interaction-history',
  templateUrl: './professor-interaction-history.component.html',
  styleUrls: ['./professor-interaction-history.component.scss'],
})
export class ProfessorInteractionHistoryComponent {
  @Output() customTitleChange: EventEmitter<string> =
    new EventEmitter<string>();
  @Input() appeal_id: number;
  @Input() student_id: number;
  @Input() current_appeal: ProfessorAppeal;
  @ViewChild('chat-item') chatItem: ElementRef;
  @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;

  chatInputMessage: string = '';
  messageCount: number = 0;
  fromGrader = false;
  isUser: Boolean;
  messages!: Message[];
  user = {
    id: 10,
    email: 'abc123@gmail.com',
  };
  sender = {
    id: 0,
    email: 'ccc1233@gmail.com',
  };

  professorAppeals!: ProfessorAppeal[];

  constructor(private supabase: SupabaseService) {}
  async ngOnInit() {
    this.user.id = 10; //TODO make this actual user ID not just fake data
    this.professorAppeals = await this.supabase.fetchProfessorAppeals(1);
    if (this.current_appeal) {
      //this.sender.id = this.current_appeal.student_id;
      this.messages = await this.supabase.fetchMessages(
        this.current_appeal.appeal_id
      );
    } else {
      this.current_appeal = this.professorAppeals[0];
      this.messages = await this.supabase.fetchMessages(
        this.current_appeal.appeal_id
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
    this.current_appeal = appeal;
    //this.sender.id = this.current_appeal.student_id;
    this.messages = await this.supabase.fetchMessages(
      this.current_appeal.appeal_id
    );
    console.log(this.current_appeal);
  }

  // async insertMessages(
  //   appid: number,
  //   sender_id: number,
  //   recipient_id: number,
  //   created_at: Date,
  //   message_text: string,
  //   from_grader: boolean
  // ):
  /**
   * Submit student appeal to database
   */
  async sendMessage(): Promise<void> {
    const now = getTimestampTz(new Date());

    try {
      console.log(this.current_appeal.student_id);
      let student_user_id = await this.supabase.getUserId(
        this.current_appeal.student_id,
        'student'
      );
      console.log(student_user_id);
      await this.supabase.insertMessages(
        this.current_appeal.appeal_id,
        this.user.id,         //professor user id
        student_user_id,        //student user id
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
        appeal_id: this.current_appeal.appeal_id,
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
}