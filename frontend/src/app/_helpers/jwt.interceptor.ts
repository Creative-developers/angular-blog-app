import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { JwtHelperService } from "@auth0/angular-jwt";
import { environment } from "@environments/environment";
import { AuthService } from "@app/_services";

@Injectable()
export class JWTInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.token;
    const apiUrl = request.url.startsWith(environment.apiUrl);

  

    if (token && apiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(request);
  }


}
