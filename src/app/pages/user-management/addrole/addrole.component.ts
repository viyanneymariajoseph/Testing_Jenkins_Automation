import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import {
  FormControl,
  FormGroupDirective,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  FormArray,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { HttpEventType, HttpClient } from "@angular/common/http";
import swal from "sweetalert2";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-addrole",
  templateUrl: "addrole.component.html",
})
export class AddRoleComponent implements OnInit {
  AddRoleForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  UserList: any;
  _PageList: any;
  PageViewList: any;
  _RightList: any;
  _RoleList: any;
  _UserList: any;
  myFiles: string[] = [];
  _PageIDAndChk: any;
  _pageRights: any;
  Role: any;

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private router: Router,
    private route: ActivatedRoute,

    private http: HttpClient,
    private httpService: HttpClient
  ) {}

  get rf() {
    return this.AddRoleForm;
  }
  get roles() {
    return this.AddRoleForm.get("Roles") as FormArray;
  }
  get _PageRight() {
    return this.AddRoleForm.get("_PageRight") as FormArray;
  }

  ngOnInit() {
    this.AddRoleForm = this.formBuilder.group({
      id: [""],
      roleName: ["", Validators.required],
      remarks: ["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
      Roles: this.formBuilder.array([]),
      SelectAll: [false],
      SelectAllRights: [false],
      _PageIDAndChk: "",
      pageRights: "",
      _PageRight: this.formBuilder.array([]),
    });

    if (Number(this.route.snapshot.params["id"]) > 0) {
      this.getPageList(Number(this.route.snapshot.params["id"]));
      this.getRightList(Number(this.route.snapshot.params["id"]));
      this.AddRoleForm.controls["roleName"].setValue(
        this.route.snapshot.params["name"]
      );
      this.AddRoleForm.controls["remarks"].setValue(
       
        localStorage.getItem("_RoleRemark")
      );
      this.AddRoleForm.controls["id"].setValue(
        this.route.snapshot.params["id"]
      );
        this.AddRoleForm.controls["remarks"].setValue(
      this.route.snapshot.params["remarks"] || ""
    );
      this.Role = "Edit Role";
    } else {
      this.getPageList(0);
      this.getRightList(0);
      this.Role = "Create Role";
    }
    
  }

  getPageList(TID: number) {
    const apiUrl =
      this._global.baseAPIUrl +
      "Role/GetPageList?ID=" +
      TID +
      "&user_Token=" +
      this.AddRoleForm.get("User_Token").value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      //console.log("Page List",data);
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
            });
            let subItems = found.get("subItems") as FormArray;
            subItems.push(fg);
          }
        }
      });
    });
  }

  getRightList(TID: number) {
    const apiUrl =
      this._global.baseAPIUrl +
      "Role/GetRightList?ID=" +
      TID +
      "&user_Token=" +
      this.AddRoleForm.get("User_Token").value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._RightList = data;
      //  _PageRight

      this._RightList.forEach((item) => {
        // if(item.parent_id == 0) {
        let fg = this.formBuilder.group({
          page_right: [item.page_right],
          isChecked: [item.isChecked],
          id: [item.id],
        });
        this._PageRight.push(fg);
        // }
      });
    });
  }

  onSubmit() {
    debugger;
    this.submitted = true;
    if (this.AddRoleForm.value.roleName.trim() == "") {
      this.ShowErrormessage("Please enter Role Name");
      return;
    }
    var _Flag = 0;

    this._PageIDAndChk = "";
    for (let i = 0; i < this.AddRoleForm.value.Roles.length; i++) {
      this._PageIDAndChk +=
        this.AddRoleForm.value.Roles[i].id +
        "," +
        this.AddRoleForm.value.Roles[i].isChecked +
        "#";
      // console.log("Parent");
      // console.log(this._PageIDAndChk);

      if (this.AddRoleForm.value.Roles[i].subItems.length > 0) {
        for (
          let j = 0;
          j < this.AddRoleForm.value.Roles[i].subItems.length;
          j++
        ) {
          this._PageIDAndChk +=
            this.AddRoleForm.value.Roles[i].subItems[j].id +
            "," +
            this.AddRoleForm.value.Roles[i].subItems[j].isChecked +
            "#";
          // console.log("SubItem");
          // console.log(this._PageIDAndChk);

          if (this.AddRoleForm.value.Roles[i].subItems[j].isChecked) {
            _Flag = 1;
          }
        }
      }
    }

    let __pageRights = "";
    for (let i = 0; i < this.AddRoleForm.value._PageRight.length; i++) {
      if (this.AddRoleForm.value._PageRight[i].isChecked) {
        __pageRights += String(this.AddRoleForm.value._PageRight[i].id) + ",";
      }
    }

    if (_Flag == 0) {
      this.ShowErrormessage("Please select page rights ");
      return;
    }

    // if (__pageRights.length <= 0) {
    //   this.ShowErrormessage("Please select rights ");
    // }
    this.AddRoleForm.patchValue({
      CreatedBy: localStorage.getItem('UserID') ,
      User_Token: localStorage.getItem("User_Token"),
      _PageIDAndChk: this._PageIDAndChk,
      pageRights: __pageRights,
    });
    if (this.route.snapshot.params["id"]) {
      const apiUrl = this._global.baseAPIUrl + "Role/Update";
      const rights = this.AddRoleForm.value._PageRight;
      this._onlineExamService
        .postData(this.AddRoleForm.value, apiUrl)
        // .pipe(first())
        .subscribe((data) => {
          if (data == "Role Already Exists") {
            this.ShowErrormessage(data);
          } else {
            this.MessageBox(data);
          }

          this.OnReset();
          setTimeout(() => {
            this._onlineExamService.roleChanged();
          }, 50);
          // location.reload();
          // Update local storage with rights
          rights.forEach((element) => {
            localStorage.setItem(element.page_right, element.isChecked);
          });
        });
      // }

      //this.localStorage.setItem('_TempID') =_TempID;

      this.router.navigate(["/usermanagement/roles"]);
    } else {
      const apiUrl = this._global.baseAPIUrl + "Role/Create";
      const rights = this.AddRoleForm.value._PageRight;
      this._onlineExamService
        .postData(this.AddRoleForm.value, apiUrl)
        // .pipe(first())
        .subscribe((data) => {
          if (data == "Role Already Exists") {
            this.ShowErrormessage(data);
          } else {
            this.MessageBox(data);
          }

          this.OnReset();
          setTimeout(() => {
            this._onlineExamService.roleChanged();
          }, 50);
          // location.reload();
          // Update local storage with rights
          rights.forEach((element) => {
            localStorage.setItem(element.page_right, element.isChecked);
          });
        });
      // }

      this.router.navigate(["/usermanagement/roles"]);
    }
  }

  ShowErrormessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Validation ! </span> <span data-notify="message"> ' +
        data +
        " </span></div>",
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-danger alert-notify",
      }
    );
  }

  ShowMessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success ! </span> <span data-notify="message"> ' +
        data +
        " </span></div>",
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-success alert-notify",
      }
    );
  }

  // OnSelectAll()
  // {
  // // alert(this.RoleForm.controls['SelectAll'].value);

  // let _bool =this.AddRoleForm.controls['SelectAll'].value; // role.get('SelectAll').value == true;
  // this.roles.controls.forEach(role => {
  // role.patchValue({isChecked: _bool})
  // // role.get('subItems').controls.forEach(elm => {
  // //   elm.patchValue({isChecked: _bool})
  // // });
  // });
  // }

  // OnSelectRightAll()
  // {
  // let _bool =this.AddRoleForm.controls['SelectAllRights'].value; // role.get('SelectAll').value == true;
  // this._PageRight.controls.forEach(role => {
  // role.patchValue({isChecked: _bool})
  // // role.get('subItems').controls.forEach(elm => {
  // //   elm.patchValue({isChecked: _bool})
  // // });
  // });
  // }

  onCheckChild(role) {
    setTimeout(() => {
      let oneFalseFound = role
        .get("subItems")
        .controls.every((r) => r.get("isChecked").value == true);
      oneFalseFound
        ? role.patchValue({ isChecked: true })
        : role.patchValue({ isChecked: false });
    }, 100);
  }

  onCheckParent(role: any) {
    let _bool = role.get("isChecked").value;
    if (_bool) {
      role.get("subItems").controls.forEach((elm) => {
        elm.patchValue({ isChecked: false });
      });
    } else {
      role.get("subItems").controls.forEach((elm) => {
        elm.patchValue({ isChecked: true });
      });
    }
  }

  OnSelectAll() {
    // alert(this.RoleForm.controls['SelectAll'].value);

    let _bool = this.AddRoleForm.controls["SelectAll"].value; // role.get('SelectAll').value == true;
    this.roles.controls.forEach((role) => {
      role.patchValue({ isChecked: _bool });
      let subItems = role.get("subItems") as FormArray;
      subItems.controls.forEach((elm) => {
        elm.patchValue({ isChecked: _bool });
      });
    });
  }

  OnSelectRightAll() {
    let _bool = this.AddRoleForm.controls["SelectAllRights"].value; // role.get('SelectAll').value == true;
    this._PageRight.controls.forEach((role) => {
      role.patchValue({ isChecked: _bool });
      // role.get('subItems').controls.forEach(elm => {
      //   elm.patchValue({isChecked: _bool})
      // });
    });
  }

  OnReset() {
    // this.Reset = true;
    // this.AddRoleForm.reset();

    this.AddRoleForm.controls["roleName"].setValue("");
    this.AddRoleForm.controls["remarks"].setValue("");

    let _bool = false; // role.get('SelectAll').value == true;
    this.roles.controls.forEach((role) => {
      role.patchValue({ isChecked: _bool });
      let subItems = role.get("subItems") as FormArray;
      subItems.controls.forEach((elm) => {
        elm.patchValue({ isChecked: _bool });
      });
    });

    //let _bool = this.AddRoleForm.controls["SelectAllRights"].value; // role.get('SelectAll').value == true;
    this._PageRight.controls.forEach((role) => {
      role.patchValue({ isChecked: false });
      // role.get('subItems').controls.forEach(elm => {
      //   elm.patchValue({isChecked: _bool})
      // });
    });
  }

  OnBack() {
    this.router.navigate(["/usermanagement/roles"]);
  }

  MessageBox(msg: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message"> ' +
        msg +
        " </span></div>",
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-success alert-notify",
      }
    );
  }
}
