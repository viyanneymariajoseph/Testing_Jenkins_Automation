
import { DashboardComponent } from "./dashboard/dashboard.component";
import { DashboardsRoutes } from "./dashboards.routing";
import { ChartModule } from 'primeng/chart';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { BsDropdownModule } from "ngx-bootstrap";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { ModalModule } from 'ngx-bootstrap/modal';
import { RouterModule } from "@angular/router";''
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import { UserdashboardComponent } from "./Userdashboard/Userdashboard.component";
import { ComponentsModule } from "../components/components.module";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';


@NgModule({
  declarations: [DashboardComponent, UserdashboardComponent],
  imports: [
    CommonModule,
    ComponentsModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    ModalModule.forRoot(),
    PaginationModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ProgressbarModule.forRoot(),
    TooltipModule.forRoot(),
    RouterModule.forChild(DashboardsRoutes),
    TableModule,
    ChartModule
  ],
exports: [DashboardComponent]
})
export class DashboardsModule {
}
