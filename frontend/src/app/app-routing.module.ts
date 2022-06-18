import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoginComponent } from "./_components/login/login.component";
import { RegisterComponent } from "./_components/register/register.component";
import { HomeComponent } from "@app/_components/home/home.component";

import { BlogDetailsComponent } from "@app/_components/blog-details/blog-details.component";
import { AuthGuard } from "@app/_helpers";

const UsersModule = () =>
  import("./users/users.module").then((x) => x.UsersModule);
const PostsModule = () =>
  import("./posts/posts.module").then((x) => x.PostsModule);
const routes: Routes = [
  // { path: 'login',component: LoginComponent},
  // { path: 'register',component: RegisterComponent},
  {
    path: "",
    loadChildren: PostsModule,
  },
  {
    path: "users/profile/:username",
    loadChildren: UsersModule,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
