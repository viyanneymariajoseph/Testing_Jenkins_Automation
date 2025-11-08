import { OnlineExamServiceService } from "../../Services/online-exam-service.service";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { BsDropdownModule, BsDatepickerModule } from "ngx-bootstrap";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
// import { NgxPrintModule } from "ngx-print";
import { ModalModule } from 'ngx-bootstrap/modal';
import { RouterModule } from "@angular/router";
import { reportRoutes } from "./report.routing";
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { TableModule } from 'primeng/table';
import { RetrievalreportComponent } from "./retrieval-report/retrieval-report.component";
import { RefillingreportComponent } from "./refilling-report/refilling-report.component";
import { OutreportComponent } from "./out-report/out-report.component";
import { DumpreportComponent } from "./dump-report/dump-report.component";
import { PickupRequestReportComponent } from './pickup-request-report/pickup-request-report.component';
import { InventoryReportComponent } from './inventory-report/inventory-report.component';
import { CheckboxModule } from 'primeng/checkbox';
import { DisInventoryReportComponent } from './dis-inventory-report/dis-inventory-report.component';
import { InventoryUploadReportComponent } from './inventory-upload-report/inventory-upload-report.component';
import{ItemstatusreportComponent} from "./item-status-report/item-status-report.component";
import { UserLogsComponent } from "./user-logs/user-logs.component";
import { UserMatrixComponent } from "./user-matrix/user-matrix.component";


@NgModule({
  declarations: [RetrievalreportComponent,RefillingreportComponent,OutreportComponent,DumpreportComponent, PickupRequestReportComponent, InventoryReportComponent, DisInventoryReportComponent,InventoryUploadReportComponent,ItemstatusreportComponent,UserLogsComponent,UserMatrixComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(reportRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ProgressbarModule.forRoot(),
    BsDropdownModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    TableModule,
    CheckboxModule
  ]
})
export class ReportModule {}
