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
  selector: "app-dump-report",
  templateUrl: "dump-report.component.html",
})
export class DumpreportComponent implements OnInit {
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
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    this.getreffilingreport();
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
    let tableHeader = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'lan_no', header: 'LAN NO', index: 3 },
      { field: 'branch_name', header: 'BRANCH NAME', index: 6 },
      { field: 'app_branch_code', header: 'APP BRANCH CODE', index: 7 },
      { field: 'applicant_name', header: 'APPLICANT NAME', index: 7 },
      { field: 'Disbursement_Date', header: 'DISBURSEMENT DATE', index: 7 },
      { field: 'Upload_By', header: 'UPLOAD BY', index: 8 },
      { field: 'UploadAt', header: 'UPLOAD AT', index: 9 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),  // Serial Number
        'lan_no': el.lan_no,
        'branch_name': el.branch_name,
        'app_branch_code': el.app_branch_code,
        'applicant_name': el.applicant_name,
        'Disbursement_Date': el.Disbursement_Date,
        'Upload_By': el.Upload_By,
        'UploadAt': el.UploadAt,
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
    const apiUrl = this._global.baseAPIUrl + "Report/GetDumpReport";
    this._onlineExamService
      .postData(this.RefillingReportForm.value, apiUrl)
      .subscribe((data) => {
        this._StatusList = data;
        this._FilteredList = data;
        this.prepareTableData(this._StatusList, this._FilteredList);
      });
  }


  onDownload() {
    this.exportToExcel(this.formattedData, "Inventory Pending Report");
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
