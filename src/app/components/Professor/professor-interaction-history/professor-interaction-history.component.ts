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
  Professor,
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
  professor = {
    id: 10,
    email: 'abc123@gmail.com',
    name: 'Sam',
  };
  student = {
    id: 0,
    email: 'ccc1233@gmail.com',
    name: 'Justin',
  };

  professorAppeals!: ProfessorAppeal[];
  professorTemplates!: ProfessorTemplate[];
  professors: Professor[];
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
    this.professors = await this.supabase.fetchProfessors();
    //select current appeal based on id from url. Otherwise, set to first appeal
    this.selectAppeal(
      this.professorAppeals.find(
        (appeal) => appeal.appeal_id === this.appealId
      ) || this.professorAppeals[0]
    );
    if (this.currentAppeal) {
      //if appeal exists, find messages for it
      this.selectAppeal(this.currentAppeal);
    } else {
      this.selectAppeal(this.professorAppeals[0]);
    }
    this.student.name = this.currentAppeal.student_name;
    if (this.professorMatch(this.messages[0].sender_id)) {
      this.professor.name = this.messages[0].sender_name;
      console.log('work');
    } else if (this.professorMatch(this.messages[1].sender_id)) {
      this.professor.name = this.messages[0].sender_name;
      this.messageCount = this.messages.length;
    } else {
      this.student.name = this.messages[0].sender_name;
    }
    console.log(this.professor.name);
    console.log(this.student.name);
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
    this.student.id = await this.supabase.getUserId(
      this.currentAppeal.student_id,
      'student'
    );
    console.log(this.messages);
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
      await this.supabase.insertMessages(
        this.currentAppeal.appeal_id,
        this.professor.id, //professor user id
        this.student.id, //student user id
        now,
        message,
        this.fromGrader
      );
      this.localSendMessage(message);

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
  //checks if a professor is in the list of professors
  professorMatch(id: number): boolean {
    return this.professors.some((professor) => professor.user_id === id);
  }

  localSendMessage(message: string) {
    console.log(this.student.id);
    console.log(this.professor.id);
    this.messages.push({
      id: 1 + this.messageCount, //TODO make id better system
      created_at: getTimestampTz(new Date()),
      sender_id: this.professor.id,
      recipient_id: this.student.id,
      appeal_id: this.currentAppeal.appeal_id,
      message_text: message,
      from_grader: this.fromGrader,
      sender_name: '',
      recipient_name: '',
    });
  }

  async sendToGrader() {
    this.sendMessage('Sent to Grader', true);
  }
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
