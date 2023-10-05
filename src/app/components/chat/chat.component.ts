import {
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Message } from 'src/app/shared/interfaces/psql.interface';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
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
  user= {
    id: 0 ,
    email: "abc123@gmail.com",
  };
  sender = {
    id: 0 ,
    email: "ccc1233@gmail.com",
  };

  // export interface Message {
  //   id: number;
  //   created_at: Date;
  //   sender_id: number;
  //   recipient_id: number;
  //   appeal_id: number;
  //   message_text: string;
  //   from_grader: boolean;
  // }
  // export interface ProfessorAppeal {
  //   appeal_id: number;
  //   appeal_text: string;
  //   assignment_id: number;
  //   code: number;
  //   created_at: Date;
  //   is_open: boolean;
  //   prefix: string;
  //   student_id: number;
  //   student_name: string;
  // }
  professorAppeals!: ProfessorAppeal[];

  constructor(private supabase: SupabaseService) {}
  async ngOnInit() {
    this.user.id = 10; //TODO make this actual user ID not just fake data
    if (this.current_appeal){
      this.sender.id = this.current_appeal.student_id;
      this.messages = await this.supabase.fetchMessages(this.current_appeal.appeal_id);
    }
    this.professorAppeals = await this.supabase.fetchProfessorAppeals(1);
  }


  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  send() {
    this.messages.push({
      id: 1 + this.messageCount,     //TODO make id better system
      created_at: new Date(), 
      sender_id: this.user.id, 
      recipient_id: this.current_appeal.student_id, 
      appeal_id: this.current_appeal.appeal_id, 
      message_text: this.chatInputMessage, 
      from_grader: this.fromGrader
    });
    this.messageCount ++;
    this.chatInputMessage = '';
    this.scrollToBottom();
  }
  useTemplate(){
    
  }

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

    // Function to select an appeal
    async selectAppeal(appeal: any) {
      // Copy the selected appeal's data into the form fields
      this.current_appeal = appeal;
      this.sender.id = this.current_appeal.student_id;
      this.messages = await this.supabase.fetchMessages(this.current_appeal.appeal_id);
      console.log(this.current_appeal);
    }
}
