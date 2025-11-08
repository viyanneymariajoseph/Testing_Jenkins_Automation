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
import { CommonService } from "src/app/Services/common.service";

@Component({
  selector: "app-inventory",
  templateUrl: "./inventory.component.html",
  styleUrls: ["./inventory.component.scss"],
})
export class InventoryComponent implements OnInit {
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
  cartonNumber: any;

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private _commonService: CommonService,
    private dialog: MatDialog
  ) { }
  ngOnInit() {
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
    this.getAllBranchList();
    this.prepareSubTableData([], []);
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

getStatusClass(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.toUpperCase()) {
    case 'WAREHOUSE LOCATION UPDATED':
      return 'status-badge status-accepted';
    case 'INVENTORY APPROVED':
      return 'status-badge status-review';
    case 'OPEN':
      return 'status-badge status-offered';
    case 'INV ACK':
      return 'status-badge status-ack';
    case 'BATCH INV REJECTED':
      return 'status-badge status-rejected';
    case 'PICKUP SCHEDULED':
      return 'status-badge status-scheduled';
    case 'PARTIALLY INV ACK':
      return 'status-badge status-partial-ack';
    default:
      return 'status-badge status-default';
    case 'Carton Inv Received':
      return 'status-badge status-received';
  }
}

  RedirectedMessage() {
    const message = this._commonService.getMessage();
    setTimeout(() => {
      if (message) {
        this.ShowSuccessMessage(message);
      }
    }, 100);
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
      "BranchInward/GetBatchList?UserID=" +
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


  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "batchId", header: "BATCH ID", index: 1 },
      { field: "DepartmentName", header: "DEPARTMENT NAME", index: 1 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },

      { field: "numberOfCartons", header: "NO OF CARTON’S", index: 1 },
      { field: "status", header: "BATCH STATUS", index: 1 },

      { field: "createdBy", header: "INWARD BY", index: 1 },
      { field: "createdDate", header: "INWARD ON", index: 1 },
      { field: "approvedBy", header: "APPROVED BY", index: 1 },
      { field: "approvedDate", header: "APPROVED ON", index: 1 },
      { field: "pickUpDate", header: "EXPECTED PICK-UP DATE", index: 1 },
      { field: "warehouseEntryBy", header: "INVENTORY SCHEDULED BY", index: 1 },
      { field: "warehouseEntryDate", header: "INVENTORY SCHEDULED ON", index: 1 },
      { field: "warehouseApprovedBy", header: "INVENTORY ACKNOWLEDGE BY", index: 1 },
      { field: "warehouseApprovedDate", header: "INVENTORY ACKNOWLEDGE DATE", index: 1 },
       { field: 'warehouseLocationUpdatedBy', header: 'LOCATION UPDATED BY', visible: true },
      { field: 'warehouseLocationUpdatedDate', header: 'LOCATION UPDATED ON', visible: true },
      { field: "remark", header: "REMARKS", index: 1 },

      // { field: "status", header: "BATCH STATUS", index: 1 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        batchId: el.batchId,
        DepartmentName: el.DepartmentName,
        DepartmentCode: el.DepartmentCode,
        createdBy: el.createdBy,
        createdDate: el.createdDate,
        numberOfCartons: el.numberOfCartons,
        approvedBy: el.approvedBy,
        approvedDate: el.approvedDate,
        pickUpDate: el.pickUpDate,
        warehouseEntryBy: el.warehouseEntryBy,
        warehouseEntryDate: el.warehouseEntryDate,
        warehouseApprovedBy: el.warehouseApprovedBy,
        warehouseApprovedDate: el.warehouseApprovedDate,
        status: el.status,
        remark: el.remark,
        rejectedBy: el.rejectedBy,
        rejectedDate: el.rejectedDate,
        warehouseLocationUpdatedDate: el.warehouseLocationUpdatedDate,
        warehouseLocationUpdatedBy:el.warehouseLocationUpdatedBy,
        
        RejectAt: el.RejectAt,
        // warehouseApprovedDate:el.warehouseApprovedDate

      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  prepareTableData1(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      // { field: "srNo", header: "SR NO", index: 1 },
      { field: "batchId", header: "BATCH ID", index: 2 },
      { field: "cartonNo", header: "CARTON NUMBER", index: 2 },
      { field: "department", header: "DEPARTMENT NAME", index: 3 },
      { field: "documentType", header: "DOCUMENT TYPE", index: 4 },
      { field: "detailDocumentType", header: "DOCUMENT DETAILS", index: 3 },
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
    });
    this.headerList1 = tableHeader;
    this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
    this.formattedData1 = formattedData;
    this.loading = false;
  }

  prepareSubTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "batchId", header: "BATCH ID", index: 2 },
      { field: "cartonNo", header: "CARTON NUMBER", index: 2 },
      { field: "department", header: "DEPARTMENT NAME", index: 3 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },

      { field: "documentType", header: "DOUCMENT TYPE", index: 4 },
      { field: "detailDocType", header: "DETAIL DOC TYPE", index: 3 },
      { field: "status", header: " STATUS", index: 3 },
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        batchId: el.carton_no,
        cartonNo: el.file_no,
        department: el.lan_no,
        documentType: el.request_id,
        detailDocType: el.applicant_name,
        app_branch_code: el.app_branch_code,
        branch_name: el.branch_name,
        document_type: el.document_type,
        service_type: el.service_type,
        DepartmentCode: el.DepartmentCode
      });
    });
    this.headerList1 = tableHeader;
    this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
    this.formattedData1 = formattedData;
    this.loading1 = false;
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
      `${this._global.baseAPIUrl}BranchInward/GetBatchListBycarton` +
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
    // this.modalService.hide;
    this.modalRef.hide();
    //this.modalRef.hide
  }
  get FormControls() {
    return this.pickupForm.controls;
  }
  View(template: TemplateRef<any>, car) {
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchInward/GetBatchDetails?batchId=" +
      car.batchId +
      "&User_Token=" +
      localStorage.getItem("User_Token") +
      "&UserID=" +
      localStorage.getItem("UserID");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.prepareTableData1(data, data);
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

  downloadFile() {
    const filename = 'Carton_Inventory';

    // CSV Header
    let csvData = "Batch Id,Carton No,Department Name,Document Type,Detail Document Type,Status,\n";

    // Ensure formattedData is defined
    if (!this.formattedData1 || this.formattedData1.length === 0) {
      console.warn("No data to download.");
      return;
    }

    // Add data rows
    this.formattedData1.forEach((row: any) => {
      csvData +=
        `${row.batchId ?? ''},` +
        `${row.cartonNo ?? ''},` +
        `${row.department ?? ''},` +
        `${row.documentType ?? ''},` +
        `${row.detailDocumentType ?? ''},` +
        `${row.status ?? ''},\n`;
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
  }

}
