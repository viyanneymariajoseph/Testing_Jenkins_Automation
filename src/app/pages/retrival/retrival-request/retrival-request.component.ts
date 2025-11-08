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
import { CommonService } from "src/app/Services/common.service";

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: "app-retrival-request",
  templateUrl: "./retrival-request.component.html",
  styleUrls: ["./retrival-request.component.scss"],
})
export class RetrivalRequestComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  isReadonly = true;
  _IndexList: any;
  UserID: any;
  PODEntryForm: FormGroup;
  pickupForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  _FileNo: any = "";
  first: any = 0;
  firstView: any = 0;
  rows: any = 0;
  first1: any = 0;
  rows1: any = 0;
  _IndexPendingListFile: any;
  _FilteredListFile: any;

  _TotalPages: any = 0;
  _FileList: any;
  _FilteredList: any;
  _IndexPendingList: any;
  bsValue = new Date();
  cartonNumber: string ;
  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
        private _commonService: CommonService,

  ) {}
  ngOnInit() {
    document.body.classList.add("data-entry");
    this.pickupForm = this.formBuilder.group({
      request_number: ["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      userid: localStorage.getItem("UserID"),
    });

    this.getPickRequest();
        this.RedirectedMessage();

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
searchByCartonNumber() { // gkj 28-07 this html and api also
  if (!this.cartonNumber?.trim()) {
    return;
  }
 
  console.log("Entered Carton Number:", this.cartonNumber);
 
  const userId = localStorage.getItem("UserID");
  const userToken = localStorage.getItem("User_Token");
 
  if (!userId || !userToken) {
    alert("User authentication details not found. Please login again.");
    return;
  }
 
  const apiUrl =
    `${this._global.baseAPIUrl}OCBCRetrival/SP_GetRetrievalRequestDatabyCarton` +
    `?USERId=${encodeURIComponent(userId)}` +
    `&user_Token=${encodeURIComponent(userToken)}` +
    `&cartonNumber=${encodeURIComponent(this.cartonNumber)}`;
 
  this._onlineExamService.getAllData(apiUrl).subscribe(
    (data: any) => {
      if (data && data.length > 0) {
        this._IndexPendingList = data;
        this._FilteredList = data;
        this.prepareTableData(this._FilteredList, this._IndexPendingList);
      } else {
        alert("No data found for this carton number.");
      }
    },
    (error) => {
      console.error("Error fetching carton data:", error);
      alert("Error fetching carton data. Please try again.");
    }
  );
}
  
   RedirectedMessage() {
    const message = this._commonService.getMessage();
    setTimeout(() => {
      if (message) {
        this.ShowSuccessMessage(message);
      }
    }, 100);
  }
  ShowSuccessMessage(data: any) {
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

  getPickRequest() {
    const apiUrl =
      this._global.baseAPIUrl +
      "OCBCRetrival/GetRetrievalRequestData?&USERId=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this._FilteredList = data;
      this.prepareTableData(this._FilteredList, this._FilteredList);
    });
  }

  View(template: TemplateRef<any>, car) {
    const apiUrl =
      this._global.baseAPIUrl +
      "OCBCRetrival/GetRetrievalDataByRequestNo?&USERId=" +
      localStorage.getItem("UserID") +
      "&request_number=" +
      car.request_number +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this._FilteredList = data;
      this.prepareTableData1(data, data);
    });
    this.modalRef = this.modalService.show(template);
  }

  get PickupControls() {
    return this.pickupForm.controls;
  }

  formattedData: any = [];
  formattedData1: any = [];
  headerList: any;
  headerList1: any;
  immutableFormattedData: any;
  immutableFormattedData1: any;
  loading: boolean = true;
