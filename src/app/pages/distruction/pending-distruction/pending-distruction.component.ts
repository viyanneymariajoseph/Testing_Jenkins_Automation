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

@Component({
  selector: 'app-pending-distruction',
  templateUrl: './pending-distruction.component.html',
  styleUrls: ['./pending-distruction.component.scss']
})
export class PendingDistructionComponent implements OnInit {

  entries: number = 10;
  selected: any[] = [];

  activeRow: any;
  modalRef: BsModalRef;
  isReadonly = true;

  UserID: any;
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
sysRole: boolean = false;
  _FilteredList: any;
  _IndexPendingList: any;

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private dialog: MatDialog
  ) { }
  ngOnInit() {
   this.sysRole = localStorage.getItem("Destruction Edit") === "true";

  console.log("sysRole:", this.sysRole);
    document.body.classList.add("data-entry");
    this.pickupForm = this.formBuilder.group({
      branch_id: ["", Validators.required],
      request_id: [""],
      service_type: ["", Validators.required],
      document_type: ["", Validators.required],
      main_file_count: [null], // No validators, will be validated conditionally
      collateral_file_count: [null],
      remark: [""],
      User_Token: localStorage.getItem("User_Token"),
      userid: localStorage.getItem("UserID"),
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
  getPickRequest() {
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchInward/GetPendingDestruction?UserID=" +
      localStorage.getItem("UserID") +
      "&User_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingList = data;
      this._FilteredList = data;
      this.prepareTableData(this._FilteredList, this._IndexPendingList);
    });
  }
  getRequestNo() { }


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

  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      //   { field: "batchId", header: "BATCH ID", index: 1 },
      { field: "cartonNo", header: "CARTON NO", index: 1 },
      { field: "departmentName", header: "DEPARTMENT NAME", index: 1 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },
      { field: 'WarehouseName', header: 'WAREHOUSE NAME', index: 3 },
      { field: 'ItemLcoation', header: 'ITEM LOCATION', index: 3 },
      { field: "documentType", header: "DOCUMENT TYPE", index: 1 },
      { field: "detailDocumentType", header: "DOCUMENT DETAILS", index: 1 },
      { field: "createdBy", header: "INVENTORY BY", index: 1 },
      { field: "createdDate", header: "INVENTORY ON", index: 1 },
      //   { field: "DestructionBy", header: "DESTRUCTION BY", index: 2 },
      //   { field: "DestructionDate", header: "DESTRUCTION ON", index: 2 },
      // { field: "extensionBy", header: "EXTENSION BY", index: 1 },
      // { field: "extensionDate", header: "EXTENSION ON", index: 1 },
      { field: "ReteionPeriod", header: "RETENTION PERIOD", index: 1 },
      { field: "ExpireDate", header: "EXPIRE DATE", index: 1 },

    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        batchId: el.batchId,
        id: el.id,
        cartonNo: el.cartonNo,
        departmentName: el.departmentName,
        documentType: el.documentTypeName,
        detailDocumentType: el.detailDocumentTypeName,
        ReteionPeriod: el.ReteionPeriod + ' Year',
        createdDate: el.createdDate,
        ExpireDate: el.ExpireDate,
        createdBy: el.createdBy,
        extensionBy: el.extensionBy,
        extensionDate: el.extensionDate,
        DepartmentCode: el.DepartmentCode,
        DestructionBy: el.DestructionBy,
        DestructionDate: el.DestructionDate,
        isDestructionOrExtension: el.isDestructionOrExtension,
        WarehouseName: el.WarehouseName,
        ItemLcoation: el.ItemLcoation

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
    this.Reset = true;
    this.isReadonly = false;
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
    this.modalRef.hide();
    //this.modalRef.hide
  }
  get FormControls() {
    return this.pickupForm.controls;
  }
  // View(template: TemplateRef<any>, car) {
  //   const apiUrl =
  //     this._global.baseAPIUrl +
  //     "BranchInward/GetBatchDetails?batchId=" +
  //     car.batchId +
  //     "&User_Token=" +
  //     localStorage.getItem("User_Token") +
  //     "&UserID=" +
  //     localStorage.getItem("UserID");
  //   this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
  //     this.prepareTableData1(data, data);
  //   });
  //   this.modalRef = this.modalService.show(template);
  // }

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


