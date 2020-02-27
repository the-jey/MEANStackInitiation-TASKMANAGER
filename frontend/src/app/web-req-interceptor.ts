import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, empty, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  refreshingAccessToken: boolean;

  accessTokenRefreshed: Subject<any> = new Subject();

  intercept(request: HttpRequest<any>, next: HttpHandler):Observable<any> {
    //Handle the request
    request = this.addAuthHeader(request);

    // call next()
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);

        if(error.status === 401) {
          //401 error

          return this.refreshAccessToken()
            .pipe(
              switchMap(() => {
                request = this.addAuthHeader(request);
                return next.handle(request);
              }),
              catchError((err: any) => {
                console.log(err);
                this.authService.logout();
                return empty();
              })
            )
        }

        return throwError(error);
      })
    )
  }

  refreshAccessToken() {
    if(this.refreshingAccessToken) {
      return new Observable(observer => {
        this.accessTokenRefreshed.subscribe(() => {
          //This code will run when acces token has been refreshed
          observer.next();
          observer.complete();
        })
      })

    } else {      
      this.refreshingAccessToken = true;
      //Call the auth service to refresh the access token
      return this.authService.getNewAccessToken().pipe(
        tap(() => {
          this.refreshingAccessToken = false;
          this.accessTokenRefreshed.next();
          console.log('Access Token Refreshed');
        })
      )

    }

  }

  addAuthHeader(request: HttpRequest<any>) {
    // Get the access token
    const token = this.authService.getAccessToken();
    if (token) {
        // Append the access token
        return request.clone({
          setHeaders: {
            'x-access-token': token
          }
        })
    }
    return request;
  }
}
