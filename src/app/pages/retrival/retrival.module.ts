import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { BsDropdownModule, BsDatepickerModule, TabsModule } from "ngx-bootstrap";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
// import { NgxPrintModule } from "ngx-print";
import { ModalModule } from 'ngx-bootstrap/modal';
import { RouterModule } from "@angular/router";
import { retrivalRoutes } from "./retrival.routing";
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { TableModule } from 'primeng/table';
import { RetrivalRequestComponent } from './retrival-request/retrival-request.component';
import { CsvUploadComponent } from './csv-upload/csv-upload.component';
import { ApprovalComponent } from './approval/approval.component';

import { MatDialogModule } from "@angular/material/dialog";
import { RetirvalDispatchComponent } from "./retirval-dispatch/retirval-dispatch.component";
import { CheckboxModule } from 'primeng/checkbox';
import { RefillingComponent } from './refilling/refilling.component';
import { RefillingAckComponent } from './refilling-ack/refilling-ack.component';
import { RetrievalRequestFormComponent } from './retrieval-request-form/retrieval-request-form.component';
import { AccessRefillingComponent } from "./access-refilling/access-refilling.component";
import { TabViewModule } from 'primeng/tabview';
import { RetrievalAcknowledgeComponent } from './retrieval-acknowledge/retrieval-acknowledge.component';


@NgModule({
  declarations: [
    RetrivalRequestComponent,
    CsvUploadComponent,
    ApprovalComponent,
    RetirvalDispatchComponent,
    RefillingComponent,
    RefillingAckComponent,
    RetrievalRequestFormComponent,
    AccessRefillingComponent,
    RetrievalAcknowledgeComponent
  ],
  imports: [
    RouterModule.forChild(retrivalRoutes),
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
    CommonModule,
    MatDialogModule,
    CheckboxModule,
    TabViewModule
  ]
})
export class RetrivalModule { }
