import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { SharedService } from 'src/app/services/shared.service';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Message } from 'src/app/shared/interfaces/psql.interface';
@Component({
  selector: 'app-professor-interaction-history',
  templateUrl: './professor-interaction-history.component.html',
  styleUrls: ['./professor-interaction-history.component.scss'],
})
export class ProfessorInteractionHistoryComponent {
  @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;
  private professorUserId: string;
  currentAppeal: ProfessorAppeal;
  appealId: number;
  chatInputMessage: string = '';
  messageCount: number = 0;
  messageLoaded = false;
  fromGrader = false;
  isUser: Boolean;
  messages!: Message[];
  user = {
    id: 10,
    email: 'abc123@gmail.com',
  };
  sender = {
    id: 0,
    email: 'ccc1233@gmail.com',
  };

  professorAppeals!: ProfessorAppeal[];

  constructor(
    private route: ActivatedRoute,
    private professorService: ProfessorService,
    private sharedService: SharedService,
    private authService: SupabaseService
  ) {
    this.route.params.subscribe((params) => {
      this.appealId = +params['id']; // Convert the parameter to a number
      console.log(this.appealId);
    });
  }
  async ngOnInit(): Promise<void> {
    const user = await this.authService.getUser();
    this.professorUserId = user?.id as string;
    this.user.id = 10; //TODO make this actual user ID not just fake data
    console.log(this.professorUserId);
    this.professorAppeals = await this.professorService.fetchProfessorAppeals(
      this.professorUserId
    );
    this.currentAppeal =
      this.professorAppeals.find(
        (appeal) => appeal.appeal_id === this.appealId
      ) || this.professorAppeals[0];

    if (this.currentAppeal) {
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
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  useTemplate() {}

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  // Function to select an appeal
  async selectAppeal(appeal: any) {
    // Copy the selected appeal's data into the form fields
    this.currentAppeal = appeal;
    //this.sender.id = this.currentAppeal.student_id;
    this.messages = await this.sharedService.fetchMessages(
      this.currentAppeal.appeal_id
    );
    console.log(this.currentAppeal);
  }

  /**
   * Submit student appeal to database
   */
  async sendMessage(): Promise<void> {
    const now = getTimestampTz(new Date());

    try {
      console.log(this.currentAppeal.student_id);
      let student_user_id = await this.sharedService.getUserId(
        this.currentAppeal.student_id,
        'student'
      );
      console.log(student_user_id);
      await this.sharedService.insertMessages(
        this.currentAppeal.appeal_id,
        this.user.id, //professor user id
        student_user_id, //student user id
        now,
        this.chatInputMessage,
        this.fromGrader
      );
      console.log('Sent to database!');
      this.messages.push({
        id: 1 + this.messageCount, //TODO make id better system
        created_at: getTimestampTz(new Date()),
        sender_id: this.user.id,
        recipient_id: student_user_id,
        appeal_id: this.currentAppeal.appeal_id,
        message_text: this.chatInputMessage,
        from_grader: this.fromGrader,
      });

      this.chatInputMessage = '';
      this.scrollToBottom();
      console.log(this.messages);
    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
  }
}
