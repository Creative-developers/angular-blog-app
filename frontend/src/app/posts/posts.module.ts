import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {
  Routes,
  RouterModule,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { SharedModule } from "@app/shared/shared.module";
import { PostsRoutingModule } from "./posts-routing.module";

import { IndexComponent } from "./index.component";
import { PostComponent } from "./post/post.component";
import { PostDetailsComponent } from "./post-details/post-details.component";
import { CreatePostComponent } from "./create-post/create-post.component";
import { AngularEditorModule } from "@kolkov/angular-editor";

import { SidebarComponent } from "@app/_partials/sidebar/sidebar.component";
import { SearchComponent } from "@app/_components/search/search.component";
import { CommentsComponent } from "@app/_components/comments/comments.component";

import { PusherService } from "@app/_services/pusher.service";

@NgModule({
  imports: [
    CommonModule,
    PostsRoutingModule,
    SharedModule,
    AngularEditorModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    IndexComponent,
    PostComponent,
    PostDetailsComponent,
    CreatePostComponent,
    SidebarComponent,
    SearchComponent,
    CommentsComponent,
  ],
  providers: [PusherService],
})
export class PostsModule {}
