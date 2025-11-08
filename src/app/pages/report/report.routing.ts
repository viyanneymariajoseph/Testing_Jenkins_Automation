import { Routes } from "@angular/router";
import { RetrievalreportComponent } from "./retrieval-report/retrieval-report.component";
import { RefillingreportComponent } from "./refilling-report/refilling-report.component";
import { OutreportComponent } from "./out-report/out-report.component";
import { DumpreportComponent } from "./dump-report/dump-report.component";
import { PickupRequestReportComponent } from "./pickup-request-report/pickup-request-report.component";
import { InventoryReportComponent } from "./inventory-report/inventory-report.component";
import{DisInventoryReportComponent} from "./dis-inventory-report/dis-inventory-report.component";
import{InventoryUploadReportComponent} from "./inventory-upload-report/inventory-upload-report.component";
import{ItemstatusreportComponent} from "./item-status-report/item-status-report.component";
import { UserLogsComponent } from "./user-logs/user-logs.component";
import { UserMatrixComponent } from "./user-matrix/user-matrix.component";

export const reportRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "retrieval-report",
        component: RetrievalreportComponent
      },
      {
        path: "refilling-report",
        component: RefillingreportComponent
      },
      {
        path: "pickup-request-report",
        component: PickupRequestReportComponent
      },
      {
        path: "inventory-report",
        component: InventoryReportComponent
      }
      ,
      {
        path: "out-report",
        component: OutreportComponent
      }
      ,
      {
        path: "dump-report",
        component: DumpreportComponent
      },
      {
        path: "dis-inventory-report",
        component: DisInventoryReportComponent
      },
      {
        path: "inventory-upload-report",
        component: InventoryUploadReportComponent
      },
      {
        path: "item-status-report",
        component: ItemstatusreportComponent
      },
        {
        path: "user-logs",
        component: UserLogsComponent
      },
       {
        path: "user-matrix",
        component: UserMatrixComponent
      }
    ]
  }
];
