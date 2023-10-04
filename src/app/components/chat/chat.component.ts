import {
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Message } from 'src/app/shared/interfaces/psql.interface';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  @Output() customTitleChange: EventEmitter<string> =
    new EventEmitter<string>();
  @Input() appeal_id: string;

  title = 'chat-ui';
  email = 'abc123@gmail.com';
  @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;
  chatInputMessage: string = '';
  messages!: Message[];
  user = {
    id: 1,
    email: 'abcd@gmail.com',
  };
  professor = {
    id: 1,
    email: '1234@gmail.com',
  };

  student = {
    id: 2,
    email: 'abc@gmail.com',
  };

  chats: {
    user: any;
    message: string;
  }[] = [
    {
      user: this.student,
      message: 'Hello professor. Please fix my grade. Thanks',
    },
  ];
  // export interface Message {
  //   id: number;
  //   created_at: Date;
  //   sender_id: number;
  //   recipient_id: number;
  //   appeal_id: number;
  //   message_text: string;
  //   from_grader: boolean;
  // }

  constructor(private supabase: SupabaseService) {}
  async ngOnInit() {
    this.messages = await this.supabase.fetchMessages(29);
    console.log(this.messages);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  send() {
    this.chats.push({
      message: this.chatInputMessage,
      user: this.professor,
    });

    this.chatInputMessage = '';
    this.scrollToBottom();
  }

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  generateFakeId(): string {
    const current = new Date();
    const timestamp = current.getTime();
    return timestamp.toString();
  }
}
