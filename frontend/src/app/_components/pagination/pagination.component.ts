import {
  Component,
  OnInit,
  ElementRef,
  Output,
  EventEmitter,
  Input,
} from "@angular/core";
import { AuthService } from "@app/_services";
import { Router, ActivatedRoute, NavigationStart } from "@angular/router";
import { Subject, Subscription } from "rxjs";

@Component({
  selector: "pagination",
  templateUrl: "./pagination.component.html",
  styleUrls: ["./pagination.component.css"],
})
export class PaginationComponent implements OnInit {
  @Input() perPage: number = 1;
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() pageRange: number = 2;

  @Output() changePage = new EventEmitter<any>(true);
  loadPagination: boolean = false;
  pages: Array<any>;

  constructor() {}

  ngOnInit() {
    if (this.totalItems) this.loadPagination = true;
    this.pages = this.calculatePages();
  }

  changePageNumber(pageNumber: number) {
    this.changePage.emit(pageNumber);
  }

  calculatePages(): Array<any> {
    let pages = [];
    for (let i = this.rangeStart; i <= this.rangeEnd; i++) {
      pages.push(i);
    }
    return pages;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.perPage);
  }

  get isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  get hasFirst(): boolean {
    return this.rangeStart !== 1;
  }
  get hasLast(): boolean {
    return this.rangeEnd !== this.totalPages;
  }

  get rangeStart(): number {
    const range =
      this.currentPage - this.pageRange > 0
        ? this.currentPage - this.pageRange
        : 1;

    return range;
  }

  get rangeEnd(): number {
    const end = this.currentPage + this.pageRange;
    return end >= this.totalPages ? this.totalPages : end;
  }

  get isLastPage(): boolean {
    return this.currentPage >= this.totalPages;
  }
}
