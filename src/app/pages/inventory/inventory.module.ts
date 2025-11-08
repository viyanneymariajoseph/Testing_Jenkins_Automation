import { OnlineExamServiceService } from "../../Services/online-exam-service.service";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
// import { NgxPrintModule } from "ngx-print";
import { ModalModule } from "ngx-bootstrap/modal";
import { MatExpansionModule } from "@angular/material/expansion";
import { RouterModule } from "@angular/router";
import { DepartmentRoutes } from "./inventory.routing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from "primeng/table";
import { CheckboxModule } from "primeng/checkbox";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { CalendarModule } from "primeng/calendar";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core"; // Import MatNativeDateModule
import { InventoryComponent } from "./inventory/inventory.component";
import { CreateInventoryComponent } from "./create-inventory/create-inventory.component";
import { BulkInventoryComponent } from "./bulk-inventory/bulk-inventory.component";
import { InventoryApprovalComponent } from "./inventory-approval/inventory-approval.component";
import { WarehouseListingComponent } from "./warehouse-listing/warehouse-listing.component";
import { WarehouseAckComponent } from "./warehouse-ack/warehouse-ack.component";
import { WarehouseLocationComponent } from "./warehouse-location/warehouse-location.component";
import { WarehouseLocationFormComponent } from "./warehouse-location-form/warehouse-location-form.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@NgModule({
  declarations: [
    InventoryComponent,
    CreateInventoryComponent,
    BulkInventoryComponent,
    InventoryApprovalComponent,
    WarehouseListingComponent,
    WarehouseAckComponent,
    WarehouseLocationComponent,
    WarehouseLocationFormComponent,
  ],
  imports: [
    CommonModule,
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MultiSelectModule,
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
    CalendarModule,
    MatProgressSpinnerModule
  ],
})
export class InventoryModule {}
