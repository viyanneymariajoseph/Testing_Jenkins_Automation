import { Routes } from "@angular/router";
import { InventoryComponent } from "./inventory/inventory.component";
import { CreateInventoryComponent } from "./create-inventory/create-inventory.component";
import { BulkInventoryComponent } from "./bulk-inventory/bulk-inventory.component";
import { InventoryApprovalComponent } from "./inventory-approval/inventory-approval.component";
import { WarehouseAckComponent } from "./warehouse-ack/warehouse-ack.component";
import { WarehouseListingComponent } from "./warehouse-listing/warehouse-listing.component";
import { WarehouseLocationComponent } from "./warehouse-location/warehouse-location.component";
import { WarehouseLocationFormComponent } from "./warehouse-location-form/warehouse-location-form.component";

export const DepartmentRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "carton-inventory",
        component: InventoryComponent,
      },
      {
        path: "create-inventory",
        component: CreateInventoryComponent,
      },
      {
        path: "bulk-inventory",
        component: BulkInventoryComponent,
      },
      {
        path: "inventory-approval",
        component: InventoryApprovalComponent,
      },
      {
        path: "pickup-schedule",
        component: WarehouseListingComponent,
      },
      {
        path: "inventory-acknowledge",
        component: WarehouseAckComponent,
      },
      {
        path: "carton-storage",
        component: WarehouseLocationComponent,
      },
      {
        path: "warehouse-location-form/:id",
        component: WarehouseLocationFormComponent,
      },
    ],
  },
];
