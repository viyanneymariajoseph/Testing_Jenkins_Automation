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
import { LoadingService } from "src/app/Services/loading.service";
import { delay } from "rxjs/operators";

@Component({
  selector: "app-warehouse-listing",
  templateUrl: "./warehouse-listing.component.html",
  styleUrls: ["./warehouse-listing.component.scss"],
})
export class WarehouseListingComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  modalRef: BsModalRef;
  isReadonly = true;
  _IndexList: any;
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
  bsValue = new Date();
  minDate: string;
  loading11: boolean = false;
  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private dialog: MatDialog,
        private _commonService: CommonService,
        private _loading: LoadingService,
    
  ) {}
  ngOnInit() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");

    this.minDate = `${year}-${month}-${day}`;
    document.body.classList.add("data-entry");
    this.pickupForm = this.formBuilder.group({
      batchId: ["", Validators.required],
      pickUpDate: ["", Validators.required],
      remark: ["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    this.getPickRequest();
        this.RedirectedMessage();
        
    this.listenToLoading();

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

  RedirectedMessage() {
    const message = this._commonService.getMessage();
    setTimeout(() => {
      if (message) {
        this.ShowSuccessMessage(message);
      }
    }, 100);
  }


  getPickRequest() {
    const apiUrl = this._global.baseAPIUrl + "BranchInward/GetBatchWarehouse";
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
  tempCartonNO: any;
  batchIdValue: string;

  // onUpdatestatus(status: any, row: any) {
  //   debugger;
  //   const cartonNo = row?.cartonNo;
  //   const batchId = this.pickupForm.get("batchId")?.value;
  //   const updatedForm = this.formBuilder.group({
  //     status: [status],
  //     batchId: [batchId],
  //     User_Token: localStorage.getItem("User_Token"),
  //     CreatedBy: localStorage.getItem("UserID"),
  //     cartonNo: [cartonNo],
  //   });

  //   const apiUrl = this._global.baseAPIUrl + "BranchInward/AddApproval";

  //   this._onlineExamService.postData(updatedForm.value, apiUrl).subscribe((data: {}) => {
  //     this.modalRef?.hide?.();
  //     this.getPickRequest();
  //   });
  // }

  onUpdatestatus(status: any, row: any) {
    debugger;
    const cartonNo = row?.cartonNo;
    const batchId = this.pickupForm.get("batchId")?.value;

    const updatedForm = this.formBuilder.group({
      status: [status],
      batchId: [batchId],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
      cartonNo: [cartonNo],
    });

    const apiUrl = this._global.baseAPIUrl + "BranchInward/AddApproval";

    this._onlineExamService.postData(updatedForm.value, apiUrl).subscribe(
      (data: any) => {
        this.modalRef?.hide?.();
        this.getPickRequest();

        // ✅ Show Toastr for Reject
        if (status === "Pickup Reject") {
          this.toastr.show(
            `<div class="alert-text">
            <span class="alert-title" style="color: white; font-weight: bold;">Rejected!</span>
            <span style="color: white;">Record has been rejected.</span>
          </div>`,
            "",
            {
              timeOut: 3000,
              closeButton: true,
              enableHtml: true,
              tapToDismiss: false,
              positionClass: "toast-top-center",
              toastClass:
                "ngx-toastr alert alert-dismissible alert-danger alert-notify",
            }
          );
        }
      },
      (error) => {
        // Optional: show failure toastr
        this.toastr.error("Something went wrong", "Error", {
          timeOut: 3000,
          positionClass: "toast-top-center",
          closeButton: true,
        });
      }
    );
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
    { field: "approvedBy", header: "APPROVED BY", index: 1 },
      { field: "approvedDate", header: "APPROVED ON", index: 1 },
      { field: "status", header: "BATCH STATUS", index: 1 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        batchId: el.batchId,
        createdBy: el.createdBy,
        createdDate: el.createdDate,
        numberOfCartons: el.numberOfCartons,
        approvedBy: el.approvedBy,
        approvedDate: el.approvedDate,
        pickUpDate: el.pickUpDate,
        pickUpBy: el.pickUpBy,
        pickUpOn: el.pickUpOn,
        status: el.status,
        DepartmentName: el.DepartmentName,
        remark: el.remark,
        DepartmentCode: el.DepartmentCode,
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
    this.loading1 = false;
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
    this.pickupForm = this.formBuilder.group({
      batchId: [car.batchId, Validators.required],
      pickUpDate: ["", Validators.required],
      remark: [""],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });
    this.modalRef = this.modalService.show(template);
  }
  SaveData() {
    this.toastr.clear();
    this.submitted = true;
    if (this.pickupForm.valid) {
      const apiUrl = this._global.baseAPIUrl + "BranchInward/AddPickup";
      this._onlineExamService
        .postData({ ...this.pickupForm.value }, apiUrl)
        .subscribe((data: any) => {
          this.modalRef.hide();
          this.getPickRequest();
          // this.toastr.show(
          //   '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success ! </span> <span data-notify="message"> ' +
          //     data +
          //     " </span></div>",
          //   "",
          //   {
          //     timeOut: 3000,
          //     closeButton: true,
          //     enableHtml: true,
          //     tapToDismiss: false,
          //     titleClass: "alert-title",
          //     positionClass: "toast-top-center",
          //     toastClass:
          //       "ngx-toastr alert alert-dismissible alert-success alert-notify",
          //   }
          // );
                 this._commonService.setMessage(data);

        });
    }
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
  }
}
 
 getStatusClass1(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.toUpperCase()) {
    case 'CARTON APPROVED':
      return 'status-badge status-accepted';
    case 'CARTON INWARD':
      return 'status-badge status-review';
    default:
      return 'status-badge status-default';
  }
}


 listenToLoading(): void {
    this._loading.loadingSub
      .pipe(delay(0)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((loading) => {
        this.loading11 = loading;
      });
  }
 
}
