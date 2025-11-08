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
  selector: "app-warehouse-ack",
  templateUrl: "./warehouse-ack.component.html",
  styleUrls: ["./warehouse-ack.component.scss"],
})
export class WarehouseAckComponent implements OnInit {
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
  _FileNo: any = "";
  first: any = 0;
  rows: any = 0;
  first1: any = 0;
  rows1: any = 10;
  _IndexPendingListFile: any;
  _FilteredListFile: any;
  selectedItems: any[] = [];
  _FilteredList: any;
  _IndexPendingList: any;
  bsValue = new Date();
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
      this._global.baseAPIUrl + "BranchInward/GetBatchWarehouseAcknowledge";
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
      { field: "pickUpDate", header: "EXPECTED PICK-UP DATE", index: 1 },
      { field: "remark", header: "REMARK", index: 1 },
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
        approvedOn: el.approvedOn,
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
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },
      { field: "documentType", header: "DOCUMENT TYPE", index: 4 },
      { field: "detailDocumentType", header: "DETAIL DOCUMENT TYPE", index: 3 },
      { field: "status", header: "CARTON STATUS", index: 3 },
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        batchId: el.batchId,
        id: el.id,
        cartonNo: el.cartonNo,
        disabled: el.status !=="Pickup Scheduled",
        department: el.departmentName,
        documentType: el.documentTypeName,
        detailDocumentType: el.detailDocumentTypeName,
        status: el.status,
        DepartmentCode: el.DepartmentCode,
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

  // onUpdatestatus(status: any, row: any) {
  //   this.pickupForm = this.formBuilder.group({
  //     status: [status],
  //     batchId: [this.batchIdValue],
  //     User_Token: localStorage.getItem("User_Token"),
  //     CreatedBy: localStorage.getItem("UserID"),
  //   });
  //       const apiUrl = this._global.baseAPIUrl + "BranchInward/AddApproval";
  //   this._onlineExamService
  //     .postData(
  //       {
  //         ...this.pickupForm.value
  //       },
  //       apiUrl
  //     )
  //     .subscribe((data: {}) => {
  //       this.modalRef.hide();
  //       this.getPickRequest();
  //     });
  // }
  // async onUpdatestatus(status: any) {
  //   if (
  //     this.formattedData1.filter((item) => item.selected === true).length === 0
  //   ) {
  //     this.showmessage("Please select at least one carton.");
  //     return;
  //   }
  //   let message = "";
  //   const apiUrl = this._global.baseAPIUrl + "BranchInward/AddApproval";
  //   const selectedItems = this.formattedData1.filter(
  //     (item) => item.selected === true
  //   );

  //   const promises = selectedItems.map((item) => {
  //     const payload = {
  //       status: status,
  //       batchId: this.batchIdValue,
  //       User_Token: localStorage.getItem("User_Token"),
  //       CreatedBy: localStorage.getItem("UserID"),
  //       cartonNo: item.cartonNo,
  //     };
  //     return new Promise((resolve, reject) => {
  //       this._onlineExamService.postData(payload, apiUrl).subscribe({
  //         next: (data) => resolve({ item, data }),
  //         error: (err) => reject(err),
  //       });
  //     });
  //   });
  //   try {
  //     const results = await Promise.all(promises);
  //     results.forEach((result) => {
  //       message = result.data; // Only last message will remain in variable
  //     });
  //     if (message === "Request Acknowledged Successfully") {
  //       this.modalRef.hide();
  //       this.getPickRequest();
  //     } else {
  //       this.getPickRequest();
  //       const apiUrl =
  //         this._global.baseAPIUrl +
  //         "BranchInward/GetBatchDetailsForInventoryAck?batchId=" +
  //         this.batchIdValue +
  //         "&User_Token=" +
  //         localStorage.getItem("User_Token") +
  //         "&UserID=" +
  //         localStorage.getItem("UserID");
  //       this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
  //         this.prepareSubTableData(data, data);
  //       });
  //     }
  //     this.toastr.show(
  //       `<span class="alert-title" data-notify="title">Success!</span>` +
  //         `<span data-notify="message">${message}</span>`,
  //       "",
  //       {
  //         timeOut: 3000,
  //         closeButton: true,
  //         enableHtml: true,
  //         tapToDismiss: false,
  //         titleClass: "alert-title",
  //         positionClass: "toast-top-center",
  //         toastClass:
  //           "ngx-toastr alert alert-dismissible alert-success alert-notify",
  //       }
  //     );
  //   } catch (error) {
  //     console.error("An error occurred during processing:", error);
  //   }
  //   this.getPickRequest();
  // }

  
  // NEW method 
  async onUpdatestatus(status: any) {
  const selectedItems = this.formattedData1.filter((item) => item.selected === true);

  if (selectedItems.length === 0) {
    this.showmessage("Please select at least one carton.");
    return;
  }

  // ✅ Group selected items by batchId
  const groupedByBatch: { [key: string]: any[] } = {};
  selectedItems.forEach((item) => {
    if (!groupedByBatch[this.batchIdValue]) {
      groupedByBatch[this.batchIdValue] = [];
    }
    groupedByBatch[this.batchIdValue].push(item.cartonNo);
  });

  let message = "";
  const apiUrl = this._global.baseAPIUrl + "BranchInward/AddApproval";

  try {
    // ✅ Call API once per batchId
    const promises = Object.keys(groupedByBatch).map((batchId) => {
      const payload = {
        status: status,
        batchId: batchId,
        User_Token: localStorage.getItem("User_Token"),
        CreatedBy: localStorage.getItem("UserID"),
        cartonNos: groupedByBatch[batchId] // send all cartons in same batch
      };

      return new Promise((resolve, reject) => {
        this._onlineExamService.postData(payload, apiUrl).subscribe({
          next: (data) => resolve({ batchId, data }),
          error: (err) => reject(err),
        });
      });
    });

    const results = await Promise.all(promises);
    results.forEach((result: any) => {
      message = result.data;
    });

    if (message === "Request Acknowledged Successfully") {
      this.modalRef.hide();
      this.getPickRequest();
    } else {
      this.getPickRequest();
      const apiUrl =
        this._global.baseAPIUrl +
        "BranchInward/GetBatchDetailsForInventoryAck?batchId=" +
        this.batchIdValue +
        "&User_Token=" +
        localStorage.getItem("User_Token") +
        "&UserID=" +
        localStorage.getItem("UserID");

      this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
        this.prepareSubTableData(data, data);
      });
    }

    this.toastr.show(
      `<span class="alert-title" data-notify="title">Success!</span>` +
        `<span data-notify="message">${message}</span>`,
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
  } catch (error) {
    console.error("An error occurred during processing:", error);
  }

  this.getPickRequest();
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
      "BranchInward/GetBatchDetailsForInventoryAck?batchId=" +
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
      .filter((item)=> item.status=='Pickup Scheduled')
      .every((item) => item.selected);
  }
  selectedAll(event: any) {
    const startIndex = this.first1;
    const endIndex = startIndex + this.rows1;

    this.formattedData1 = this.formattedData1.map((item, index) => {
      if (index >= startIndex && index < endIndex && item.status=='Pickup Scheduled') {
        return { ...item, selected: event.target.checked };
      }
      return item;
    });
  }

  isSelected(item: any): boolean {
    return this.selectedItems.some((i) => i.id === item.id);
  }

  toggleAllSelection(event: any) {
    if (event.target.checked) {
      this.selectedItems = [...this.formattedData1]; // Select all
    } else {
      this.selectedItems = []; // Deselect all
    }
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
 
  switch (status.trim().toUpperCase()) {
    case 'CARTON INV RECEIVED':
      return 'status-badge status-accepted'; // green
    case 'PICKUP SCHEDULED':
      return 'status-badge status-review'; // yellow
    case 'CARTON INV NOT RECEIVED':
      return 'status-badge status-rejected'; // red
    default:
      return 'status-badge status-default'; // grey-blue
  }
}
}
