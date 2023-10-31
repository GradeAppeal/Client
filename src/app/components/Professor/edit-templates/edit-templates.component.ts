import {
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { ProfessorTemplate } from 'src/app/shared/interfaces/professor.interface';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-edit-templates',
  templateUrl: './edit-templates.component.html',
  styleUrls: ['./edit-templates.component.scss']
})
export class EditTemplatesComponent {
  constructor(private supabase: SupabaseService){}
  @ViewChild('inboxContainer') list?: ElementRef<HTMLDivElement>;

  professorTemplates : ProfessorTemplate[];

  editTemplate(template: ProfessorTemplate){

  }
  addTemplate(template: ProfessorTemplate){

  }

  async ngOnInit() {
    this.professorTemplates = await this.supabase.fetchProfessorTemplates(
      1 //TODO make this actual user ID not just fake data
    );
    }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }
}
