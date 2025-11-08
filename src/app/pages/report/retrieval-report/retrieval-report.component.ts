import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import noUiSlider from "nouislider";
import Dropzone from "dropzone";
Dropzone.autoDiscover = false;
import Selectr from "mobius1-selectr";
import swal from "sweetalert2";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-retrieval-report",
  templateUrl: "retrieval-report.component.html",
})
export class RetrievalreportComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  RetrievalReportForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = '';
  _FilteredList: any;
  _StatusList: any;
  _HeaderList: any;
  _IndexPendingList: any;
  _ColNameList = ["request_number", "retrival_type", "item_code", "item_number", "branch_name", "lan_no", "disb_date", "created_by", "retrival_request_date", "request_close_date", "pod_entry_by", "pod_entry_date", "item_status", "retrival_remark", "page_count"];
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  minToDate: Date | undefined;
  maxFromDate: Date | undefined;
  first = 0;
  rows = 10;
  currentDate: Date;
  constructor(

    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,

  ) { }
  ngOnInit() {
    this.currentDate = new Date();
    this.RetrievalReportForm = this.formBuilder.group({
      FromDate: ['', Validators.required],
      ToDate: ['', Validators.required],
      // status: [0],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),
    });
    this.prepareTableData([], []);
    this.getretrievalreport();
    this.RetrievalReportForm.get('FromDate')?.valueChanges.subscribe(() => {
      this.clearLogTable();
    });

    this.RetrievalReportForm.get('ToDate')?.valueChanges.subscribe(() => {
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

  // getretrievalreport1() {
  //   debugger;
  //   if (this.RetrievalReportForm.value.ToDate && this.RetrievalReportForm.value.FromDate) {
  //     if(this.RetrievalReportForm.controls['status'].value == "1"){
  //       this.RetrievalReportForm.controls['status'].setValue("1");
  //     }
  //     else if(this.RetrievalReportForm.controls['status'].value == "2"){
  //       this.RetrievalReportForm.controls['status'].setValue("2");
  //     }
  //     else if(this.RetrievalReportForm.controls['status'].value == "3"){
  //       this.RetrievalReportForm.controls['status'].setValue("3");
  //     }
  //     else if(this.RetrievalReportForm.controls['status'].value == "4"){
  //       this.RetrievalReportForm.controls['status'].setValue("4");
  //     }
  //     else if(this.RetrievalReportForm.controls['status'].value == "5"){
  //       this.RetrievalReportForm.controls['status'].setValue("5");
  //     }
  //     this.getretrievalreport();
  //   } else {
  //     this.toastr.show(
  //       '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please select from date and to date!</span></div>',
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

  //   }

  // }

  getretrievalreport() {
    debugger;

    const fromDateStr = this.RetrievalReportForm.get('FromDate')?.value;
    const toDateStr = this.RetrievalReportForm.get('ToDate')?.value;
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

    // FIX: make this let, so you can append
    let apiUrl = this._global.baseAPIUrl + 'Report/GetRetrievalReport?user_Token=' + token;

    if (formattedFrom) apiUrl += `&FromDate=${formattedFrom}`;
    if (formattedTo) apiUrl += `&ToDate=${formattedTo}`;
    if (userId) apiUrl += `&UserId=${userId}`;

    this._onlineExamService.getAllData(apiUrl).subscribe({
      next: (data: any) => {
        console.log("retrieval report data:", data);
        this._StatusList = data;
        this._FilteredList = data;
        this.prepareTableData(data, data);
      },
      error: err => {
        console.error('getretrievalreport Error:', err);
      }
    });
  }

  normalizeDate(dateStr: string | null): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (
      isNaN(date.getTime()) ||
      date.getFullYear() < 1753
    ) {
      return null;
    }
    return dateStr;
  }


  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;

  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: 'RequestID', header: 'REQUEST NO', index: 5 },
      { field: 'CartonNo', header: 'CARTON NO', index: 4 },
      { field: "ItemStatus", header: "ITEM STATUS", index: 2 },
      { field: 'FileStatus', header: 'CARTON STATUS', index: 10 },
      { field: 'RequestStatus', header: 'REQUEST STATUS', index: 8 },
      { field: "DepartmentName", header: "DEPARTMENT NAME", index: 3 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },
      { field: "documents", header: "DOCUMENT TYPE", index: 3 },
      { field: "DocumentDetails", header: "DOCUMENT DETAILS", index: 4 },
      { field: "ReteionPeriod", header: "RETENTION PERIOD", index: 2 },
      { field: "warehouseName", header: "WAREHOUSE NAME", index: 2 },
      { field: "ItemLcoation", header: "DETAIL LOCATION", index: 2 },
      { field: 'RetrievalBy', header: 'RETRIEVAL REQUEST BY', index: 17 },
      { field: 'RetrievalDate', header: 'RETRIEVAL REQUEST ON', index: 19 },
      { field: 'ApprovalBy', header: 'RETRIEVAL APPROVED BY', index: 3 },
      { field: 'ApprovalDate', header: 'RETRIEVAL APPROVED ON', index: 3 },
      { field: 'RejectAt', header: 'RETRIEVAL REJECTED AT', index: 3 },

      { field: 'RejectBy', header: 'RETRIEVAL REJECTED BY', index: 3 },
      { field: 'RejectDate', header: 'RETRIEVAL REJECTED ON', index: 3 },

      { field: 'RetrievalDispatchBy', header: 'RETRIEVAL DISPATCH BY', index: 3 },
      { field: 'RetrievalDispatchDate', header: 'RETRIEVAL SCHEDULE MADE ON', index: 3 },
      { field: 'pickupDate', header: 'EXPECTED DATE OF DELIVERY', index: 15 },

      { field: 'RetrievalAckBy', header: 'RETRIEVAL ACK BY', index: 16 },
      { field: 'RetrievalAckDate', header: 'RETRIEVAL ACK ON', index: 3 },
      { field: 'remark', header: 'RETRIEVAL REMARK', index: 9 },

      // { field: 'status', header: 'RETURN REQUEST STATUS', index: 3 },
      // { field: 'ReturnRequestBy', header: 'RETURN REQUEST BY', index: 12 },
      // { field: 'ReturnRequestDate', header: 'RETURN REQUEST ON', index: 13 },
      // { field: 'approvedBy', header: 'RETURN REQUEST APPROVED BY', index: 13 },
      // { field: 'approvedDate', header: 'RETURN REQUEST APPROVED ON', index: 15 },
      // { field: 'WarehouseReturnAckBy', header: 'RETURN REQUEST ACK BY', index: 13 },
      // { field: 'WarehouseReturnAckDate', header: 'RETURN REQUEST ACK ON', index: 13 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),

        'RequestID': el.RequestID,
        'CartonNo': el.CartonNo,
        'FileStatus': el.FileStatus,
        'RequestStatus': el.RequestStatus,
        'ReteionPeriod': el.ReteionPeriod,
        'remark': el.remark,
        'warehouseName': el.warehouseName,
        'ItemLcoation': el.ItemLcoation,
        'ItemStatus': el.ItemStatus,
        'RetrievalBy': el.RetrievalBy,
        'RetrievalDate': el.RetrievalDate,
        'ApprovalBy': el.ApprovalBy,
        'ApprovalDate': el.ApprovalDate,
        'RetrievalDispatchBy': el.RetrievalDispatchBy,
        'RetrievalDispatchDate': el.RetrievalDispatchDate,
        'RetrievalAckBy': el.RetrievalAckBy,
        'RetrievalAckDate': el.RetrievalAckDate,
        'RejectBy': el.RejectBy,
        'RejectDate': el.RejectDate,
        'status': el.status,
        'ReturnRequestBy': el.ReturnRequestBy,
        'ReturnRequestDate': el.ReturnRequestDate,
        'approvedBy': el.approvedBy,
        'approvedDate': el.approvedDate,
        'pickupDate': el.pickupDate,
        'WarehouseReturnAckBy': el.WarehouseReturnAckBy,
        'WarehouseReturnAckDate': el.WarehouseReturnAckDate,
        'DepartmentName': el.DepartmentName,
        'DepartmentCode': el.DepartmentCode,
        'documents': el.documents,
        'DocumentDetails': el.DocumentDetails,
        'RejectAt': el.RejectAt
      });
    });

    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }


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

  onDownload() {
    debugger;
    this.exportToExcel(this.formattedData, "Retrieval Report");
    this.logDownloadActivity();
  }

  exportToExcel(data: any[], fileName: string): void {
    const orderedHeaders = this.headerList; // Already sorted
    const headerFields = orderedHeaders.map(h => h.field);
    const headerNames = orderedHeaders.map(h => h.header);

    // Reorder data to match headerFields
    const orderedData = data.map(row => {
      const newRow: any = {};
      headerFields.forEach(field => {
        newRow[field] = row[field] ?? ''; // handle undefined/null
      });
      return newRow;
    });

    // Generate worksheet with custom headers
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(orderedData, { header: headerFields });

    // Replace the default headers with custom headers (user-friendly names)
    XLSX.utils.sheet_add_aoa(worksheet, [headerNames], { origin: "A1" });

    // Create workbook and export
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

  onFromDateChange(date: Date) {
    this.RetrievalReportForm.get('FromDate')?.setValue(date);
    this.minToDate = date;

    const toDate = this.RetrievalReportForm.get('ToDate')?.value;
    if (toDate && new Date(toDate) < new Date(date)) {
      this.RetrievalReportForm.get('ToDate')?.setValue(null);
    }
  }

  logDownloadActivity() {
    const payload = {
      pageName: 'Retrieval Report',
      activity: 'Download',
      activityDescription: 'User downloaded the Retrieval Report',
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

      this._HeaderList += this._ColNameList[j] + ((j <= this._ColNameList.length - 2) ? ',' : '');
    }
    this._HeaderList += '\n'
    this._StatusList.forEach(stat => {
      for (let j = 0; j < this._ColNameList.length; j++) {
        this._HeaderList += (stat[this._ColNameList[j]]) + ((j <= this._ColNameList.length - 2) ? ',' : '');
      }
      this._HeaderList += '\n'
    });
  }

  OnReset() {
    this.Reset = true;
    this.RetrievalReportForm.reset();
  }
  isValid() {
    return this.RetrievalReportForm.valid
  }


  onToDateChange(date: Date) {
    this.maxFromDate = date;

    const fromDate = this.RetrievalReportForm.get('FromDate')?.value;
    if (fromDate && new Date(fromDate) > new Date(date)) {
      this.RetrievalReportForm.get('FromDate')?.setValue(null); // reset invalid date
    }
  }
}

