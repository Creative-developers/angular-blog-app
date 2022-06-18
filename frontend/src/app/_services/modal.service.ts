import { Injectable } from "@angular/core";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  private modal =  new Subject();

  onModal(): Observable<any> {
    return this.modal.asObservable();  
  }
    

  openModal(){
    this.modal.next();
  }  


}
