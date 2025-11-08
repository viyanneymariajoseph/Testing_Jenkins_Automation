import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  public hasRightListChanged: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public menuList: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private message: string = '';
  constructor() { }

  setRightList(rightList: any): void {
    this.hasRightListChanged.next(rightList);
  }
  setMessage(msg: string) {
    this.message = msg;
  }

  getMessage(): string {
    const temp = this.message;
    this.message = '';
    return temp;
  }

  getMenuAccess() {
    return this.menuList;
  }

  setMenuAccess(menu: any) {
    this.menuList.next(menu);
  }
}
