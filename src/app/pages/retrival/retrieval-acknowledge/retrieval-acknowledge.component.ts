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
import { CsvUploadComponent } from "../csv-upload/csv-upload.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-retrieval-acknowledge",
  templateUrl: "./retrieval-acknowledge.component.html",
  styleUrls: ["./retrieval-acknowledge.component.scss"],
})
export class RetrievalAcknowledgeComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
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
  rows: any = 0;
  first1: any = 0;
  rows1: any = 10;
  first2: any = 0;
  rows2: any = 10;
  _IndexPendingListFile: any;
  _FilteredListFile: any;
  _TotalPages: any = 0;
  _FileList: any;
  _FilteredList: any;
  _IndexPendingList: any;
  bsValue = new Date();
  selectedItems: any[] = [];
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
      request_number: [""],
      department: [""],
      status: [""],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    this.GetRetrievalAckPendingData();
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

  GetRetrievalAckPendingData() {
    const apiUrl =
      this._global.baseAPIUrl +
      "OCBCRetrival/GetRetrievalAckPendingData?&USERId=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this._FilteredList = data;
      this.prepareTableData(this._FilteredList, this._FilteredList);
    });
  }

  GetTableData(request_number: any) {
    const apiUrl =
      this._global.baseAPIUrl +
      "OCBCRetrival/GetDispatchDataByRequestNo?&USERId=" +
      localStorage.getItem("UserID") +
      "&request_number=" +
      request_number +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this._FilteredList = data;
      this.prepareTableData1(this._FilteredList, this._FilteredList);
    });
  }

  get PickupControls() {
    return this.pickupForm.controls;
  }

  isAllSelectedOnCurrentPage(): boolean {
    const startIndex = this.first1;
    const endIndex = startIndex + this.rows1;
    console.log(this.formattedData1);
    return this.formattedData1
      .slice(startIndex, endIndex)
      .filter((item) => item.status === "Carton Dispatched").length > 0 && this.formattedData1
      .slice(startIndex, endIndex)
      .filter((item) => item.status === "Carton Dispatched")
      .every((item) => item.selected);
  }
  selectedAll(event: any) {
    const startIndex = this.first1;
    const endIndex = startIndex + this.rows1;

    this.formattedData1 = this.formattedData1.map((item, index) => {
      if (
        index >= startIndex &&
        index < endIndex &&
        item.status === "Carton Dispatched"
      ) {
        return { ...item, selected: event.target.checked };
      }
      return item;
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
      { field: "request_number", header: "REQUEST NUMBER", index: 1 },
      { field: "department", header: "DEPARTMENT NAME", index: 1 },
      //   { field: "WarehouseName", header: "WAREHOUSE NAME", index: 3 },
      { field: "NoOfCartons", header: "NO OF CARTONS", index: 2 },
            { field: "RequestStatus", header: "REQUEST STATUS", index: 8 },

      //   { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },
      { field: "RetrievalBy", header: "REQUEST BY", index: 3 },
      { field: "RetrievalDate", header: "REQUEST ON", index: 4 },
      { field: "ApprovalBy", header: "APPROVED BY", index: 3 },
      { field: "ApprovalDate", header: "APPROVED ON", index: 4 },
     // { field: "ExpDeliveryDate", header: "EXPECTED DELIVERY ON", index: 3 },
      { field: "RetrievalDispatchBy", header: "DISPATCHED BY", index: 3 },
      { field: "ExpDeliveryDate", header: "DISPATCHED ON", index: 4 },
      { field: "Remark", header: "REMARKS", index: 3 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        request_number: el.request_number,
        department: el.department,
        NoOfCartons: el.NoOfCartons,
        RetrievalBy: el.RetrievalBy,
        RetrievalDate: el.RetrievalDate,
        ApprovalBy: el.ApprovalBy,
        ApprovalDate: el.ApprovalDate,
        RetrievalDispatchBy: el.RetrievalDispatchBy,
        RetrievalDispatchDate: el.RetrievalDispatchDate,
        RequestStatus: el.RequestStatus,
        DepartmentCode: el.DepartmentCode,
        Remark: el.Remark,
        ExpDeliveryDate: el.ExpDeliveryDate,
        //   'WarehouseName': el.WarehouseName
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  formattedData1: any = [];
  headerList1: any;
  immutableFormattedData1: any;
  loading1: boolean = true;
  prepareTableData1(tableData, headerList) {
    let formattedData1 = [];
    let tableHeader: any = [
      //{ field: 'srNo', header: "SR NO", index: 1 },
      { field: "request_number", header: "REQUEST NO", index: 2 },
      { field: "carton_number", header: "CARTON NUMBER", index: 2 },
      { field: "department", header: "DEPARTMENT NAME", index: 2 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },
      { field: "document_type", header: "DOCUMENT TYPE", index: 3 },
      {
        field: "detail_document_type",
        header: "DETAIL DOCUMENT TYPE",
        index: 3,
      },
      { field: "WarehouseName", header: "WAREHOUSE NAME", index: 3 },
      { field: "detail_location", header: "DETAIL LOCATION", index: 4 },
      //    { field: 'ApprovalBy', header: 'APPROVAL BY', index: 3 },
      //   { field: 'ApprovalDate', header: 'APPROVAL DATE', index: 4 },
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
        ApprovalBy: el.ApprovalBy,
        ApprovalDate: el.ApprovalDate,
        status: el.status,
        DepartmentCode: el.DepartmentCode,
        WarehouseName: el.WarehouseName,
      });
    });
    this.headerList1 = tableHeader;
    this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData1));
    this.formattedData1 = formattedData1;
    this.loading1 = false;
  }

  AddApprovalForm: FormGroup;

  // async onUpdatestatus(status: any) {
  //   if (
  //     this.formattedData1.filter((item) => item.selected === true).length === 0
  //   ) {
  //     this.ShowErrormessage("Please select at least one carton.");
  //     return;
  //   }

  //   const apiUrl = this._global.baseAPIUrl + "OCBCRetrival/RetrievalRequestAck";
  //   const requestNumber = this.pickupForm.controls["request_number"].value;

  //   let processedIds: any[] = [];
  //   let message = "";

  //   const selectedItems = this.formattedData1.filter(
  //     (item) => item.selected === true
  //   );

  //   const promises = selectedItems.map((item) => {
  //     const payload = {
  //       status: status,
  //       request_number: requestNumber,
  //       cartonNo: item.carton_number,
  //       User_Token: localStorage.getItem("User_Token"),
  //       CreatedBy: localStorage.getItem("UserID"),
  //     };

  //     return new Promise((resolve, reject) => {
  //       this._onlineExamService.postData(payload, apiUrl).subscribe({
  //         next: (data) => resolve({ item, data }),
  //         error: (err) => reject(err),
  //       });
  //     });
  //   });

  //   try {
  //     const results = await Promise.all(promises)
  //     results.forEach((result) => {
  //       console.log(
  //         "Processed:",
  //         result.item.carton_number,
  //         "Message:",
  //         result.data
  //       );
  //       message = result.data; // Only last message will remain in variable
  //     });

  //     console.log("Final message:", message);
  //     // Do something with message
  //   } catch (error) {
  //     console.error("An error occurred during processing:", error);
  //   }
  //   if (message === "Request Acknowledged Successfully.") {
  //     this.modalRef.hide();
  //     this.GetRetrievalAckPendingData();
  //   } else {
  //     this.GetTableData(this.pickupForm.controls["request_number"].value);
  //   }
  //   this.toastr.show(
  //     `<span class="alert-title" data-notify="title">Success!</span>` +
  //       `<span data-notify="message">${message}</span>`,
  //     "",
  //     {
  //       timeOut: 3000,
  //       closeButton: true,
  //       enableHtml: true,
  //       tapToDismiss: false,
  //       titleClass: "alert-title",
  //       positionClass: "toast-top-center",
  //       toastClass:
  //         "ngx-toastr alert alert-dismissible alert-success alert-notify",
  //     }
  //   );
  //   // this.modalRef.hide();
  // }

    async onUpdatestatus(status: any) {
  const selectedItems = this.formattedData1.filter((item) => item.selected === true);

  if (selectedItems.length === 0) {
    this.ShowErrormessage("Please select at least one carton.");
    return;
  }

  const apiUrl = this._global.baseAPIUrl + "OCBCRetrival/RetrievalRequestAck";

  const payload = {
    status: status,
    request_number: this.pickupForm.controls["request_number"].value,
    cartonNos: selectedItems.map((item) => item.carton_number), // ✅ send all cartons
    User_Token: localStorage.getItem("User_Token"),
    CreatedBy: localStorage.getItem("UserID"),
  };

  try {
    const response: any = await this._onlineExamService.postData(payload, apiUrl).toPromise();

    if (response === "Request Acknowledged Successfully.") {
      this.modalRef.hide();
      this.GetRetrievalAckPendingData();
    } else {
      this.GetTableData(this.pickupForm.controls["request_number"].value);
    }

    this.toastr.show(
      `<span class="alert-title" data-notify="title">Success!</span>` +
        `<span data-notify="message">${response}</span>`,
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

  Editinward(template: TemplateRef<any>, row: any) {
    this.modalRef = this.modalService.show(template);
    this.pickupForm.patchValue({
      request_number: row.request_number,
      department: row.department,
    });
    this.GetTableData(row.request_number);
  }

  OnReset() {
    this.Reset = true;
    this.isReadonly = false;
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }
  paginate1(e) {
    this.first1 = e.first;
    this.rows1 = e.rows;
  }

  hidepopup() {
    this.modalRef.hide();
    this.GetRetrievalAckPendingData();
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

  ShowErrormessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error ! </span> <span data-notify="message"> ' +
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

  ShowMessage(data: any) {
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
  toggleSelection(items: any) {
    this.formattedData1 = this.formattedData1.map((item) => {
      if (items.srNo === item.srNo && item.status === "Carton Dispatched") {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
  }
   
 
getStatusClass(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.toUpperCase()) {
    case 'REQUEST DISPATCHED':
      return 'status-badge status-accepted';
    case 'RETRIEVAL REQUEST':
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
    case 'CARTON DISPATCHED':
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
