import { Component } from '@angular/core';
import { GenericPopupComponent } from '../generic-popup/generic-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  showImage: boolean = false;
  constructor(private location: Location) {}
  goBack() {
    this.location.back();
  }
  toggleImage() {
    this.showImage = !this.showImage;
  }
}
