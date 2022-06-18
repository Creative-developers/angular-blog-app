import { Component, OnInit, Output, Input, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import * as moment from "moment";
import { environment } from "@environments/environment";

import { AlertService, AuthService, DbService } from "@app/_services";
import { HeaderComponent } from "@app/_partials/header/header.component";
import { Post, Category, Comment } from "@app/_models";

@Component({
  selector: "comments",
  templateUrl: "./comments.component.html",
  styleUrls: ["./comments.component.css"],
})
export class CommentsComponent implements OnInit {
  @Input() postId: string;
  replyForm: FormGroup;
  user: string;
  @Input() comment: Comment;
  @Output() addComment = new EventEmitter();
  isSubmitted: boolean = false;
  loading: boolean = false;
  depth: string;
  showReply: boolean = false;
  private uploadsUrl = environment.uploadsUrl;

  constructor(
    private router: Router,
    private db: DbService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.replyForm = new FormGroup({
      body: new FormControl("", [Validators.required, Validators.minLength(3)]),
    });
    this.depth = (this.comment.depth - 1) * 10 + "%";
    this.user = this.authService.token;
  }

  get f() {
    return this.replyForm.controls;
  }

  calculateDepth(depth: number) {
    if (depth <= 3) return (depth - 1) * 10 + "%";
    return 0;
  }

  getUserImage(comment: any) {
    if (comment.user.profile.image) {
      if (
        this.db.checkFileExists(
          `${this.uploadsUrl}/users-profile/${comment.user.profile.image}`
        )
      ) {
        return `${this.uploadsUrl}/users-profile/${comment.user.profile.image}`;
      } else {
        return "./assets/images/no-user.jpg";
      }
    } else {
      return "./assets/images/no-user.jpg";
    }
  }

  toggleReplyTo() {
    this.showReply = !this.showReply;
  }

  replyToComment(event) {
    this.isSubmitted = true;
    if (this.replyForm.invalid) return;

    this.loading = true;
    event.preventDefault();

    let comment = {
      body: this.f.body.value,
      parentId: this.comment._id,
      depth: this.comment.depth + 1,
    };

    this.db.createComment(comment, this.postId).subscribe({
      next: (response: any) => {
        this.replyForm.reset();
        this.isSubmitted = false;
        this.loading = false;
        this.addComment.emit();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitted = false;
        this.loading = false;
      },
    });
  }

  refreshComments(event) {
    console.log("refreshComments");
  }
}
