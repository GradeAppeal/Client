import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Session } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { SharedService } from 'src/app/services/shared.service';
import { formatTimestamp } from 'src/app/shared/functions/general.util';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import {
  ProfessorAppeal,
  ProfessorTemplate,
} from 'src/app/shared/interfaces/professor.interface';
import {
  Professor,
  Message,
  Student,
} from 'src/app/shared/interfaces/psql.interface';
import { AssignGraderPopupComponent } from './assign-grader-popup/assign-grader-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GraderAssignedSnackbarComponent } from './grader-assigned-snackbar/grader-assigned-snackbar.component';

@Component({
  selector: 'app-professor-interaction-history',
  templateUrl: './professor-interaction-history.component.html',
  styleUrls: ['./professor-interaction-history.component.scss'],
})
export class ProfessorInteractionHistoryComponent {
  @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;
  session: Session;
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
  professor: Professor;
  student: Student;
  grader: Student;
  talkingToGrader: Boolean = false;
  graderValue: Boolean = true;

  professorAppeals: ProfessorAppeal[];
  professorTemplates!: ProfessorTemplate[];
  professors: Professor[];
  //template
  selectedTemplate: string = '';
  // snackbar duration
  durationInSeconds: number = 2;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private professorService: ProfessorService,
    private sharedService: SharedService,
    private authService: AuthService
  ) {
    this.route.params.subscribe((params) => {
      this.appealId = +params['id']; // Get appeal id from url
      console.log(this.appealId);
    });
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.professor = {
          id: user.id,
          first_name: user.user_metadata['first_name'],
          last_name: user.user_metadata['last_name'],
          email: user.user_metadata['email'],
        };
      }
    });
  }
  async ngOnInit() {
    this.professorAppeals =
      await this.professorService.fetchAllProfessorAppeals(this.professor.id);

    this.noAppeals = this.professorAppeals.length === 0 ? true : false;
    this.professorTemplates =
      await this.professorService.fetchProfessorTemplates(this.professor.id);

    // appeals exist
    if (!this.noAppeals) {
      // if navigated from appeal-inbox, get the specific appeal
      // otherwise, set to the most current appeal
      this.currentAppeal =
        this.professorAppeals.find(
          (appeal) => appeal.appeal_id === this.appealId
        ) || this.professorAppeals[0];

      if (this.currentAppeal) {
        // get current student
        this.student = await this.sharedService.getStudent(
          this.currentAppeal.student_id
        );
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
      this.handleMessageUpdates();
    }
    // no appeals: show the no appeals message in HTML template
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  handleMessageUpdates() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `message-channel`,
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
          // show new message
          this.messages.push(record);
        }
      });
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
    // update real-time filtering
    this.handleMessageUpdates();
    //this.sender.id = this.currentAppeal.student_id;
    const { student_id } = this.currentAppeal;
    // TODO: adjust get appeals function to get student email
    this.student = await this.sharedService.getStudent(student_id);
    this.messages = await this.sharedService.fetchMessages(
      this.currentAppeal.appeal_id
    );
    console.log(this.currentAppeal);
  }

  /**
   * Send message to student/grader
   * @param message professor's message
   * @param notification set to false; send with Notification: prefix
   */
  async sendMessage(
    message: string,
    notification: boolean = false
  ): Promise<void> {
    const now = getTimestampTz(new Date());
    const sender_id = this.professor.id;
    let recipient_id = this.student.id;
    let recipient_name = `${this.student.first_name} ${this.student.last_name}`;
    if (notification === true) {
      message = 'Notification: ' + message;
    }
    if (this.talkingToGrader && this.talkingToGrader === true) {
      recipient_id = this.currentAppeal.grader_id as string;
      recipient_name = this.currentAppeal.grader_name as string;
    }
    console.log(this.currentAppeal.grader_id);
    console.log(recipient_id);
    try {
      console.log(this.currentAppeal);

      // console.log(student_user_id);
      await this.sharedService.insertMessage(
        this.currentAppeal.appeal_id,
        sender_id, //professor user id
        recipient_id, //student user id
        now,
        message,
        this.fromGrader,
        `${this.professor.first_name} ${this.professor.last_name}`,
        `${this.student.first_name} ${this.student.last_name}`
      );

      this.currentAppeal.created_at =
        this.messages[this.messages.length - 1].created_at;

      this.chatInputMessage = '';
      this.scrollToBottom();
      console.log(this.messages);
    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
    console.log(this.messages);
  }

  localFormatTimestamp(timestamp: Date): { date: string; time: string } {
    return formatTimestamp(timestamp);
  }

  /**
   * send message to grader
   */

  async onAssignToGrader() {
    // if the appeal not assigned to grader
    if (!this.currentAppeal.grader_id) {
      console.log(this.currentAppeal);
      const graders = await this.professorService.getGraders(
        this.currentAppeal.course_id
      );
      const appealID = this.currentAppeal.appeal_id;
      // open popup to assign grader
      const dialog = this.dialog.open(AssignGraderPopupComponent, {
        width: '30%',
        height: '35%',
        data: {
          graders: graders,
          appealID: appealID,
          professor: this.professor,
        },
      });
    }
    // if grader already assigned
    else {
      console.log('appeal already assigned to grader');
      this._snackBar.openFromComponent(GraderAssignedSnackbarComponent, {
        duration: this.durationInSeconds * 1000,
      });
    }
  }

  talkToGrader() {
    this.talkingToGrader = !this.talkingToGrader;
    console.log(this.talkingToGrader);
  }
}
