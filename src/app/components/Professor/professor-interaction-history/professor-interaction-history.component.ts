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
import { formatTimestamp } from 'src/app/shared/functions/general.util';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import {
  ProfessorAppeal,
  ProfessorTemplate,
} from 'src/app/shared/interfaces/professor.interface';
import { Message } from 'src/app/shared/interfaces/psql.interface';
@Component({
  selector: 'app-professor-interaction-history',
  templateUrl: './professor-interaction-history.component.html',
  styleUrls: ['./professor-interaction-history.component.scss'],
})
export class ProfessorInteractionHistoryComponent {
  @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;
  currentAppeal: ProfessorAppeal;
  selectedRecipient: 'Student' | 'Grader' = 'Student'; // Student' by default
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
  professorTemplates!: ProfessorTemplate[];

  //template
  selectedTemplate: string = '';

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {
    this.route.params.subscribe((params) => {
      this.appealId = +params['id']; // Get appeal id from url
      console.log(this.appealId);
    });
  }
  async ngOnInit() {
    this.professorAppeals = await this.supabase.fetchProfessorAppeals(1); //todo fix ID
    this.professorTemplates = await this.supabase.fetchProfessorTemplates(1);
    //select current appeal based on id from url. Otherwise, set to first appeal
    this.currentAppeal =
      this.professorAppeals.find(
        (appeal) => appeal.appeal_id === this.appealId
      ) || this.professorAppeals[0];

    if (this.currentAppeal) {
      //get messages for current appeal
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

  selectTemplate(template: string) {
    this.selectedTemplate = template;
    this.chatInputMessage = template;
  }

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  async selectAppeal(appeal: any) {
    this.currentAppeal = appeal;
    this.messages = await this.supabase.fetchMessages(
      this.currentAppeal.appeal_id
    );
  }

  /**
   * Submit student appeal to database
   */
  async sendMessage(): Promise<void> {
    const now = getTimestampTz(new Date());

    try {
      let student_user_id = await this.supabase.getUserId(
        this.currentAppeal.student_id,
        'student'
      );

      await this.supabase.insertMessages(
        this.currentAppeal.appeal_id,
        this.user.id, //professor user id
        student_user_id, //student user id
        now,
        this.chatInputMessage,
        this.fromGrader,
        'Tyler',
        'Justin'
      );
      this.messages.push({
        id: 1 + this.messageCount, //TODO make id better system
        created_at: getTimestampTz(new Date()),
        sender_id: this.user.id,
        recipient_id: student_user_id,
        appeal_id: this.currentAppeal.appeal_id,
        message_text: this.chatInputMessage,
        from_grader: this.fromGrader,
        sender_name: 'Tyler',
        recipient_name: 'Justin',
      });
      this.currentAppeal.created_at =
        this.messages[this.messages.length - 1].created_at;

      this.chatInputMessage = '';
      this.scrollToBottom();
    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
  }

  localFormatTimestamp(timestamp: Date): { date: string; time: string } {
    return formatTimestamp(timestamp);
  }

  async sendToGrader() {}
  //   let student_user_id = await this.supabase.getUserId(
  //     this.currentAppeal.student_id,
  //     'student'
  //   );
  //   let message = 'Sending to Grader';
  //   await this.supabase.insertMessages(
  //     this.currentAppeal.appeal_id,
  //     this.user.id, //professor user id
  //     student_user_id, //student user id
  //     new Date(),
  //     message,
  //     this.fromGrader,
  //     'Tyler',
  //     'Justin'
  //   );

  //   this.messages.push({
  //     id: 1 + this.messageCount, //TODO make id better system
  //     created_at: getTimestampTz(new Date()),
  //     sender_id: this.user.id,
  //     recipient_id: student_user_id,
  //     appeal_id: this.currentAppeal.appeal_id,
  //     message_text: message,
  //     from_grader: this.fromGrader,
  //     sender_name: 'Tyler',
  //     recipient_name: 'Justin',
  //   });
  // }
}
