import { Routes } from "@angular/router";
import { ReturnToStorageComponent } from "./return-to-storage/return-to-storage.component";
import { ReturnApprovalComponent } from "./return-approval/return-approval.component";
import { WarehouseScheduleComponent } from "./warehouse-schedule/warehouse-schedule.component";
import { WarehouseReturnAckComponent } from "./warehouse-return-ack/warehouse-return-ack.component";
import { WarehouseLocationUpdateComponent } from "./warehouse-location-update/warehouse-location-update.component";
import { ReturnToStorageFormComponent } from "./return-to-storage-form/return-to-storage-form.component";
import { WarehouseLocationUpdateFormComponent } from "./warehouse-location-update-form/warehouse-location-update-form.component";

export const DepartmentskRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "send-to-storage",
        component: ReturnToStorageComponent,
      },
      {
        path: "send-to-storage-form",
        component: ReturnToStorageFormComponent,
      },
      {
        path: "return-approval",
        component: ReturnApprovalComponent,
      },
      {
        path: "warehouse-schedule",
        component: WarehouseScheduleComponent,
      },
      {
        path: "warehouse-ack",
        component: WarehouseReturnAckComponent,
      },
      {
        path: "warehouse-location-update",
        component: WarehouseLocationUpdateComponent,
      },
            {
        path: "warehouse-location-update/:id",
        component: WarehouseLocationUpdateFormComponent,
      },
    ],
  },
];
