import { NgModule, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AlertComponent } from "@app/_components/alert/alert.component";
import { PaginationComponent } from "@app/_components/pagination/pagination.component";

import { DateAsAgoPipe } from "./date-as-ago.pipe";

import { AngularEditorConfig } from "@kolkov/angular-editor";

@NgModule({
  imports: [CommonModule],
  declarations: [AlertComponent, PaginationComponent, DateAsAgoPipe],
  exports: [AlertComponent, PaginationComponent, DateAsAgoPipe],
})
export class SharedModule {}
