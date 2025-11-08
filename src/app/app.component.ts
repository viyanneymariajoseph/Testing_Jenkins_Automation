import { Component, HostListener } from "@angular/core";
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { LoadingService } from './Services/loading.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {

  title = 'angular-boilerplate';
  loading: boolean = false;
  popStateHandler: () => void;


  constructor(private router: Router,
    private _loading: LoadingService) {

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Show loading indicator
        window.scrollTo(0, 0);
      }

      if (event instanceof NavigationEnd) {
        // Hide loading indicator
      }

      if (event instanceof NavigationError) {
        // Hide loading indicator

        // Present error to user
        console.log(event.error);
      }
    });
  }

  ngOnInit() {
    this.listenToLoading();
    this.popStateHandler = () => {
      history.pushState(null, '', window.location.href); // re-push same URL
    };
    history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', this.popStateHandler);
    // Prevent history popstate fallback
     history.pushState(null, '', location.href);
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    history.pushState(null, '', location.href);
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      event.preventDefault();
    }
  }

  /**
  * Listen to the loadingSub property in the LoadingService class. This drives the
  * display of the loading spinner.
  */
  listenToLoading(): void {
    this._loading.loadingSub
      .pipe(delay(0)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((loading) => {
        this.loading = loading;
      });
  }
}
