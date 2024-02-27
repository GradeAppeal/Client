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
  ImageMessage
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
  imageMessages!: ImageMessage[];

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
        };
      }
    });
  }

  onFilechange(event: any) {
    console.log(event.target.files[0]);
    this.imageFile = event.target.files[0];
  }

  async ngOnInit() {
    const isGrader = await this.graderService.isGrader(this.grader.id);

    // student is not a grader
    if (!isGrader) {
      this.noAppeals = true;
      this.noAppealsMessage =
        'You have not been assigned as a grader to any courses';
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
      console.log('no appeal status: ', this.noAppeals);
      // grader has appeals
      if (!this.noAppeals) {
        this.currentAppeal =
          this.graderAppeals.find(
            (appeal) => appeal.appeal_id === this.appealId
          ) || this.graderAppeals[0];

        if (this.currentAppeal) {
          this.messages = await this.sharedService.fetchMessages(
            this.currentAppeal.appeal_id
          );
        } else {
          this.currentAppeal = this.graderAppeals[0];
          this.messages = await this.sharedService.fetchMessages(
            this.currentAppeal.appeal_id
          );
        }

        this.imageMessages = this.messages;
        await this.getImages();

        const { sender_id, recipient_id } = this.messages[0];
        const pid = sender_id === this.grader.id ? recipient_id : sender_id;
        this.professor = await this.sharedService.getProfessor(pid);
        this.messageLoaded = true;
        this.messageCount = this.messages.length;
        this.handleMessageUpdates();
      }
      // grader has no appeals
      else {
        console.log("Grader doesn't have any appeals");
        this.messages = [];
        this.noAppealsMessage = 'You have not been assigned to any appeals';
      }
      console.log(this.messages);
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
        // const imageUrl = URL.createObjectURL(this.image);
        // const imgElement = document.createElement('img');
        // imgElement.src = imageUrl;
        // document.getElementById("chat")!.appendChild(imgElement);
      });
    }
    catch {
      //do nothing
    }
  }

  displayImage(image: Blob | undefined): SafeUrl {
    const imageUrl = URL.createObjectURL(image as Blob);
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  }

  handleMessageUpdates() {
    console.log('current appeal is: ', this.currentAppeal.appeal_id);
    this.sharedService
      .getTableChanges(
        'Messages',
        `message-channel`,
        `appeal_id=eq.${this.currentAppeal.appeal_id}`
      )
      .subscribe(async (update: any) => {
        console.log({ update });
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

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  async selectAppeal(appeal: GraderAppeal) {
    try {
      this.currentAppeal = appeal;
      // change filter
      this.handleMessageUpdates();
      console.log(this.currentAppeal.appeal_id);
      this.messages = await this.sharedService.fetchMessages(
        this.currentAppeal.appeal_id
      );
      this.imageMessages = this.messages;
      await this.getImages();
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
    console.log(this.grader, 'Grader');
    console.log(this.professor, 'Prof');
    try {
      const hasImage = this.imageFile == null ? false : true;
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
      }

      // clear the file input
      (<HTMLInputElement>document.getElementById("image")).value = "";

    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
    console.log(this.messages);
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
