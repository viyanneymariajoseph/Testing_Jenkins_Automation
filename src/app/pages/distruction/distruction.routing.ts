import { Routes } from "@angular/router";
import { AnnualReviewComponent } from "./annual-review/annual-review.component";
import { BulkDistructionComponent } from "./bulk-distruction/bulk-distruction.component";
import { DistructionFormComponent } from "./distruction-form/distruction-form.component";
import { PendingDistructionComponent } from "./pending-distruction/pending-distruction.component";

export const DepartmentRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "annual-review",
        component: AnnualReviewComponent,
      },
      {
        path: "bulk-destruction",
        component: BulkDistructionComponent,
      },
      {
        path: "destruction-form/:id",
        component: DistructionFormComponent,
      },
      {
        path: "pending-distruction",
        component: PendingDistructionComponent,
      },
    ],
  },
];
