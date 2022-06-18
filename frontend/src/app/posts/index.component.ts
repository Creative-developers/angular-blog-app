import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DbService, AlertService } from "@app/_services";
import { Subscription } from 'rxjs'
import { Post } from '@app/_models'

@Component({
  selector: "posts-index",
  templateUrl: "./index.component.html",
})
export class IndexComponent implements OnInit {

    ngOnInit(){

    }
}