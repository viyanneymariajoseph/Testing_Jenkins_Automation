import { Routes } from "@angular/router";
import { PODEntryComponent } from './PODEntry/PODEntry.component';
import { PODAcknowledgeComponent } from './PODAcknowledge/PODAcknowledge.component';
// import { InwardACKComponent } from './InwardACK/InwardACK.component';
// import { FileAcknowledgeComponent } from "./file-acknowledge/file-acknowledge.component";
import { FileAckComponent } from './file-ack/file-ack.component';
import { BranchInwardComponent } from './branch-inward/branch-inward.component';
import { PodAckComponent } from './pod-Ack/pod-Ack.component';
import { FileinwardComponent } from './file-inward/file-inward.component';
 import{PrintBarcodeComponent} from'./print-barcode/print-barcode.component';
import { PickupRequestComponent } from "./pickup-request/pickup-request.component";
import { PickupRequestAckComponent } from "./pickup-request-ack/pickup-request-ack.component";
import { UpdateScheduleComponent } from "./update-schedule/update-schedule.component";
import { FileInwardFormComponent } from "./file-inward-form/file-inward-form.component";
import { FileInwardInventryComponent } from "./file-inward-inventry/file-inward-inventry.component";
import { FileInventryQcComponent } from "./file-inventry-qc/file-inventry-qc.component";
import { FileInventryQcFormComponent } from "./file-inventry-qc-form/file-inventry-qc-form.component";


export const DepartmentRoutes: Routes = [
  {
    path: "",
    children: [
      // {
      //   path: "Retrivalrequest",
      //   component: RetrivalrequestComponent
      // } 
      // ,
      
      {
        path: "branch-inward",
        component: BranchInwardComponent
      },
      {
        path: "pod-entry",
        component: PODEntryComponent
      }  
      ,
      {
        path: "pod-ack",
        component: PodAckComponent
      },
  
      {
        path: "FileAck",
        component: FileAckComponent
      },
      {
        path: "file-inward",
        component: FileinwardComponent
      } ,
      {
        path: "file-inventory-qc",
        component: FileInventryQcComponent
      } ,
      {
        path: "file-inventory-qc/:REQ",
        component: FileInventryQcFormComponent
      } ,
      {
        path: "file-inward-inventry",
        component: FileInwardInventryComponent
      } ,
      {
        path: "file-inward/:REQ",
        component: FileInwardFormComponent
      } ,
      {
        path: "PODAcknowledge",
        component: PODAcknowledgeComponent
      },
      {
        
          path: "printbarcode",
          component: PrintBarcodeComponent
         
      },
      {
        
        path: "pickup-request",
        component: PickupRequestComponent
       
    },
    {
        
      path: "pickup-request-ack",
      component: PickupRequestAckComponent
     
  },
  {
        
    path: "update-schedule",
    component: UpdateScheduleComponent
   
},

    ]
  }
];
