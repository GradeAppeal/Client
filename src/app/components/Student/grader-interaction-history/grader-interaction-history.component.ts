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
import {
  Professor,
  ProfessorAppeal,
} from 'src/app/shared/interfaces/professor.interface';
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
  currentProfessor: string | null = '';
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
  professors!: Professor[];
  professorIds: [];

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {
    this.route.params.subscribe((params) => {
      this.appealId = +params['id']; // Convert the parameter to a number
    });
  }
  async ngOnInit() {
    this.graderAppeals = await this.supabase.fetchGraderAppeals(1);
    this.professors = await this.supabase.fetchProfessors();
    this.professorIds;
    console.log(this.graderAppeals);
    console.log(this.professors);
    //select current appeal based on id from url. Otherwise, set to first appeal
    this.selectAppeal(
      this.graderAppeals.find((appeal) => appeal.appeal_id === this.appealId) ||
        this.graderAppeals[0]
    );
    if (this.currentAppeal) {
      //if appeal exists, find messages for it
      this.selectAppeal(this.currentAppeal);
    } else {
      this.selectAppeal(this.graderAppeals[0]);
    }
    this.messageCount = this.messages.length;

    console.log(this.messages);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
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
    console.log(this.currentAppeal);
  }

  /**
   * Submit student appeal to database
   */
  async sendMessage(): Promise<void> {
    const student_user_id = 10; //TODO fix this
    try {
      await this.supabase.insertMessages(
        this.currentAppeal.appeal_id,
        this.user.id, //sender id: grader
        10, //recipientid : professor??
        new Date(),
        this.chatInputMessage,
        this.fromGrader,
        'tyler',
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

      this.chatInputMessage = '';
      this.scrollToBottom();
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
  //checks if a professor is in the list of professors
  professorMatch(id: number): boolean {
    return this.professors.some((professor) => professor.user_id === id);
  }
  // set current professor
  setProfessor(targetId: number): void {
    const professor = this.professors.find((p) => p.id === targetId);
    this.currentProfessor = professor ? professor.first_name : null;
  }
}
