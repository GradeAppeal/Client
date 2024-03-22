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
  noAppealsMessage: string = '';
  chatInputMessage: string = '';
  fromGrader = true;
  noAppeals = true;
  isUser: Boolean;
  appealId: number;
  courseId: number;
  messages: Message[];
  currentProfessor: string | null = '';
  currentCourse: Course | null;

  professor: Professor;
  graderAppeals!: GraderAppeal[];
  professors!: Professor[];
  professorIds: [];

  imageFile: File | undefined;
  messageID: number;
  image: Blob;
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
        this.graderAppeals = await this.graderService.getCourseGraderAppeals(
          this.grader.id,
          this.courseId
        );

        this.currentCourse = await this.sharedService.getCourse(this.courseId);
      }
      // otherwise, get all assigned appeals from all courses the grader is grading
      else {
        this.graderAppeals = await this.graderService.getAllGraderAppeals(
          this.grader.id
        );
      }

      this.noAppeals = this.graderAppeals.length === 0 ? true : false;
      // grader has appeals
      if (!this.noAppeals) {
        // Set current appeal to latest appeal
        // at this point, graderAppeals will contain either appeals for a specific course or all appeals assigned to the grader
        this.currentAppeal = this.graderAppeals[0];
        this.handleCurrentAppealMessages();
        this.messages = await this.sharedService.getMessages(
          this.currentAppeal.appeal_id
        );

        const { professor_id } = this.currentAppeal;
        this.professor = await this.sharedService.getProfessor(professor_id);

        this.imageMessages = this.messages;
        await this.getImages();
      }
      // grader has no appeals
      else {
        this.messages = [];
        this.imageMessages = [];
        this.noAppealsMessage = 'You have no appeals assigned';
      }
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
        `grader-current-appeal-messages-channel`,
        `appeal_id=eq.${this.currentAppeal.appeal_id}`
      )
      .subscribe((update: any) => {
        // if insert or update event, get new row
        // if delete event, get deleted row ID
        const record = update.new?.id ? update.new : update.old;
        // INSERT
        const event = update.eventType;
        if (!record) return;
        // new message inserted
        if (event === 'INSERT') {
          // show new message
          this.messages.push(record);
          // If the appeal's interaction history is already showing on the right,
          // no need to mark left pane with blue dot to indicate it has not been read
          this.graderAppeals = this.graderAppeals.map((appeal) =>
            // {record} is the new message in the currently-open interaction history
            // {appeal} is the information for each tab in the left pane
            // Since the professor is already viewing this.currentAppeal, we don't need to mark the left tab with a blue dot
            record.appeal_id === appeal.appeal_id
              ? { ...appeal, is_read: true }
              : appeal
          );
        }
      });
  }

  /**
   * Listen for all new messages sent to the grader
   */
  // TODO: change up for course appeals and for all appeals?
  //    Ask prof Norman tomorrow
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
        // if a student or grader sends a message
        if (event === 'INSERT') {
          // If a student sent a message on a different appeal (i.e. an appeal not showing on the right)
          // mark left pane with blue dot to indicate it has not been read
          this.graderAppeals = this.graderAppeals.map((appeal) =>
            // the second condition makes sure that if the appeal's interaction history is already open to the right
            // (i.e. this.currentAppeal), the left pane isn't marked with a blue dot
            // necessary because this handler and handleCurrentAppealMessages both listen to the same table
            record.appeal_id === appeal.appeal_id &&
            record.appeal_id !== this.currentAppeal.appeal_id
              ? { ...appeal, is_read: false }
              : appeal
          );
        }
      });
  }

  // TODO: filtering for graders?
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
          const newAppeal = await this.graderService.getAllGraderAppeals(
            record.id
          );
          this.graderAppeals = newAppeal.concat(this.graderAppeals);
        }
      });
  }

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  async selectAppeal(appeal: GraderAppeal) {
    try {
      this.currentAppeal = appeal;
      // change filter
      this.handleCurrentAppealMessages();
      this.messages = await this.sharedService.getMessages(
        this.currentAppeal.appeal_id
      );
      this.imageMessages = this.messages;
      await this.getImages();
      await this.sharedService.updateMessageRead(this.currentAppeal.appeal_id);
      console.log('selectAppeal');
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
    if (notification === true) {
      message = 'Notification:' + message;
    }
    try {
      const hasImage = this.imageFile ? true : false;
      console.log(
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
      this.scrollToBottom();

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
      throw new Error('onSubmitAppeal');
    }
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