prepareTableData(tableData, headerList) {//gkj_25_08
  let formattedData = [];
  let tableHeader: any = [
    { field: "srNo", header: "SR NO", index: 1 },
    { field: "request_number", header: "REQUEST NUMBER", index: 1 },
    { field: "department", header: "DEPARTMENT NAME", index: 2 },
    // { field: 'WarehouseName', header: 'WAREHOUSE NAME', index: 3 },

    { field: "NoOfCartons", header: "NO OF CARTONS", index: 2 },
    { field: "RequestStatus", header: "REQUEST STATUS", index: 8 },

    { field: "RetrievalBy", header: "REQUEST BY", index: 3 },
    { field: "RetrievalDate", header: "REQUEST  ON", index: 4 },
    { field: "ApprovalBy", header: "APPROVAL BY", index: 5 },
    { field: "ApprovalDate", header: "APPROVAL ON", index: 6 },
    { field: "ExpDeliveryDate", header: "EXPECTED DELIVERY ON", index: 7 },

    { field: "RetrievalDispatchBy", header: "DISPATCHED BY", index: 6 },
    { field: "RetrievalDispatchDate", header: "DISPATCHED ON", index: 6 },
    { field: "RetrievalAckBy", header: "ACKNOWLEDGED BY", index: 6 },
    { field: "RetrievalAckDate", header: "ACKNOWLEDGED ON", index: 6 },
    // { field: 'BatchStatus', header: 'BATCH STATUS', index: 9 },
  ];

  tableData.forEach((el, index) => {
    const requestStatusDisplay = el.RequestStatus === 'Retrieval Request'
      ? 'APPROVAL PENDING'
      : el.RequestStatus;

    formattedData.push({
      srNo: index + 1,
      request_number: el.request_number,
      NoOfCartons: el.NoOfCartons,
      RetrievalBy: el.RetrievalBy,
      RetrievalDate: el.RetrievalDate,
      ApprovalBy: el.ApprovalBy,
      ApprovalDate: el.ApprovalDate,
      ExpDeliveryDate: el.ExpDeliveryDate,
      RequestStatus: el.RequestStatus,
      BatchStatus: el.BatchStatus,
      RetrievalAckDate: el.RetrievalAckDate,
      RetrievalDispatchDate: el.RetrievalDispatchDate,
      RejectDate: el.RejectDate,
      RejectBy: el.RejectBy,
      RetrievalDispatchBy: el.RetrievalDispatchBy,
      RetrievalAckBy: el.RetrievalAckBy,
      department: el.department,
      WarehouseName: el.WarehouseName,
    });
  });

  this.headerList = tableHeader;
  this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
  this.formattedData = formattedData;
  this.loading = false;
}

  prepareTableData1(tableData, headerList) {
    let formattedData1 = [];
    let tableHeader: any = [
      //{ field: 'srNo', header: "SR NO", index: 1 },
      { field: "request_number", header: "REQUEST NO", index: 2 },
      { field: "carton_number", header: "CARTON NUMBER", index: 2 },
      { field: "department", header: "DEPARTMENT NAME", index: 2 },
      { field: "document_type", header: "DOCUMENT TYPE", index: 3 },
      { field: "detail_document_type", header: "DOCUMENT DETAILS", index: 3 },
      { field: "WarehouseName", header: "WAREHOUSE NAME", index: 3 },
      //    { field: 'retention_period', header: 'RETENTION PERIOD', index: 3 },
      { field: "detail_location", header: "DETAIL LOCATION", index: 4 },
      { field: "RejectAt", header: "REJECTED AT", index: 5 },
      { field: "RejectBy", header: "REJECTED BY", index: 6 },
      { field: "RejectDate", header: "REJECTED ON", index: 6 },
      { field: "status", header: "CARTON STATUS", index: 3 },
    ];
    tableData.forEach((el, index) => {
      formattedData1.push({
        srNo: parseInt(index + 1),
        id: el.id,
        request_number: el.request_number,
        carton_number: el.carton_number,
        department: el.department,
        document_type: el.document_type,
        detail_document_type: el.detail_document_type,
        retention_period: el.retention_period,
        detail_location: el.detail_location,
        status: el.status,
        WarehouseName: el.WarehouseName,
        RejectDate: el.RejectDate,
        RejectBy: el.RejectBy,
        RejectAt: el.RejectAt,
      });
    });
    this.headerList1 = tableHeader;
    this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData1));
    this.formattedData1 = formattedData1;
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

  OnReset() {
    this.Reset = true;
    this.isReadonly = false;
  }
  hidepopup() {
    this.modalRef.hide();
  }
  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  paginateView(e) {
    this.firstView = e.firstView;
    this.rows = e.rows;
  }

  paginate1(e) {
    this.first1 = e.first;
    this.rows1 = e.rows;
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
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message"> ' +
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

  downloadFile() {
    const filename = "Retrieval_Request";

    // CSV Header
    let csvData =
      "Request Number,Carton Number,Department Name,Document Type,Document Details, WarehouseName, Detail Location,Carton Status,\n";

    // Ensure formattedData is defined
    if (!this.formattedData1 || this.formattedData1.length === 0) {
      console.warn("No data to download.");
      return;
    }

    // Add data rows
    this.formattedData1.forEach((row: any) => {
      csvData +=
        `${row.request_number ?? ""},` +
        `${row.carton_number ?? ""},` +
        `${row.department ?? ""},` +
        `${row.document_type ?? ""},` +
        `${row.detail_document_type ?? ""},` +
        `${row.WarehouseName ?? ""},` +
        `${row.detail_location ?? ""},` +
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
   
getStatusClass(status: string) { //gkj 01-08
  if (!status) return 'status-default';
 
  switch (status.toUpperCase()) {
    case 'RETRIEVAL REQUEST':
      return 'status-accepted';
    case 'REQUEST ACKNOWLEDGED':
      return 'status-review';
    case 'REQUEST DISPATCHED':
      return 'status-incomplete';
    case 'REQUEST REJECTED':
      return 'status-rejected';
       case 'APPROVAL PENDING':
      return 'status-badge status-incomplete';
    default:
      return 'status-default';
  }
}
 
 
getStatusClass1(status: string) { // gkj 01-08
  if (!status) return 'status-default';
 
  const normalizedStatus = status.trim().toUpperCase();
 
  switch (normalizedStatus) {
    case 'RETRIEVAL REQUEST':
      return 'status-accepted';
    case 'CARTON ACKNOWLEDGED':
      return 'status-review';
    case 'REQUEST DISPATCHED':
      return 'status-incomplete';
    case 'CARTON REJECTED AT ACK':
    case 'CARTON REJECTED':
      return 'status-rejected';
     case 'APPROVAL PENDING':
      return 'status-badge status-incomplete';
    default:
      return 'status-default';
  }
}
 
}
