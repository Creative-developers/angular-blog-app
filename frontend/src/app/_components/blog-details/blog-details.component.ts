import { Component, OnInit } from "@angular/core";
import { AuthService } from "@app/_services";
import { User } from "@app/_models";

@Component({
  selector: "app-blog-details",
  templateUrl: "./blog-details.component.html",
  styleUrls: ["./blog-details.component.css"],
})
export class BlogDetailsComponent implements OnInit {
  user: User;
  constructor(private authService: AuthService) {
    console.log(localStorage.getItem("user"));
  }

  ngOnInit() {}
}
