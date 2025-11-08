import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";

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

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-inventory-report",
  templateUrl: "./inventory-report.component.html",
  styleUrls: ["./inventory-report.component.scss"],
})
export class InventoryReportComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  RefillingReportForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  minToDate: Date | undefined;
  _FilteredList: any;
  _statusList: any;
  _HeaderList: any;
  _IndexPendingList: any;
  currentDate: Date;

  _ColNameList = [
    // "request_id",
    // "lan_no",
    // "carton_no",
    // "document_type",
    // "file_no",
    // "item_status",
    // "applicant_name",
    // "branch_name",
    // "created_by",
    // "created_date",
    // "request_status",

    // "Request_ID",
    // "Document_Type",
    // "lan_no",
    // "carton_no",
    // "file_no",
    // "item_status",
    // "app_branch_code",
    // "Branch_Name",
    // "disb_date",
    // "zone_name",
    // "disb_number",
    // "applicant_name",
    // "scheme_name",
    // "smemel_product",
    // "total_disb_amt",
    // "pos",
    // "bal_disb_amt",
    // "schedule_date",
    // "Inventory_By",
    // "Inventory_Date",
    // "request_status",
    // "File_status",
    "batchId",
    "cartonNo",
    "DepartmentName",
    "DepartmentCode",
    "documents",
    "DocumentDetails",
    "InventoryBy",
    "InventoryDate", ,
    "approvedBy",
    "approvedDate", ,
    "rejectedDate",
    "rejectedBy",
    "warehouseEntryBy",
    "warehouseApprovedBy",
    "warehouseApprovedDate",
    "warehouseLocationUpdatedBy",
    "warehouseLocationUpdatedDate",
    "ItemLcoation",
    "ItemStatus",
    "ReteionPeriod",
    "ExpireDate",
    "isDestructionOrExtension",
    "extensionDate",
    "extensionBy",
    "DestructionDate",
    "DestructionBy",
    "status",

  ];

  // { field: "item_status", header: "ITEM status", index: 2 },      
  // { field: "applicant_name", header: "APPLICANT NAME", index: 2 },      
  // { field: "branch_name", header: "BRANCH NAME", index: 2 },       

  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  maxFromDate = new Date();
  first = 0;
  rows = 10;

  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) { }

  ngOnInit() {
    this.currentDate = new Date();
    this.RefillingReportForm = this.formBuilder.group({
      ToDate: [null, Validators.required],
      FromDate:[null, Validators.required],
      status: [0],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    this.RefillingReportForm.controls['status'].setValue(0);
    // this.getreffilingreport();

    this.prepareTableData([], []);
    this.GetInventoryList();
        this.RefillingReportForm.get('FromDate')?.valueChanges.subscribe(() => {
      this.clearLogTable();
    });

    this.RefillingReportForm.get('ToDate')?.valueChanges.subscribe(() => {
      this.clearLogTable();
    });
  }

  
    private clearLogTable() {
    this.formattedData = [];
    this.immutableFormattedData = [];
    this._FilteredList = [];
    this._statusList = [];

    this.first = 0;
    this.loading = false;
    this.rows = 10;
  }

  paginate(e) {
    //this.first = e.first;
    this.first = 0;
    this.rows = e.rows;
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = false;
  // private formatDate(originalDateString: any) {
  //   const date = new Date(originalDateString);

  //   const day = this.padZero(date.getDate());
  //   const month = this.padZero(date.getMonth() + 1); // Months are zero-based
  //   const year = date.getFullYear();

  //   return `${day}-${month}-${year}`;
  // }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
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

  prepareTableData(tableData, headerList) {
    debugger;
    let formattedData = [];
    loading: true;
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },

      { field: "batchId", header: "BATCH ID", index: 2 },
      { field: "cartonNo", header: "CARTON NO", index: 2 },
      { field: "ItemStatus", header: "ITEM STATUS", index: 2 },
      { field: "status", header: "CARTON STATUS", index: 2 },
      { field: "DepartmentName", header: "DEPARTMENT NAME", index: 2 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 2 },
      { field: "documents", header: "DOCUMENT TYPE", index: 2 },
      { field: "DocumentDetails", header: "DOCUMENT DETAILS", index: 2 },
      { field: "ReteionPeriod", header: "RETENTION PERIOD", index: 2 },
      { field: "InventoryBy", header: "INWARD BY", index: 2 },
      { field: "InventoryDate", header: "INWARD ON", index: 2 },
      { field: "approvedBy", header: "INVENTORY APPROVED BY", index: 2 },
      { field: "approvedDate", header: "INVENTORY APPROVED ON", index: 2 },
      { field: "RejectAt", header: "REJECTED AT", index: 2 },

      { field: "rejectedBy", header: "REJECTED BY", index: 2 },
      { field: "rejectedDate", header: "REJECTED ON", index: 2 },
      { field: "warehouseEntryBy", header: "INVENTORY SCHEDULE BY", index: 2 },
      { field: "warehouseEntryDate", header: "INVENTORY SCHEDULE ON", index: 2 },
      { field: "pickupDate", header: "EXPECTED PICKUP ON", index: 2 },
      { field: "InventoryAckBy", header: "INVENTORY ACK BY", index: 2 },
      { field: "InventoryAckDate", header: "INVENTORY ACK ON", index: 2 },
      { field: "warehouseLocationUpdatedDate", header: "LOCATION UPDATED ON", index: 2 },
      { field: "warehousePickupLocationBy", header: "LOCATION UPDATED BY", index: 2 },
      { field: "warehouseName", header: "WAREHOUSE NAME", index: 2 },
      { field: "ItemLcoation", header: "DETAIL LOCATION", index: 2 },
      { field: "ExpireDate", header: "EXPIRE DATE", index: 2 },
      { field: "isDestructionOrExtension", header: "IS DESTRUCTION OR EXTENSION", index: 2 },
      { field: "extensionBy", header: "EXTENSION BY", index: 2 },

      { field: "extensionDate", header: "EXTENSION ON", index: 2 },
      { field: "DestructionBy", header: "DESTRUCTION BY", index: 2 },

      { field: "DestructionDate", header: "DESTRUCTION ON", index: 2 },

    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        batchId: el.batchId,
        cartonNo: el.cartonNo,
        DepartmentName: el.DepartmentName,
        DepartmentCode: el.DepartmentCode,

        DocumentDetails: el.DocumentDetails,
        documents: el.documents,
        BatchCreatedBy: el.BatchCreatedBy,
        approvedBy: el.approvedBy,
        warehouseEntryBy: el.warehouseEntryBy,
        warehouseApprovedBy: el.warehouseApprovedBy,
        BatchCreatedDate: el.BatchCreatedDate,
        approvedDate: el.approvedDate,
        rejectedDate: el.rejectedDate,
        warehouseEntryDate: el.warehouseEntryDate,
        warehouseApprovedDate: el.warehouseApprovedDate,
        pickupDate: el.pickupDate,
        warehouseLocationUpdatedDate: el.warehouseLocationUpdatedDate,
        InventoryDate: el.InventoryDate,
        status: el.status,
        InventoryBy: el.InventoryBy,
        ItemLcoation: el.ItemLcoation,
        warehouseName: el.warehouseName,
        ReteionPeriod: el.ReteionPeriod + ' Years',
        detailDocumentType: el.detailDocumentType,
        createdBy: el.userName,
        isDestructionOrExtension: el.isDestructionOrExtension,
        extensionDate: el.extensionDate,
        extensionBy: el.extensionBy,
        DestructionDate: el.DestructionDate,
        DestructionBy: el.DestructionBy,
        ExpireDate: el.ExpireDate,
        rejectedBy: el.rejectedBy,
        ItemStatus: el.ItemStatus,
        InventoryAckBy: el.InventoryAckBy,
        InventoryAckDate: el.InventoryAckDate,
        RejectAt: el.RejectAt,
        warehousePickupLocationBy: el.warehousePickupLocationBy

      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;

    // console.log(this.formattedData);
  }

  onFromDateChange(date: Date) {
    this.RefillingReportForm.get('FromDate')?.setValue(date);
    this.minToDate = date;

    const toDate = this.RefillingReportForm.get('ToDate')?.value;
    if (toDate && new Date(toDate) < new Date(date)) {
      this.RefillingReportForm.get('ToDate')?.setValue(null);
    }
  }

  onToDateChange(date: Date) {
    this.maxFromDate = date;

    const fromDate = this.RefillingReportForm.get('FromDate')?.value;
    if (fromDate && new Date(fromDate) > new Date(date)) {
      this.RefillingReportForm.get('FromDate')?.setValue(null); // reset invalid date
    }
  }

  searchTable($event) {

    if (!this.RefillingReportForm.controls["FromDate"].value || !this.RefillingReportForm.controls["ToDate"].value) {

      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">There should be some data before you download!</span></div>',
        "",
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          titleClass: "alert-title",
          positionClass: "toast-top-center",
          toastClass:
            "ngx-toastr alert alert-dismissible alert-danger alert-notify"
        }
      );
      return;
    }


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

  getreffilingreport1() {
    if (this.RefillingReportForm.value.ToDate && this.RefillingReportForm.value.FromDate) {
      this.RefillingReportForm.controls['status'].setValue(1);
      this.getreffilingreport();
    } else {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please select from date and to date!</span></div>',
        "",
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          titleClass: "alert-title",
          positionClass: "toast-top-center",
          toastClass:
            "ngx-toastr alert alert-dismissible alert-danger alert-notify"
        }
      );

    }

  }


  getreffilingreport() {
    const apiUrl = this._global.baseAPIUrl + "Report/GetFileInventoryReport";
    this._onlineExamService.postData(this.RefillingReportForm.value, apiUrl).subscribe((data) => {
      // this._statusList = data;
      // this._FilteredList = data;
      // this.prepareTableData(this._statusList, this._FilteredList);
    });
  }

  onDownload() {
    this.exportToExcel(this.formattedData, "File Inventory Report");
  }

  GetHeaderNames() {
    this._HeaderList = "";
    for (let j = 0; j < this._ColNameList.length; j++) {
      this._HeaderList +=
        this._ColNameList[j] + (j <= this._ColNameList.length - 2 ? "," : "");
    }
    this._HeaderList += "\n";
    this._statusList.forEach((stat) => {
      for (let j = 0; j < this._ColNameList.length; j++) {
        this._HeaderList +=
          stat[this._ColNameList[j]] +
          (j <= this._ColNameList.length - 2 ? "," : "");
      }
      this._HeaderList += "\n";
    });
  }

  OnReset() {
    this.Reset = true;
    this.RefillingReportForm.reset();
  }
  isValid() {
    return this.RefillingReportForm.valid;
  }

  getDisplayNames(csvRecordsArr: any) {

    //  console.log("csvRecordsArr",csvRecordsArr);

    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    if (headers.length != 8) {
      var msg = 'Invalid No. of Column Expected :- ' + 8;
      this.ShowErrormessage(msg);

      return false;
    }
    //this._ColNameList[0] = "id";
    this._ColNameList[1] = "batchId";
    this._ColNameList[2] = "cartonNo";
    this._ColNameList[3] = "DepartmentName";
    this._ColNameList[4] = "DepartmentCode";
    this._ColNameList[5] = "documents";
    this._ColNameList[6] = "DocumentDetails";
    this._ColNameList[7] = "InventoryBy";
    this._ColNameList[8] = "InventoryDate";
    this._ColNameList[9] = "approvedBy";
    this._ColNameList[10] = "approvedDate";
    this._ColNameList[11] = "rejectedDate";
    this._ColNameList[12] = "rejectedBy";
    this._ColNameList[13] = "warehouseEntryBy";
    this._ColNameList[14] = "warehouseApprovedBy";
    this._ColNameList[15] = "warehouseApprovedDate";
    this._ColNameList[16] = "warehouseLocationUpdatedDate";
    this._ColNameList[17] = "ItemLcoation";
    this._ColNameList[18] = "ItemStatus";
    this._ColNameList[19] = "ReteionPeriod";
    this._ColNameList[20] = "ExpireDate";
    this._ColNameList[21] = "isDestructionOrExtension";
    this._ColNameList[22] = "extensionDate";
    this._ColNameList[23] = "extensionBy";
    this._ColNameList[24] = "DestructionDate";
    this._ColNameList[25] = "DestructionBy";
    this._ColNameList[26] = "status";
    this._ColNameList[27] = "RejectAt";
    this._ColNameList[28] = "warehouseLocationUpdatedBy";




    return true;
  }
  ShowErrormessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Validation ! </span> <span data-notify="message"> ' + data + ' </span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-danger alert-notify"
      }
    );

  }
  //  downloadFile() {
  //   const filename = 'DumpUpload_Format_CSV';
  //   let csvData = "Batch_ID,Carton_No,Department_Name,Batch_Created_By,Approved_By,warehouse_Entry_By,warehouse_Approved_By,Batch_Created_Date,Apporved_Date,Rejected_Date,warehouse_Entry_Date,warehouse_Approved_Date,Pickup_Date,warehouse_location_updated_Date,Inventory_Date,status,Inventory_By\n";

  //   // let csvData = "AccountNo,AppNo,CRN,URN,DBDate,DBMonth,DBYear,ProductCode,ProductType,ProductName,COD_OFFICR_ID,CustomerName,BranchCode,BranchName,Zone,ClosedDate";    
  //   //console.log(csvData)
  //   let blob = new Blob(['\ufeff' + csvData], {
  //     type: 'text/csv;charset=utf-8;'
  //   });
  //   let dwldLink = document.createElement("a");
  //   let url = URL.createObjectURL(blob);
  //   let isSafariBrowser = -1;
  //   // let isSafariBrowser = navigator.userAgent.indexOf( 'Safari') != -1 & amp; & amp;
  //   // navigator.userAgent.indexOf('Chrome') == -1;

  //   //if Safari open in new window to save file with random filename.
  //   if (isSafariBrowser) {
  //     dwldLink.setAttribute("target", "_blank");
  //   }
  //   dwldLink.setAttribute("href", url);
  //   dwldLink.setAttribute("download", filename + ".csv");
  //   dwldLink.style.visibility = "hidden";
  //   document.body.appendChild(dwldLink);
  //   dwldLink.click();
  //   document.body.removeChild(dwldLink);

  // }


  //   GetInventoryList() {
  //     const asch = this.RefillingReportForm.value;
  //     console.log("hoihoih",asch);
  //   const apiUrl =
  //     this._global.baseAPIUrl +
  //     "InventoryDone/GetList?user_Token=" +
  //     localStorage.getItem("User_Token");

  //   this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
  //     if (data && data.length > 0) {
  //      this._statusList = data;
  //         this._FilteredList = data;
  //         this.prepareTableData(this._statusList, this._FilteredList);
  //     } else {
  //       console.warn("No inventory data found.");
  //     }
  //   }, error => {
  //     console.error("API error:", error);
  //   });
  // }
  GetInventoryList() {
    const fromDateStr = this.RefillingReportForm.get('FromDate')?.value;
    const toDateStr = this.RefillingReportForm.get('ToDate')?.value;
    const token = localStorage.getItem("User_Token");

    const apiUrl = this._global.baseAPIUrl + "Report/GetList?user_Token=" + token;

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data && data.length > 0) {
        this._statusList = data;

        if (fromDateStr && toDateStr) {
          const from = new Date(fromDateStr);
          const to = new Date(toDateStr);

          this._FilteredList = this._statusList.filter((item: any) => {
            if (!item.InventoryDate) return false;

            // 👇 This part parses dd-MM-yyyy or dd/MM/yyyy safely
            const parts = item.InventoryDate.includes('-')
              ? item.InventoryDate.split('-')
              : item.InventoryDate.split('/');

            const day = +parts[0];
            const month = +parts[1] - 1;
            const year = +parts[2];
            const invDate = new Date(year, month, day);

            return invDate >= from && invDate <= to;
          });
        } else {
          this._FilteredList = this._statusList;
        }

        this.prepareTableData(this._FilteredList, this._FilteredList);
      } else {
        this._FilteredList = [];
        this.formattedData = [];
      }
    });
  }

  GetSearchedData() {
  debugger;
  const fromDate = this.RefillingReportForm.get('FromDate')?.value;
  const toDate = this.RefillingReportForm.get('ToDate')?.value;
  const token = localStorage.getItem("User_Token");
  const userId = localStorage.getItem("UserID");

  // 🔹 Validation with toaster
  if (!fromDate || !toDate) {
    this.toastr.show(
      '<div class="alert-text"></div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please select both From Date and To Date</span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass: "ngx-toastr alert alert-dismissible alert-danger alert-notify"
      }
    );
    return;
  }

  if (new Date(fromDate) > new Date(toDate)) {
    this.toastr.show(
      '<div class="alert-text"></div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">From Date cannot be greater than To Date</span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass: "ngx-toastr alert alert-dismissible alert-danger alert-notify"
      }
    );
    return;
  }

  let apiUrl = this._global.baseAPIUrl + "Report/GetList?user_Token=" + token;

  if (fromDate) {
    const formattedFrom = this.formatDate(fromDate);
    apiUrl += "&FromDate=" + formattedFrom;
  }

  if (toDate) {
    const formattedTo = this.formatDate(toDate);
    apiUrl += "&ToDate=" + formattedTo;
  }

  if (userId) {
    apiUrl += "&UserId=" + userId;
  }

  this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
    if (data && data.length > 0) {
      this._statusList = data;
      this._FilteredList = this._statusList;
      this.prepareTableData(this._FilteredList, this._FilteredList);
    } else {
      this._FilteredList = [];
      this.formattedData = [];
      this.toastr.show(
        '<div class="alert-text"></div> <span class="alert-title" data-notify="title">Warning!</span> <span data-notify="message">No records found for the selected date range</span></div>',
        "",
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          titleClass: "alert-title",
          positionClass: "toast-top-center",
          toastClass: "ngx-toastr alert alert-dismissible alert-warning alert-notify"
        }
      );
    }
  }, (error) => {
    this.toastr.show(
      '<div class="alert-text"></div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Error while fetching data</span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass: "ngx-toastr alert alert-dismissible alert-danger alert-notify"
      }
    );
  });
}


  // Helper method
  formatDate(date: Date): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }


  onSearchByDate() {
    this.GetInventoryList();
  }

  // downloadFile() {
  //   const filename = 'Inventory_Report';

  //   // CSV Header - matches prepareTableData order and tableHeader labels
  //   let csvData = "BATCH ID,CARTON NO,STATUS,ITEM STATUS,DEPARTMENT NAME,DEPARTMENT CODE,DOCUMENT TYPE,DOCUMENT DETAILS,INVENTORY BY,INVENTORY ON,INVENTORY APPROVED BY,INVENTORY APPROVED ON,REJECTED AT,REJECTED BY,REJECTED ON,INVENTORY SCHEDULE BY,INVENTORY SCHEDULE ON,INVENTORY ACK BY,INVENTORY ACK ON,PICKUP DATE,LOCATION UPDATED ON,LOCATION UPDATED BY,WAREHOUSE NAME,ITEM LOCATION,RETENTION PERIOD,EXPIRE DATE,IS DESTRUCTION OR EXTENSION,EXTENSION ON,EXTENSION BY,DESTRUCTION ON,DESTRUCTION BY\n";

  //   if (!this.formattedData || this.formattedData.length === 0) {
  //     console.warn("No data to download.");
  //     return;
  //   }

  //   // Add CSV rows
  //   this.formattedData.forEach((row: any) => {
  //     csvData +=
  //       `${row.batchId ?? ''},` +
  //       `${row.cartonNo ?? ''},` +
  //       `${row.status ?? ''},` +
  //       `${row.ItemStatus ?? ''},` +
  //       `${row.DepartmentName ?? ''},` +
  //       `${row.DepartmentCode ?? ''},` +
  //       `${row.documents ?? ''},` +
  //       `${row.DocumentDetails ?? ''},` +
  //       `${row.InventoryBy ?? ''},` +
  //       `${row.InventoryDate ?? ''},` +
  //       `${row.approvedBy ?? ''},` +
  //       `${row.approvedDate ?? ''},` +
  //       `${row.RejectAt ?? ''},` +
  //       `${row.rejectedBy ?? ''},` +
  //       `${row.rejectedDate ?? ''},` +
  //       `${row.warehouseEntryBy ?? ''},` +
  //       `${row.warehouseEntryDate ?? ''},` +
  //       `${row.InventoryAckBy ?? ''},` +
  //       `${row.InventoryAckDate ?? ''},` +
  //       `${row.pickupDate ?? ''},` +
  //       `${row.warehouseLocationUpdatedDate ?? ''},` +
  //       `${row.warehouseLocationUpdatedBy ?? ''},` +

  //       `${row.warehouseName ?? ''},` +
  //       `${row.ItemLcoation ?? ''},` +
  //       `${row.ReteionPeriod ?? ''},` +
  //       `${row.ExpireDate ?? ''},` +
  //       `${row.isDestructionOrExtension ?? ''},` +
  //       `${row.extensionDate ?? ''},` +
  //       `${row.extensionBy ?? ''},` +
  //       `${row.DestructionDate ?? ''},` +
  //       `${row.DestructionBy ?? ''}\n`;
  //   });

  //   const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
  //   const dwldLink = document.createElement("a");
  //   const url = URL.createObjectURL(blob);

  //   dwldLink.setAttribute("href", url);
  //   dwldLink.setAttribute("download", filename + ".csv");
  //   dwldLink.style.visibility = "hidden";
  //   document.body.appendChild(dwldLink);
  //   dwldLink.click();
  //   document.body.removeChild(dwldLink);
  //   this.logDownloadActivity();
  // }
  downloadFile() {
  const filename = 'Inventory_Report';

  // Define headers and field mappings (consistent, reusable)
  const headers = [
    { label: "BATCH ID", field: "batchId" },
    { label: "CARTON NO", field: "cartonNo" },
    { label: "STATUS", field: "status" },
    { label: "ITEM STATUS", field: "ItemStatus" },
    { label: "DEPARTMENT NAME", field: "DepartmentName" },
    { label: "DEPARTMENT CODE", field: "DepartmentCode" },
    { label: "DOCUMENT TYPE", field: "documents" },
    { label: "DOCUMENT DETAILS", field: "DocumentDetails" },
    { label: "INVENTORY BY", field: "InventoryBy" },
    { label: "INVENTORY ON", field: "InventoryDate" },
    { label: "INVENTORY APPROVED BY", field: "approvedBy" },
    { label: "INVENTORY APPROVED ON", field: "approvedDate" },
    { label: "REJECTED AT", field: "RejectAt" },
    { label: "REJECTED BY", field: "rejectedBy" },
    { label: "REJECTED ON", field: "rejectedDate" },
    { label: "INVENTORY SCHEDULE BY", field: "warehouseEntryBy" },
    { label: "INVENTORY SCHEDULE ON", field: "warehouseEntryDate" },
    { label: "INVENTORY ACK BY", field: "InventoryAckBy" },
    { label: "INVENTORY ACK ON", field: "InventoryAckDate" },
    { label: "PICKUP DATE", field: "pickupDate" },
    { label: "LOCATION UPDATED ON", field: "warehouseLocationUpdatedDate" },
    { label: "LOCATION UPDATED BY", field: "warehouseLocationUpdatedBy" },
    { label: "WAREHOUSE NAME", field: "warehouseName" },
    { label: "ITEM LOCATION", field: "ItemLcoation" },
    { label: "RETENTION PERIOD", field: "ReteionPeriod" },
    { label: "EXPIRE DATE", field: "ExpireDate" },
    { label: "IS DESTRUCTION OR EXTENSION", field: "isDestructionOrExtension" },
    { label: "EXTENSION ON", field: "extensionDate" },
    { label: "EXTENSION BY", field: "extensionBy" },
    { label: "DESTRUCTION ON", field: "DestructionDate" },
    { label: "DESTRUCTION BY", field: "DestructionBy" },
  ];

  const data = this.formattedData ?? [];
  if (!data.length) {
    console.warn("No data to download.");
    return;
  }

  // Escape a value properly for CSV (handles commas, quotes, newlines)
  const escapeCSV = (value: any): string => {
    if (value == null) return '';
    let v = value;

    // Try to format Dates as ISO (optional)
    if (v instanceof Date) v = v.toISOString();
    else if (typeof v === 'object') {
      try { v = JSON.stringify(v); } catch { v = String(v); }
    }

    v = String(v);
    // If contains special characters, wrap in quotes and escape quotes
    if (/[",\n\r]/.test(v)) {
      v = '"' + v.replace(/"/g, '""') + '"';
    }
    return v;
  };

  // Build CSV header
  const csvRows: string[] = [];
  csvRows.push(headers.map(h => escapeCSV(h.label)).join(','));

  // Build CSV body
  data.forEach(row => {
    const values = headers.map(h => escapeCSV(row[h.field]));
    csvRows.push(values.join(','));
  });

  // Combine with UTF-8 BOM for Excel compatibility
  const csvString = '\ufeff' + csvRows.join('\n');

  // Create and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  this.logDownloadActivity?.();
}

logDownloadActivity() {
  const payload = {
    pageName: 'Inventory Report',
    activity: 'Download',
    activityDescription: 'User downloaded the Inventory Report',
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
