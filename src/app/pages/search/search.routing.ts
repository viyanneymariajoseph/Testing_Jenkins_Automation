import { Routes } from "@angular/router";
  
import { QuicksearchComponent } from './Quicksearch/Quicksearch.component';
import { BasicsearchComponent } from './basic-search/basic-search.component';

//DataUploadComponent
 
 
export const searchRoutes: Routes = [
  {
    path: "",
    children: [      
      
      {
        path: "quick-search",
       component: QuicksearchComponent
      },
      {
        path: "item-history/:CartonNo/:historytype",
       component: BasicsearchComponent
      }
    ]
  }
];
