import { Component, OnInit, ViewChild } from "@angular/core";
import { ViewportScroller } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import * as moment from "moment";
import {
  AuthService,
  DbService,
  AlertService,
  ModalService,
  PusherService,
} from "@app/_services";
import { User, Post } from "@app/_models";
import { environment } from "@environments/environment";

@Component({
  selector: "app-post-details",
  templateUrl: "./post-details.component.html",
  styleUrls: ["./post-details.component.css"],
})
export class PostDetailsComponent implements OnInit {
  user: User;
  post: Post;
  form: FormGroup;
  loading: boolean = true;
  commentFormLoading: boolean = false;
  comments: Comment[] = [];
  totalComments: number = 0;
  isSubmitted: boolean = false;
  private uploadsUrl = environment.uploadsUrl;
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private db: DbService,
    private modalService: ModalService,
    private pusher: PusherService,
    private scroller: ViewportScroller
  ) {}

  ngOnInit() {
    const channel = this.pusher.init("comments");

    this.user = this.authService.token;

    this.form = new FormGroup({
      body: new FormControl("", [Validators.required, Validators.minLength(3)]),
    });

    this.route.fragment.subscribe((fragment: string) => {
      if (fragment) {
        setTimeout(() => {
          this.scrollToAnchor(fragment, 100);
        }, 300);
      }
    });

    this.route.params.subscribe((params: any) => {
      if (params.postId !== undefined) {
        channel.bind(`comment-added-${params.postId}`, (data) => {
          console.log(data);
          if (data.comment !== undefined && data.comment !== null) {
            this.getComments(params.postId);
          }
        });

        this.db.getPost(params.postId).subscribe(
          (response: any) => {
            this.loading = false;
            this.post = response.post;
            this.getComments(this.post._id);
          },
          (error: any) => {
            this.loading = false;
            console.error(error);
            this.alertService.warn("Post not found");
          }
        );
      }
    });
  }
  get f() {
    return this.form.controls;
  }

  public scrollToAnchor(location: string, wait = 0): void {
    const element = document.querySelector("#" + location);
    console.log(element);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, wait);
    }
  }

  getComments(postId: string, scroll = true) {
    this.db.getPostComments(postId).subscribe(
      (res: any) => {
        this.comments = this.displayComments(res.comments);
        const last_comment = this.comments[this.comments.length - 1];
        if (last_comment && scroll) {
          setTimeout(() => {
            const element = document.querySelector("#comments-area");
            element.scrollTop = element.scrollHeight;
          }, 100);
        }
        // this.comments = res.comments;
        this.totalComments = res.count;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  displayComments(allComments: any) {
    let comments = [];
    for (let comment of allComments) {
      comments.push(comment);

      if (comment.childrens && comment.childrens.length > 0) {
        let replies = this.displayComments(comment.childrens);

        comments = comments.concat(replies);
      }
    }
    return comments;
  }

  openLoginModal(event) {
    event.preventDefault();
    this.modalService.openModal();
  }

  refreshComments(event) {
    this.getComments(this.post._id, false);
  }

  parsePostDate(date: string): string {
    return moment(date).format("MMMM Do, YYYY");
  }

  getPostImage(post: Post) {
    if (post.featuredImage !== undefined && post.featuredImage !== null) {
      return `${this.uploadsUrl}/posts/${post.featuredImage}`;
    } else {
      return "https://dummyimage.com/900x400/ced4da/6c757d.jpg&text=No+Image+Available";
    }
  }

  submitForm(event) {
    // if (event.keyCode === 13) {
    this.isSubmitted = true;
    if (this.form.invalid) return;

    this.commentFormLoading = true;
    this.db.createComment(this.form.value, this.post._id).subscribe({
      next: (res: any) => {
        let comment_id = "comment-" + res.comment._id;
        this.form.reset();
        this.isSubmitted = false;
        this.commentFormLoading = false;

        this.getComments(this.post._id);
        setTimeout(() => {
          this.scrollToAnchor(comment_id);
        }, 500);
      },
      error: (err: any) => {
        console.error(err);
        this.commentFormLoading = false;
      },
    });
  }
  // }
}
