import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from 'src/app/Services/authentication.service';
import { OnlineExamServiceService } from 'src/app/Services/online-exam-service.service';
import { Globalconstants } from 'src/app/Helper/globalconstants';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonService } from "src/app/Services/common.service";

var misc: any = {
  sidebar_mini_active: false
};

export interface RouteInfo {
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
  isCollapsed?: boolean;
  isCollapsing?: any;
  children?: ChildrenItems[];
}

export interface ChildrenItems {
  path: string;
  title: string;
  type?: string;
  collapse?: string;
  children?: ChildrenItems2[];
  isCollapsed?: boolean;
}
export interface ChildrenItems2 {
  path?: string;
  title?: string;
  type?: string;
}


export let ROUTES: RouteInfo[] = []
@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"]
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  public isCollapsed = true;
  AddRoleForm: FormGroup;

  public routes = []
  _PageList = []
  _RList = []
  get roles() {
    return this.AddRoleForm.get("Roles") as FormArray;
  }
  constructor(private router: Router, private _auth: AuthenticationService, private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService, private _global: Globalconstants, private _commonService: CommonService) {

  }

  ngOnInit() {
    this.AddRoleForm = this.formBuilder.group({
      roleName: ["", Validators.required],
      remarks: ["", Validators.required],
      Roles: this.formBuilder.array([]),
    });
    this.getPageList(this._auth.getUserInfo.tid)
    this.minimizeSidebar();
    this.onMouseLeaveSidenav();
    this.getRightList();
    this._onlineExamService.isRoleChanged.subscribe(res => {
      this.AddRoleForm.get("Roles") as FormArray;
      this.initializeRoutes();
      //console.log("Roles change timestamp: " + res);
    })
  }

  initializeRoutes() {
    this.routes = [];
    this.AddRoleForm.value.Roles.forEach(role => {
      // console.log(role)
      if (role.isChecked || role.subItems.filter(el => el.isChecked).length > 0) {
        let route = this.getRoute(role.page_name);
        if (route && Object.keys(route).length !== 0) {
          route.ParentID = role.ParentID;
          route.ChildID = role.ChildID;
        }
        if (route) {
          role.subItems.forEach(subRoute => {
            if (subRoute.isChecked) {
              let matchedRoute = this.getRoute(subRoute.page_name);
              if (matchedRoute && Object.keys(matchedRoute).length !== 0) {
                matchedRoute.ParentID = subRoute.ParentID;
                matchedRoute.ChildID = subRoute.ChildID;
              }
              if (matchedRoute && route.children)
                route.children.push(matchedRoute);
            }
          });
        }
        this.routes.push(route)
      }
    });
    console.log('Routes', this.routes);

    this.routes.sort((a: any, b: any) => a.ParentID - b.ParentID);
    this.routes.map(route => {

      route.children.sort((a: any, b: any) => a.ChildID - b.ChildID);
    });
    this.menuItems = this.routes.filter(menuItem => menuItem);
    this._commonService.setMenuAccess(this.menuItems);
    this.router.events.subscribe(event => {
      this.isCollapsed = true;
    });
  }

  getRoute(routeName: string): any {
    let route: any = {}
    switch (routeName) {
      case "Dashboard": {
        route = {
          path: "/dashboards",
          title: "Dashboards",
          type: "sub",
          icontype: "ni-shop text-primary",
          isCollapsed: true,
          children: [
            { path: "dashboard", title: "Dashboard", type: "link", ChildID: 0 },

          ]
        }
        break;
      }
      case "User Management": {
        route = {
          path: "/usermanagement",
          title: "User Management",
          type: "sub",
          icontype: "fa fa-users text-orange",
          isCollapsed: true,
          children: []
        }
        break;
      }
      case "Add User": {
        route = { path: "users", title: "Users", type: "link" }
        break;
      }
      case "Add Role": {
        route = { path: "roles", title: "Roles", type: "link" }
        break;
      }
      case "Change Password": {
        route = { path: "change-password", title: "Change Password", type: "link" }
        break;
      }

      case "Document list": {
        route = { path: "document-list", title: "Document list", type: "link" }
        break;
      }

      case "Upload": {
        route = {
          path: "/upload",
          title: "Upload",
          type: "sub",
          icontype: "fas fa-file-upload text-danger",
          isCollapsed: true,
          children: []
        }
        break;
      }

      // case "Dumpupload": {
      //   // route.children.push({ path: "file-upload", title: "File Upload", type: "link" })
      //   route = { path: "Dumpupload", title: "Dump Upload", type: "link" }
      //   break;

      // }

      // case "invupload": {
      //   // route.children.push({ path: "file-upload", title: "File Upload", type: "link" })
      //   route = { path: "invupload", title: "Inventory Upload", type: "link" }
      //   break;        
      // }
      // case "upload-item-status": {
      //   // route.children.push({ path: "file-upload", title: "File Upload", type: "link" })
      //   route = { path: "itemstatusupload", title: "Item Status Upload", type: "link" }
      //   break;
      // }

      case "Master": {
        route = {
          path: "/master",
          title: "Masters",
          type: "sub",
          icontype: "fa fa-certificate text-danger",
          isCollapsed: true,
          children: [
            // { path: "dashboard", title: "Dashboard", type: "link", ChildID: 0 },
          ]
        }
        break;
      }
      case "Department Master": {
        route = { path: "department-master", title: "Department Master", type: "link" }
        break;
      }
      // case "branch-mapping": {
      //   route = { path: "branch-mapping", title: "Branch Mapping", type: "link" }
      //   break;
      // }
      case "Document Master": {
        route = { path: "documents-master", title: "Document Master", type: "link" }
        break;
      }
      case "Warehouse Master": {
        route = { path: "warehouse-master", title: "Warehouse Master", type: "link" }
        break;
      }
      case "Email Notification": {
        route = { path: "email-notification", title: "Email Notification", type: "link" }
        break;
      }

      // case "Process": {
      //   route = {
      //     path: "/process",
      //     title: "Process",
      //     type: "sub",
      //     icontype: "fa fa-database text-pink",
      //     isCollapsed: true,
      //     children: [
      //      ]
      //   }
      //   break;
      // }

      case "Retrival": {
        route = {
          path: "/retrival",
          title: "Retrieval",
          type: "sub",
          icontype: "fa fa-folder text-pink",
          isCollapsed: true,
          children: [

          ]
        }
        break;
      }
      case "Retrieval Request": {
        route = { path: "retrival-request", title: "Retrieval Request", type: "link" }
        break;
      }
      // case "crown-master": {
      //   route = { path: "crown-master", title: "Document Master", type: "link" }
      //   break;
      // }
      case "crown-mapping": {
        route = { path: "crown-mapping", title: "Crown Mapping", type: "link" }
        break;
      }

      case "branch-inward": {
        route = { path: "branch-inward", title: "Branch Inward", type: "link" }
        break;
      }

      // case "file-inward-inventry": {
      //   route = { path: "file-inward-inventry", title: "File Inventory", type: "link" }
      //   break;
      // }    

      case "pod-ack": {
        route = { path: "pod-ack", title: "POD Ack", type: "link" }
        break;
      }
      case "pickup-request": {
        route = { path: "pickup-request", title: "Pickup Request", type: "link" }
        break;
      }
      case "pickup-request-ack": {
        route = { path: "pickup-request-ack", title: "Pickup Request ACK", type: "link" }
        break;
      }
      // case "update-schedule": {
      //   route = { path: "update-schedule", title: "Update Schedule", type: "link" }
      //   break;
      // }
      // case "Access-Refilling": {
      //   route = { path: "Access-Refilling", title: "Access Refilling", type: "link" }
      //   break;
      // }

      // case "Storage": {
      //   route = {
      //     path: "/refilling",
      //     title: "Storage",
      //     type: "sub",
      //     icontype: "fas fa-file-upload text-danger",
      //     isCollapsed: true,
      //     children: [],
      //   };
      //   break;
      // }
      // case "Return To Storage": {
      //   route = { path: "send-to-storage", title: "Return To Storage", type: "link" };
      //   break;
      // }
      // case "return-approval": {
      //   route = { path: "return-approval", title: "Return Approval", type: "link" };
      //   break;
      // }
      // case "warehouse-schedule": {
      //   route = { path: "warehouse-schedule", title: "Warehouse Schedule", type: "link" };
      //   break;
      // }
      // case "warehouse-ack": {
      //   route = { path: "warehouse-ack", title: "Warehouse Ack", type: "link" };
      //   break;
      // }
      // case "warehouse-location-update": {
      //   route = { path: "warehouse-location-update", title: "Warehouse Location Update", type: "link" };
      //   break;
      // }

      case "Refiling": {
        route = {
          path: "/Refiling",
          title: "Refiling",
          type: "sub",
          icontype: "fas fa-download text-danger",
          isCollapsed: true,
          children: [],
        };
        break;
      }

      case "Send To Storage": {
        route = { path: "send-to-storage", title: "Send To Storage", type: "link" };
        break;
      }

      //  case "Send To Storage Form": {
      //   route = { path: "send-to-storage-form", title: "Send To Storage Form", type: "link" };
      //   break;
      // }

      case "Return Approval": {
        route = { path: "return-approval", title: "Return Approval", type: "link" };
        break;
      }
      case "Return Pickup Schedule": {
        route = { path: "warehouse-schedule", title: "Return Pickup Schedule", type: "link" };
        break;
      }
      case "Return Acknowledgement": {
        route = { path: "warehouse-ack", title: "Return Acknowledgement", type: "link" };
        break;
      } case "Carton Location Update": {
        route = { path: "warehouse-location-update", title: "Carton Location Update", type: "link" };
        break;
      }
      case "Destruction": {
        route = {
          path: "/Destruction",
          title: "Destruction",
          type: "sub",
          icontype: "fas fa-file-upload text-danger",
          isCollapsed: true,
          children: [],
        };
        break;
      }

      case "Annual Review": {
        route = { path: "annual-review", title: "Annual Review", type: "link" };
        break;
      }
      case "Pending Destruction": {
        route = { path: "pending-distruction", title: "Pending Destruction", type: "link" };
        break;
      }
      case "Dumpupload": {
        route = { path: "Dumpupload", title: "Dump Upload", type: "link" };
        break;
      }

      case "Bulk Destruction": {
        route = { path: "bulk-destruction", title: "Bulk Destruction", type: "link" };
        break;
      }

      case "invupload": {
        route = { path: "invupload", title: "Inventory Upload", type: "link" };
        break;
      }
      case "upload-item-status": {
        route = {
          path: "itemstatusupload",
          title: "Item Status Upload",
          type: "link",
        };
        break;

      }


      //----
      case "Inventory": {
        route = {
          path: "/inventory",
          title: "Inventory",
          type: "sub",
          icontype: "fa fa-database text-pink",
          isCollapsed: true,
          children: [
          ]
        }
        break;
      }
      case "Inventory Acknowledge": {
        route = { path: "inventory-acknowledge", title: "Inventory Acknowledge", type: "link" }
        break;
      }

      case "Carton Inventory": {
        route = { path: "carton-inventory", title: "Carton Inventory", type: "link" }
        break;
      }
      case "Inventory Approval": {
        route = { path: "inventory-approval", title: "Inventory Approval", type: "link" }
        break;
      }
      case "Pickup Schedule": {
        route = { path: "pickup-schedule", title: "Pickup Schedule", type: "link" }
        break;
      }
      case "Carton Storage": {
        route = { path: "carton-storage", title: "Carton Storage", type: "link" }
        break;
      }


      //----

      case "Search": {
        route = {
          path: "/search",
          title: "Search",
          type: "sub",
          icontype: "fa fa-search text-green",
          isCollapsed: true,
          children: [
            // { path: "advance-search", title: "Advanced Search", type: "link" },
            // { path: "content-search", title: "Quick Search", type: "link" },
          ]
        }
        break;
      }
      case "Quick Search": {
        route = { path: "quick-search", title: "Quick Search", type: "link" }
        break;
      }
      case "Request Approval": {
        route = { path: "request-approval", title: "Request Approval", type: "link" }
        break;
      }


      case "Retrieval Dispatch": {
        route = { path: "retrival-dispatch", title: "Retrieval Dispatch", type: "link" }
        break;
      }
      case "Retrieval Acknowledge": {
        route = { path: "retrieval-acknowledge", title: "Retrieval Acknowledge", type: "link" }
        break;
      }

      case "Report": {
        route = {
          path: "/report",
          title: "Reports",
          type: "sub",
          icontype: "fa fa-book text-default",
          isCollapsed: true,
          children: []
        }
        break;
      }

      case "Retrieval Report": {
        route = { path: "retrieval-report", title: "Retrieval Report", type: "link" }
        break;
      }
      case "Refilling Report": {
        route = { path: "refilling-report", title: "Refilling Report", type: "link" }
        break;
      }

      case "Inventory Report": {
        route = { path: "inventory-report", title: "Inventory Report", type: "link" }
        break;
      }
      case "Destruction Report": {
        route = { path: "out-report", title: "Destruction Report", type: "link" }
        break;
      }

      case "Warehouse Location Report": {
        route = { path: "item-status-report", title: "Warehouse Location Report", type: "link" }
        break;
      }
      case "User Logs Report": {
        route = { path: "user-logs", title: "User Logs Report", type: "link" }
        break;
      }
      case "User Matrix Report": {
        route = { path: "user-matrix", title: "User Matrix Report", type: "link" }
        break;
      }

      default: { route = null }
    }
    return route
  }

  getPageList(TID: number) {
    const apiUrl =
      this._global.baseAPIUrl +
      "Role/GetPageList?ID=" +
      Number(localStorage.getItem('sysRoleID')) +
      "&user_Token=" + localStorage.getItem('User_Token')
    this._onlineExamService.getAllData(apiUrl).subscribe((data: []) => {
      console.log(data)
      this._PageList = data;
      this._PageList.forEach((item) => {
        if (item.parent_id == 0) {
          item.subItem = [];
          let fg = this.formBuilder.group({
            page_name: [item.page_name],
            isChecked: [item.isChecked],
            subItems: this.formBuilder.array([]),
            id: [item.id],
            parent_id: [item.parent_id],
            ParentID: [item.ParentID],
            ChildID: [item.ChildID]
          });
          this.roles.push(fg);
        }
      });

      this._PageList.forEach((item) => {
        if (item.parent_id && item.parent_id != 0) {
          let found = this.roles.controls.find(
            (ctrl) => ctrl.get("id").value == item.parent_id
          );
          if (found) {
            let fg = this.formBuilder.group({
              page_name: [item.page_name],
              isChecked: [item.isChecked],
              subItems: [[]],
              id: [item.id],
              parent_id: [item.parent_id],
              ParentID: [item.ParentID],
              ChildID: [item.ChildID]
            });
            let subItems = found.get("subItems") as FormArray;
            subItems.push(fg);
          }
        }
      });
      this.initializeRoutes()
    });
  }

  getRightList() {
    debugger;
    const apiUrl =
      this._global.baseAPIUrl +
      "Role/GetRightList?ID=" +
      Number(localStorage.getItem('sysRoleID')) +
      "&user_Token=" + localStorage.getItem('User_Token');

    this._onlineExamService.getAllData(apiUrl).subscribe((data: []) => {
      this._RList = data;

      // reset all rights to "0"
      localStorage.setItem('Download', "0");
      localStorage.setItem('Delete', "0");
      localStorage.setItem('Email', "0");
      localStorage.setItem('Link', "0");
      localStorage.setItem('Edit', "0");
      localStorage.setItem('Document View', "0");
      localStorage.setItem('Refiling', "0");
      localStorage.setItem('Retrival', "0");
      localStorage.setItem('Invetory', "0");
      localStorage.setItem('Destruction Edit', "0");

      this._RList.forEach((item) => {
        if (item.page_right == "Download") {
          localStorage.setItem('Download', item.isChecked);
        }
        if (item.page_right == "Delete") {
          localStorage.setItem('Delete', item.isChecked);
        }
        if (item.page_right == "Link") {
          localStorage.setItem('Link', item.isChecked);
        }
        if (item.page_right == "Email") {
          localStorage.setItem('Email', item.isChecked);
        }
        if (item.page_right == "Edit") {
          localStorage.setItem('Edit', item.isChecked);
        }
        if (item.page_right == "Document View") {
          localStorage.setItem('Document View', item.isChecked);
        }
        if (item.page_right == "Refiling") {
          localStorage.setItem('Refiling', item.isChecked);
        }
        if (item.page_right == "Retrival") {
          localStorage.setItem('Retrival', item.isChecked);
        }
        if (item.page_right == "Invetory") {
          localStorage.setItem('Invetory', item.isChecked);
        }
        if (item.page_right == "Destruction Edit") {
          localStorage.setItem('Destruction Edit', item.isChecked);
        }
      });

      this._commonService.setRightList(this._RList);
    });
  }


  onMouseEnterSidenav() {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.add("g-sidenav-show");
    }
  }
  onMouseLeaveSidenav() {

    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-show");
    }
  }
  minimizeSidebar() {

    const sidenavToggler = document.getElementsByClassName(
      "sidenav-toggler"
    )[0];
    const body = document.getElementsByTagName("body")[0];
    if (body.classList.contains("g-sidenav-pinned")) {
      misc.sidebar_mini_active = true;
    } else {
      misc.sidebar_mini_active = false;
    }
    if (misc.sidebar_mini_active === true) {
      body.classList.remove("g-sidenav-pinned");
      body.classList.add("g-sidenav-hidden");
      sidenavToggler.classList.remove("active");
      misc.sidebar_mini_active = false;
    } else {
      body.classList.add("g-sidenav-pinned");
      body.classList.remove("g-sidenav-hidden");
      sidenavToggler.classList.add("active");
      misc.sidebar_mini_active = true;
    }
  }
}
