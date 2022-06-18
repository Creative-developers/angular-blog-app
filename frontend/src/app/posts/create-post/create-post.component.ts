import {
  Component,
  OnInit,
  QueryList,
  ElementRef,
  ViewChildren,
  ViewChild,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AngularEditorConfig } from "@kolkov/angular-editor";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  FormArray,
  Validators,
} from "@angular/forms";
import { environment } from "@environments/environment";

import {
  AlertService,
  AuthService,
  DbService,
  CustomValidationService,
} from "@app/_services";
import { Post, Category } from "@app/_models";
import { ThrowStmt } from "@angular/compiler";
import { e, t } from "@angular/core/src/render3";

@Component({
  selector: "app-create-post",
  templateUrl: "./create-post.component.html",
  styleUrls: ["./create-post.component.css"],
})
export class CreatePostComponent implements OnInit {
  Categories: Array<Category[]>;
  isSubmitted: boolean = false;
  public featuredImage: string;
  public newCategory: "asf";
  editPostRoute: boolean = false;
  post: Post;
  // postForm: FormGroup;
  loading: boolean = false;
  savingCategory: boolean = false;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @ViewChild("fileInput") fileInput: ElementRef;
  private uploadsUrl = environment.uploadsUrl;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private db: DbService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private customValidationService: CustomValidationService
  ) {
    this.route.params.subscribe((params) => {
      if (params.postId) {
        this.editPostRoute = true;
        this.gePostData(params.postId);
      }
    });
  }

  ngOnInit() {
    this.categoriesList;
  }

  postForm = new FormGroup({
    title: new FormControl(null, [
      Validators.required,
      Validators.minLength(6),
    ]),
    body: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    categories: this.formBuilder.array([], Validators.required),
    status: new FormControl("draft"),
    newCategory: new FormControl(""),
    featuredImage: new FormControl(null, [
      this.customValidationService.imageTypeValidator("image/jpeg, image/png"),
      this.customValidationService.fileSizeValidator(2000000),
    ]),
  });

  get f() {
    return this.postForm.controls;
  }

  gePostData(postId: string) {
    console.log(postId);
    this.db.getPost(postId).subscribe({
      next: (data: any) => {
        console.log(data);
        this.post = data.post;
        this.postForm.patchValue({
          title: this.post.title,
          body: this.post.body,
          status: this.post.status,
          categories: this.post.categories,
        });
        this.featuredImage = `${this.uploadsUrl}/posts/${this.post.featuredImage}`;
      },
    });
  }

  onFileChange($event) {
    console.log(this.Categories);
    let file = $event.target.files[0];
    if (file) {
      this.postForm.patchValue({
        featuredImage: file,
      });
      if (this.postForm.controls.featuredImage.valid) {
        var fileReader: FileReader = new FileReader();
        fileReader.onload = (e) => {
          this.featuredImage = fileReader.result as string;
        };
        fileReader.readAsDataURL(file);
      }
      //this.form.controls["profileImage"].setValue(file);
    }
  }

  /**
   * Uncheck all checkboxes
   */
  uncheckAll() {
    this.checkboxes.forEach((element) => {
      element.nativeElement.checked = false;
    });
  }

  /**
   * Reset the form
   */

  resetPostForm() {
    this.postForm.reset();
    this.uncheckAll();
    this.featuredImage = null;

    this.fileInput.nativeElement.value = "";

    this.postForm.patchValue({
      status: "published",
    });
    const categories: FormArray = this.postForm.get("categories") as FormArray;
    let i: number = 0;

    categories.controls.forEach((item: FormControl) => {
      categories.removeAt(i);
      i++;
    });
  }

  /**
   *
   * @returns Get Catgories
   */

  get categoriesList() {
    return this.db.getAll().subscribe({
      next: (data) => {
        this.Categories = data.categories;
        if (this.editPostRoute) {
          setTimeout(() => {
            const Categories: FormArray = this.postForm.get(
              "categories"
            ) as FormArray;
            this.post.categories.forEach((category: any) => {
              this.checkboxes.forEach((element) => {
                if (element.nativeElement.value === category._id) {
                  element.nativeElement.checked = true;
                  Categories.push(new FormControl(category._id));
                }
              });
            });
          }, 50);
        }
      },
      error: (err) => {
        console.error(err);
        this.alertService.error(
          err.error.message || "Something went wrong Please try again Later."
        );
      },
    });
  }

  /**
   *
   * save Category
   */

  saveCategory(e) {
    e.preventDefault();
    this.postForm.controls.newCategory.setErrors(null);
    this.alertService.clear();
    const newCategory = this.f.newCategory.value;
    if (newCategory) {
      this.savingCategory = true;
      const categoryData: Category = {
        name: newCategory,
        slug: newCategory.replace(/\s+/g, "-").toLowerCase(),
      };
      this.db.createCategory(categoryData).subscribe(
        (category: any) => {
          console.log(category);
          this.savingCategory = false;
          this.f.newCategory.setValue("");
          this.Categories.push(category);
        },
        (err) => {
          this.savingCategory = false;
          this.alertService.error(
            err.error.message || "Something went wrong Please try again Later."
          );
        }
      );
    } else {
      this.postForm.controls.newCategory.setErrors({ required: true });
    }
  }

  savePost() {
    this.f.newCategory.setErrors(null);
    this.isSubmitted = true;
    if (this.postForm.invalid) return;
    this.alertService.clear();
    this.loading = true;

    const { newCategory, ...formData } = this.postForm.value;

    if (this.editPostRoute && this.post._id) {
      this.db.updatePost(formData, this.post._id).subscribe(
        (data) => {
          this.alertService.success("Post Updated Successfully!", {
            keepAfterRouteChange: true,
            autoClose: true,
          });

          this.router.navigate(
            [
              "/users/profile/" +
                this.authService.userData.userProfile.user.username +
                "/posts",
            ],
            { relativeTo: this.route }
          );
        },
        (err) => {
          this.alertService.error(
            err.error.message || "Something went wrong Please try again Later."
          );
          this.resetPostForm();

          this.isSubmitted = false;
          this.loading = false;
        }
      );
    } else {
      this.db.createPost(formData).subscribe(
        (data) => {
          this.alertService.success("Post Created Successfully!", {
            keepAfterRouteChange: true,
            autoClose: true,
          });

          this.router.navigate(
            [
              "/users/profile/" +
                this.authService.userData.userProfile.user.username +
                "/posts",
            ],
            { relativeTo: this.route }
          );

          // this.resetPostForm();

          // this.loading = false;
          // this.isSubmitted = false;
          // this.postForm.reset();
        },
        (err) => {
          this.alertService.error(
            err.error.message || "Something went wrong Please try again Later."
          );
          this.resetPostForm();

          this.isSubmitted = false;
          this.loading = false;
        }
      );
    }
  }

  changeStatus(e) {
    this.postForm.patchValue({ status: e.target.value });
  }

  onCategoryChange(e) {
    const categories: FormArray = this.postForm.get("categories") as FormArray;
    if (e.target.checked) {
      categories.push(new FormControl(e.target.value));
    } else {
      let i: number = 0;
      categories.controls.forEach((item: FormControl) => {
        if (item.value == e.target.value) {
          categories.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: "25rem",
    minHeight: "0",
    maxHeight: "auto",
    width: "auto",
    minWidth: "0",
    translate: "yes",
    enableToolbar: true,
    showToolbar: true,
    placeholder: "Enter text here...",
    defaultParagraphSeparator: "",
    defaultFontName: "",
    defaultFontSize: "",
    fonts: [
      { class: "arial", name: "Arial" },
      { class: "times-new-roman", name: "Times New Roman" },
      { class: "calibri", name: "Calibri" },
      { class: "comic-sans-ms", name: "Comic Sans MS" },
    ],
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: "redText",
        class: "redText",
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ],
    uploadUrl: "v1/image",
  };
}
