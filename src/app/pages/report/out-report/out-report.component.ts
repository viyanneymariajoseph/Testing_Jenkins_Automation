import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import noUiSlider from "nouislider";
import Dropzone from "dropzone";
Dropzone.autoDiscover = false;
import { formatDate } from '@angular/common';

import Selectr from "mobius1-selectr";

import swal from "sweetalert2";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-out-report",
  templateUrl: "out-report.component.html",
})
export class OutreportComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  OutReportForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  _FilteredList: any;
  _StatusList: any;
  _HeaderList: any;
  _IndexPendingList: any;
  _ColNameList = [
    "lanno",
    "file_barcode",
    "property_barcode",
    "request_no",
    "request_type",
    "request_reason",
    "request_date",
    "ack_date",
    "file_status",
    "status",
    "file_barcode_status",
  ];

  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  minToDate: Date | undefined;
  maxFromDate: Date | undefined;
  first = 0;
  rows = 10;

  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) { }
  ngOnInit() {
    this.OutReportForm = this.formBuilder.group({
      FromDate: [null, Validators.required],
      ToDate: [null, Validators.required],
      status: [0],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    this.prepareTableData([], []);
    this.OutReportForm.get('FromDate')?.valueChanges.subscribe(() => {
      this.clearLogTable();
    });

    this.OutReportForm.get('ToDate')?.valueChanges.subscribe(() => {
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

  get isDateRangeValid(): boolean {
    const fromDate = this.OutReportForm.get('DATEFROM')?.value;
    const toDate = this.OutReportForm.get('DATETO')?.value;
    return !!fromDate && !!toDate;
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
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "cartonNo", header: "CARTON NO", index: 3 },
      { field: "DepartmentName", header: "DEPARTMENT NAME", index: 3 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },
      { field: "documents", header: "DOCUMENTS", index: 3 },
      { field: "DocumentDetails", header: "DOCUMENT DETAILS", index: 4 },
      { field: "ReteionPeriod", header: "RETENTION PERIOD", index: 4 },
      { field: "ExpireDate", header: "EXPIRY ON", index: 4 },
      { field: "extensionBy", header: "EXTENSION BY", index: 2 },
      { field: "extensionDate", header: "EXTENSION ON", index: 2 },
      { field: "isDestruction", header: "IS DESTRUCTION", index: 4 },
      { field: "DestructionDate", header: "DESTRUCTION ON", index: 2 },
      { field: "DestructionBy", header: "DESTRUCTION BY", index: 2 },
    ];

    tableData.forEach((el, index) => {
      let periodStr = "";
      if (el.ReteionPeriod && el.ReteionPeriod.toString().toUpperCase() !== "NA") {
        const periodNum = parseInt(el.ReteionPeriod);
        if (!isNaN(periodNum)) {
          periodStr = `${periodNum} year${periodNum > 1 ? "s" : ""}`;
        }
      } else {
        periodStr = "NA";
      }

      formattedData.push({
        srNo: parseInt(index + 1),
        cartonNo: el.cartonNo,
        DepartmentName: el.DepartmentName,
        ExpireDate: el.ExpireDate,
        DepartmentCode: el.DepartmentCode,
        documents: el.documents,
        DocumentDetails: el.DocumentDetails,
        ReteionPeriod: periodStr,
        isDestruction: el.isDestruction,
        DestructionDate: el.DestructionDate,
        DestructionBy: el.DestructionBy,
        extensionBy: el.extensionBy,
        extensionDate: el.extensionDate,
      });
    });

    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }


  searchTable($event) {
    // console.log($event.target.value);

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
  normalizeDate(date: any): string | null {
    if (!date) return null;
    return new Date(date).toISOString();
  }
  formatDate(date: Date): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }
  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
  onFromDateChange(date: Date) {
    this.OutReportForm.get('FromDate')?.setValue(date);
    this.minToDate = date;

    const toDate = this.OutReportForm.get('ToDate')?.value;
    if (toDate && new Date(toDate) < new Date(date)) {
      this.OutReportForm.get('ToDate')?.setValue(null);
    }
  }

  onToDateChange(date: Date) {
    this.maxFromDate = date;

    const fromDate = this.OutReportForm.get('FromDate')?.value;
    if (fromDate && new Date(fromDate) > new Date(date)) {
      this.OutReportForm.get('FromDate')?.setValue(null); // reset invalid date
    }
  }

  GetDestructionReport() {
    const fromDateStr = this.OutReportForm.get('FromDate')?.value;
    const toDateStr = this.OutReportForm.get('ToDate')?.value;

    // Show toaster if dates are missing
    if (!fromDateStr || !toDateStr) {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please select both From Date and To Date before searching!</span></div>',
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

    const token = localStorage.getItem("User_Token");
    const userId = localStorage.getItem("UserID");

    // helper to format YYYY-MM-DD in local timezone
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

    let apiUrl = this._global.baseAPIUrl + "Report/GetDestructionReport?user_Token=" + token;

    if (formattedFrom) apiUrl += "&FromDate=" + formattedFrom;
    if (formattedTo) apiUrl += "&ToDate=" + formattedTo;
    if (userId) apiUrl += "&UserId=" + userId;

    this._onlineExamService.getAllData(apiUrl).subscribe({
      next: (data: any) => {
        console.log("data_", data);
        this._StatusList = data;
        this._FilteredList = data;
        this.prepareTableData(this._FilteredList, this._FilteredList);
      },
      error: err => {
        console.error('GetDestructionReport Error:', err);
      }
    });
  }

  // onDownload() {
  //   this.downloadFile();
  // }

  GetHeaderNames() {
    this._HeaderList = "";
    for (let j = 0; j < this._ColNameList.length; j++) {
      this._HeaderList +=
        this._ColNameList[j] + (j <= this._ColNameList.length - 2 ? "," : "");
      // headerArray.push(headers[j]);
    }
    this._HeaderList += "\n";
    this._StatusList.forEach((stat) => {
      for (let j = 0; j < this._ColNameList.length; j++) {
        this._HeaderList +=
          stat[this._ColNameList[j]] +
          (j <= this._ColNameList.length - 2 ? "," : "");
        // headerArray.push(headers[j]);
      }
      this._HeaderList += "\n";
    });
  }

  // downloadFile() {
  //   this.GetHeaderNames();
  //   let csvData = this._HeaderList;
  //   //   console.log(csvData)
  //   if (this._StatusList.length > 0) {
  //     let blob = new Blob(["\ufeff" + csvData], {
  //       type: "text/csv;charset=utf-8;",
  //     });
  //     let dwldLink = document.createElement("a");
  //     let url = URL.createObjectURL(blob);
  //     let isSafariBrowser = -1;
  //     if (isSafariBrowser) {
  //       dwldLink.setAttribute("target", "_blank");
  //     }
  //     dwldLink.setAttribute("href", url);
  //     dwldLink.setAttribute("download", "Destruction Report" + ".csv");
  //     dwldLink.style.visibility = "hidden";
  //     document.body.appendChild(dwldLink);
  //     dwldLink.click();
  //     document.body.removeChild(dwldLink);
  //   } else {
  //     this.toastr.show(
  //       '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">There should be some data before you download!</span></div>',
  //       "",
  //       {
  //         timeOut: 3000,
  //         closeButton: true,
  //         enableHtml: true,
  //         tapToDismiss: false,
  //         titleClass: "alert-title",
  //         positionClass: "toast-top-center",
  //         toastClass:
  //           "ngx-toastr alert alert-dismissible alert-danger alert-notify",
  //       }
  //     );
  //   }
  // }

onDownload() {
  if (!this.formattedData || this.formattedData.length === 0) {
    alert('No data to download');
    return;
  }
  const cols = this.headerList ?? [];

  const headerLabels: string[] = cols.map((col: any) => col?.header ?? String(col?.field ?? col ?? ''));
  const fields: string[] = cols.map((col: any) => (typeof col === 'string' ? col : (col?.field ?? col)));

  const getByPath = (obj: any, path: string) => {
    if (!path) return undefined;
    return path.split('.').reduce((acc: any, k: string) => {
      if (acc == null) return undefined;
      const idx = Number(k);
      return Number.isInteger(idx) ? acc[idx] : acc[k];
    }, obj);
  };
  const escapeCSV = (value: any): string => {
    if (value == null) return '';
    if (value instanceof Date) value = value.toISOString();
    else if (typeof value === 'object') {
      try { value = JSON.stringify(value); } catch { value = String(value); }
    } else {
      value = String(value);
    }
    if (/[",\r\n]/.test(value)) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  };

  const rows: string[] = [];
  rows.push(headerLabels.map(h => escapeCSV(h)).join(','));

  for (const row of this.formattedData) {
    const values = fields.map((f: any) => {
      const raw = (typeof f === 'string' && f.includes('.')) ? getByPath(row, f) : row[f];
      return escapeCSV(raw);
    });
    rows.push(values.join(','));
  }

  const csvContent = '\uFEFF' + rows.join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'DestructionReport.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  this.logDownloadActivity?.();
}



  logDownloadActivity() {
    const payload = {
      pageName: 'Destruction Report',
      activity: 'Download',
      activityDescription: 'User downloaded the Destruction Report',
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

  OnReset() {
    this.Reset = true;
    this.OutReportForm.reset();
  }
  isValid() {
    return this.OutReportForm.valid;
  }





  formatDateToDDMMYYYY(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }
  isValidDate(date: any): boolean {
    if (!date || date === "0001-01-01T00:00:00") return false;
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }
}
