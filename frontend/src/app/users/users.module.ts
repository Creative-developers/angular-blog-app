import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { UsersRoutingModule } from "./users-routing.module";
import { LayoutComponent } from "./layout.component";
import { EditProfileComponent } from "./edit-profile/edit-profile.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { ManagePostsComponent } from "./manage-posts/manage-posts.component";
import { SharedModule } from "@app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UsersRoutingModule,
    SharedModule,
  ],
  declarations: [
    LayoutComponent,
    EditProfileComponent,
    ChangePasswordComponent,
    ManagePostsComponent,
  ],
})
export class UsersModule {}
