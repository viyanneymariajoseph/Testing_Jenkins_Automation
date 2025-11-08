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
  AbstractControl,
} from "@angular/forms";
import { Injectable } from "@angular/core";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

import { ToastrService } from "ngx-toastr";

import swal from "sweetalert2";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-warehouse-schedule",
  templateUrl: "./warehouse-schedule.component.html",
  styleUrls: ["./warehouse-schedule.component.scss"],
})
export class WarehouseScheduleComponent implements OnInit {
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
  todayDate: string;

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private dialog: MatDialog
  ) { }
  ngOnInit() {
    const today = new Date();
    this.todayDate = today.toISOString().split("T")[0];
    document.body.classList.add("data-entry");
    this.pickupForm = this.formBuilder.group({
      requestNumber: ["", Validators.required],
      pickUpDate: ["", [Validators.required, this.pickupDateValidator]],
      remark: ["", [Validators.required, this.noWhitespaceValidator]],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    this.getPickRequest();
    // this.getAllBranchList();
    // this.prepareSubTableData([], []);
  }
  get f() {
    return this.pickupForm.controls;
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    return !isWhitespace ? null : { required: true };
  }
  prepareTableData1(tableData, headerList) {
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
    this.pickupForm = this.formBuilder.group({
      requestNumber: [car.requestNumber, Validators.required],
      pickUpDate: ["", Validators.required],
      remark: ["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });
    this.modalRef = this.modalService.show(template);
  }

  // SaveData(): void {
  //   debugger;
  //   this.submitted = true;

  //   if (this.pickupForm.valid) {
  //     const formData = this.pickupForm.value;

  //     const requestPayload = {
  //       requestNumber: formData.requestNumber,
  //       pickUpDate: formData.pickUpDate,
  //       remark: formData.remark,
  //       CreatedBy: localStorage.getItem("UserID"),
  //       User_Token: formData.User_Token,
  //     };

  //     const apiUrl = this._global.baseAPIUrl + "Refilling/AddWarehouseSchedule";

  //     this._onlineExamService.postData(requestPayload, apiUrl).subscribe(
  //       (response: any) => {
  //         const message = response || "No message returned from server.";
  //         const isSuccess = message.toLowerCase().includes("pickup");

  //         this.toastr.show(
  //           `<div class="alert-text"></div>
  //          <span class="alert-title ${
  //            isSuccess ? "success" : "danger"
  //          }" data-notify="title">
  //            ${isSuccess ? "Success!" : "Failed!"}
  //          </span>
  //          <span data-notify="message"> ${message} </span>`,
  //           "",
  //           {
  //             timeOut: 3000,
  //             closeButton: true,
  //             enableHtml: true,
  //             tapToDismiss: false,
  //             titleClass: `alert-title ${isSuccess ? "success" : "danger"}`,
  //             positionClass: "toast-top-center",
  //             toastClass: `ngx-toastr alert alert-dismissible alert-${
  //               isSuccess ? "success" : "danger"
  //             } alert-notify`,
  //           }
  //         );

  //         if (isSuccess) {
  //           this.OnReset();
  //         }

  //         this.submitted = false;
  //       },
  //       (error) => {
  //         this.toastr.show(
  //           `<div class="alert-text"></div>
  //          <span class="alert-title danger" data-notify="title"> Error! </span>
  //          <span data-notify="message"> Server error occurred. </span>`,
  //           "",
  //           {
  //             timeOut: 3000,
  //             closeButton: true,
  //             enableHtml: true,
  //             tapToDismiss: false,
  //             titleClass: "alert-title danger",
  //             positionClass: "toast-top-center",
  //             toastClass:
  //               "ngx-toastr alert alert-dismissible alert-danger alert-notify",
  //           }
  //         );
  //         this.submitted = false;
  //       }
  //     );
  //   }
  // }
  SaveData(): void {
    debugger;
    this.submitted = true;

    if (this.pickupForm.valid) {
      const formData = this.pickupForm.value;

      const requestPayload = {
        requestNumber: formData.requestNumber,
        pickUpDate: formData.pickUpDate,
        remark: formData.remark,
        CreatedBy: localStorage.getItem("UserID"),
        User_Token: formData.User_Token,
      };

      const apiUrl = this._global.baseAPIUrl + "Refilling/AddWarehouseSchedule";

      this._onlineExamService.postData(requestPayload, apiUrl).subscribe(
        (response: any) => {
          const message = response || "No message returned from server.";
          const isSuccess = message.toLowerCase().includes("successfully");

          this.toastr.show(
            `<div class="alert-text">
   <span class="alert-title" data-notify="title">
     ${isSuccess ? "Success!" : "Failed!"}
   </span>
   <span data-notify="message">${message}</span></div>`,
            "",
            {
              timeOut: 3000,
              closeButton: true,
              enableHtml: true,
              tapToDismiss: false,
              titleClass: "alert-title",
              positionClass: "toast-top-center",
              toastClass: `ngx-toastr alert alert-dismissible ${isSuccess ? "alert-success" : "alert-danger"
                } alert-notify`,
            }
          );

          if (isSuccess) {
            this.getPickRequest();
            //this.OnReset();
          }

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
    this.modalRef.hide();

    this.getPickRequest();
  }

  onSubmit(): void {
    //   console.log("Back button clicked");
    this.modalRef?.hide();
    this.pickupForm.reset();
    this.submitted = false;
    this.Reset = false;
    this.getPickRequest();
  }
  pickupDateValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const selectedDate = new Date(control.value);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
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
      "Refilling/GetWarehouseScheduleData?UserID=" +
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
      { field: "requestNumber", header: "RETURN REQUEST ID", index: 1 },
      { field: "department", header: "DEPARTMENT", index: 1 },
      { field: "noofcartons", header: "NO OF CARTONS", index: 1 },
      { field: "status", header: "RETURN STATUS", index: 3 },

      { field: "returnBy", header: "RETURN REQUEST BY", index: 1 },
      { field: "returnDate", header: "RETURN REQUEST ON", index: 1 },
      { field: "approvedBy", header: "APPROVED BY", index: 1 },
      { field: "approvedDate", header: "APPROVED ON", index: 1 },
      // { field: "remarks", header: "REMARKS", index: 1 },
      // { field: "status", header: "STATUS", index: 1 },
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
        remarks: el.remarks,
        status: el.status,
        approvedBy: el.approvedBy,
        approvedDate: el.approvedDate,
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

  getStatusClass(status: string) { // gkj 01-08
    if (!status) return 'status-badge status-default';

    switch (status.toUpperCase()) {
      case 'RETURN REQUEST APPROVED':
        return 'status-badge status-accepted'; // green
      case 'RETURN REQUEST CLOSED':
        return 'status-badge status-review';   // yellow
      default:
        return 'status-badge status-default';  // grey-blue
    }
  }



  getStatusClass1(status: string) { // gkj 01-08
    if (!status) return 'status-badge status-default';

    switch (status.trim().toUpperCase()) {
      case 'RETURN REQUEST APPROVED':
        return 'status-badge status-accepted'; // green
      case 'RETRIEVAL REQUEST':
        return 'status-badge status-review'; // yellow
      case 'CARTON INV NOT RECEIVED':
        return 'status-badge status-rejected'; // red
      default:
        return 'status-badge status-default'; // grey-blue
    }
  }
}
