import {
  Component,
  Input,
  Output,
  EventEmitter,
  Optional,
  Inject,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
interface ParentData {
  title: string;
  message: string;
  actionButtonText: string;
  action: any;
}
@Component({
  selector: 'app-generic-popup',
  templateUrl: './generic-popup.component.html',
  styleUrls: ['./generic-popup.component.scss'],
})
export class GenericPopupComponent {
  title: string = 'Title';
  message: string = 'Generic Message';
  actionButtonText2: string = 'Send';

  @Output() actionConfirmed = new EventEmitter<boolean>();
  @Output() popupClosed = new EventEmitter<void>();

  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {
    this.title = data.title;
    this.message = data.message;
    this.actionButtonText2 = data.actionButtonText;
    console.log(data.action);
    this.action = data.action;
  }
  action() {}
  confirmAction(confirmed: boolean) {
    if (this.data.action) {
      this.data.action();
    }
    this.closePopup();
    //console.log(this.message);
    //console.log(this.title);
    //this.actionConfirmed.emit(confirmed);
  }
  closePopup() {
    this.popupClosed.emit();
  }
}
