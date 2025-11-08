import { Routes } from "@angular/router";
import { RetrivalRequestComponent } from "./retrival-request/retrival-request.component";
import { CsvUploadComponent } from "./csv-upload/csv-upload.component";
import { ApprovalComponent } from "./approval/approval.component";
import { RetirvalDispatchComponent } from "./retirval-dispatch/retirval-dispatch.component";
import { RefillingComponent } from "./refilling/refilling.component";
import { RefillingAckComponent } from "./refilling-ack/refilling-ack.component";
import { RetrievalRequestFormComponent } from "./retrieval-request-form/retrieval-request-form.component";
import { AccessRefillingComponent } from "./access-refilling/access-refilling.component";
import { RetrievalAcknowledgeComponent } from "./retrieval-acknowledge/retrieval-acknowledge.component";



export const retrivalRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "retrival-request",
        component: RetrivalRequestComponent
      },
      {
        path: "retrival-request-form",
        component: RetrievalRequestFormComponent
      },
      {
        path: "request-approval",
        component: ApprovalComponent
      },
      {
        path: "retrival-dispatch",
        component: RetirvalDispatchComponent
      },
      {
        path: "retrieval-acknowledge",
        component: RetrievalAcknowledgeComponent
      },
      {
        path: "csv-upload",
        component: CsvUploadComponent
      },

      {
        path: "refilling-request",
        component: RefillingComponent
      },
      {
        path: "refilling-ack",
        component: RefillingAckComponent
      },
      {
        path: "Access-Refilling",
        component: AccessRefillingComponent
      },
      
    ]
  }
];
