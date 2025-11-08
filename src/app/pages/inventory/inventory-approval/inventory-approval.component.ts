import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from "@angular/forms";
import { Injectable } from "@angular/core";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

import { ToastrService } from "ngx-toastr";

import swal from "sweetalert2";
import { MatDialog } from "@angular/material/dialog";
import { LoadingService } from "src/app/Services/loading.service";
import { delay } from "rxjs/operators";

@Component({
  selector: "app-inventory-approval",
  templateUrl: "./inventory-approval.component.html",
  styleUrls: ["./inventory-approval.component.scss"],
})
export class InventoryApprovalComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  modalRef: BsModalRef;
  isReadonly = true;
  _IndexList: any;
  UserID: any;
  AddFileInwardForm: FormGroup;
  pickupForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  first: any = 0;
  rows: any = 0;
  first1: any = 0;
  rows1: any = 0;
  _IndexPendingListFile: any;
  _FilteredListFile: any;
  _FileList: any;
    loading11: boolean = false;

  _FilteredList: any;
  _IndexPendingList: any;
  bsValue = new Date();
  tempCartonNO: any;
  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private dialog: MatDialog,
            private _loading: LoadingService,
    
  ) { }
  ngOnInit() {
    document.body.classList.add("data-entry");
    this.AddFileInwardForm = this.formBuilder.group({
      batchId: ["", Validators.required],
      documentType: ["", Validators.required],
      department: ["", Validators.required],
      cartonNo: ["", [Validators.required]],
      detailDocumentType: ["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      UserID: localStorage.getItem("UserID"),
    });

    this.getPickRequest();
    // this.getAllBranchList();
    // this.prepareSubTableData([], []);
  }
  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    FileSaver.saveAs(blob, fileName + ".xlsx");
  }
  AllBranch: any;
  getAllBranchList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchMaster/GetbranchDeatilsByUserId?USER_ID=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this.AllBranch = data;
    });
  }
  //karta hoon integrate work ho raha abb
  getPickRequest() {
    const apiUrl = this._global.baseAPIUrl + "BranchInward/GetBatchApproval";
    this._onlineExamService
      .postData(
        {
          createdBy: localStorage.getItem("UserID"),
          User_Token: localStorage.getItem("User_Token"),
        },
        apiUrl
      )
      .subscribe((data: {}) => {
        this._IndexPendingList = data;
        this._FilteredList = data;
        this.prepareTableData(this._FilteredList, this._IndexPendingList);
      });
  }
  get PickupControls() {
    return this.pickupForm.controls;
  }

  closeModel() {
    this.modalRef.hide();
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  formattedData1: any = [];
  headerList1: any;
  immutableFormattedData1: any;
  loading1: boolean = true;
  private formatDate(originalDateString: any) {
    const date = new Date(originalDateString);

    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1); // Months are zero-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "batchId", header: "BATCH ID", index: 1 },
      { field: "DepartmentName", header: "DEPARTMENT NAME", index: 1 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },

      { field: "numberOfCartons", header: "NO OF CARTON’S", index: 1 },
      { field: "createdBy", header: "INWARD BY", index: 1 },
      { field: "createdDate", header: "INWARD ON", index: 1 },
      { field: "status", header: "BATCH STATUS", index: 1 },


    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        batchId: el.batchId,
        createdBy: el.createdBy,
        createdDate: el.createdDate,
        numberOfCartons: el.numberOfCartons,
        pickUpDate: el.pickUpDate,
        pickUpBy: el.pickUpBy,
        pickUpOn: el.pickUpOn,
        status: el.status,
        DepartmentName: el.DepartmentName,
        DepartmentCode: el.DepartmentCode
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  prepareSubTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "batchId", header: "BATCH ID", index: 2 },
      { field: "cartonNo", header: "CARTON NUMBER", index: 2 },
      { field: "department", header: "DEPARTMENT", index: 3 },
      { field: "documentType", header: "DOCUMENT TYPE", index: 4 },
      { field: "detailDocumentType", header: "DETAIL DOC TYPE", index: 3 },
      { field: "status", header: "CARTON STATUS", index: 3 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        batchId: el.batchId,
        id: el.id,
        cartonNo: el.cartonNo,
        department: el.departmentName,
        documentType: el.documentTypeName,
        detailDocumentType: el.detailDocumentTypeName,
        status: el.status,
      });
      this.tempCartonNO = el.cartonNo;
    });

    this.headerList1 = tableHeader;
    this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
    this.formattedData1 = formattedData;
    this.loading1 = false;
  }
 
// onUpdatestatus(status: any, row: any) {
//   this.toastr.clear();
//   const cartonNo = this.tempCartonNO;
//   this.AddFileInwardForm = this.formBuilder.group({
//     status: [status],
//     batchId: [this.batchIdValue],
//     User_Token: localStorage.getItem("User_Token"),
//     CreatedBy: localStorage.getItem("UserID"),
//     cartonNo: [cartonNo],
//   });
 
//   const apiUrl = this._global.baseAPIUrl + "BranchInward/AddApproval";
 
//   this._onlineExamService.postData(this.AddFileInwardForm.value, apiUrl).subscribe((data: {}) => {
//     this.modalRef.hide();
//     this.getPickRequest();
 
