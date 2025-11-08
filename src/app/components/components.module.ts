import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
import { SidebarComponent } from "./sidebar/sidebar.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { VectorMapComponent1 } from "./vector-map/vector-map.component";

import { RouterModule } from "@angular/router";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { DxVectorMapModule } from "devextreme-angular";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import {MatToolbarModule} from '@angular/material/toolbar';
import { CommonService } from "../Services/common.service";
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CollapseModule.forRoot(),
    DxVectorMapModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatExpansionModule,
    MatCardModule,
    MatDividerModule,
    BrowserAnimationsModule
  ],
  declarations: [
    FooterComponent,
    VectorMapComponent1,
    NavbarComponent,
    SidebarComponent,
  ],
  exports: [
    FooterComponent,
    VectorMapComponent1,
    NavbarComponent,
    SidebarComponent
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    CommonService
  ]
})
export class ComponentsModule {}
