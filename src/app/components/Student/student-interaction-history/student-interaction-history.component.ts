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
  noAppeals: boolean = false;
  studentUserId: string;
  chatInputMessage: string = '';
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
    console.log(this.studentAppeals);
    this.handleAllNewMessages();
    this.noAppeals = this.studentAppeals.length === 0 ? true : false;
    if (!this.noAppeals) {
      this.currentAppeal = this.studentAppeals[0];
      // start listening to changes in currentAppeal as soon as currentAppeal is set
      this.handleCurrentAppealMessages();
      // get the professor for the appeal
      this.professor = await this.sharedService.getProfessor(
        this.currentAppeal.professor_id
      );
      // get messages for appeal
      this.messages = await this.sharedService.fetchStudentMessages(
        this.currentAppeal.appeal_id,
        this.student.id,
        this.professor.id
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
      });
    } catch {
      //do nothing
    }
  }

  displayImage(image: Blob | undefined): SafeUrl {
    const imageUrl = URL.createObjectURL(image as Blob);
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  }

  handleCurrentAppealMessages() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `student-current-appeal-messages-channel`,
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
          // If the appeal's interaction history is already showing on the right,
          // no need to mark left pane with blue dot to indicate it has not been read
          this.studentAppeals = this.studentAppeals.map((appeal) =>
            // {record} is the new message in the currently-open interaction history
            // {appeal} is the information for each tab in the left pane
            // Since the professor is already viewing this.currentAppeal, we don't need to mark the left tab with a blue dot
            record.appeal_id === appeal.appeal_id
              ? { ...appeal, is_read: true }
              : appeal
          );
        }
        // click to view an appeal that hasn't been viewed
        // remove the blue "unread" dot
        else if (event === 'UPDATE') {
          this.studentAppeals = this.studentAppeals.map((appeal) => {
            return record.appeal_id === appeal.appeal_id
              ? { ...appeal, is_read: true }
              : appeal;
          });
        }
        this.filteredAppeals = this.studentAppeals;
      });
  }

  /**
   * Listen for all new messages sent to the student
   */
  handleAllNewMessages() {
    this.sharedService
      .getTableChanges(
        'Messages',
        `student-all-messages-channel`,
        `recipient_id=eq.${this.student.id}`
      )
      .subscribe(async (update: any) => {
        const record = update.new?.id ? update.new : update.old;
        const event = update.eventType;

        if (!record) return;

        // if a professor sends a message
        if (event === 'INSERT') {
          // If a professor sent a message on a different appeal (i.e. an appeal not showing on the right)
          // mark left pane with blue dot to indicate it has not been read
          this.studentAppeals = this.studentAppeals.map((appeal) =>
            // the second condition makes sure that if the appeal's interaction history is already open to the right
            // (i.e. this.currentAppeal), the left pane isn't marked with a blue dot
            // necessary because this handler and handleCurrentAppealMessages both listen to the same table
            record.appeal_id === appeal.appeal_id &&
            record.appeal_id !== this.currentAppeal.appeal_id
              ? { ...appeal, is_read: false }
              : appeal
          );
        }
        this.filteredAppeals = this.studentAppeals;
      });
  }

  /**
   * Select appeal from left
   * @param appeal
   */
  async onSelectAppeal(appeal: any) {
    this.currentAppeal = appeal;
    // update listener to listen to current appeal
    this.handleCurrentAppealMessages();
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
        location.reload();
      }

      // clear the file input
      (<HTMLInputElement>document.getElementById('image')).value = '';
    } catch (err) {
      console.log(err);
      throw new Error('sendMessage');
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
