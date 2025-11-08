import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import noUiSlider from "nouislider";
import Dropzone from "dropzone";
Dropzone.autoDiscover = false;

import Selectr from "mobius1-selectr";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

import swal from "sweetalert2";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-refilling-report",
  templateUrl: "refilling-report.component.html",
})
export class RefillingreportComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  RefillingReportForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  _FilteredList: any;
  _StatusList: any;
  _HeaderList: any;
  _IndexPendingList: any;

  _ColNameList = [
    "request_number",
    "item_number",
    "created_by",
    "created_date",
    "ack_by",
    "ack_date",
    "pickup_date",
    "request_status",
  ];

  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  first = 0;
  rows = 10;
  currentDate: Date;
  minToDate: Date | undefined;
  maxFromDate: Date | undefined;
  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) { }


  ngOnInit() {
    this.currentDate = new Date();

    this.RefillingReportForm = this.formBuilder.group({
      FromDate: [null, Validators.required],
      ToDate: [null, Validators.required],
      status: [0],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });


    this.prepareTableData([], []);
    this.GetRefillingReport();
   

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
    this._StatusList = [];

    this.first = 0;
    this.loading = false;
    this.rows = 10;
  }
  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];

    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: "requestNumber", header: "RETURN REQUEST ID", index: 1 },
      { field: "CartonNo", header: "CARTON NO", index: 1 },
      { field: "ItemStatus", header: "ITEM STATUS", index: 2 },
      { field: "FileStatus", header: "CARTON STATUS", index: 1 },
      { field: "DepartmentName", header: "DEPARTMENT NAME", index: 2 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 2 },
      { field: "documents", header: "DOCUMENT TYPE", index: 3 },
      { field: "DocumentDetails", header: "DOCUMENT DETAILS", index: 4 },
      { field: "ReteionPeriod", header: "RETENTION PERIOD", index: 2 },
      { field: "ReturnRequestBy", header: "REQUESTED BY", index: 1 },
      { field: "ReturnRequestDate", header: "REQUESTED ON", index: 1 },
      { field: "status", header: "STATUS", index: 1 },
      { field: "ReturnRequestApproveBy", header: "APPROVED BY", index: 1 },
      { field: "ReturnRequestApproveDate", header: "APPROVED ON", index: 1 },
      { field: "RejectAt", header: "REJECTED AT", index: 3, },
      { field: "rejectedBy", header: "REJECTED BY", index: 3, },
      { field: "rejectedDate", header: "REJECTED ON", index: 3, },
      { field: "warehousePickupLocationBy", header: "SCHEDULE BY", index: 2 },
      { field: "warehousePickupLocationDate", header: "SCHEDULE ON", index: 2 },
      { field: "pickupDate", header: "EXPECTED DATE OF PICK UP", index: 1 },
      { field: "WarehouseReturnAckDate", header: "ACKNOWLEDGED ON", index: 1 },
      { field: "WarehouseReturnAckBy", header: "ACKNOWLEDGED BY", index: 1 },
      { field: "warehouseName", header: "WAREHOUSE NAME", index: 2 },
      { field: "ItemLcoation", header: "DETAIL LOCATION", index: 2 },
      { field: "warehousePickupLocationBy", header: "LOCATION UPDATED BY", index: 1 },
      { field: "warehousePickupLocationDate", header: "LOCATION UPDATED ON", index: 1 },

      // { field: "WarehouseEntryBy", header: "WAREHOUSE ENTRY BY", index: 1 },
      //  { field: "WarehouseEntryDate", header: "WAREHOUSE ENTRY ON", index: 1 },   
      // { field: "Remark", header: "REMARK", index: 1 }, 

      //

    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: index + 1,
        requestNumber: el.requestNumber,
        CartonNo: el.CartonNo,
        ReturnRequestDate: el.ReturnRequestDate,
        ReturnRequestBy: el.ReturnRequestBy,
        ServiceType: el.ServiceType,
        FileStatus: el.FileStatus,
        status: el.status,
        ReteionPeriod: el.ReteionPeriod,
        documents: el.documents,
        DocumentDetails: el.DocumentDetails,
        ItemStatus: el.ItemStatus,
        warehouseName: el.warehouseName,
        warehousePickupLocationDate: el.warehousePickupLocationDate,
        warehousePickupLocationBy: el.warehousePickupLocationBy,
        ReturnRequestApproveBy: el.ReturnRequestApproveBy,
        ReturnRequestApproveDate: el.ReturnRequestApproveDate,
        ReturnRequestRejectedBy: el.ReturnRequestRejectedBy,
        ReturnRequestRejectDate: el.ReturnRequestRejectDate,
        ReturnRequestRejectReason: el.ReturnRequestRejectReason,
        WarehouseReturnAckDate: el.WarehouseReturnAckDate,
        WarehouseReturnAckBy: el.WarehouseReturnAckBy,
        ReturnRequestExpectedPickDate: el.ReturnRequestExpectedPickDate,
        Remark: el.Remark,
        WarehouseLcoation: el.WarehouseLcoation,
        WarehousePickupAckBy: el.WarehousePickupAckBy,
        WarehousePickupAckDate: el.WarehousePickupAckDate,
        ItemLcoation: el.ItemLcoation,

        WarehouseReturnRejectedBy: el.WarehouseReturnRejectedBy,
        WarehouseReturnRejectDate: el.WarehouseReturnRejectDate,
        ApprovedBy: el.ApprovedBy,
        ApprovedDate: el.ApprovedDate,
        rejectedBy: el.rejectedBy,
        rejectedDate: el.rejectedDate,

        pickupDate: el.pickupDate,
        WarehouseEntryBy: el.WarehouseEntryBy,
        WarehouseEntryDate: el.WarehouseEntryDate,
        RejectAt: el.RejectAt,
        DepartmentCode: el.DepartmentCode,
        DepartmentName: el.DepartmentName
        //  ReturnRequestBy: el.ReturnRequestBy
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

  getreffilingreport1() {
    if (this.RefillingReportForm.value.ToDate && this.RefillingReportForm.value.FromDate) {
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
            "ngx-toastr alert alert-dismissible alert-danger alert-notify",
        }
      );
    }
  }

  getreffilingreport() {
    const apiUrl = this._global.baseAPIUrl + "Retrival/GetRefillingReport";
    this._onlineExamService
      .postData(this.RefillingReportForm.value, apiUrl)
      .subscribe((data) => {
        this._StatusList = data;
        this._FilteredList = data;
        this.prepareTableData(this._StatusList, this._FilteredList);
      });
  }

  GetRefillingReport() {
    const fromDateStr = this.RefillingReportForm.get('FromDate')?.value;
    const toDateStr = this.RefillingReportForm.get('ToDate')?.value;
    const token = localStorage.getItem("User_Token");
    const userId = localStorage.getItem("UserID");

    const formatLocalYMD = (d: string) => {
      if (!d) return '';
      const dt = new Date(d);
      const y = dt.getFullYear();
      const m = (dt.getMonth() + 1).toString().padStart(2, '0');
      const dd = dt.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    const formattedFrom = formatLocalYMD(fromDateStr);
    const formattedTo = formatLocalYMD(toDateStr);

    let apiUrl = this._global.baseAPIUrl + "Report/GetRefillingReport?user_Token=" + token;

    if (formattedFrom) {
      apiUrl += "&FromDate=" + formattedFrom;
    }

    if (formattedTo) {
      apiUrl += "&ToDate=" + formattedTo;
    }

    if (userId) {
      apiUrl += "&UserId=" + userId;
    }

    console.log("Calling API:", apiUrl); // 🔍 Add this to confirm URL

    this._onlineExamService.getAllData(apiUrl).subscribe({
      next: (data: any) => {
        console.log("data_", data);
        this._StatusList = data;
        this._FilteredList = data;
        this.prepareTableData(this._FilteredList, this._FilteredList);
      },
      error: err => {
        console.error('GetRefillingReport Error:', err);
      }
    });
  }


  onFromDateChange(date: Date) {
    this.RefillingReportForm.get('FromDate')?.setValue(date);
    this.minToDate = date;

    const toDate = this.RefillingReportForm.get('ToDate')?.value;
    if (toDate && new Date(toDate) < new Date(date)) {
      this.RefillingReportForm.get('ToDate')?.setValue(null);
    }
  }
  formatDate(date: Date): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }
  onToDateChange(date: Date) {
    this.maxFromDate = date;

    const fromDate = this.RefillingReportForm.get('FromDate')?.value;
    if (fromDate && new Date(fromDate) > new Date(date)) {
      this.RefillingReportForm.get('FromDate')?.setValue(null); // reset invalid date
    }
  }

  onDownload() {
    this.exportToExcel(this.formattedData, "Refilling_Report");
    this.logDownloadActivity();
  }

  exportToExcel(data: any[], fileName: string): void {
    if (!data || data.length === 0) {
      console.warn("No data available to export.");
      return;
    }

    const tableHeader: any[] = [

      { field: 'srNo', header: "SR NO", index: 1 },
      { field: "requestNumber", header: "RETURN REQUEST ID", index: 1 },
      { field: "CartonNo", header: "CARTON NO", index: 1 },
      { field: "ItemStatus", header: "ITEM STATUS", index: 2 },
      { field: "FileStatus", header: "CARTON STATUS", index: 1 },
      { field: "DepartmentName", header: "DEPARTMENT NAME", index: 2 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 2 },
      { field: "documents", header: "DOCUMENT TYPE", index: 3 },
      { field: "DocumentDetails", header: "DOCUMENT DETAILS", index: 4 },
      { field: "ReteionPeriod", header: "RETENTION PERIOD", index: 2 },
      { field: "ReturnRequestBy", header: "REQUESTED BY", index: 1 },
      { field: "ReturnRequestDate", header: "REQUESTED ON", index: 1 },
      { field: "status", header: "STATUS", index: 1 },
      { field: "ReturnRequestApproveBy", header: "APPROVED BY", index: 1 },
      { field: "ReturnRequestApproveDate", header: "APPROVED ON", index: 1 },
      { field: "RejectAt", header: "REJECTED AT", index: 3, },
      { field: "rejectedBy", header: "REJECTED BY", index: 3, },
      { field: "rejectedDate", header: "REJECTED ON", index: 3, },
      { field: "warehousePickupLocationBy", header: "SCHEDULE BY", index: 2 },
      { field: "warehousePickupLocationDate", header: "SCHEDULE ON", index: 2 },
      { field: "pickupDate", header: "EXPECTED DATE OF PICK UP", index: 1 },
      { field: "WarehouseReturnAckDate", header: "ACKNOWLEDGED ON", index: 1 },
      { field: "WarehouseReturnAckBy", header: "ACKNOWLEDGED BY", index: 1 },
      { field: "warehouseName", header: "WAREHOUSE NAME", index: 2 },
      { field: "ItemLcoation", header: "DETAIL LOCATION", index: 2 },
      { field: "warehousePickupLocationBy", header: "LOCATION UPDATED BY", index: 1 },
      { field: "warehousePickupLocationDate", header: "LOCATION UPDATED ON", index: 1 },

      // { field: "WarehouseEntryBy", header: "WAREHOUSE ENTRY BY", index: 1 },
      //  { field: "WarehouseEntryDate", header: "WAREHOUSE ENTRY ON", index: 1 },   
      // { field: "Remark", header: "REMARK", index: 1 }, 

      //

    ];
    // Create rows with custom headers
    const formattedData = data.map((row: any) => {
      const newRow: any = {};
      tableHeader.forEach(col => {
        newRow[col.header] = row[col.field] ?? '';
      });
      return newRow;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook: XLSX.WorkBook = {
      Sheets: { "Return Request Report": worksheet },
      SheetNames: ["Return Request Report"],
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    FileSaver.saveAs(blob, fileName + ".xlsx");
  }

  logDownloadActivity() {
    const payload = {
      pageName: 'Refilling Report',
      activity: 'Download',
      activityDescription: 'User downloaded the Refilling Report',
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

  GetHeaderNames() {
    this._HeaderList = "";
    for (let j = 0; j < this._ColNameList.length; j++) {
      this._HeaderList +=
        this._ColNameList[j] + (j <= this._ColNameList.length - 2 ? "," : "");
    }
    this._HeaderList += "\n";
    this._StatusList.forEach((stat) => {
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
}