// ResetDestruction(event: any) {
//   debugger;

//   const apiUrl =
//     this._global.baseAPIUrl + "BranchInward/ResetDestruction";

//   const payload = {
//     cartonNo: event.cartonNo,
//     UserID: localStorage.getItem("UserID"),
//     User_Token: localStorage.getItem("User_Token")
//   };

//   this._onlineExamService.postData(payload,apiUrl).subscribe({
//     next: (response: any) => {
//       this.toastr.success(response, "Success");
      
//       this.getPickRequest();
//     },
//     error: (err) => {
//       console.error("ResetDestruction error:", err);

//       if (typeof err === "string") {
//         this.toastr.error(err, "Error");
//       } else if (err?.error) {
//         this.toastr.error(err.error, "Error");
//       } else {
//         this.toastr.error("Unexpected error occurred", "Error");
//       }
//     }
//   });
// }

ResetDestruction(event: any) {
  debugger;

  swal
    .fire({
      title: "Are you sure?",
      text: `Do you want to reset destruction for carton ${event.cartonNo}?`,
      type: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonClass: "btn btn-danger",
      confirmButtonText: "Yes, Reset",
      cancelButtonClass: "btn btn-secondary",
    })
    .then((result) => {
      if (result.value) {
        const payload = {
          cartonNo: event.cartonNo,
          UserID: localStorage.getItem("UserID"),
          User_Token: localStorage.getItem("User_Token"),
        };

        const apiUrl =
          this._global.baseAPIUrl + "BranchInward/ResetDestruction";

        this._onlineExamService.postData(payload, apiUrl).subscribe(
          (msg: string) => {
            let alertType: "success" | "error" | "warning" = "success";

            if (msg.toLowerCase().includes("success")) {
              alertType = "success";
            } else if (
              msg.toLowerCase().includes("cannot") ||
              msg.toLowerCase().includes("not found") ||
              msg.toLowerCase().includes("already")
            ) {
              alertType = "warning";
            } else {
              alertType = "error";
            }

            swal.fire({
              title: alertType === "success" ? "Reset Done!" : "Notice",
              text: msg,
              type: alertType,
              buttonsStyling: false,
              confirmButtonClass: "btn btn-primary",
            });

            if (alertType === "success") {
              this.getPickRequest();
            }
          },
          (error) => {
            swal.fire({
              title: "Error!",
              text: "Failed to reset destruction.",
              type: "error",
              confirmButtonClass: "btn btn-danger",
            });
          }
        );
      }
    });
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

  downloadFile() {
    const filename = 'Pending_Destruction';

    //    { field: 'WarehouseName', header: 'WAREHOUSE NAME', index: 3 },
    // { field: 'ItemLcoation', header: 'ITEM LOCATION', index: 3 },


    // CSV Header matching tableHeader
    let csvData = "CARTON NO,DEPARTMENT NAME,DEPARTMENT CODE,WAREHOUSE NAME,ITEM LOCATION,DOCUMENT TYPE,DOCUMENT DETAILS,INVENTORY BY,INVENTORY ON,RETENTION PERIOD,EXPIRE DATE\n";

    // Ensure data exists
    if (!this.formattedData || this.formattedData.length === 0) {
      console.warn("No data to download.");
      return;
    }

    // Add data rows matching header order
    this.formattedData.forEach((row: any) => {
      csvData +=
        // `${row.batchId ?? ''},` +
        `${row.cartonNo ?? ''},` +
        `${row.departmentName ?? ''},` +
        `${row.DepartmentCode ?? ''},` +
        `${row.WarehouseName ?? ''},` +
        `${row.ItemLcoation ?? ''},` +
        `${row.documentType ?? ''},` +
        `${row.detailDocumentType ?? ''},` +
        `${row.createdBy ?? ''},` +
        `${row.createdDate ?? ''},` +
        //   `${row.DestructionBy ?? ''},` +
        //   `${row.DestructionDate ?? ''},` +
        `${row.ReteionPeriod ?? ''},` +
        `${row.ExpireDate ?? ''}\n`;
    });

    // Create and download CSV
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);

    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
    this.logDownloadActivity();
  }

logDownloadActivity() {
  const payload = {
    pageName: 'Pending Destruction',
    activity: 'Download',
    activityDescription: 'User downloaded the Pending Destruction list',
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

}
