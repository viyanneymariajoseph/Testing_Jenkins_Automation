import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { ThirdPartyDraggable } from "@fullcalendar/interaction";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements OnInit {
selectedDepartmentIds: number[] = [];
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  AddWarehouseForm: FormGroup;
  AddBranchMappingForm: FormGroup;
  BranchMappingForm: FormGroup;
  submitted = false;
  __checkedList: string = "";
  _UserL: any;
  Reset = false;
   editRights: any;
  sMsg: string = "";
  master_checked: boolean = false;
  master_indeterminate: boolean = false;
  _BranchList: any;
  BranchForm: FormGroup;
  _FilteredList: any;
  checkbox_list = [];
  isEditMode: boolean = false;
  _BranchID: any = 0;
 
  first = 0;
  first1 = 0;
  rows = 10;
  rows1 = 10;
  isAllSelected = false;
  departmentList: any[] = [];
 
  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) { }
  ngOnInit() {
    const userID = localStorage.getItem("UserID");
     this.editRights = (localStorage.getItem('Edit') || '').trim() === 'true';
    this.AddWarehouseForm = this.formBuilder.group({
      Id: [0],
      WarehouseName: ["", Validators.required],
      WarehouseDescription: ["", Validators.required],
      IsActive: ["", Validators.required],
      User_Token: localStorage.getItem("user_Token"),
      userid: Number(localStorage.getItem("UserID"))
    });
    this.prepareTableData([], []);
    this.getWarehouseList();
 
  }
 
 
 
  get FormControls() {
    return this.AddWarehouseForm.controls;
  }
 
  entriesChange($event) {
    this.entries = $event.target.value;
  }
 
  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  onActivate(event) {
    this.activeRow = event.row;
  }
 
  getWarehouseList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "Warehouse/GetWarehouseLists?user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log("WareHouseList" ,data);
 
      this._BranchList = data;
 
      this._FilteredList = data;
      this.prepareTableData(this._BranchList, this._FilteredList);
    });
  }
 
 
 
  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
 prepareTableData(tableData, headerList) {
  let formattedData = [];
  let tableHeader: any = [
    { field: "srNo", header: "SR NO", index: 1 },
    { field: "WarehouseName", header: "WAREHOUSE NAME", index: 3 },
    { field: "WarehouseDescription", header: "WAREHOUSE DESCRIPTION", index: 2 },
    { field: "CreatedDate", header: "CREATED DATE", index: 2 },
    { field: "userName", header: "CREATED BY", index: 2 },
    { field: "IsActive", header: "IS ACTIVE", index: 4 },
  ];
 
  tableData.forEach((el, index) => {
    formattedData.push({
      id: el.Id || el.id, 
      srNo: parseInt(index + 1),
      WarehouseDescription: el.WarehouseDescription,
      WarehouseName: el.WarehouseName,
      CreatedDate: el.CreatedDate,
      userName: el.userName,
      IsActive: el.IsActive === 'Y' ? 'YES' : 'NO',
    });
  });
  this.headerList = tableHeader;
  this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
  this.formattedData = formattedData;
  this.loading = false;
}
 
  searchTable($event) {
    let val = $event.target.value;
    if (val == "") {
      this.formattedData = this.immutableFormattedData;
    } else {
      let filteredArr = [];
      const strArr = val.split(",");
      this.formattedData = this.immutableFormattedData.filter(function (d) {
        for (var key in d) {
          strArr.forEach((el) => {
            if (
              d[key] &&
              el !== "" &&
              (d[key] + "").toLowerCase().indexOf(el.toLowerCase()) !== -1
            ) {
              if (filteredArr.filter((el) => el.srNo === d.srNo).length === 0) {
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
    this.onClose();
     if (this.modalRef) {
    this.modalRef.hide(); // ✅ This closes the modal
  }
  }
 
 
 
onSubmit(modal: any) {
  this.submitted = true;

  if (this.AddWarehouseForm.invalid) {
    return;
  }

  const userToken = localStorage.getItem("user_Token");
  const apiUrl = this._global.baseAPIUrl + "Warehouse/Add?user_Token=" + userToken;

  this._onlineExamService.postData(this.AddWarehouseForm.value, apiUrl).subscribe(
    (response: any) => {
      const rawMessage = (response?.Message || "").trim();
      const message = rawMessage.toLowerCase();

      const isDuplicate =
        message.includes("already exists") || message.includes("warehouse already exists");

      const title = isDuplicate ? "Error!" : "Success!";
      const toastClass = isDuplicate
        ? "ngx-toastr alert alert-dismissible alert-danger alert-notify"
        : "ngx-toastr alert alert-dismissible alert-success alert-notify";

      // ✅ Show correct toast
      this.toastr.show(
        `<span class="alert-title">${title}</span> <span data-notify="message">${rawMessage}</span>`,
        "",
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          positionClass: "toast-top-center",
          toastClass,
        }
      );
            this.handleAfterSubmit();

      if (!isDuplicate) {
        this.getWarehouseList();
        this.OnReset();
        console.log("Form Submitted:", this.AddWarehouseForm.value);
      }
    },
    (error) => {
      console.error("Error saving warehouse:", error);
      this.toastr.error('Failed to save warehouse details.', 'Error');
    }
  );
}

  handleAfterSubmit() {
    this.OnReset();
    this.modalRef.hide();
  }
  onSubmitDepartment() {
    this.submitted = true;
 
    if (this.AddWarehouseForm.invalid) {
      return;
    }
 
    const formValue = this.AddWarehouseForm.value;
    console.log("🧾 Update Form Value:", formValue);
 
    const userToken = localStorage.getItem("user_Token");
 
    if (!formValue.Id || Number(formValue.Id) === 0) {
      this.toastr.error("Invalid department ID for update.");
      return;
    }
 
    const apiUrl = this._global.baseAPIUrl + "Warehouse/Update?user_Token=" + userToken;
    console.log("🌐 Update API URL:", apiUrl);
 
    this._onlineExamService.postData(formValue, apiUrl).subscribe((response: any) => {
      this.toastr.show(
        '<span class="alert-title">Success!</span> <span data-notify="message">Warehouse Details Updated Successfully</span>',
        "",
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          positionClass: "toast-top-center",
          toastClass: "ngx-toastr alert alert-success alert-notify"
        }
      );
 
      this.getWarehouseList();
      this.OnReset();
      this.modalRef?.hide();
    });
  }
 
 
 
  deleteBranch(item: any) {
    console.log("item received in deleteBranch:", item);
    const id = item.id;
    swal
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonClass: "btn btn-danger",
      confirmButtonText: "Yes, delete it!",
      cancelButtonClass: "btn btn-secondary",
    })
    .then((result) => {
      if (result.value) {
        const apiUrl =
          this._global.baseAPIUrl +
          "Warehouse/DeleteWarehouse?id=" +
          id +
          "&User_Token=" +
          localStorage.getItem("User_Token") +
          "&userid=" +
          localStorage.getItem("UserID");
 
        this._onlineExamService.getAllData(apiUrl).subscribe((data) => {
          swal.fire({
            title: "Deleted!",
            text: "Warehouse has been deleted.",
            type: "success",
            buttonsStyling: false,
            confirmButtonClass: "btn btn-primary",
          });
          this.getWarehouseList();
        });
      }
    });
  }
  _SingleDepartment: any;
 
  editBranch(template: TemplateRef<any>, row: any) {
    console.log("🔍 Editing department:", row);
    this.isEditMode = true; // Set edit mode to true  
    this.AddWarehouseForm.patchValue({
      Id: row.Id || row.id,  // ✅ Patch 'Id' with the value from row
      WarehouseDescription: row.WarehouseDescription,
      WarehouseName: row.WarehouseName,
      IsActive: row.IsActive === 'YES' ? 'Y' : 'N',
      userid: localStorage.getItem("UserID"),
      User_Token: localStorage.getItem("user_Token")
    });
 
    this.modalRef = this.modalService.show(template);
  }
 
 
  addBranch(template: TemplateRef<any>) {
    this.isEditMode = false;
    this.submitted = false;
    this.AddWarehouseForm.reset();
    this.AddWarehouseForm = this.formBuilder.group({
      WarehouseName: ["", Validators.required],
      WarehouseDescription: ["", Validators.required],
     // IsActive: ["", Validators.required],
      User_Token: localStorage.getItem("user_Token"),
      userid: localStorage.getItem("UserID"),
      Id: [0],
    });
    this.modalRef = this.modalService.show(template);
   
  }
 
  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }
 
 
 
  get departmentsArray(): FormArray {
    return this.AddBranchMappingForm.get("departmentsArray") as FormArray;
  }
 
  isChecked(id: number): boolean {
    return this.departmentsArray.value.includes(id);
  }
 
 
 
  onClose() {
    // Reset form fields
    this.AddWarehouseForm.reset();
 
    // Reset checkbox selections
    this.selectedDepartmentIds = []; // if you're tracking selected IDs
    this.isAllSelected = false;
 
    // Optionally mark all controls as untouched
    this.AddWarehouseForm.markAsPristine();
    this.AddWarehouseForm.markAsUntouched();
  }
 
 
 
 
  ErrorMessage(msg: any) {
    this.toastr.show(
      `<div class="alert-text">
       <span class="alert-title" data-notify="title"></span>
       <span data-notify="message"> ${msg} </span>
     </div>`,
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass: "ngx-toastr alert alert-dismissible alert-danger alert-notify"
      }
    );
  }
 
  showSuccessToast(msg: any) {
    this.toastr.show(
      '<div class="alert-text"></div> <span class="alert-title" data-notify="title"></span> <span data-notify="message"> ' + msg + ' </span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-success alert-notify" // Use alert-success for green
      }
    );
  }
 
 
 
 
 
}
 