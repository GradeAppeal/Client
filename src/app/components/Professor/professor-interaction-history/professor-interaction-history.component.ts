import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Session } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { SharedService } from 'src/app/services/shared.service';
import {
  formatTimestamp,
  isSameDate,
} from 'src/app/shared/functions/general.util';
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
import { UnassignGraderPopupComponent } from '../unassign-grader-popup/unassign-grader-popup.component';
import { CloseAppealPopupComponent } from '../professor-appeal-inbox/close-appeal-popup/close-appeal-popup.component';

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
  filteredAppeals: ProfessorAppeal[];
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
      await this.professorService.fetchOpenProfessorAppeals(this.professor.id);
    this.filteredAppeals = this.professorAppeals;

    this.noAppeals = this.professorAppeals.length === 0 ? true : false;

    // appeals exist
    if (!this.noAppeals) {
      this.professorTemplates =
        await this.professorService.fetchProfessorTemplates(this.professor.id);
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
      this.handleAppealNewMessages();
      this.handleAppealUpdates();
      this.handleAllNewMessages();
    }
    // no appeals: show the no appeals message in HTML template
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  /**
   * Listen for new messages to update RIGHT pane
   */
  handleAppealNewMessages() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `professor-appeal-messages-channel`,
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
        // is_read updates
        else if (event === 'UPDATE') {
          this.currentAppeal.is_read = record.is_read;
        } else if (event === 'DELETE') {
          console.log('delete', { record });
          this.professorAppeals = this.professorAppeals.filter(
            (appeal) => appeal !== record.id
          );
        }
      });
  }

  /**
   * Listen for new appeals to update LEFT pane
   */
  handleAllNewMessages() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `professor-all-messages-channel`,
        `recipient_id=eq.${this.professor.id}`
      )
      .subscribe(async (update: any) => {
        const record = update.new?.id ? update.new : update.old;
        // INSERT new message
        const event = update.eventType;
        if (!record) return;
        if (event === 'INSERT') {
          // get new message
          const record = update.new;
          // show new appeal/message on left pane
          this.professorAppeals = this.professorAppeals.map((professorAppeal) =>
            professorAppeal.appeal_id === record.appeal_id
              ? { ...professorAppeal, is_read: false }
              : { ...professorAppeal }
          );
        }
      });
  }

  /**
   * Listen for new appeals & grader updates
   */
  handleAppealUpdates(): void {
    this.sharedService
      .getTableChanges(
        'Appeals',
        'appeals-update-channel',
        `professor_id=eq.${this.professor.id}`
      )
      .subscribe(async (update: any) => {
        // get the newly updated row
        const record = update.new?.id ? update.new : update.old;
        if (!record) return;
        const event = update.eventType;

        // new appeal
        if (event === 'INSERT') {
          const newAppeal = await this.professorService.getNewProfessorAppeal(
            record.id
          );
          this.professorAppeals = newAppeal.concat(this.professorAppeals);
        }
        // update grader status
        else if (event === 'UPDATE') {
          this.currentAppeal.grader_id = record.grader_id;
        } else if (event === 'DELETE') {
          console.log('delete', { record });
          this.professorAppeals = this.professorAppeals.filter(
            (appeal) => appeal !== record.id
          );
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
    console.log(this.currentAppeal);
    // update real-time filtering
    this.handleAppealNewMessages();
    //this.sender.id = this.currentAppeal.student_id;
    const { student_id } = this.currentAppeal;
    // TODO: adjust get appeals function to get student email
    this.student = await this.sharedService.getStudent(student_id);
    this.messages = await this.sharedService.fetchMessages(
      this.currentAppeal.appeal_id
    );
    await this.sharedService.updateMessageRead(this.currentAppeal.appeal_id);
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

  formatTimestamp(timestamp: Date): { date: string; time: string } {
    return formatTimestamp(timestamp);
  }

  async filterResults(text: string) {
    if (!text) {
      this.filteredAppeals = this.professorAppeals;
      return;
    }

    this.filteredAppeals = this.professorAppeals.filter((appeal) => {
      return (
        appeal?.assignment_name.toLowerCase().includes(text.toLowerCase()) ||
        appeal?.course_name.toLowerCase().includes(text.toLowerCase()) ||
        appeal?.course_code
          .toString()
          .toLowerCase()
          .includes(text.toLowerCase()) ||
        (appeal?.student_first_name as string)
          .toLowerCase()
          .includes(text.toLowerCase())
      );
    });
    this.currentAppeal = this.filteredAppeals[0];
    this.messages = await this.sharedService.fetchMessages(
      this.currentAppeal.appeal_id
    );
  }
  async onAssignGrader(event: MouseEvent) {
    const currentAppeal = this.currentAppeal;
    if (!this.currentAppeal.grader_id) {
      const graders = await this.professorService.getGraders(
        this.currentAppeal.course_id
      );

      const appealID = currentAppeal.appeal_id;
      // open popup to assign grader
      const dialog = this.dialog.open(AssignGraderPopupComponent, {
        data: { graders, appealID, professor: this.professor },
      });
    } else {
      console.log('appeal already assigned to grader');
      this._snackBar.openFromComponent(GraderAssignedSnackbarComponent, {
        duration: this.durationInSeconds * 1000,
      });
    }
  }

  async unassignGrader(event: MouseEvent) {
    if (this.currentAppeal.grader_id) {
      const graderName = this.currentAppeal.grader_name;
      const studentID = this.currentAppeal.student_id;
      const professorID = this.professor.id;
      console.log(graderName);
      const appealID = this.currentAppeal.appeal_id;
      // open popup to assign grader
      const dialog = this.dialog.open(UnassignGraderPopupComponent, {
        data: { graderName, appealID, studentID, professorID },
      });
    }
  }

  talkToGrader() {
    this.talkingToGrader = !this.talkingToGrader;
    console.log(this.talkingToGrader);
  }

  //This function makes sure that the messages appearing in interaction history only show if the dates are from a different day
  isSameDate(
    date1: Date | string | undefined,
    date2: Date | string | undefined
  ): boolean {
    return isSameDate(date1, date2);
  }

  async onCloseAppeal(event: MouseEvent) {
    const currentAppeal = this.currentAppeal;
    const dialogRef = this.dialog.open(CloseAppealPopupComponent, {
      data: { currentAppeal },
    });
    // update UI: get rid of closed appeal
    dialogRef.afterClosed().subscribe(async (result: number) => {
      this.professorAppeals = this.professorAppeals.filter(
        (appeal) => appeal.appeal_id !== result
      );
      this.currentAppeal = this.professorAppeals[0];
      this.messages = await this.sharedService.fetchMessages(
        this.currentAppeal.appeal_id
      );
    });
  }
}
