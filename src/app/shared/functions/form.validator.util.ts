import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  console.log({ control });
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  console.log(newPassword);
  return newPassword?.value !== confirmPassword?.value
    ? {
        passwordMismatch: true,
      }
    : null;
};
