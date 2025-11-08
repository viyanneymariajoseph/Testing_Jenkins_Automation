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
  selector: "app-warehouse-return-ack",
  templateUrl: "./warehouse-return-ack.component.html",
  styleUrls: ["./warehouse-return-ack.component.scss"],
})
export class WarehouseReturnAckComponent implements OnInit {
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
  masterCheckbox: boolean = false;
  first: any = 0;
  rows: any = 0;
  first1: any = 0;
  rows1: any = 10;
  _IndexPendingListFile: any;
  _FilteredListFile: any;

  _FilteredList: any;
  _IndexPendingList: any;

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
      main_file_count: [null], // No validators, will be validated conditionally
      collateral_file_count: [null],
      remark: [""],
      request_number: [""],
      department: [""],
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
      "Refilling/GetWarehouseAckData?UserID=" +
      localStorage.getItem("UserID") +
      "&User_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingList = data;
      this._FilteredList = data;
      this.prepareTableData(this._FilteredList, this._IndexPendingList);
    });
  }
  getRequestNo() {}

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

  toggleSelection(items: any) {
    this.formattedData1 = this.formattedData1.map((item) => {
      if (items.srNo === item.srNo) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
  }
  isAllSelectedOnCurrentPage(): boolean {
    const startIndex = this.first1;
    const endIndex = startIndex + this.rows1;

    return this.formattedData1
      .slice(startIndex, endIndex)
      .filter((item) => item.disabled === false)
      .every((item) => item.selected);
  }
  selectedAll(event: any) {
    const startIndex = this.first1;
    const endIndex = startIndex + this.rows1;

    this.formattedData1 = this.formattedData1.map((item, index) => {
      if (index >= startIndex && index < endIndex && item.disabled === false) {
        return { ...item, selected: event.target.checked };
      }
      return item;
    });
  }

  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "requestNumber", header: "RETURN REQUEST ID", index: 1 },
      { field: "department", header: "DEPARTMENT NAME", index: 1 },
      { field: "noofcartons", header: "NO OF CARTON'S", index: 1 },
      { field: "status", header: "RETURN STATUS", index: 1 },
      { field: "returnBy", header: "RETURN BY", index: 1 },
      { field: "returnDate", header: "RETURN ON", index: 1 },
      { field: "approvedBy", header: "APPROVED BY", index: 1 },
      { field: "approvedDate", header: "APPROVED ON", index: 1 },
      { field: "pickupDate", header: "EXPECTED DATE ON", index: 1 },
      { field: "remarks", header: "REMARKS", index: 1 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        requestNumber: el.requestNumber,
        noofcartons: el.noOfCartons,
        id: el.id,
        department: el.department,
        returnBy: el.returnBy,
        returnDate: el.returnDate,
        remarks: el.remark,
        status: el.status,
        approvedBy: el.approvedBy,
        approvedDate: el.approvedDate,
        pickupDate: el.pickupDate,
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
    // this.modalService.hide;
    this.modalRef.hide();
    //this.modalRef.hide
  }
  get FormControls() {
    return this.pickupForm.controls;
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

  // View(template: TemplateRef<any>, car) {
  //   this.pickupForm = this.formBuilder.group({
  //     batchId: [car.batchId, Validators.required],
  //     pickUpDate: ["", Validators.required],
  //     remark: [""],
  //     User_Token: localStorage.getItem("User_Token"),
  //     CreatedBy: localStorage.getItem("UserID"),
  //   });
  //   this.modalRef = this.modalService.show(template);
  // }

  View(template: TemplateRef<any>, row: any) {
    this.modalRef = this.modalService.show(template);
    debugger;
    this.pickupForm.patchValue({
      request_number: row.requestNumber,
      department: row.department,
    });

    this.GetTableData(row.requestNumber, row.department);
  }

  GetTableData(request_number: any, department: any) {
    const apiUrl =
      this._global.baseAPIUrl +
      "Refilling/GetWarehouseAckDetailsByRequestNumber?&USERId=" +
      localStorage.getItem("UserID") +
      "&request_number=" +
      request_number +
      "&department=" +
      department +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this._FilteredList = data;
      this.prepareTableData1(this._FilteredList, this._FilteredList);
    });
  }

  // prepareTableData1(tableData, headerList) {
  //   let formattedData1 = [];
  //   let tableHeader: any = [
  //     { field: 'srNo', header: "SR NO", index: 1 },
  //     { field: 'cartonNumber', header: 'CARTON NUMBER', index: 2 },
  //     { field: 'department', header: 'DEPARTMENT NAME', index: 2 },
  //     { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },
  //     { field: 'documentType', header: 'DOCUMENT TYPE', index: 3 },
  //     { field: 'detailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 3 },
  //     { field: 'retentionPeriod', header: 'RETENTION PERIOD', index: 3 },
  //     { field: 'status', header: 'STATUS', index: 3 },
  //   ];
  //   tableData.forEach((el, index) => {
  //     formattedData1.push({
  //       'srNo': parseInt(index + 1),
  //       'id': el.id,
  //       'cartonNumber': el.cartonNumber,
  //       'documentType': el.documentType,
  //       'detailDocumentType': el.detailDocumentType,
  //       'retentionPeriod': el.retentionPeriod ? `${el.retentionPeriod} years` : '',
  //       'status': el.status,
  //       'department': el.department,
  //       'DepartmentCode': el.DepartmentCode,
  //       selected: el.status === 'Return Request Acknowledged'
  //     });
  //   })
  //   this.headerList1 = tableHeader;
  //   this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData1));
  //   this.formattedData1 = formattedData1;
  //   this.loading1 = false;
  //    this.masterCheckbox = this.formattedData1.every(row => row.selected);
  // }
  isPending = false
  prepareTableData1(tableData, headerList) {
    let formattedData1 = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "cartonNumber", header: "CARTON NUMBER", index: 2 },
      { field: "department", header: "DEPARTMENT NAME", index: 3 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 4 },
      { field: "documentType", header: "DOCUMENT TYPE", index: 5 },
      // { field: 'detailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 6 },
      { field: "WarehouseName", header: "WAREHOUSE NAME", index: 4 },
      { field: "detailLocation", header: "DETAIL LOCATION", index: 4 },
      { field: "status", header: "CARTON STATUS", index: 8 },
    ];

    tableData.forEach((el, index) => {
      const isAcknowledged =
        el.status === "Return Request Carton Acknowledged" ||
        el.status === "Return Request Carton Rejected" ||
        el.status === "Warehouse Return Location Updated";
      formattedData1.push({
        srNo: index + 1,
        id: el.id,
        cartonNumber: el.cartonNumber,
        documentType: el.documentType,
        detailDocumentType: el.detailDocumentType,
        retentionPeriod: el.retentionPeriod
          ? `${el.retentionPeriod} years`
          : "",
        status: el.status,
        department: el.department,
        DepartmentCode: el.DepartmentCode,
        disabled: isAcknowledged, // <-- add this
        WarehouseName: el.WarehouseName,
        detailLocation: el.detailLocation,
      });
    });

    this.headerList1 = tableHeader;
    this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData1));
    this.formattedData1 = formattedData1;
    this.loading1 = false;
    this.masterCheckbox = this.formattedData1.every(
      (row) => row.selected || row.disabled
    );
  }

  toggleAllSelection() {
    this.formattedData1.forEach((row) => {
      if (!row.disabled) {
        row.selected = this.masterCheckbox;
      }
    });
  }

  onRowSelectChange() {
    this.masterCheckbox = this.formattedData1
      .filter((row) => !row.disabled)
      .every((row) => row.selected);
  }

  onUpdatestatus(
    status: "Warehouse Approval" | "Warehouse Rejected",
    modal?: any
  ): void {
    debugger;
    this.submitted = true;

    const requestNumber = this.pickupForm.get("request_number")?.value;
    const userToken = localStorage.getItem("User_Token");
    const userId = localStorage.getItem("UserID");

    if (!requestNumber || !userToken || !userId) {
      this.toastr.show(
        `<div class="alert-text">
      <span class="alert-title danger" data-notify="title"> Error! </span>
      <span data-notify="message"> Missing request number or user info. </span></div>`,
        "",
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          titleClass: "alert-title danger",
          positionClass: "toast-top-center",
          toastClass:
            "ngx-toastr alert alert-dismissible alert-danger alert-notify",
        }
      );
      this.submitted = false;
      return;
    }

    const selectedCartons = this.formattedData1
      .filter((row) => row.selected && !row.disabled)
      .map((row) => row.cartonNumber);

    if (selectedCartons.length === 0) {
      this.toastr.show(
        `<div class="alert-text">
      <span class="alert-title warning" data-notify="title"> Warning! </span>
      <span data-notify="message"> Please select at least one row. </span></div>`,
        "",
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          titleClass: "alert-title warning",
          positionClass: "toast-top-center",
          toastClass:
            "ngx-toastr alert alert-dismissible alert-warning alert-notify",
        }
      );
      this.submitted = false;
      return;
    }

    const payload = {
      requestNumber: requestNumber,
      userId: userId,
      status: status,
      User_Token: userToken,
      cartonNumbers: selectedCartons,
    };

    const apiUrl =
      this._global.baseAPIUrl + "Refilling/WarehouseApprovalOrReject";

    this._onlineExamService.postData(payload, apiUrl).subscribe(
      (response: any) => {
        const message = response || "No message returned from server.";
          this.toastr.show(
            `
              <div class="alert-text">
                <span class="alert-title" >
                  Success!
                </span>
                <span style="font-size: 14px; color: #fff;">
                  ${message}
                </span>
              </div>
              `,
            "", // No plain title; we use HTML
            {
              timeOut: 3000,
              closeButton: true,
              enableHtml: true,
              tapToDismiss: false,
              positionClass: "toast-top-center",
              toastClass:
                "ngx-toastr alert alert-dismissible alert-success alert-notify",
            }
          );
        if(message === "Request Acknowledged successfully."){
          this.modalRef.hide()
        }
        this.GetTableData(requestNumber, this.pickupForm.value.department);
        this.getPickRequest();

        this.submitted = false;
      },
      (error) => {
        this.toastr.show(
          `<div class="alert-text"></div>
        <span class="alert-title danger" data-notify="title"> Error! </span>
        <span data-notify="message"> Server error occurred. </span>`,
          "",
          {
            timeOut: 3000,
            closeButton: true,
            enableHtml: true,
            tapToDismiss: false,
            titleClass: "alert-title danger",
            positionClass: "toast-top-center",
            toastClass:
              "ngx-toastr alert alert-dismissible alert-danger alert-notify",
          }
        );
        this.submitted = false;
      }
    );
  }

  getStatusClass(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.toUpperCase()) {
    case 'WAREHOUSE LOCATION UPDATED':
      return 'status-badge status-accepted';
    case 'RETURN PICKUP SCHEDULED':
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
  }
}
 
 
getStatusClass1(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.trim().toUpperCase()) {
    case 'CARTON INV RECEIVED':
      return 'status-badge status-accepted'; // green
    case 'RETURN PICKUP SCHEDULED':
      return 'status-badge status-review'; // yellow
    case 'CARTON INV NOT RECEIVED':
      return 'status-badge status-rejected'; // red
    default:
      return 'status-badge status-default'; // grey-blue
  }
}
}
