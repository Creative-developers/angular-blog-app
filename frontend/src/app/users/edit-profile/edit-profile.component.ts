import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  AuthService,
  AlertService,
  CustomValidationService,
} from "@app/_services";
import {
  Form,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { Observable, Subscription } from "rxjs";
import { first } from "rxjs/operators";

import { User } from "@app/_models";
import { environment } from "@environments/environment";

@Component({
  selector: "app-edit-profile",
  templateUrl: "./edit-profile.component.html",
  styleUrls: ["./edit-profile.component.css"],
})
export class EditProfileComponent implements OnInit {
  public userProfile;
  // form: FormGroup;
  loading: boolean = false;
  isSubmitted: boolean = false;
  profileImage: string;
  alertTest: string = "This is edit profile 1st time";
  private uploadsUrl = environment.uploadsUrl;
  alertSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private customValidationService: CustomValidationService
  ) {}

  ngOnInit() {
    // this.form = this.formBuilder.group({
    //   firstName: ["", [Validators.required, Validators.minLength(3)]],
    //   lastName: ["", Validators.minLength(3)],
    //   email: [
    //     "",
    //     [Validators.required, Validators.email, Validators.minLength(3)],
    //   ],
    //   username: ["", [Validators.required, Validators.minLength(4)]],
    //   profileImage: ["", [Validators.required]],
    //   phoneNumber: ["", [Validators.required]],
    // });

    this.getUserProfile();
  }

  ngOnDestroy() {
    console.log("alert component destoryed...");
  }

  form = new FormGroup({
    firstName: new FormControl(null, [
      Validators.required,
      Validators.minLength(3),
    ]),
    lastName: new FormControl(null, Validators.minLength(3)),
    email: new FormControl(null, [
      Validators.required,
      Validators.email,
      Validators.minLength(3),
    ]),
    username: new FormControl(null, [
      Validators.required,
      Validators.minLength(4),
    ]),
    profileImage: new FormControl(null, [
      this.customValidationService.imageTypeValidator("image/jpeg, image/png"),
      this.customValidationService.fileSizeValidator(2000000),
    ]),
    phoneNumber: new FormControl(null, Validators.required),
  });

  get f() {
    return this.form.controls;
  }

  getUserProfile() {
    this.userProfile = this.authService.userData.userProfile;
    this.form.patchValue({
      firstName: this.userProfile.user.firstName,
      lastName: this.userProfile.user.lastName,
      email: this.userProfile.user.email,
      username: this.userProfile.user.username,
      phoneNumber: this.userProfile.phoneNumber,
    });
    if (this.userProfile.image) {
      this.profileImage = `${this.uploadsUrl}/users-profile/${this.userProfile.image}`;
    } else {
      this.profileImage = "./assets/images/no-user.jpg";
    }
  }

  onFileChange($event) {
    let file = $event.target.files[0];
    if (file) {
      this.form.patchValue({
        profileImage: file,
      });
      var fileReader: FileReader = new FileReader();
      fileReader.onload = (e) => {
        this.profileImage = fileReader.result as string;
      };
      fileReader.readAsDataURL(file);
      //this.form.controls["profileImage"].setValue(file);
    }
  }

  submitForm() {
    this.isSubmitted = true;
    this.alertService.clear();

    if (this.form.invalid) return;
    else {
      this.loading = true;
      let { profileImage, ...formData } = this.form.value;
      this.authService
        .updateProfile(this.form.value)
        .pipe(first())
        .subscribe({
          next: (user: User) => {
            this.loading = false;
            this.alertService.success("Profile updated successfully");
          },
          error: (error) => {
            this.loading = false;
            this.alertService.error(
              error.error.message ||
                "Something went wrong. Please try again later"
            );
            console.error(error);
          },
        });
    }
  }
}
