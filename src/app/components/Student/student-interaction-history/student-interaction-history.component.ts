import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
  @Input() current_appeal: StudentAppeal;
  @ViewChild('chat-item') chatItem: ElementRef;
  @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;

  chatInputMessage: string = '';
  messageCount: number = 0;
  fromGrader = false;
  isUser: Boolean;
  messages!: Message[];
  user = {    //student
    id: 3,
    email: 'abc123@gmail.com',
  };
  sender = { //professor
    id: 0,
    email: 'ccc1233@gmail.com',
  };

  studentAppeals!: StudentAppeal[];

  constructor(private supabase: SupabaseService) {}
  async ngOnInit() {
    this.studentAppeals = await this.supabase.fetchStudentAppeals(1);
    if (this.current_appeal) {
      //this.sender.id = this.current_appeal.student_id;
      this.messages = await this.supabase.fetchMessages(
        this.current_appeal.appeal_id
      );
    } else {
      this.current_appeal = this.studentAppeals[0];
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

  /**
   * Submit student appeal to database
   */
  async sendMessage(): Promise<void> {
    const now = getTimestampTz(new Date());

    try {
      let professor_user_id = await this.supabase.getUserId(
        this.current_appeal.professor_id,
        'professor'
      );
      console.log(professor_user_id);
      console.log(this.user.id)
      await this.supabase.insertMessages(
        this.current_appeal.appeal_id,
        this.user.id,                    //sender id: student
        professor_user_id,               //recipientid : professor
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
