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
  ImageMessage,
} from 'src/app/shared/interfaces/psql.interface';
import { AssignGraderPopupComponent } from './assign-grader-popup/assign-grader-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GraderAssignedSnackbarComponent } from './grader-assigned-snackbar/grader-assigned-snackbar.component';
import { UnassignGraderPopupComponent } from '../unassign-grader-popup/unassign-grader-popup.component';
import { CloseAppealPopupComponent } from '../professor-appeal-inbox/close-appeal-popup/close-appeal-popup.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

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
  fromGrader = false;
  isUser: Boolean;
  menu: any;
  messages!: Message[];
  professor: Professor;
  student: Student;
  grader: Student;
  talkingToGrader: Boolean = false;
  graderValue: Boolean = true;
  showOptions: Boolean = false;
  imageFile: File | undefined;
  messageID: number;
  image: Blob;
  imageMessages!: ImageMessage[];
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
    private router: Router,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private professorService: ProfessorService,
    private sharedService: SharedService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.route.params.subscribe((params) => {
      this.appealId = +params['id']; // Get appeal id from url
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
    // populate left pane with all appeals to professor (latest appeal appears at the top)
    this.professorAppeals =
      await this.professorService.fetchOpenProfessorAppeals(this.professor.id);
    // for filter search
    this.filteredAppeals = this.professorAppeals;
    // start listening to changes in all appeals as soon as all appeals are loaded
    this.handleAllNewMessages();
    this.handleAppealUpdates();

    // no appeals: show the no appeals message in HTML template
    this.noAppeals = this.professorAppeals.length === 0 ? true : false;

    // appeals exist
    if (!this.noAppeals) {
      // get templates for professor
      this.professorTemplates =
        await this.professorService.fetchProfessorTemplates(this.professor.id);

      // Set current appeal to display interaction history
      //  if navigated from appeal-inbox, get the specific appeal
      //  otherwise, set to the latest appeal
      this.currentAppeal =
        this.professorAppeals.find(
          (appeal) => appeal.appeal_id === this.appealId
        ) || this.professorAppeals[0];
      // start listening to changes in currentAppeal as soon as currentAppeal is set
      this.handleCurrentAppealMessages();
      // get the student for appeal
      this.student = await this.sharedService.getStudent(
        this.currentAppeal.student_id
      );
      // get messages for the appeal
      this.messages = await this.sharedService.getMessages(
        this.currentAppeal.appeal_id
      );
      // set the currently displaying message as "read"
      await this.sharedService.updateMessageRead(this.currentAppeal.appeal_id);
      // load images
      this.imageMessages = this.messages;
      await this.getImages();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // get images associated with the appeal
  async getImages() {
    try {
      this.imageMessages.forEach(async (message) => {
        if (message.has_image) {
          this.image = await this.sharedService.getFile(
            this.currentAppeal.appeal_id,
            message.message_id
          );
          message.image = this.image;
        }
      });
    } catch {
      //do nothing
    }
  }

  displayImage(image: Blob | undefined): SafeUrl {
    const imageUrl = URL.createObjectURL(image as Blob);
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  }

  /**
   * Listen for new messages in this.currentAppeal ONLY (what is showing on the right pane)
   */
  handleCurrentAppealMessages() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `professor-current-appeal-messages-channel`,
        `appeal_id=eq.${this.currentAppeal.appeal_id}`
      )
      .subscribe(async (update: any) => {
        // if insert or update event, get new row
        // if delete event, get deleted row ID
        const record = update.new?.id ? update.new : update.old;

        const event = update.eventType;
        if (!record) return;

        // if a student or grader sends a message
        if (event === 'INSERT') {
          // show new message to right pane
          this.messages.push(record);
          // If the appeal's interaction history is already showing on the right,
          // no need to mark left pane with blue dot to indicate it has not been read
          await this.sharedService.updateMessageRead(record.appeal_id);
          this.professorAppeals = this.professorAppeals.map((appeal) => {
            // {record} is the new message in the currently-open interaction history
            // {appeal} is the information for each tab in the left pane
            // Since the professor is already viewing this.currentAppeal, we don't need to mark the left tab with a blue dot
            return record.appeal_id === appeal.appeal_id
              ? { ...appeal, is_read: true }
              : appeal;
          });
        }
        this.filteredAppeals = this.professorAppeals;
      });
  }

  /**
   * Listen for all new messages sent to the professor
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
        const event = update.eventType;

        if (!record) return;

        // if a student or grader sends a message
        if (event === 'INSERT') {
          // If a student sent a message on a different appeal (i.e. an appeal not showing on the right)
          // mark left pane with blue dot to indicate it has not been read
          this.professorAppeals = this.professorAppeals.map((appeal) =>
            // the second condition makes sure that if the appeal's interaction history is already open to the right
            // (i.e. this.currentAppeal), the left pane isn't marked with a blue dot
            // necessary because this handler and handleCurrentAppealMessages both listen to the same table
            record.appeal_id === appeal.appeal_id &&
            record.appeal_id !== this.currentAppeal.appeal_id
              ? { ...appeal, is_read: false }
              : appeal
          );
        }
        this.filteredAppeals = this.professorAppeals;
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
          this.currentAppeal.grader_name = record.grader_name;
        } else if (event === 'DELETE') {
          this.professorAppeals = this.professorAppeals.filter(
            (appeal) => appeal !== record.id
          );
        }
        this.filteredAppeals = this.professorAppeals;
      });
  }

  selectTemplate(template: string) {
    this.selectedTemplate = template;
    this.chatInputMessage = template;
  }
  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  async onSelectAppeal(appeal: any) {
    this.currentAppeal = appeal;
    // update listener to listen to current appeal
    this.handleCurrentAppealMessages();
    //this.sender.id = this.currentAppeal.student_id;
    const { student_id } = this.currentAppeal;
    // TODO: adjust get appeals function to get student email
    this.student = await this.sharedService.getStudent(student_id);
    this.messages = await this.sharedService.getMessages(
      this.currentAppeal.appeal_id
    );
    this.imageMessages = this.messages;
    await this.getImages();
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
    const hasImage = this.imageFile == null ? false : true;

    if (notification === true) {
      message = 'Notification: ' + message;
    }

    const recipient_id = this.talkingToGrader
      ? (this.currentAppeal.grader_id as string)
      : this.student.id;
    const recipient_name = this.talkingToGrader
      ? (this.currentAppeal.grader_name as string)
      : `${this.student.first_name} ${this.student.last_name}`;
    try {
      this.messageID = await this.sharedService.insertMessage(
        this.currentAppeal.appeal_id,
        sender_id, //sender id
        recipient_id, //student or grader id
        now,
        message,
        this.fromGrader,
        `${this.professor.first_name} ${this.professor.last_name}`,
        recipient_name,
        hasImage
      );

      this.currentAppeal.created_at =
        this.messages[this.messages.length - 1].created_at;

      this.chatInputMessage = '';

      if (hasImage) {
        const imageID = await this.sharedService.uploadFile(
          this.currentAppeal.appeal_id,
          this.imageFile!,
          this.messageID
        );
        window.location.reload();
      }

      // clear the file input
      (<HTMLInputElement>document.getElementById('image')).value = '';
    } catch (err) {
      console.log(err);
      throw new Error('sendMessage');
    }
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
    this.messages = await this.sharedService.getMessages(
      this.currentAppeal.appeal_id
    );
  }
  onInputChange(filterValue: string): void {
    //if input is blank, just show all appeals
    if (filterValue.trim() === '') {
      this.filteredAppeals = this.professorAppeals;
    }
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
      const appealID = this.currentAppeal.appeal_id;
      // open popup to assign grader
      const dialog = this.dialog.open(UnassignGraderPopupComponent, {
        data: { graderName, appealID, studentID, professorID },
      });
    }
  }

  talkToGrader() {
    this.talkingToGrader = !this.talkingToGrader;
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
      this.router.navigateByUrl('professor/appeal-inbox');
      // this.professorAppeals = this.professorAppeals.filter(
      //   (appeal) => appeal.appeal_id !== result
      // );
      // this.currentAppeal = this.professorAppeals[0];
      // this.messages = await this.sharedService.getMessages(
      //   this.currentAppeal.appeal_id
      // ); //237, 238, 239 240
    });
  }

  onFilechange(event: any) {
    this.imageFile = event.target.files[0];
    let fileChosen = document.getElementById('file-chosen') as HTMLElement;
    fileChosen.textContent = event.target.files[0].name;

    if (this.chatInputMessage.trim() === '' && this.imageFile) {
      this.chatInputMessage = event.target.files[0].name; // Set message to a space character
    }
  }
}
