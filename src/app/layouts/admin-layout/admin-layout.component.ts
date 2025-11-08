import { Component, OnInit, HostListener } from "@angular/core";
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.scss"]
})
export class AdminLayoutComponent implements OnInit {
  isMobileResolution: boolean;
  hidefooter = true;

  constructor(private router: Router) {
    if (window.innerWidth < 1200) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const hideFooterRoutes = ['/dashboards/dashboard'];
        this.hidefooter = !hideFooterRoutes.includes(event.urlAfterRedirects);
      }
    });
  }
  @HostListener("window:resize", ["$event"])
  isMobile(event) {
    if (window.innerWidth < 1200) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }
  ngOnInit() {
    
  }
}
