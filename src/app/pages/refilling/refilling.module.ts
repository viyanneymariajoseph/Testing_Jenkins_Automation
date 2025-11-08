import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReturnToStorageComponent } from "./return-to-storage/return-to-storage.component";
import { ReturnToStorageFormComponent } from "./return-to-storage-form/return-to-storage-form.component";
import { ReturnApprovalComponent } from "./return-approval/return-approval.component";
import { WarehouseReturnAckComponent } from "./warehouse-return-ack/warehouse-return-ack.component";
import { WarehouseScheduleComponent } from "./warehouse-schedule/warehouse-schedule.component";
import { WarehouseLocationUpdateComponent } from "./warehouse-location-update/warehouse-location-update.component";
import { WarehouseLocationUpdateFormComponent } from "./warehouse-location-update-form/warehouse-location-update-form.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MultiSelectModule } from "primeng/multiselect";
import { MatNativeDateModule } from "@angular/material/core";
import { RouterModule } from "@angular/router";
import { DepartmentskRoutes } from "./refilling.routing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { BsDatepickerModule, BsDropdownModule, ModalModule, PaginationModule, ProgressbarModule, TooltipModule } from "ngx-bootstrap";
import { CheckboxModule } from "primeng/checkbox";
import { TableModule } from "primeng/table";
import { MatDialogModule } from "@angular/material/dialog";
import { CalendarModule } from "primeng/calendar";

@NgModule({
  declarations: [
    ReturnToStorageComponent,
    ReturnToStorageFormComponent,
    ReturnApprovalComponent,
    WarehouseReturnAckComponent,
    WarehouseScheduleComponent,
    WarehouseLocationUpdateComponent,
    WarehouseLocationUpdateFormComponent,
  ],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MultiSelectModule,
    MatNativeDateModule,
    RouterModule.forChild(DepartmentskRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ProgressbarModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    CheckboxModule,
    TableModule,
    MatDialogModule,
    CalendarModule,
  ],
})
export class RefillingModule {}
