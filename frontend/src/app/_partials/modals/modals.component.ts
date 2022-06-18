import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  EventEmitter,
  OnDestroy,
  HostListener,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription, Observable } from "rxjs";
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormGroupDirective,
  NgForm,
} from "@angular/forms";
import { first } from "rxjs/operators";

import { AuthService, AlertService, ModalService } from "@app/_services";

@Component({
  selector: "app-modals",
  templateUrl: "./modals.component.html",
  styleUrls: ["./modals.component.css"],
})
export class ModalsComponent implements OnInit {
  modalReference: NgbModalRef;
  private eventsSubscription: Subscription;
  loginForm: FormGroup;
  registerForm: FormGroup;
  isSubmitted: boolean = false;
  isRegisterationSubmitted: boolean = false;
  loading: boolean = false;
  errorMessage: string = "";

  @Input() events: Observable<void>;
  closeResult = "";

  modalOption: NgbModalOptions = {
    backdrop: "static",
    keyboard: false,
  };

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private modal:ModalService
  ) {}

  @ViewChild("content") Modal: ElementRef;
  @ViewChild("signupcontent") RegisterModal: ElementRef;
  @ViewChild("myForm") public userLoginForm: NgForm;

  ngOnInit(): void {
    this.eventsSubscription = this.modal.onModal().subscribe((event) => {
      console.log('asfd')
      this.openLoginModal()
   });

    /**
     * login form
     */
    this.loginForm = this.formBuilder.group({
      username: ["", [Validators.required, Validators.minLength(4)]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });

    /**
     * Register form validation
     */

    this.registerForm = this.formBuilder.group(
      {
        username: ["", [Validators.required, Validators.minLength(4)]],
        firstName: ["", [Validators.required, Validators.minLength(3)]],
        lastName: ["", [Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      {
        validator: this.checkIfMatch("password", "confirmPassword"),
      }
    );
  }

  get f() {
    return this.loginForm.controls;
  }

  get rF() {
    return this.registerForm.controls;
  }

  checkIfMatch(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey];
      let confirmPasswordInput = group.controls[confirmPasswordKey];
      if (
        confirmPasswordInput.errors &&
        !confirmPasswordInput.errors.notEquivalent
      )
        return;

      if (passwordInput.value !== confirmPasswordInput.value) {
        return confirmPasswordInput.setErrors({ notEquivalent: true });
      } else {
        return confirmPasswordInput.setErrors(null);
      }
    };
  }

  openLoginModal() {
    this.modalReference = this.modalService.open(this.Modal, this.modalOption);
    this.modalReference.result.then((result) => {
      this.closeResult = ` Closed with : ${result}`;
      this.loginForm.reset();
      this.isSubmitted = false;
      this.alertService.clear();
    });
  }

  openRegisterModal(event) {
    event.preventDefault();
    this.modalReference.close();
    this.modalReference = this.modalService.open(
      this.RegisterModal,
      this.modalOption
    );
    this.modalReference.result.then((result) => {
      this.closeResult = ` Closed with : ${result}`;
      this.registerForm.reset();
      this.alertService.clear();
      this.isRegisterationSubmitted = false;
    });
  }

  loginUser() {
    this.isSubmitted = true;
    this.alertService.clear();
    if (this.loginForm.invalid) return;
    else {
      this.loading = true;
      this.authService
        .loginUser(this.f.username.value, this.f.password.value)
        .pipe(first())
        .subscribe({
          next: () => {
            this.loading = false;
            this.isSubmitted = false;
            this.modalReference.close();
            const returnUrl =
              this.route.snapshot.queryParams["returnUrl"] || "/";
            this.router.navigateByUrl(returnUrl);
          },
          error: (error) => {
            this.loading = false;
            this.isSubmitted = false;
            this.alertService.error(
              error.error.message || "Something went wrong please try again."
            );
          },
        });
    }
  }

  registerUser() {
    this.isRegisterationSubmitted = true;

    //reset alerts on clear
    this.alertService.clear();
    if (this.registerForm.invalid) return;
    else {
      this.loading = true;
      let { confirmPassword, ...formData } = this.registerForm.value;
      this.authService
        .registerUser(formData)
        .pipe(first())
        .subscribe({
          next: () => {
            this.loading = false;
            this.isRegisterationSubmitted = false;
            this.modalReference.close();
            this.openLoginModal();
            setTimeout(() => {
              this.alertService.success("Registeration Successfull", {
                keepAfterRouteChange: true,
                autoClose: true,
              });
            }, 10);
          },
          error: (error) => {
            this.alertService.error(
              error.error.message ||
                "Something went wrong Please try again later."
            );
            this.loading = false;
            this.isRegisterationSubmitted = false;
          },
        });
    }
  }
}
