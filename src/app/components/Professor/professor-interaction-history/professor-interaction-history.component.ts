import {
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;
  currentAppeal: ProfessorAppeal;
  appealId: number;
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
    this.user.id = 10; //TODO make this actual user ID not just fake data
    this.professorAppeals = await this.supabase.fetchProfessorAppeals(1);
    this.currentAppeal =
      this.professorAppeals.find(
        (appeal) => appeal.appeal_id === this.appealId
      ) || this.professorAppeals[0];

    if (this.currentAppeal) {
      //this.sender.id = this.currentAppeal.student_id;
      this.messages = await this.supabase.fetchMessages(
        this.currentAppeal.appeal_id
      );
    } else {
      this.currentAppeal = this.professorAppeals[0];
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

    try {
      console.log(this.currentAppeal.student_id);
      let student_user_id = await this.supabase.getUserId(
        this.currentAppeal.student_id,
        'student'
      );
      console.log(student_user_id);
      await this.supabase.insertMessages(
        this.currentAppeal.appeal_id,
        this.user.id, //professor user id
        student_user_id, //student user id
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
      console.log(this.messages[this.messages.length - 1].created_at);
      this.currentAppeal.created_at =
        this.messages[this.messages.length - 1].created_at;
      console.log(this.currentAppeal.created_at);

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

  formatMessageTimestamp(timestamp: Date): string {
    //TODO make it show date if most recent message is more than a day
    const currentDate = new Date();
    const messageDate = new Date(timestamp);

    if (
      currentDate.getFullYear() === messageDate.getFullYear() &&
      currentDate.getMonth() === messageDate.getMonth() &&
      currentDate.getDate() === messageDate.getDate()
    ) {
      // If the message was sent today, display only the time
      const hours = messageDate.getHours().toString().padStart(2, '0');
      const minutes = messageDate.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      // If the message was sent on a different day, display the full date
      const year = messageDate.getFullYear();
      const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
      const day = messageDate.getDate().toString().padStart(2, '0');
      const hours = messageDate.getHours().toString().padStart(2, '0');
      const minutes = messageDate.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
  }
}
