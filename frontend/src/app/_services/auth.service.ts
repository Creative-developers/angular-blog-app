import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError, first } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import { environment } from "@environments/environment";
import { JwtHelperService } from "@auth0/angular-jwt";
import { User } from "@app/_models";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json; charset=utf-8",
  }),
};

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private UserSubject: BehaviorSubject<any>;
  private TokenSubject: BehaviorSubject<any>;
  public user: Observable<User>;

  constructor(private http: HttpClient, private router: Router) {
    this.TokenSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem("token"))
    );
    this.UserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem("user"))
    );
    this.user = this.UserSubject.asObservable();
  }

  public checkAuth() {
    const helper = new JwtHelperService();
    if (helper.isTokenExpired(this.token)) {
      this.logout();
    }
  }

  public get token() {
    return this.TokenSubject.value;
  }

  public isTokenExpired(): boolean {
    const helper = new JwtHelperService();
    return helper.isTokenExpired(this.token);
  }

  public get userData() {
    const helper = new JwtHelperService();

    const token = JSON.parse(localStorage.getItem("user"));
    const userData = helper.decodeToken(token);
    return userData;
  }

  loginUser(username, password) {
    return this.http
      .post<any>(this.apiUrl + "/auth/login", { username, password })
      .pipe(
        map((res) => {
          localStorage.setItem("token", JSON.stringify(res.token));
          this.TokenSubject.next(res.token);
          //get User profile
          this.http
            .get<any>(`${this.apiUrl}/users/profile`)
            .subscribe((res) => {
              localStorage.setItem("user", JSON.stringify(res.user));
              this.UserSubject.next(res.user);
              return;
            });
        })
      );
  }
  registerUser(user: User) {
    console.log(user);
    return this.http.post(`${this.apiUrl}/auth/register`, user);
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.UserSubject.next(null);
    this.TokenSubject.next(null);
    this.router.navigate(["/"]);
  }

  getProfile(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/users/profile`);
  }

  updateProfile(user: User): Observable<any> {
    let formData = new FormData();

    for (const key of Object.keys(user)) {
      if (key !== "profileImage") formData.append(key, user[key]);
    }

    if (user.profileImage) {
      formData.append(
        "profileImage",
        user.profileImage,
        user.profileImage.name
      );
    }

    // const formData = new FormData();
    // console.log(user);
    // formData.append("firstName", user.firstName);
    // formData.append("lastName", user.lastName);
    // formData.append("email", user.email);
    // formData.append("username", user.username);
    // formData.append("phoneNumber", user.phoneNumber);
    // if (user.profileImage) {
    //   formData.append(
    //     "profileImage",
    //     user.profileImage,
    //     user.profileImage.name
    //   );
    // }

    return this.http.put<any>(`${this.apiUrl}/users/profile`, formData).pipe(
      map((res) => {
        console.log(res.user);
        localStorage.setItem("user", JSON.stringify(res.user));
        this.UserSubject.next(res.user);
        return user;
      })
    );
  }

  updatePassword(passwords) {
    return this.http.put(`${this.apiUrl}/users/updatePassword`, passwords);
  }
}
