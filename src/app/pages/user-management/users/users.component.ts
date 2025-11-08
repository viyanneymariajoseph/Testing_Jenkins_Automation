import { Globalconstants } from "./../../../Helper/globalconstants";
import { OnlineExamServiceService } from "./../../../Services/online-exam-service.service";
import { Component, OnInit } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { ViewChild, TemplateRef } from '@angular/core';

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-users",
  templateUrl: "users.component.html",
  styleUrls: ["users.component.scss"]
})
export class UsersComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;

  UserList: any;
  _FilteredList: any;
  _RoleList: any;
  AddUserForm: FormGroup;
  submitted = false;
  Reset = false;
  //_UserList: any;
  sMsg: string = "";
  //RoleList: any;
  _SingleUser: any = [];
  _UserID: any;
  User: any;
  first = 0;
  rows = 10;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
  ) { }
  ngOnInit() {
    // this.AddUserForm = this.formBuilder.group({
    //   id: [""],
    //   name: new FormControl('', [Validators.required]),
    //   userid: ["", [Validators.required,]],
    //   // Validators.maxLength(20), Validators.minLength(5)
    //   pwd: ["", [ Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)]],
    //   confirmPass: [""],

    //   email: ["", [Validators.required, Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    //   ]],
    //   mobile: ["", [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
    //   sysRoleID: ["0", [Validators.required, this.validateRoleSelection]],
    //   Remarks: [""],
    //   UserType: [0, Validators.required],
    //   User_Token: localStorage.getItem('User_Token'),
    // }, {
    //   validator: this.ConfirmedValidator('pwd', 'confirmPass')
    // });
    this.buildForm();

    this.geRoleList();
    this.geUserList();
    this.User = "Create User";

  }
  @ViewChild('userFormPopup') userFormPopup: TemplateRef<any>;
  @ViewChild('dt') dt: any;

  validateRoleSelection(control: AbstractControl) {//gkj_25_08
    return control.value && control.value !== '0' ? null : { required: true };
  }

  validateUserType(control: AbstractControl) {//gkj_25_08
    return control.value && control.value !== 0 ? null : { required: true };
  }


  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }
  get f() {
    return this.AddUserForm.controls;
  }
  openUserForm() {
    this.OnReset(); // Reset first
    this.modalRef = this.modalService.show(this.userFormPopup);
  }

  private buildForm() {//gkj_25_08
    this.AddUserForm = this.formBuilder.group(
      {
        id: [""],
        name: new FormControl("", [
          Validators.required,
          Validators.pattern(/^[A-Za-z ]+$/)
        ]),
        userid: ["", [Validators.required]],
        pwd: [
          "",
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
            ),
          ],
        ],
        confirmPass: ["", [Validators.required]],
        email: [
          "",
          [
            Validators.required,
            Validators.pattern(
              /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ),
          ],
        ],
        mobile: [
          "",
          [
            Validators.required,
            Validators.maxLength(10),
            Validators.minLength(10),
          ],
        ],
        sysRoleID: ["0", [Validators.required, this.validateRoleSelection]],
        UserType: [0, [Validators.required, this.validateUserType]],

        Remarks: [""],
        User_Token: localStorage.getItem("User_Token"),
      },
      {
        validator: this.ConfirmedValidator("pwd", "confirmPass"),
      }
    );
  }


  entriesChange($event) {
    this.entries = $event.target.value;
  }
  filterTable($event) {

    let val = $event.target.value;
    this._FilteredList = this.UserList.filter(function (d) {
      for (var key in d) {
        if (key == "name" || key == "email" || key == "userid" || key == "mobile" || key == "roleName") {
          if (d[key].toLowerCase().indexOf(val.toLowerCase()) !== -1) {
            return true;
          }
        }
      }
      return false;
    });
  }
  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  onActivate(event) {
    this.activeRow = event.row;
  }

  geRoleList() {
    const userToken = this.AddUserForm.get('User_Token').value || localStorage.getItem('User_Token');
    const apiUrl = this._global.baseAPIUrl + "Role/GetList?user_Token=" + userToken;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._RoleList = data;
    });
  }
  geUserList() {
    const userToken = this.AddUserForm.get('User_Token').value || localStorage.getItem('User_Token');
    const apiUrl = this._global.baseAPIUrl + "Admin/GetList?user_Token=" + userToken;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this.UserList = data;
      this._FilteredList = data;
      this.prepareTableData(this.UserList, this._FilteredList);
    });
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'name', header: 'NAME', index: 3 },
      { field: 'userid', header: 'USER ID', index: 2 },
      { field: 'email', header: 'EMAIL', index: 3 },
      { field: 'mobile', header: 'MOBILE', index: 3 },
      { field: 'roleName', header: 'ROLE', index: 3 },
      { field: 'PasswodExpiryDate', header: 'PASSWORD EXPIRY DATE', index: 3 },
      { field: 'isactive', header: 'ISACTIVE', index: 3 }
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'name': el.name,
        'id': el.id,
        'userid': el.userid,
        'email': el.email,
        'mobile': el.mobile,
        'roleName': el.roleName,
        isactive:
          el.isactive?.toLowerCase() === 'y'
            ? 'ACTIVE'
            : el.isactive?.toLowerCase() === 'd'
              ? 'DELETED'
              : 'INACTIVE',
        'AccountTypeID': el.AccountTypeID,
        'PasswodExpiryDate': el.PasswodExpiryDate ? this.formatDateToDDMMYYYY(el.PasswodExpiryDate) : '',
      });

    });
    this.headerList = tableHeader;
    //}

    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;

  }

  formatDateToDDMMYYYY(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }


  searchTable($event) {
    // console.log($event.target.value);

    let val = $event.target.value;
    if (val == '') {
      this.formattedData = this.immutableFormattedData;
    } else {
      let filteredArr = [];
      const strArr = val.split(',');
      this.formattedData = this.immutableFormattedData.filter(function (d) {
        for (var key in d) {
          strArr.forEach(el => {
            if (d[key] && el !== '' && (d[key] + '').toLowerCase().indexOf(el.toLowerCase()) !== -1) {
              if (filteredArr.filter(el => el.srNo === d.srNo).length === 0) {
                filteredArr.push(d);
              }
            }
          });
        }
      });
      this.formattedData = filteredArr;
    }
  }

  OnReset() {
    this.buildForm(); // brand new form instance
    this.submitted = false;
    this.User = "Create User";
  }



  OnClose() {
    this.OnReset();
    this.modalRef?.hide();
  }
  onSubmit() { // gkj_25_08
    debugger;
    this.submitted = true;
    const isEditMode = !!this.AddUserForm.get('id')?.value;
    const useridLogged = localStorage.getItem('UserID');
    const passwordControl = this.AddUserForm.get('pwd');
    const confirmPassControl = this.AddUserForm.get('confirmPass');

    // Password validation (only for create mode)
    if (!isEditMode) {
      passwordControl?.setValidators([
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)
      ]);
      confirmPassControl?.setValidators([Validators.required]);
    } else {
      passwordControl?.clearValidators();
      confirmPassControl?.clearValidators();
    }

    passwordControl?.updateValueAndValidity();
    confirmPassControl?.updateValueAndValidity();

    // Touch all controls
    Object.keys(this.AddUserForm.controls).forEach((field) => {
      const control = this.AddUserForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });

    // Trim string values
    Object.keys(this.AddUserForm.controls).forEach((key) => {
      const control = this.AddUserForm.get(key);
      if (control && typeof control.value === 'string') {
        control.setValue(control.value.trim());
      }
    });

    // Required field checks
    if (this.AddUserForm.value.sysRoleID <= 0) {
      this.ShowErrormessage("Select Role Name");
      return;
    }
    if (this.AddUserForm.value.userid === "") {
      this.ShowErrormessage("Please enter user ID");
      return;
    }
    if (this.AddUserForm.value.name === "") {
      this.ShowErrormessage("Please enter user name");
      return;
    }

    if (!this.AddUserForm.value.User_Token) {
      this.AddUserForm.patchValue({ User_Token: localStorage.getItem('User_Token') });
    }

    this.AddUserForm.value.useridLogged = useridLogged;

    const apiUrl = this._global.baseAPIUrl + (isEditMode ? "Admin/Update" : "Admin/Create");

    this._onlineExamService.postData(this.AddUserForm.value, apiUrl).subscribe({
      next: (data: any) => {
        if (!data) {
          this.ShowErrormessage("An unexpected error occurred.");
          return;
        }

        const msg = data.toString();

        // 🔴 If backend says "already exists" or "failed/error" → show error
        if (
          msg.toLowerCase().includes("already exists") ||
          msg.toLowerCase().includes("failed") ||
          msg.toLowerCase().includes("deleted") ||
          msg.toLowerCase().includes("error")
        ) {
          this.ShowErrormessage(msg);

          if (msg.toLowerCase().includes("user id already exists")) {
            this.AddUserForm.get('userid')?.setErrors({ duplicate: true });
          }
          if (msg.toLowerCase().includes("email id already exists")) {
            this.AddUserForm.get('email')?.setErrors({ duplicate: true });
          }
          debugger;
          if (msg.toLowerCase().includes("User is Deleted. NO action can be performed.")) {
            this.AddUserForm.get('User')?.setErrors({ duplicate: true });
          }
          return;
        }

        // ✅ Otherwise treat as success
        this.ShowMessage(msg);
        if (msg.toLowerCase().includes("success")) {
          this.geUserList();
          this.OnReset();
          this.modalRef?.hide();
        }
      },
      error: (err) => {
        const backendMsg = err.error?.Message || "An unexpected error occurred.";
        this.ShowErrormessage(backendMsg);

        if (backendMsg.toLowerCase().includes("user id already exists")) {
          this.AddUserForm.get('userid')?.setErrors({ duplicate: true });
        }
        if (backendMsg.toLowerCase().includes("email id already exists")) {
          this.AddUserForm.get('email')?.setErrors({ duplicate: true });
        }
      }
    });
  }


  editEmployee(template: TemplateRef<any>, value: any) {
    debugger;
    this.User = "Edit User Details";

    console.log("value", value);

    const apiUrl =
      this._global.baseAPIUrl +
      "Admin/GetDetails?ID=" +
      value.id + "&user_Token=" + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      var that = this;
      that._SingleUser = data;
      console.log('data', data);
      this.AddUserForm.patchValue({
        id: that._SingleUser.id,
        name: that._SingleUser.name,
        userid: that._SingleUser.userid,
        // pwd: that._SingleUser.pwd,
        // confirmPass: that._SingleUser.pwd,
        email: that._SingleUser.email,
        mobile: that._SingleUser.mobile,
        sysRoleID: that._SingleUser.sysRoleID,
        Remarks: that._SingleUser.remarks,
        UserType: that._SingleUser.UserType,

        // AccountType:that._SingleUser.AccountTypeID,
      })

      //  console.log('form', this.AddUserForm);
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });

    this.modalRef = this.modalService.show(template);
  }



  deleteEmployee(user: any) {
    debugger;

    const currentUserId = localStorage.getItem('UserID');

    if (user.id !== currentUserId) {
      swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonClass: "btn btn-danger",
        cancelButtonClass: "btn btn-secondary",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.value) {
          // Prepare payload
          this.AddUserForm.patchValue({
            id: user.id,
            userid: currentUserId,
            User_Token: localStorage.getItem('User_Token'),
          });

          const apiUrl = this._global.baseAPIUrl + "Admin/SoftDeleteUser";

          this._onlineExamService.postData(this.AddUserForm.value, apiUrl).subscribe(
            (response: any) => {
              const msg = response?.toString();
              const isSuccess = msg.toLowerCase().includes("deleted successfully");

              swal.fire({
                title: isSuccess ? "Success" : "Alert",
                text: msg,
                type: isSuccess ? "success" : "warning",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });

              if (isSuccess) {
                this.geUserList(); // Refresh only on successful deletion
              }
            },
            (error) => {
              swal.fire({
                title: "Error",
                text: "An error occurred while deleting the user.",
                type: "error",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });
            }
          );
        }
      });
    } else {
      this.ShowErrormessage("You are currently logged in and cannot delete your own account.");
    }
  }

  downloadCSV() {
    const data = this.dt?.filteredValue || this.formattedData;

    if (!data || data.length === 0) {
      this.toastr.warning("No data available to export.");
      return;
    }


    const headers = this.headerList.map(h => h.header);

    const rows = data.map(row =>
      this.headerList.map(col => {
        let val = row[col.field];
        return val !== null && val !== undefined ? String(val).replace(/"/g, '""') : "";
      })
    );
    let csvContent =
      headers.join(",") +
      "\n" +
      rows.map(r => r.map(x => `"${x}"`).join(",")).join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "UsersList.csv";
    link.style.visibility = "hidden";
    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);
    URL.revokeObjectURL(url);


    this.logDownloadActivity();
  }


  logDownloadActivity() {
    const payload = {
      pageName: 'Users',
      activity: 'Download',
      activityDescription: 'User downloaded the UsersList CSV',
      entryBy: localStorage.getItem('UserID'),
      User_Token: localStorage.getItem('User_Token')
    };

    const apiUrl = this._global.baseAPIUrl + "Role/InsertActivityDetail";

    this._onlineExamService.postData(payload, apiUrl).subscribe(
      () => {
        console.log("InsertActivityDetail API call successful.");
      },
      (error) => {
        console.error("InsertActivityDetail API call failed:", error);
      }
    );
  }





  addUser(template: TemplateRef<any>) {
    this.OnReset(); // clears form
    this.modalRef = this.modalService.show(template);
  }

  toggleUserStatus(user: any) {
    debugger;
    if (user.isactive === 'DELETED') {
      this.ShowErrormessage("This user is already deleted. No action can be performed.");
      return;
    }
    const newStatus = user.isactive === 'ACTIVE' ? 'N' : 'Y';
    const currentUserId = localStorage.getItem('UserID');

    if (user.id == currentUserId) {
      this.ShowErrormessage("You are currently logged in. You cannot lock/unlock your own account.");
      return;
    }

    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to ${newStatus === 'Y' ? 'activate' : 'deactivate'} this user?`,
        type: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonClass: "btn btn-danger",
        confirmButtonText: `Yes, ${newStatus === 'Y' ? 'Activate' : 'Deactivate'}`,
        cancelButtonClass: "btn btn-secondary",
      })
      .then((result) => {
        if (result.value) {
          const payload = {
            userid: user.id,
            isactive: newStatus,
            useridLogged: localStorage.getItem('UserID'),
            User_Token: localStorage.getItem('User_Token'),
          };

          const apiUrl = this._global.baseAPIUrl + "Admin/ToggleStatus";

          this._onlineExamService.postData(payload, apiUrl).subscribe(
            (msg: string) => {
              let alertType: 'success' | 'error' | 'warning' = 'success';

              if (msg.toLowerCase().includes('success')) {
                alertType = 'success';
              } else if (
                msg.toLowerCase().includes('cannot') ||
                msg.toLowerCase().includes('not allowed') ||
                msg.toLowerCase().includes('already')
              ) {
                alertType = 'warning';
              } else {
                alertType = 'error';
              }

              swal.fire({
                title: alertType === 'success' ? "Status Updated!" : "Notice",
                text: msg,
                type: alertType,
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });

              if (alertType === 'success') {
                this.geUserList();
              }
            },
            (error) => {
              swal.fire({
                title: "Error!",
                text: "Failed to update user status.",
                type: "error",
                confirmButtonClass: "btn btn-danger",
              });
            }
          );
        }
      });
  }



  showSpMessage(msg: string) {
    let alertType: 'success' | 'warning' | 'error' = 'success';

    if (msg.toLowerCase().includes('success')) {
      alertType = 'success';
    } else if (msg.toLowerCase().includes('cannot') || msg.toLowerCase().includes('already')) {
      alertType = 'warning';
    } else {
      alertType = 'error';
    }

    swal.fire({
      title: alertType === 'success' ? "Success" : "Notice",
      text: msg,
      type: alertType,
      buttonsStyling: false,
      confirmButtonClass: "btn btn-primary",
    });

    if (alertType === 'success') {
      this.geUserList();
    }
  }

  ShowErrormessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error ! </span> <span data-notify="message"> ' + data + ' </span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-danger alert-notify"
      }
    );


  }
  ShowMessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success ! </span> <span data-notify="message"> ' + data + ' </span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-success alert-notify"
      }
    );


  }

}

