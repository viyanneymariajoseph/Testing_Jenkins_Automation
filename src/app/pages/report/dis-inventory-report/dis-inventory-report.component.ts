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
  selector: 'app-dis-inventory-report',
  templateUrl: './dis-inventory-report.component.html',
  styleUrls: ['./dis-inventory-report.component.scss']
})
export class DisInventoryReportComponent implements OnInit {
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
  currentDate: Date;
  _ColNameList = [
    "request_id",
    "lan_no",
    "carton_no",
    "document_type",
    "file_no",
    "created_by",
    "created_date",
    "request_status",
    "location",
    "disb_date",
    "crown_branch_name",
  ];
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
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
  loading: boolean = false;
  private formatDate(originalDateString: any) {
    const date = new Date(originalDateString);

    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1);
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

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
    let formattedData = [];
    loading: true;
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "request_id", header: "REQUEST NO", index: 2 },
      { field: "file_no", header: "FILE BARCODE", index: 2 },
      { field: "lan_no", header: "LAN NUMBER", index: 2 },
      { field: "carton_no", header: "CARTON NUMBER", index: 7 },
      { field: "disb_date", header: "DIST DATE", index: 7 },
      { field: "document_type", header: "DOCUMENT TYPE", index: 2 },
      { field: "applicant_name", header: "APPLICANT NAME", index: 2 },
      { field: "branch_name", header: "BRANCH NAME", index: 2 },
      { field: "app_branch_code", header: "BRANCH CODE", index: 2 },
      { field: "crown_branch_name", header: "CROWN BRANCH NAME", index: 2 },
      { field: "schedule_date", header: "SCHEDULE DATE", index: 2 },
      { field: "created_by", header: "INVENTORY BY", index: 2 },
      { field: "created_date", header: "INVENTORY DATE", index: 2 },
      { field: "item_status", header: "ITEM STATUS", index: 2 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        request_id: el.request_id,
        document_type: el.document_type,
        branch_name: el.branch_name,
        schedule_date: el.schedule_date ? this.formatDate(el.schedule_date) : "",
        created_by: el.created_by,
        created_date: el.created_date,
        carton_no: el.carton_no,
        lan_no: el.lan_no,
        file_no: el.file_no,
        disb_date: el.disb_date,
        item_status: el.item_status,
        app_branch_code: el.app_branch_code,
        applicant_name: el.applicant_name,
        crown_branch_name: el.crown_branch_name,
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

  getreffilingreport() {
    const apiUrl =
      this._global.baseAPIUrl + "Report/GetFileInventoryReportByDisDate";
    this._onlineExamService.postData(this.RefillingReportForm.value, apiUrl).subscribe((data) => {
      this._StatusList = data;
      this._FilteredList = data;
      this.prepareTableData(this._StatusList, this._FilteredList);
    });
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

  onDownload() {
    this.exportToExcel(this.formattedData, "Disb Inventory Report");
  }

  downloadFile() { }
  OnReset() {
    this.Reset = true;
    this.RefillingReportForm.reset();
  }
  isValid() {
    return this.RefillingReportForm.valid;
  }
}