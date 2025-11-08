import { Routes } from "@angular/router";
import { DepartmentComponent } from "./department/department.component";
import { BranchMappingComponent } from './branch-mapping/branch-mapping.component';
import { BranchComponent } from "./branch/branch.component";
import { EmailNotificationComponent } from "./email-notification/email-notification.component";
import { CrownMasterComponent } from "./crown-master/crown-master.component";
import { CrownMappingComponent } from "./crown-mapping/crown-mapping.component";
import { ApprovalComponent } from './approval/approval.component';
import { WarehouseComponent } from "./warehouse/warehouse.component";

export const DepartmentRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "department-master",
        component: BranchComponent
      },
      {
        path: "branch-mapping",
        component: BranchMappingComponent
      },
      {
        path: "documents-master",
        component: CrownMasterComponent
      },
      {
        path: "crown-mapping",
        component: CrownMappingComponent
      },
      // {
      //   path: "email-notification",
      //   component: EmailNotificationComponent
      // },
      {
        path: "email-notification",
        component: EmailNotificationComponent
      },
      {
        path: "folder",
        component: DepartmentComponent
      },
      {
        path: "warehouse-master",
        component: WarehouseComponent
      }
      ,
      {
        path: "approval",
        component: ApprovalComponent
      },
      {
        path: "", redirectTo:"branch-master",pathMatch:"full"
      }
      
      
      
    ]
  }
];
