import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Session, User } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { Professor } from 'src/app/shared/interfaces/psql.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfessorService } from 'src/app/services/professor.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  session: Session;
  user: User;
  professor: Professor;
  passwordMinLength = 6;
  newPassword: string;
  emailFrequency: string;
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  cronForm: FormGroup;
  frequencies = ['daily', 'weekly', 'monthly'];
  hours: number[] = Array.from({ length: 24 }, (_, index) => index);
  minutes: number[] = Array.from({ length: 60 }, (_, index) => index);
  hide: boolean = true;

  dayOfMonth: (number | string)[] = Array.from(
    { length: 31 },
    (_, index) => index + 1
  );
  daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  cron: string[]; // [minute, hour, day of month, month, day of week]

  constructor(
    private authService: AuthService,
    private professorService: ProfessorService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
        this.professor = {
          id: this.user.id,
          first_name: this.user.user_metadata['first_name'],
          last_name: this.user.user_metadata['last_name'],
          email: this.user.email as string,
        };
      }
    });
  }

  async ngOnInit() {
    const cronString = await this.professorService.getCron(this.professor.id);
    const cron = cronString.split(' ');

    const cronMinute = cron[0];
    const cronHour = cron[1];
    const cronMonthDay = cron[2];
    const cronWeek = cron[4];

    let frequency: string;
    if (cronMonthDay === '*' && cronWeek === '*') {
      frequency = 'daily';
    } else if (cronWeek !== '*') {
      frequency = 'weekly';
    } else if (cronMonthDay !== '*' && cronWeek === '*') {
      frequency = 'monthly';
    } else {
      frequency = '';
    }

    // initialize cronForm
    this.cronForm = this.fb.group({
      frequency: [frequency, Validators.required],
      week: [Number(cronWeek) ? Number(cronWeek) : null],
      month: [Number(cronMonthDay) ? Number(cronMonthDay) : null],
      hour: [Number(cronHour), Validators.required],
      minute: [Number(cronMinute), Validators.required],
    });

    // listen for changes in the cronForm
    // {emitEvent: false} used to prevent infinite calls
    this.cronForm.get('frequency')?.valueChanges.subscribe((change) => {
      if (change === 'daily') {
        // week and month fields not needed: remove validators so cronForm can be valid
        this.cronForm.get('week')?.setValidators([]);
        this.cronForm.get('month')?.setValidators([]);
        // set week and month fields to null
        this.cronForm.get('week')?.setValue(null, { emitEvent: false });
        this.cronForm.get('month')?.setValue(null, { emitEvent: false });
      } else if (change === 'weekly') {
        this.cronForm.get('week')?.setValidators(Validators.required);
        // month field not needed: remove validator so cronForm can be valid
        this.cronForm.get('month')?.setValidators([]);
        this.cronForm.get('month')?.setValue(null, { emitEvent: false });
      } else if (change === 'monthly') {
        this.cronForm.get('month')?.setValidators(Validators.required);
        // week field not needed: remove validator so cronForm can be valid
        this.cronForm.get('week')?.setValidators([]);
        this.cronForm.get('week')?.setValue(null, { emitEvent: false });
      }
    });
  }

  async onChangePassword() {
    const password = this.password.value as string;
    try {
      if (password) {
        await this.authService.updatePassword(password);
        this.snackBar.open('Successfully Updated Password', '', {
          panelClass: ['blue-snackbar'],
          duration: 2000,
        });
      }
    } catch (error) {
      this.snackBar.open(`${error}`, '', {
        panelClass: ['error-snackbar'],
        duration: 3000,
      });
    } finally {
      this.password.reset();
    }
  }

  async onSaveSettings() {
    const { password, frequency } = this.cronForm.value;
    // if user entered new password, update the password
    try {
      const { week, month, hour, minute } = this.cronForm.value;
      console.log(`week: ${week}`);
      console.log(`month: ${month}`);
      console.log(`hour: ${hour}`);
      console.log(`minute: ${minute}`);
      const cron = `${minute} ${hour} ${month ? month : '*'} * ${
        week ? week : '*'
      }`;
      // update cron schedule
      await this.professorService.updateCron(this.professor.id, cron);
      await this.authService.updatePassword(password);
      this.snackBar.open('Successfully Updated Emailing Schedule', '', {
        panelClass: ['blue-snackbar'],
        duration: 2000,
      });
    } catch (error) {
      this.snackBar.open(`${error}`, '', {
        panelClass: ['red-snackbar'],
        duration: 3000,
      });
    }
    // TODO: configure frequency after figuring out edge functions
  }
}
