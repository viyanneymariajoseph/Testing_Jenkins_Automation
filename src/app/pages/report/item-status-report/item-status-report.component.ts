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
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-item-status-report",
  templateUrl: "item-status-report.component.html",
})
export class ItemstatusreportComponent implements OnInit {
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
  downloadEnabled = false;
  currentDate: Date;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  minToDate: Date | undefined;
  maxFromDate: Date | undefined;
  _ColNameList = [

    // "Batch_ID",
    "Carton_No",
    "Warehouse_Name",
    "Item_Location",
    "Item_status",
    "Created_By",
    "Created_Date",


  ];


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
    ToDate: [],
    FromDate: [],
    status: [0],
    SearchBy: [""],
    User_Token: localStorage.getItem("User_Token"),
    createdBy: localStorage.getItem("UserID"),
  });

  this.RefillingReportForm.controls['status'].setValue(0);
  this.prepareTableData([], []);
  this.getreffilingreport();
  this.GetItemstatusreportList();
  this.downloadEnabled = false;
  this.getWarehouseList();

  this.RefillingReportForm.get('SearchBy')?.valueChanges.subscribe(() => {
    this.clearTable();
  });
}

clearTable() {
  this.formattedData = [];
  this.immutableFormattedData = [];
  this._FilteredList = [];
  this._StatusList = [];
   this.first = 0;
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

  exportToExcel(data: any[], fileName: string): void {
    // Use headerList to map field values with header names
    const exportData = data.map(row => {
      const formattedRow = {};
      this.headerList.forEach(header => {
        formattedRow[header.header] = row[header.field] ?? '';  // safe access
      });
      return formattedRow;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
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


  selectedColumns: any[] = [];
  prepareTableData(tableData, headerList) {
    debugger;
    let formattedData = [];
    loading: true;
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "cartonNo", header: "CARTON NO", index: 2 },
      { field: "warehouseName", header: "WAREHOUSE NAME", index: 2 },
      { field: "DepartmentName", header: "DEPARTMENT NAME", index: 3 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },
      { field: "documents", header: "DOUCMENT TYPE", index: 4 },
      { field: "DocumentDetails", header: "DETAIL DOC TYPE", index: 3 },
      { field: "ItemLcoation", header: "DETAIL LOCATION", index: 2 },
      { field: "ItemStatus", header: "ITEM STATUS", index: 2 },
      // { field: "createdBy", header: "INVENTORY BY", index: 2 },
      // { field: "createdDate", header: "INVENTORY ON", index: 2 },     
      { field: "warehouseLocationUpdatedBy", header: "CARTON LOCATION UPDATED BY", index: 2 },
      { field: "warehouseLocationUpdatedDate", header: "CARTON LOCATION UPDATED ON", index: 2 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),

        cartonNo: el.cartonNo,
        warehouseName: el.warehouseName,
        ItemLcoation: el.ItemLcoation,
        ItemStatus: el.ItemStatus,
        createdBy: el.createdBy,
        createdDate: el.createdDate,
        documents: el.documents,
        DocumentDetails: el.DocumentDetails,
        warehouseLocationUpdatedBy: el.warehouseLocationUpdatedBy,
        warehouseLocationUpdatedDate: el.warehouseLocationUpdatedDate,
        DepartmentName: el.DepartmentName,
        DepartmentCode: el.DepartmentCode

      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.selectedColumns = [...tableHeader];
    this.loading = false;

    // console.log(this.formattedData);
  }

  // searchTable($event) {

  //   if (!this.RefillingReportForm.controls["FromDate"].value || !this.RefillingReportForm.controls["ToDate"].value) {

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
  //           "ngx-toastr alert alert-dismissible alert-danger alert-notify"
  //       }
  //     );
  //     return;
  //   }

  searchTable($event) {
    let val = $event.target.value;
    if (val == '') {
      this.formattedData = this.immutableFormattedData;
    } else {
      let filteredArr = [];
      const strArr = val.split(',');
      this.formattedData = this.immutableFormattedData.filter(function (d) {
        for (var key in d) {
          strArr.forEach(el => {
            if (d[key] && el !== '' && (d[key] + '').toLowerCase().indexOf(el.toLowerCase()) !== -1) {
              if (filteredArr.filter(el => el.srNo === d.srNo).length === 0) {
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
    const apiUrl = this._global.baseAPIUrl + "Report/GetItemstatusreportList";
    this._onlineExamService.postData(this.RefillingReportForm.value, apiUrl).subscribe((data) => {
      // this._StatusList = data;
      // this._FilteredList = data;
      // this.prepareTableData(this._StatusList, this._FilteredList);
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
    //this._ColNameList[1] = "batch_id";
    this._ColNameList[0] = "carton_no";
    this._ColNameList[1] = "warehouse_name";
    //this._ColNameList[2] = "warehouse_location";
    this._ColNameList[2] = "item_location";
    this._ColNameList[3] = "item_status";
    this._ColNameList[4] = "created_by";
    this._ColNameList[5] = "created_date";

    // this._ColNameList[3] = "department_name";
    // this._ColNameList[4] = "batch_created_by";

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
  //      this._StatusList = data;
  //         this._FilteredList = data;
  //         this.prepareTableData(this._StatusList, this._FilteredList);
  //     } else {
  //       console.warn("No inventory data found.");
  //     }
  //   }, error => {
  //     console.error("API error:", error);
  //   });
  // }

  onFromDateChange(date: Date) {
    this.minToDate = date;

    const toDate = this.RefillingReportForm.get('DATETO')?.value;
    if (toDate && new Date(toDate) < new Date(date)) {
      this.RefillingReportForm.get('DATETO')?.setValue(null);
    }
  }

  GetItemstatusreportList() {
    const fromDateStr = this.RefillingReportForm.get('FromDate')?.value;
    const toDateStr = this.RefillingReportForm.get('ToDate')?.value;
    const token = localStorage.getItem("User_Token");
    const userId = localStorage.getItem("UserID");

    // helper to format date as YYYY-MM-DD
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

    let apiUrl = this._global.baseAPIUrl + "Report/GetItemstatusreportList?user_Token=" + token;

    if (formattedFrom) {
      apiUrl += "&FromDate=" + formattedFrom;
    }
    if (formattedTo) {
      apiUrl += "&ToDate=" + formattedTo;
    }
    if (userId) {
      apiUrl += "&UserId=" + userId;
    }

    this._onlineExamService.getAllData(apiUrl).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          const withFormattedDate = data.map((item: any) => {
            let formattedDate = '';
            if (item.CreatedDate) {
              try {
                formattedDate = formatDate(item.CreatedDate, 'yyyy-MM-dd', 'en-IN');
              } catch {
                // Ignore invalid date formatting
              }
            }
            return { ...item, CreatedDateFormatted: formattedDate };
          });

          // Apply client-side date filtering if both dates are given
          let filtered = withFormattedDate;
          if (formattedFrom && formattedTo) {
            const from = new Date(fromDateStr); from.setHours(0, 0, 0, 0);
            const to = new Date(toDateStr); to.setHours(0, 0, 0, 0);

            filtered = withFormattedDate.filter((item: any) => {
              if (!item.CreatedDate) return false;
              const created = new Date(item.CreatedDate);
              created.setHours(0, 0, 0, 0);
              return created >= from && created <= to;
            });
          }

          this._StatusList = data;
          this._FilteredList = filtered;
          this.prepareTableData(this._FilteredList, this._FilteredList);
        } else {
          this._FilteredList = [];
          this.formattedData = [];
        }
      },
      error: (err) => {
        console.error("GetItemstatusreportList Error:", err);
      }
    });
  }

  GetSearchedData() {
    const token = localStorage.getItem("User_Token");
    const userId = localStorage.getItem("UserID");
    const searchBy = this.RefillingReportForm.controls['SearchBy'].value;

    // Show toaster if SearchBy is not selected
    if (!searchBy) {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please select a Warehouse Location.</span></div>',
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

    if (!token || !userId) {
      console.error("Missing token or user ID");
      return;
    }

    const apiUrl = `${this._global.baseAPIUrl}Report/GetItemstatusreportList?user_Token=${token}&UserId=${userId}&SearchBy=${searchBy}`;

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data && data.length > 0) {
        this._StatusList = data;

        this._FilteredList = data.map((item: any) => {
          let formatted = '';
          try {
            formatted = formatDate(item.CreatedDate, 'dd-MM-yyyy', 'en-IN');
          } catch (e) {
            console.warn('Invalid date format in CreatedDate', item.CreatedDate);
          }
          return {
            ...item,
            CreatedDateFormatted: formatted
          };
        });

        this.prepareTableData(this._FilteredList, this._FilteredList);
      } else {
        this._FilteredList = [];
        this.formattedData = [];
      }
    }, error => {
      console.error("API Error:", error);
    });
  }


  onToDateChange(date: Date) {
    this.maxFromDate = date;

    const fromDate = this.RefillingReportForm.get('DATEFROM')?.value;
    if (fromDate && new Date(fromDate) > new Date(date)) {
      this.RefillingReportForm.get('DATEFROM')?.setValue(null);
    }
  }

  onSearchByDate() {
    this.GetItemstatusreportList();
  }

  downloadFile() {
    const filename = 'Warehouse Location Report';

    // CSV Header (matches the fields in prepareTableData)
    let csvData = "CARTON NO,WAREHOUSE NAME,DEPARTMENT NAME,DEPARTMENT CODE,DOUCMENT TYPE,DETAIL DOC TYPE,DETAIL LOCATION,ITEM STATUS,CARTON LOCATION UPDATED BY,CARTON LOCATION UPDATED ON\n";

    // Ensure formattedData is defined
    if (!this.formattedData || this.formattedData.length === 0) {
      console.warn("No data to download.");
      return;
    }

    // Add data rows
    this.formattedData.forEach((row: any) => {
      csvData +=
        `${row.cartonNo ?? ''},` +
        `${row.warehouseName ?? ''},` +
        `${row.DepartmentName ?? ''},` +
        `${row.DepartmentCode ?? ''},` +

        `${row.documents ?? ''},` +
        `${row.DocumentDetails ?? ''},` +
        `${row.ItemLcoation ?? ''},` +
        `${row.ItemStatus ?? ''},` +

        `${row.warehouseLocationUpdatedBy ?? ''},` +
        `${row.warehouseLocationUpdatedDate ?? ''}\n`;
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
    this.logDownloadActivity();
  }


  downloadXlsxVisible(filename = 'Warehouse Location Report', onlyCurrentPage = false) {

  let cols = (this.selectedColumns?.length ? this.selectedColumns : this.headerList) || [];


  cols = cols.filter((c: any) =>
    (c.header ?? '').toString().trim().toLowerCase() !== 'sr no'
  );

  if (!cols.length) {
    console.warn('No columns available to export.');
    return;
  }

 
  const allRows = this.formattedData || [];
  const rows = onlyCurrentPage
    ? allRows.slice(this.first, Math.min(this.first + this.rows, allRows.length))
    : allRows;

  if (!rows.length) {
    console.warn('No data to export.');
    return;
  }

  const getByPath = (obj: any, path: string) =>
    path.split('.').reduce((acc: any, k: string) => (acc == null ? acc : acc[k]), obj);

  const isLikelyISODate = (s: any) =>
    typeof s === 'string' && /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?)?$/.test(s);

  const normalizeValue = (v: any) => {
    if (v == null) return '';
    if (typeof v === 'string' && isLikelyISODate(v)) {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d;
    }
    if (typeof v === 'object') {
      try { return JSON.stringify(v); } catch { return String(v); }
    }
    return v;
  };

  const exportRows = rows.map((row: any) => {
    const out: any = {};
    cols.forEach((c: any) => {
      const field = c.field ?? c;
      const header = c.header ?? String(field);
      const value = typeof field === 'string' && field.includes('.')
        ? getByPath(row, field)
        : row[field];
      out[header] = normalizeValue(value);
    });
    return out;
  });

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportRows, { cellDates: true });
  const headers = Object.keys(exportRows[0] || {});
  ws['!cols'] = headers.map((h) => {
    const maxLen = exportRows.reduce((m, r) => {
      const v = r[h];
      const s = v instanceof Date ? v.toISOString() : (v == null ? '' : String(v));
      return Math.max(m, s.length);
    }, h.length);
    return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
  });

  const wb: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ['data'] };
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/octet-stream' });
  FileSaver.saveAs(blob, `${filename}.xlsx`);

  this.logDownloadActivity?.();
}


  logDownloadActivity() {
    const payload = {
      pageName: 'Warehouse Location Report',
      activity: 'Download',
      activityDescription: 'User downloaded the Warehouse Location Report',
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


  //Ruchi
  WarehouseList: any;
  getWarehouseList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "Warehouse/GetWarehouseLists?user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log("WareHouseList", data);
      this.WarehouseList = data;
    });
  }
  //Ruchi


}
