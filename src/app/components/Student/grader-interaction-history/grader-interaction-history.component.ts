// Grader Interaction History is based off of professor interaction history. Almost a "child" component.
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Session, User } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { GraderService } from 'src/app/services/grader.service';
import { SharedService } from 'src/app/services/shared.service';
import {
  formatTimestamp,
  isSameDate,
} from 'src/app/shared/functions/general.util';
import {
  Message,
  Professor,
  Course,
  Grader,
  ImageMessage,
  Student,
} from 'src/app/shared/interfaces/psql.interface';
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

  session: Session;
  user: User;
  grader: Grader;
  student: { id: string; first_name: string; last_name: string };
  noAppealsMessage: string = '';
  chatInputMessage: string = '';
  messageCount: number = 0;
  fromGrader = true;
  noAppeals = true;
  isUser: Boolean;
  appealId: number;
  courseId: number;
  messages: Message[];
  messageLoaded = false;
  currentProfessor: string | null = '';
  currentCourse: Course | null;

  professor: Professor;
  studentAppeals!: StudentAppeal[];
  graderAppeals!: GraderAppeal[];
  professors!: Professor[];
  professorIds: [];

  imageFile: File | undefined;
  messageID: number;
  image: Blob;
  inputFilled: boolean = false;
  imageMessages: ImageMessage[];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private graderService: GraderService,
    private sharedService: SharedService,
    private sanitizer: DomSanitizer
  ) {
    this.route.params.subscribe((params) => {
      this.appealId = +params['id']; // Convert the parameter to a number
      this.courseId = +params['id'];
    });
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
        this.grader = {
          id: this.user.id,
          first_name: this.user.user_metadata['first_name'],
          last_name: this.user.user_metadata['last_name'],
          email: this.user.email as string,
          is_verified: this.user.email_confirmed_at ? true : false,
        };
      }
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

  async ngOnInit() {
    const isGrader = await this.graderService.isGrader(this.grader.id);

    // student is not a grader
    if (!isGrader) {
      this.noAppeals = true;
      this.noAppealsMessage = 'You are not a grader';
    }
    // student is a grader
    else {
      // if navigated from course dashboard, only get the appeals for that course
      if (this.courseId) {
        this.graderAppeals = await this.graderService.fetchCourseGraderAppeals(
          this.grader.id,
          this.courseId
        );

        this.currentCourse = await this.sharedService.getCourse(this.courseId);
      }
      // otherwise, get all assigned appeals from all courses the grader is grading
      else {
        this.graderAppeals = await this.graderService.fetchAllGraderAppeals(
          this.grader.id
        );
      }

      this.noAppeals = this.graderAppeals.length === 0 ? true : false;
      // grader has appeals
      if (!this.noAppeals) {
        // get appeal with specific id
        // otherwise set the latest appeal as the current appeal
        this.currentAppeal =
          this.graderAppeals.find(
            (appeal) => appeal.appeal_id === this.appealId
          ) || this.graderAppeals[0];
        // get student info
        this.student = await this.graderService.getAppealStudent(
          this.currentAppeal.appeal_id
        );

        this.messages = await this.sharedService.fetchStudentMessages(
          this.currentAppeal.appeal_id,
          this.grader.id,
          this.currentAppeal.professor_id
        );
        // get professor information
        const pid = this.currentAppeal.professor_id;
        this.professor = await this.sharedService.getProfessor(pid);
        this.messageLoaded = true;
        this.messageCount = this.messages.length;
        this.imageMessages = this.messages;
        await this.getImages();

        this.handleAppealNewMessages();
      }
      // grader has no appeals
      else {
        this.messages = [];
        this.imageMessages = [];
        this.noAppealsMessage = 'You have no appeals assigned to you';
      }
    }
  }

  /*  Get images associated with the appeal */
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
   * Listen for new messages to update RIGHT pane
   */
  handleAppealNewMessages() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `grader-appeal-messages-channel`,
        `appeal_id=eq.${this.currentAppeal.appeal_id}`
      )
      .subscribe((update: any) => {
        // if insert or update event, get new row
        // if delete event, get deleted row ID
        const record = update.new?.id ? update.new : update.old;
        // INSERT or DELETE
        const event = update.eventType;
        if (!record) return;
        // new message inserted
        if (event === 'INSERT') {
          // show new message
          this.messages.push(record);
        }
      });
  }

  handleAllNewMessages() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `grader-all-messages-channel`,
        `recipient_id=eq.${this.grader.id}`
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
          this.graderAppeals = this.graderAppeals.map((graderAppeals) =>
            graderAppeals.appeal_id === record.appeal_id
              ? { ...graderAppeals, is_read: false }
              : { ...graderAppeals }
          );
        }
      });
  }

  async selectAppeal(appeal: GraderAppeal) {
    try {
      this.currentAppeal = appeal;
      // get professor information from appeal
      const pid = this.currentAppeal.professor_id;
      this.professor = await this.sharedService.getProfessor(pid);
      // get student information
      this.student = await this.graderService.getAppealStudent(
        this.currentAppeal.appeal_id
      );

      // change filter
      this.handleAppealNewMessages();
      this.messages = await this.sharedService.fetchStudentMessages(
        this.currentAppeal.appeal_id,
        this.grader.id,
        this.professor.id
      );
      this.imageMessages = this.messages;
      await this.getImages();
      await this.sharedService.updateMessageRead(this.currentAppeal.appeal_id);
    } catch (e) {
      console.log({ e });
    }
  }

  /**
   * Submit student appeal to database
   */
  async sendMessage(
    message: string,
    notification: boolean = false
  ): Promise<void> {
    this.inputFilled = false;
    if (notification === true) {
      message = 'Notification:' + message;
    }
    try {
      const hasImage = this.imageFile ? true : false;

      this.messageID = await this.sharedService.insertMessage(
        this.currentAppeal.appeal_id,
        this.grader.id, //sender id: grader
        this.professor.id, //recipientid : professor??
        new Date(),
        this.chatInputMessage,
        this.fromGrader,
        `${this.grader.first_name} ${this.grader.last_name}`,
        `${this.professor.first_name} ${this.professor.last_name}`,
        hasImage
      );

      this.chatInputMessage = '';

      if (hasImage) {
        const imageID = await this.sharedService.uploadFile(
          this.currentAppeal.appeal_id,
          this.imageFile!,
          this.messageID
        );
        // clear the file input
        (<HTMLInputElement>document.getElementById('image')).value = '';
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
  }
  /**
   * Check if input is filled for send button color
   */
  onTextAreaChange() {
    this.inputFilled = this.chatInputMessage.trim().length > 0;
  }

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
