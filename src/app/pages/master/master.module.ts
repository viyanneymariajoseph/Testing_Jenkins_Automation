import { OnlineExamServiceService } from "../../Services/online-exam-service.service";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { BsDropdownModule } from "ngx-bootstrap";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
// import { NgxPrintModule } from "ngx-print";
import { ModalModule } from 'ngx-bootstrap/modal';
import { DepartmentComponent } from "./department/department.component";
import { BranchMappingComponent } from "./branch-mapping/branch-mapping.component";
import { RouterModule } from "@angular/router";''
import { DepartmentRoutes } from "./master.routing";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BranchComponent } from "./branch/branch.component"; 
import { TableModule } from 'primeng/table';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import { EmailNotificationComponent } from "./email-notification/email-notification.component";
import { CrownMasterComponent } from './crown-master/crown-master.component';
import { CrownMappingComponent } from './crown-mapping/crown-mapping.component';
// import { FileAcknowledgeComponent } from '../process/file-acknowledge/file-acknowledge.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { ApprovalComponent } from './approval/approval.component';
import { TabViewModule } from 'primeng/tabview';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [DepartmentComponent,BranchMappingComponent,BranchComponent, CrownMasterComponent, CrownMappingComponent, ApprovalComponent, WarehouseComponent, EmailNotificationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(DepartmentRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ProgressbarModule.forRoot(),
    BsDropdownModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    MatIconModule,
    MatMenuModule,
    TabViewModule, 
    // NgxPrintModule,
    TableModule,
    NgSelectModule,
    MultiSelectModule
  ]
})
export class MasterModule {}
