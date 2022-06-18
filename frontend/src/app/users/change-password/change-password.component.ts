import { Component, OnInit } from "@angular/core";
import { first } from "rxjs/operators";

import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { AlertService, AuthService } from "@app/_services";

@Component({
  templateUrl: "change-password.component.html",
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  id: string;
  isAddMode: boolean;
  loading = false;
  isSubmitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private alert: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        oldPassword: ["", Validators.required],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
      },
      {
        validator: [this.comparePasswords("newPassword", "confirmPassword")],
      }
    );
  }

  comparePasswords(passwordKey: string, comparePasswordKey: string) {
    return (group: FormGroup) => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[comparePasswordKey];

      if (confirmPassword.errors && !confirmPassword.errors.notEquivalent) {
        return;
      }

      if (password.value !== confirmPassword.value) {
        return confirmPassword.setErrors({ notEquivalent: true });
      } else {
        return confirmPassword.setErrors(null);
      }
    };
  }

  get f() {
    return this.form.controls;
  }

  changePassword() {
    this.isSubmitted = true;
    this.alert.clear();
    if (this.form.invalid) return;

    this.loading = true;
    this.authService
      .updatePassword({
        oldPassword: this.f.oldPassword.value,
        newPassword: this.f.newPassword.value,
      })
      .pipe(first())
      .subscribe({
        next: () => {
          this.alert.success("Password updated succesfully");
          this.form.reset();
          this.loading = false;
          this.isSubmitted = false;
        },
        error: (error) => {
          this.alert.error(
            error.error.message || "Something went wrong please try again."
          );
          this.loading = false;
          this.isSubmitted = false;
        },
      });
  }
}
