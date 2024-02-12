import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { SharedService } from 'src/app/services/shared.service';
import { StudentService } from 'src/app/services/student.service';
import {
  formatTimestamp,
  isSameDate,
} from 'src/app/shared/functions/general.util';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import {
  Message,
  Professor,
  Student,
} from 'src/app/shared/interfaces/psql.interface';
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
  @Input() currentAppeal: StudentAppeal;
  @ViewChild('chat-item') chatItem: ElementRef;
  @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;

  user: User;
  loading: boolean = true;
  noAppeals: boolean = false;
  studentUserId: string;
  chatInputMessage: string = '';
  messageCount: number = 0;
  fromGrader = false;
  isUser: Boolean;
  appealId: number;
  messages!: Message[];
  professor: Professor;
  student: Student;

  studentAppeals!: StudentAppeal[];
  loadStudentAppeals = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private studentService: StudentService,
    private sharedService: SharedService
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
        this.student = {
          id: this.user.id,
          first_name: this.user.user_metadata['first_name'],
          last_name: this.user.user_metadata['last_name'],
          email: this.user.email as string,
        };
      }
    });
  }

  async ngOnInit() {
    this.handleStudentMessageUpdates();
    this.studentAppeals = await this.studentService.fetchStudentAppeals(
      this.student.id
    );
    console.log(this.studentAppeals[0]);
    this.noAppeals = this.studentAppeals.length === 0 ? true : false;
    if (!this.noAppeals) {
      this.currentAppeal = this.studentAppeals[0];
      this.professor = await this.sharedService.getProfessor(
        this.currentAppeal.professor_id
      );
      // get messages for appeal
      this.messages = await this.sharedService.fetchStudentMessages(
        this.currentAppeal.appeal_id,
        this.student.id,
        this.professor.id
      );
      console.log(this.messages);
      this.loadStudentAppeals = true;
      this.messageCount = this.messages.length;
      this.loading = false;
      this.handleAppealMessageUpdates();
    } else {
      this.loading = false;
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  /**
   * Listen for new messages to update right pane with messages
   */
  handleAppealMessageUpdates() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `student-message-appeal-channel`,
        `appeal_id=eq.${this.currentAppeal.appeal_id}`
      )
      .subscribe(async (update: any) => {
        // if insert or update event, get new row
        // if delete event, get deleted row ID
        const record = update.new?.id ? update.new : update.old;
        // INSERT or DELETE
        const event = update.eventType;
        if (!record) return;
        // new student inserted
        if (event === 'INSERT') {
          // get new message
          const record: Message = update.new;
          // show new message on screen
          this.messages.push(record);
        } // is_read updates
        else if (event === 'UPDATE') {
          this.currentAppeal.is_read = record.is_read;
        }
      });
  }

  /**
   * Listen for new messages to label left pane with unread blue dot
   */
  handleStudentMessageUpdates() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `student-message-recipient-channel`,
        `recipient_id=eq.${this.student.id}`
      )
      .subscribe(async (update: any) => {
        console.log({ update }, 'handleStudentMessageUpdates');
        const record = update.new?.id ? update.new : update.old;
        // INSERT or DELETE
        const event = update.eventType;
        if (!record) return;
        // new student inserted
        if (event === 'INSERT') {
          // get new message
          const record = update.new;
          // update left pane
          this.studentAppeals = this.studentAppeals.map((studentAppeal) =>
            studentAppeal.appeal_id === record.appeal_id
              ? { ...studentAppeal, is_read: false }
              : { ...studentAppeal }
          );
        }
      });
  }

  /**
   * Select appeal from left
   * @param appeal
   */
  async selectAppeal(appeal: any) {
    // Copy the selected appeal's data into the form fields
    this.currentAppeal = appeal;
    this.handleAppealMessageUpdates();

    //this.sender.id = this.currentAppeal.student_id;
    this.messages = await this.sharedService.fetchStudentMessages(
      this.currentAppeal.appeal_id,
      this.student.id,
      this.professor.id
    );
    await this.sharedService.updateMessageRead(this.currentAppeal.appeal_id);
  }

  /**
   * Submit student appeal to database
   */
  async sendMessage(
    message: string,
    notification: boolean = false
  ): Promise<void> {
    const now = getTimestampTz(new Date());

    try {
      const professorID = this.professor.id;
      const studentID = this.student.id;

      await this.sharedService.insertMessage(
        this.currentAppeal.appeal_id,
        studentID, //sender id: student
        professorID, //recipientid : professor
        now,
        message,
        this.fromGrader,
        `${this.student.first_name} ${this.student.last_name}`,
        `${this.professor.first_name} ${this.professor.last_name}`
      );
      this.chatInputMessage = '';
      this.scrollToBottom();
    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
  }

  //imported functions
  formatTimestamp(timestamp: Date): { date: string; time: string } {
    return formatTimestamp(timestamp);
  }

  //This function makes sure that the messages appearing in interaction history only show if the dates are from a different day
  isSameDate(
    date1: Date | string | undefined,
    date2: Date | string | undefined
  ): boolean {
    return isSameDate(date1, date2);
  }
}
