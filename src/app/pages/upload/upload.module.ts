import { OnlineExamServiceService } from "../../Services/online-exam-service.service";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
//import { NgxPrintModule } from "ngx-print";
import { ModalModule } from 'ngx-bootstrap/modal';
import { RouterModule } from "@angular/router";
import { uploadRoutes } from "./upload.routing";
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { TableModule } from 'primeng/table'; 
import { DumpuploadComponent } from "./dump-upload/dump-upload.component";
import { InvuploadComponent } from "./invupload/invupload.component"; 
import { PaymentUpdateComponent } from "./payment-update/payment-update.component";
import { UploaditemstatusComponent } from "./upload-item-status/upload-item-status.component";

//sftpuploadForm
//import { DepartmentComponent } from "./department/department.component";

@NgModule({
  declarations: [DumpuploadComponent,InvuploadComponent,PaymentUpdateComponent,UploaditemstatusComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(uploadRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ProgressbarModule.forRoot(),
    BsDropdownModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    
 
    TableModule
     
  ]
})
export class UploadModule {}