//     if (status === "Warehouse Approval") {
//       this.toastr.show(
//         '<span class="alert-title" data-notify="title">Success!</span>' +
//           '<span data-notify="message">Approved successfully!</span>',
//         "",
//         {
//           timeOut: 3000,
//           closeButton: true,
//           enableHtml: true,
//           tapToDismiss: false,
//           titleClass: "alert-title",
//           positionClass: "toast-top-center",
//           toastClass:
//             "ngx-toastr alert alert-dismissible alert-success alert-notify",
//         }
//       );
//     } else if (status === "Warehouse Rejected") {
//       this.toastr.show(
//         '<span class="alert-title" data-notify="title">Rejected!</span>' +
//           '<span data-notify="message">Rejected successfully!</span>',
//         "",
//         {
//           timeOut: 3000,
//           closeButton: true,
//           enableHtml: true,
//           tapToDismiss: false,
//           titleClass: "alert-title",
//           positionClass: "toast-top-center",
//           toastClass:
//             "ngx-toastr alert alert-dismissible alert-danger alert-notify",
//         }
//       );
//     }
//   });
// }
 
//   onUpdatestatus(status: any, row: any) {
//   this.toastr.clear();
//   const cartonNo = this.tempCartonNO;
//   this.AddFileInwardForm = this.formBuilder.group({
//     status: [status],
//     batchId: [this.batchIdValue],
//     User_Token: localStorage.getItem("User_Token"),
//     CreatedBy: localStorage.getItem("UserID"),
//     cartonNo: [cartonNo],
//   });
 
//   const apiUrl = this._global.baseAPIUrl + "BranchInward/AddApproval";
 
//   this._onlineExamService.postData(this.AddFileInwardForm.value, apiUrl).subscribe((data: {}) => {
//     this.modalRef.hide();
//     this.getPickRequest();
 
//     // ✅ Show toaster based on status
//     if (status === "Approval") {
//       this.toastr.show(
//         '<span class="alert-title" data-notify="title">Success!</span>' +
//           '<span data-notify="message">Approved successfully!</span>',
//         "",
//         {
//           timeOut: 3000,
//           closeButton: true,
//           enableHtml: true,
//           tapToDismiss: false,
//           titleClass: "alert-title",
//           positionClass: "toast-top-center",
//           toastClass:
//             "ngx-toastr alert alert-dismissible alert-success alert-notify",
//         }
//       );
//     } else if (status === "Reject") {
//       this.toastr.show(
//         '<span class="alert-title" data-notify="title">Rejected!</span>' +
//           '<span data-notify="message">Inventory Rejected!</span>',
//         "",
//         {
//           timeOut: 3000,
//           closeButton: true,
//           enableHtml: true,
//           tapToDismiss: false,
//           titleClass: "alert-title",
//           positionClass: "toast-top-center",
//           toastClass:
//             "ngx-toastr alert alert-dismissible alert-danger alert-notify",
//         }
//       );
//     }
//   });
// }

 onUpdatestatus(status: any, row: any) {
  this.toastr.clear();
  const cartonNo = this.tempCartonNO;
  this.AddFileInwardForm = this.formBuilder.group({
    status: [status],
    batchId: [this.batchIdValue],
    User_Token: localStorage.getItem("User_Token"),
    CreatedBy: localStorage.getItem("UserID"),
    cartonNo: [cartonNo],
    cartonNos: [cartonNo]
  });
 
  const apiUrl = this._global.baseAPIUrl + "BranchInward/AddApproval";
 
  this._onlineExamService.postData(this.AddFileInwardForm.value, apiUrl).subscribe((data: {}) => {
    this.modalRef.hide();
    this.getPickRequest();
 
    // ✅ Show toaster based on status
    if (status === "Approval") {
      this.toastr.show(
        '<span class="alert-title" data-notify="title">Success!</span>' +
          '<span data-notify="message">Approved successfully!</span>',
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
    } else if (status === "Reject") {
      this.toastr.show(
        '<span class="alert-title" data-notify="title">Rejected!</span>' +
          '<span data-notify="message">Inventory Rejected!</span>',
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
  });
}

getStatusClass1(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.toUpperCase()) {
    case 'CARTON INWARD':
      return 'status-badge status-accepted';
    case 'APPROVAL PENDING':
      return 'status-badge status-review';
   
    default:
      return 'status-badge status-default';
  }
}
 getStatusClass(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.toUpperCase()) {
    case 'WAREHOUSE LOCATION UPDATED':
      return 'status-badge status-accepted';
    case 'APPROVAL PENDING':
      return 'status-badge status-review';
   
    default:
      return 'status-badge status-default';
  }
}

listenToLoading(): void {
  this._loading.loadingSub
    .pipe(delay(0))
    .subscribe((loading) => {
      this.loading11 = loading;
    });
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
    this.Reset = true;
    this.isReadonly = false;
    //this.modalRef.hide();
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  searchTable1($event) {
    let val = $event.target.value;
    if (val == "") {
      this.formattedData1 = this.immutableFormattedData1;
    } else {
      let filteredArr = [];
      const strArr = val.split(",");
      this.formattedData1 = this.immutableFormattedData1.filter(function (d) {
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
      this.formattedData1 = filteredArr;
    }
  }

  OnReset1() {
    this.Reset = true;
    this.isReadonly = false;
  }

  paginate1(e) {
    this.first1 = e.first;
    this.rows1 = e.rows;
  }

  hidepopup() {
    // this.modalService.hide;
    this.modalRef.hide();
    //this.modalRef.hide
  }
  get FormControls() {
    return this.pickupForm.controls;
  }
  batchIdValue: string;
  View(template: TemplateRef<any>, car) {
    this.batchIdValue = car.batchId;
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchInward/GetBatchDetails?batchId=" +
      car.batchId +
      "&User_Token=" +
      localStorage.getItem("User_Token") +
      "&UserID=" +
      localStorage.getItem("UserID");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.prepareSubTableData(data, data);
    });
    this.modalRef = this.modalService.show(template);
  }

  entriesChange($event) {
    this.entries = $event.target.value;
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(selected);
  }
  onActivate(event) {
    this.activeRow = event.row;
  }

  ngOnDestroy() {
    document.body.classList.remove("data-entry");
  }

  showmessage(data: any) {
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
}
