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
  selector: 'app-return-to-storage',
  templateUrl: './return-to-storage.component.html',
  styleUrls: ['./return-to-storage.component.scss']
})
export class ReturnToStorageComponent implements OnInit {

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

  _FilteredList: any;
  _IndexPendingList: any;
   cartonNumber: string;

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private dialog: MatDialog
  ) {}
  ngOnInit() {
    document.body.classList.add("data-entry");
    this.pickupForm = this.formBuilder.group({
      branch_id: ["", Validators.required],
      request_id: [""],
      service_type: ["", Validators.required],
      document_type: ["", Validators.required],
      main_file_count: [null], 
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
  //karta hoon integrate work ho raha abb
  getPickRequest() {
    const apiUrl =
      this._global.baseAPIUrl +
      "Refilling/GetRefillingDataAll?UserID=" +
      localStorage.getItem("UserID") +
      "&User_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingList = data;
      this._FilteredList = data;
      this.prepareTableData(this._FilteredList, this._IndexPendingList);
    });
  }
   prepareTableData1(tableData, headerList) {
  //  console.log("iowowowow",tableData);
    let formattedData = [];
    let tableHeader: any = [
      // { field: "srNo", header: "SR NO", index: 1 },
{ field: "requestNumber", header: "RETURN REQUEST ID", index: 2 },
{ field: "cartonNo", header: "CARTON NUMBER", index: 2 },
{ field: "department", header: "DEPARTMENT NAME", index: 3 },
{ field: "documentType", header: "DOCUMENT TYPE", index: 4 },
{ field: "detailDocumentType", header: "DETAIL DOCUMENT TYPE", index: 3 },
{ field: "WarehouseName", header: "WAREHOUSE NAME", index: 4 }, 
{ field: "detailLocation", header: "DETAIL LOCATION", index: 4 },
{ field: "status", header: "CARTON STATUS", index: 3 },//GKJ_09_01


    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        requestNumber: el.requestNumber,
        id: el.id,
        cartonNo: el.cartonNumber,
        department: el.department,
        documentType: el.documentType,
        detailDocumentType: el.detailDocumentType,
        status: el.status,
         WarehouseName: el.WarehouseName,
          detailLocation: el.detailLocation,
      });
    });
    this.headerList1 = tableHeader;
    this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
    this.formattedData1 = formattedData;
    this.loading = false;
  }

    View(template: TemplateRef<any>, car) {
    const apiUrl =
      this._global.baseAPIUrl +
      "Refilling/GetViewDetails?request_number=" +
      car.requestNumber +
      "&User_Token=" +
      localStorage.getItem("User_Token") +
      "&UserID=" +
      localStorage.getItem("UserID");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.prepareTableData1(data, data);
    });
    this.modalRef = this.modalService.show(template);
  }

  toggleValidators() {
    const mainFileCountControl = this.pickupForm.get("main_file_count");
    const collateralFileCountControl = this.pickupForm.get(
      "collateral_file_count"
    );

    if (this.pickupForm.get("document_type").value === "Main File") {
      mainFileCountControl.setValidators([Validators.required]);
      collateralFileCountControl.clearValidators();
    } else if (
      this.pickupForm.get("document_type").value === "Collateral File"
    ) {
      collateralFileCountControl.setValidators([Validators.required]);
      mainFileCountControl.clearValidators();
    } else if (
      this.pickupForm.get("document_type").value ===
      "Both (Main and Collateral)"
    ) {
      collateralFileCountControl.setValidators([Validators.required]);
      mainFileCountControl.setValidators([Validators.required]);
    } else {
      mainFileCountControl.clearValidators();
      collateralFileCountControl.clearValidators();
    }

    mainFileCountControl.updateValueAndValidity();
    collateralFileCountControl.updateValueAndValidity();
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

 
  prepareTableData(tableData, headerList) { //gkj 28-07
    let formattedData = [];
    let tableHeader: any = [
      { field: "requestNumber", header: "RETURN REQUEST ID", index: 1 },
      { field: "noOfCartons", header: "NO OF CARTON'S", index: 1 },
     { field: "status", header: " RETURN STATUS", index: 1 }, //GKJ_09_01
      { field: "returnBy", header: "RETURN REQUEST BY ", index: 1 },
      { field: "returnDate", header: "RETURN REQUEST ON", index: 1 },
      { field: "approvedBy", header: "APPROVED BY", index: 1 },
      { field: "approvedDate", header: "APPROVED ON", index: 1 },
      // { field: "rejectedBy", header: "REJECTED BY", index: 1 },
      // { field: "rejectedDate", header: "REJECTED ON", index: 1 },
      { field: "scheduledBy", header: "RETURN SCHEDULED BY", index: 1 },
      // { field: "scheduledDate", header: "RETURN SCHEDULED  ON", index: 1 },
      { field: "pickupDate", header: "EXPECTED DATE OF PICKUP", index: 1 },
      { field: "returnAckBy", header: "RETURN ACK BY", index: 1 },
      { field: "retunrAckDate", header: "RETURN ACK ON", index: 1 },
      { field: "locationupdatedBy", header: "LOCATION UPDATED BY", index: 1 },
      { field: "locationupdatedDate", header: "LOCATION UPDATED  ON", index: 1 },
    ];
 
    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        requestNumber: el.requestNumber,
        id: el.id,
        noOfCartons:el.noOfCartons,
        returnBy:el.returnBy,
        returnDate:el.returnDate,
        approvedBy:el.approvedBy,
        approvedDate:el.approvedDate,
        rejectedBy:el.rejectedBy,
         rejectedDate:el.rejectedDate,
          scheduledBy:el.scheduledBy,
           scheduledDate:el.scheduledDate,
        pickupDate:el.pickupDate,
        returnAckBy:el.returnAckBy,
        retunrAckDate:el.returnAckDate,
        locationupdatedBy:el.locationupdatedBy,
        locationupdatedDate:el.locationupdatedDate,
        status:el.status
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
b
  paginate1(e) {
    this.first1 = e.first1;
    this.rows1 = e.rows1;
  }

  hidepopup() {
    // this.modalService.hide;
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
    const filename = "Return_Request";


//     { field: "requestNumber", header: "RETURN REQUEST ID", index: 2 },
// { field: "cartonNo", header: "CARTON NUMBER", index: 2 },
// { field: "department", header: "DEPARTMENT NAME", index: 3 },
// { field: "documentType", header: "DOCUMENT TYPE", index: 4 },
// { field: "detailDocumentType", header: "DETAIL DOCUMENT TYPE", index: 3 },
// { field: "WarehouseName", header: "WAREHOUSE NAME", index: 4 }, 
// { field: "detailLocation", header: "DETAIL LOCATION", index: 4 },
// { field: "status", header: "STATUS", index: 3 },


    // CSV Header
    let csvData =
      "RETURN REQUEST ID,Carton Number,Department Name,DOCUMENT TYPE,DETAIL DOCUMENT TYPE, WAREHOUSE NAME,DETAIL LOCATION,Carton Status,\n";

    // Ensure formattedData is defined
    if (!this.formattedData1 || this.formattedData1.length === 0) {
      console.warn("No data to download.");
      return;
    }

    // Add data rows
    this.formattedData1.forEach((row: any) => {
      csvData +=
        `${row.requestNumber ?? ""},` +
        `${row.cartonNo ?? ""},` +
        `${row.department ?? ""},` +
        `${row.documentType ?? ""},` +        
        `${row.detailDocumentType ?? ""},` +
        `${row.WarehouseName ?? ""},` +
        `${row.detailLocation ?? ""},` +
        `${row.status ?? ""},\n`;
    });

    //   { field: 'WarehouseName', header: 'WAREHOUSE NAME', index: 3 },

    // Create and download CSV
    const blob = new Blob(["\ufeff" + csvData], {
      type: "text/csv;charset=utf-8;",
    });
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);

    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  searchByCartonNumber() { //gkj 28-07 this  html and api also
  if (!this.cartonNumber?.trim()) {
    return;
  }
 
  console.log("Entered Carton Number:", this.cartonNumber);
 
  const apiUrl =
    this._global.baseAPIUrl +
    "Refilling/GetRefillingDataAllbyCartonNo?UserID=" +
    localStorage.getItem("UserID") +
    "&user_Token=" +
    localStorage.getItem("User_Token") +
    "&cartonNumber=" +
    encodeURIComponent(this.cartonNumber);
 
  this._onlineExamService.getAllData(apiUrl).subscribe(
    (data: any) => {
      console.log("API Response:", data);
 
      this._IndexPendingList = data;
      this._FilteredList = data;
 
      this.prepareTableData(this._FilteredList, this._IndexPendingList);
    },
    (error) => {
      console.error("Error fetching carton data:", error);
    }
  );
}
 
 getStatusClass(status: string) {
  if (!status) return 'status-default';
 
  switch (status.toUpperCase()) {
    case 'APPROVAL PENDING':
      return 'status-accepted';
    case 'RETURN PICKUP SCHEDULED':
      return 'status-review';
    case 'RETURN REQUEST APPROVED':
      return 'status-incomplete';
    case 'RETURN REQUEST CLOSED':
    case 'RETURN REQUEST ACKNOWLEDGED PARTIALLY':
      return 'status-rejected';
    default:
      return 'status-default';
  }
}
 
getStatusClass1(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.trim().toUpperCase()) {
    case 'APPROVAL PENDING':
      return 'status-badge status-accepted'; // green
    case 'RETURN PICKUP SCHEDULED':
      return 'status-badge status-review'; // yellow
    case 'RETURN REQUEST APPROVED':
      return 'status-badge status-incomplete'; // grey  
       case 'WAREHOUSE RETURN LOCATION UPDATED':
      return 'status-badge status-review';
    case 'RETURN REQUEST CLOSED':
    case 'RETURN REQUEST REJECTED':
      return 'status-badge status-rejected'; // red
    default:
      return 'status-badge status-default'; // grey-blue
  }
}
}
