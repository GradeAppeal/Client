import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-generic-popup',
  templateUrl: './generic-popup.component.html',
  styleUrls: ['./generic-popup.component.scss'],
})
export class GenericPopupComponent {
  @Input() title: string = 'Title';
  @Input() message: string = 'Generic Message';
  @Input() actionButtonText: string = 'Send';
  @Output() actionConfirmed = new EventEmitter<boolean>();
  @Output() popupClosed = new EventEmitter<void>();

  confirmAction(confirmed: boolean) {
    this.actionConfirmed.emit(confirmed);
  }
  closePopup() {
    this.popupClosed.emit();
  }
}
