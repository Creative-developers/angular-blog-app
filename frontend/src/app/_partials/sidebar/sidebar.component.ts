import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";

import { AlertService, AuthService, DbService } from "@app/_services";
import { Category } from "@app/_models";

@Component({
  selector: "sidebar",
  templateUrl: "./sidebar.component.html",
})
export class SidebarComponent implements OnInit {
  categories: Category[] = [];
  search: string = "";
  constructor(private db: DbService, private router: Router) {}

  ngOnInit(): void {
    this.categoriesList;
  }

  get categoriesList() {
    return this.db.getAll().subscribe({
      next: (data) => {
        this.categories = data.categories;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  searchInPosts() {
    this.router.navigate(["/posts/search"], {
      queryParams: {
        keyword: this.search,
      },
    });
  }
}
