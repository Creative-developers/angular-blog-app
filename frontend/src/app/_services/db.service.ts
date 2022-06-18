import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError, first } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import { environment } from "@environments/environment";
import { JwtHelperService } from "@auth0/angular-jwt";

import { Category, Post, Comment } from "@app/_models";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

@Injectable({
  providedIn: "root",
})
export class DbService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  public checkFileExists(path: string) {
    // var xhr = new XMLHttpRequest();
    // xhr.open("HEAD", path, false);
    // xhr.send();

    // return xhr.status !== 404;
    return path;
  }

  public getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl + "/categories").pipe(
      map((res) => {
        return {
          categories: res.categories,
        };
      })
    );
  }

  public getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl + "/posts");
  }

  public getUserPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl + "/posts/user");
  }

  public getPostsByCategory(categorySlug: string): Observable<Post[]> {
    //      let category = res.categories.find(c => c.slug === categorySlug);

    return this.http.get<Post[]>(
      `${this.apiUrl}/posts/categories/${categorySlug}`
    );
  }

  /**
   *
   * @ Search In Post
   */

  public searchInPosts(search: string): Observable<Post> {
    return this.http.get<Post>(this.apiUrl + `/posts/search?keyword=${search}`);
  }

  public deletePost(post: Post): Observable<Post> {
    return this.http.delete<Post>(this.apiUrl + "/posts/" + post._id);
  }

  public createPost(post: Post): Observable<Post> {
    let formData = new FormData();

    // console.log(post.categories.filter((c) => c !== null));

    // console.log(post);

    for (let key in post) {
      if (post.hasOwnProperty(key)) {
        if (key === "categories") {
          post[key] = post[key].filter((c) => c !== null);
        }
        formData.append(key, post[key]);
        //   formData.append("categories", JSON.stringify(post[key]));
        //   console.log(JSON.stringify(post[key]));
        // } else formData.append(key, post[key]);
      }
    }

    return this.http.post<Post>(this.apiUrl + "/posts", formData);
  }

  public updatePost(post: Post, postId: string): Observable<Post> {
    let formData = new FormData();
    for (let key in post) {
      if (post.hasOwnProperty(key)) {
        if (key === "categories") {
          post[key] = post[key].filter((c) => c !== null);
        }
        formData.append(key, post[key]);
      }
    }

    return this.http.put<Post>(this.apiUrl + `/posts/${postId}`, formData);
  }

  public getPostByName(postName: string): Observable<Post> {
    return this.http.get<Post>(this.apiUrl + `/posts/name/${postName}`);
  }

  public getPost(postId: string): Observable<Post> {
    return this.http.get<Post>(this.apiUrl + "/posts/" + postId);
  }

  public getPostComments(postId: string): Observable<Comment> {
    return this.http.get<Comment>(this.apiUrl + `/comments/${postId}`);
  }

  public createComment(comment: {}, postId: string): Observable<Comment> {
    return this.http.post<Comment>(
      this.apiUrl + `/comments/${postId}`,
      comment
    );
  }

  public createCategory(category: Category): Observable<Category> {
    return this.http
      .post<Category>(this.apiUrl + "/categories", category, httpOptions)
      .pipe(
        map((response) =>
          response["category"] !== [] ? response["category"] : []
        ),
        map((category) => {
          return {
            _id: category._id,
            name: category.name,
            slug: category.slug,
          };
        })
      );
  }
}
