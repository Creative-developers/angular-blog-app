import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { JwtModule } from "@auth0/angular-jwt";

import { AppComponent } from "./app.component";
import { LoginComponent } from "./_components/login/login.component";
import { RegisterComponent } from "./_components/register/register.component";

import { AppRoutingModule } from "./app-routing.module";
import { HomeComponent } from "./_components/home/home.component";
import { HeaderComponent } from "./_partials/header/header.component";
import { FooterComponent } from "./_partials/footer/footer.component";
import { BlogDetailsComponent } from "./_components/blog-details/blog-details.component";
import { ModalsComponent } from "./_partials/modals/modals.component";

import { ErrorInterceptor, JWTInterceptor } from "@app/_helpers";

import { SharedModule } from "@app/shared/shared.module";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    BlogDetailsComponent,
    ModalsComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
