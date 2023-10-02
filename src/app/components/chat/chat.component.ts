import {Component, ElementRef, Input, Output, ViewChild, EventEmitter} from '@angular/core';
@Component({
 selector: 'app-chat',
 templateUrl: './chat.component.html',
 styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  @Output() customTitleChange: EventEmitter<string> = new EventEmitter<string>();

@Input() customTitle: string;

 title = 'chat-ui';
 email = 'abc123@gmail.com'
 @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;
 chatInputMessage: string = "";
 
 professor = {
   id: 1,
   email: '1234@gmail.com'
 }

 student = {
   id: 2,
   email: 'abc@gmail.com'
 }

 chats: {
   user: any,
   message: string
 }[] = [
   {
     user: this.student,
     message: "Hello professor. Please fix my grade. Thanks"
   },
 ];

 ngAfterViewChecked() {
   this.scrollToBottom()
 }

 send() {
   this.chats.push({
     message: this.chatInputMessage,
     user: this.professor
   });

   this.chatInputMessage = ""
   this.scrollToBottom()
 }

 scrollToBottom() {
   const maxScroll = this.list?.nativeElement.scrollHeight;
   this.list?.nativeElement.scrollTo({top: maxScroll, behavior: 'smooth'});
 }

 generateFakeId(): string {
   const current = new Date();
   const timestamp = current.getTime();
   return timestamp.toString()
 }


}