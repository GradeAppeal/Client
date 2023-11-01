import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { SharedService } from 'src/app/services/shared.service';
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
  private professorUserId: string;
  noAppeals: boolean;
  currentAppeal: ProfessorAppeal;
  selectedRecipient: 'Student' | 'Grader' = 'Student'; // Student' by default
  appealId: number;
  chatInputMessage: string = '';
  messageCount: number = 0;
  messageLoaded = false;
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
    private professorService: ProfessorService,
    private sharedService: SharedService,
    private authService: SupabaseService
  ) {
    this.route.params.subscribe((params) => {
      this.appealId = +params['id']; // Get appeal id from url
      console.log(this.appealId);
    });
  }
  async ngOnInit() {
    this.professorUserId = (await this.authService.getUserId()) as string;
    this.user.id = 10; //TODO make this actual user ID not just fake data
    this.professorAppeals = await this.professorService.fetchProfessorAppeals(
      this.professorUserId
    );
    this.noAppeals = this.professorAppeals.length === 0 ? true : false;
    this.professorTemplates =
      await this.professorService.fetchProfessorTemplates(this.professorUserId);
    if (!this.noAppeals) {
      this.currentAppeal =
        this.professorAppeals.find(
          (appeal) => appeal.appeal_id === this.appealId
        ) || this.professorAppeals[0];

      if (this.currentAppeal) {
        //this.sender.id = this.currentAppeal.student_id;
        this.messages = await this.sharedService.fetchMessages(
          this.currentAppeal.appeal_id
        );
      } else {
        this.currentAppeal = this.professorAppeals[0];
        this.messages = await this.sharedService.fetchMessages(
          this.currentAppeal.appeal_id
        );
      }
      this.messageLoaded = true;
      this.messageCount = this.messages.length;
    }
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
    //this.sender.id = this.currentAppeal.student_id;
    this.messages = await this.sharedService.fetchMessages(
      this.currentAppeal.appeal_id
    );
  }

  /**
   * Submit student appeal to database
   */
  async sendMessage(): Promise<void> {
    const now = getTimestampTz(new Date());

    try {
      console.log(this.currentAppeal.student_id);
      let student_user_id = await this.sharedService.getUserId(
        this.currentAppeal.student_id,
        'student'
      );
      console.log(student_user_id);
      await this.sharedService.insertMessages(
        this.currentAppeal.appeal_id,
        this.user.id, //professor user id
        student_user_id, //student user id
        now,
        this.chatInputMessage,
        this.fromGrader
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
