import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  Routes,
  RouterModule,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

import { PostComponent } from "./post/post.component";
import { CreatePostComponent } from "./create-post/create-post.component";
import { PostDetailsComponent } from "./post-details/post-details.component";
import { IndexComponent } from "./index.component";
import { SearchComponent } from "@app/_components/search/search.component";

import { AuthGuard } from "@app/_helpers";

const routes: Routes = [
  {
    path: "",
    component: IndexComponent,
    children: [
      {
        path: "",
        component: PostComponent,
      },
      {
        path: "posts/create",
        component: CreatePostComponent,
        pathMatch: "full",
        canActivate: [AuthGuard],
      },
      {
        path: "posts/search",
        component: SearchComponent,
      },
      {
        path: "posts/edit/:postId",
        component: CreatePostComponent,
        pathMatch: "full",
      },
      {
        path: "posts/:post/:postId",
        component: PostDetailsComponent,
        pathMatch: "full",
      },
      {
        path: "category/:category",
        component: PostComponent,
        pathMatch: "full",
      },
      {
        path: "category/:categoryId/:post.html",
        component: PostDetailsComponent,
        pathMatch: "full",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: "canActivatePosts",
      useValue: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        false,
    },
  ],
})
export class PostsRoutingModule {}
