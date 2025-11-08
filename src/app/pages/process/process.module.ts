import { OnlineExamServiceService } from "../../Services/online-exam-service.service";
import { NgModule  } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
// import { NgxPrintModule } from "ngx-print";
import { ModalModule } from 'ngx-bootstrap/modal';
import {MatExpansionModule} from '@angular/material/expansion';
import { RouterModule } from "@angular/router";
import { DepartmentRoutes } from "./process.routing";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FileAcknowledgeComponent } from "./file-acknowledge/file-acknowledge.component";
import { PODEntryComponent } from './PODEntry/PODEntry.component';

import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { PODAcknowledgeComponent } from './PODAcknowledge/PODAcknowledge.component';
// import { InwardACKComponent } from './InwardACK/InwardACK.component';
import { FileAckComponent } from './file-ack/file-ack.component';
import { BranchInwardComponent } from './branch-inward/branch-inward.component';
import { PodAckComponent } from './pod-Ack/pod-Ack.component';
//import { DataviewComponent } from './dataview/dataview.component';
import { FileinwardComponent } from './file-inward/file-inward.component';
import{ PrintBarcodeComponent }from './print-barcode/print-barcode.component';
import { PickupRequestComponent } from './pickup-request/pickup-request.component';
import { NewPickupRequestComponent } from './new-pickup-request/new-pickup-request.component';
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { PickupRequestAckComponent } from './pickup-request-ack/pickup-request-ack.component';
import { UpdateScheduleComponent } from './update-schedule/update-schedule.component';
import { FileInwardFormComponent } from './file-inward-form/file-inward-form.component';
import { FileInwardInventryComponent } from './file-inward-inventry/file-inward-inventry.component';
import { FileInventryQcComponent } from './file-inventry-qc/file-inventry-qc.component';
import { FileInventryQcFormComponent } from './file-inventry-qc-form/file-inventry-qc-form.component';
import { EditFileQcComponent } from './edit-file-qc/edit-file-qc.component';
import { CalendarModule } from 'primeng/calendar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core'; // Import MatNativeDateModule


@NgModule({
  declarations:  [BranchInwardComponent,FileinwardComponent,FileAckComponent, PODAcknowledgeComponent,PODEntryComponent,FileAcknowledgeComponent,PodAckComponent,PrintBarcodeComponent, PickupRequestComponent, NewPickupRequestComponent, PickupRequestAckComponent, UpdateScheduleComponent, FileInwardFormComponent, FileInwardInventryComponent, FileInventryQcComponent, FileInventryQcFormComponent, EditFileQcComponent],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    RouterModule.forChild(DepartmentRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ProgressbarModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    // NgxPrintModule,
    CheckboxModule,
    TableModule,
    MatDialogModule,
    CalendarModule
    //MatExpansionModule
  ],
 })
export class ProcessModule {}
