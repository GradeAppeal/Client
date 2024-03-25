import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
  ImageMessage,
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
  imageFile: File | undefined;
  messageID: number;
  image: Blob;
  imageMessages!: ImageMessage[];

  studentAppeals!: StudentAppeal[];
  filteredAppeals: StudentAppeal[];
  loadStudentAppeals = false;
  inputFilled : boolean = false;

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private sharedService: SharedService,
    private sanitizer: DomSanitizer
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
        this.student = {
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
    this.studentAppeals = await this.studentService.fetchStudentAppeals(
      this.student.id
    );
    this.filteredAppeals = this.studentAppeals;
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
      this.imageMessages = this.messages;
      await this.getImages();

      this.loadStudentAppeals = true;
      this.messageCount = this.messages.length;
      this.loading = false;
      this.handleAppealNewMessages();
      this.handleAllNewMessages();
      this.handleNewMessages();
    } else {
      this.loading = false;
    }
    console.log(this.currentAppeal);
  }

  // ngAfterViewChecked() {
  //   this.scrollToBottom();
  // }

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
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
    } catch {
      //do nothing
    }
  }

  displayImage(image: Blob | undefined): SafeUrl {
    const imageUrl = URL.createObjectURL(image as Blob);
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  }

  handleNewMessages() {
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

  /**
   * Listen for new messages to update RIGHT pane
   */
  handleAppealNewMessages() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `student-appeal-messages-channel`,
        `recipient_id=eq.${this.student.id}`
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
          if (record.appeal_id === this.currentAppeal.appeal_id) {
            this.messages.push(record);
          }
        } // is_read updates
        else if (event === 'UPDATE') {
          this.currentAppeal.is_read = record.is_read;
        }
      });
  }

  /**
   * Listen for new messages to update LEFT pane
   */
  handleAllNewMessages() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `student-all-messages-channel`,
        `recipient_id=eq.${this.student.id}`
      )
      .subscribe(async (update: any) => {
        // get the new message
        const record = update.new?.id ? update.new : update.old;
        const event = update.eventType;
        if (!record) return;
        // new student inserted
        if (event === 'INSERT') {
          // update left pane
          this.studentAppeals = this.studentAppeals.map((studentAppeal) =>
            studentAppeal.appeal_id === record.appeal_id
              ? { ...studentAppeal, is_read: false }
              : { ...studentAppeal }
          );
          this.studentAppeals = this.studentAppeals.map((studentAppeal) =>
            studentAppeal.appeal_id === this.currentAppeal.appeal_id
              ? { ...studentAppeal, is_read: true }
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

    //this.sender.id = this.currentAppeal.student_id;
    this.messages = await this.sharedService.fetchStudentMessages(
      this.currentAppeal.appeal_id,
      this.student.id,
      this.professor.id
    );
    this.imageMessages = this.messages;
    await this.getImages();
    await this.sharedService.updateMessageRead(this.currentAppeal.appeal_id);
  }

  /**
   * Submit student appeal to database
   */
  async sendMessage(
    message: string,
    notification: boolean = false
  ): Promise<void> {
    this.inputFilled = false;
    const now = getTimestampTz(new Date());
    try {
      const professorID = this.professor.id;
      const studentID = this.student.id;
      const hasImage = this.imageFile == null ? false : true;

      this.messageID = await this.sharedService.insertMessage(
        this.currentAppeal.appeal_id,
        studentID, //sender id: student
        professorID, //recipientid : professor
        now,
        message,
        this.fromGrader,
        `${this.student.first_name} ${this.student.last_name}`,
        `${this.professor.first_name} ${this.professor.last_name}`,
        hasImage
      );

      // await this.sharedService.mark_appeal_as_unread(
      //   this.currentAppeal.appeal_id
      // );
      this.chatInputMessage = '';
      this.scrollToBottom();

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
      throw new Error('sendMessage');
    }
  }

    /**
 * Check if input is filled for send button color
 */
    onTextAreaChange() {
      this.inputFilled = this.chatInputMessage.trim().length > 0;
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

  async filterResults(text: string) {
    if (!text) {
      this.filteredAppeals = this.studentAppeals;
      return;
    }

    this.filteredAppeals = this.studentAppeals.filter((appeal) => {
      return (
        appeal?.assignment_name.toLowerCase().includes(text.toLowerCase()) ||
        appeal?.course_name.toLowerCase().includes(text.toLowerCase()) ||
        appeal?.course_code
          .toString()
          .toLowerCase()
          .includes(text.toLowerCase()) ||
        (appeal?.professor_first_name as string)
          .toLowerCase()
          .includes(text.toLowerCase())
      );
    });
    this.currentAppeal = this.filteredAppeals[0];
    this.messages = await this.sharedService.fetchStudentMessages(
      this.currentAppeal.appeal_id,
      this.student.id,
      this.professor.id
    );
  }
  onInputChange(filterValue: string): void {
    //if input is blank, just show all appeals
    if (filterValue.trim() === '') {
      this.filteredAppeals = this.studentAppeals;
    }
  }
}
