import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import { ToastrService } from "ngx-toastr";

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: 'app-pickup-request-report',
  templateUrl: './pickup-request-report.component.html',
  styleUrls: ['./pickup-request-report.component.scss']
})
export class PickupRequestReportComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  RefillingReportForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = '';
  _FilteredList: any;
  _StatusList: any;
  _HeaderList: any;
  _IndexPendingList: any;

  _ColNameList = ["request_id", "request_date", "request_by", "ack_date", "ack_by", "schedule_date", "reschedule_date", "request_status"];
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  first = 0;
  rows = 10;
  currentDate: Date;
  toDate: Date;


  constructor(

    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,

  ) { }
  ngOnInit() {
    this.currentDate = new Date();
    this.RefillingReportForm = this.formBuilder.group({
      ToDate: "",
      FromDate: "",
      status: [0],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),
    });
    this.getreffilingreport();
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }


  getreffilingreport1() {
    if (this.RefillingReportForm.value.ToDate && this.RefillingReportForm.value.FromDate) {
      this.RefillingReportForm.controls['status'].setValue(1);
      this.getreffilingreport();
    } else {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please select from date and to date!</span></div>',
        "",
        { timeOut: 3000, closeButton: true, enableHtml: true, tapToDismiss: false, titleClass: "alert-title", positionClass: "toast-top-center", toastClass:
            "ngx-toastr alert alert-dismissible alert-danger alert-notify"
        }
      );
    }
  }

  getreffilingreport() {
    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetPickupRequestReport';
    this._onlineExamService.postData(this.RefillingReportForm.value, apiUrl)
      .subscribe(data => {
        this._StatusList = data;
        this._FilteredList = data;
        this.prepareTableData(this._StatusList, this._FilteredList);
      });
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
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
      // { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'request_id', header: 'REQUEST NO', index: 2 },
      { field: 'service_type', header: 'SERVICE TYPE', index: 2 },
      { field: 'document_type', header: 'DOCUMENT TYPE', index: 3 },
      { field: "main_file_count", header: "REQ MAIN FILE COUNT", index: 4 },
      { field: "collateral_file_count", header: "REQ COLLETRAL FILE COUNT", index: 4, },
      { field: "inward_main_file_count", header: "INWARD MAIN FILE COUNT", index: 4, },
      { field: "inward_collateral_file_count", header: "INWARD COLLETRAL FILE COUNT", index: 4, },
      { field: 'branch_code', header: 'BRANCH CODE', index: 7 },
      { field: 'branch_name', header: 'BRANCH NAME', index: 7 },
      { field: 'request_by', header: 'REQUESTED BY', index: 2 },
      { field: 'request_date', header: 'REQUEST DATE', index: 7 },
      { field: 'remark', header: 'REQUESTOR REMARK', index: 7 },
      { field: 'ack_by', header: 'ACKNOWLEDGE BY', index: 2 },
      { field: 'ack_date', header: 'ACKNOWLEDGE DATE', index: 2 },
      { field: 'pra_remark', header: 'ACK REMARK', index: 7 },
      { field: 'entry_by', header: 'SCHEDULED BY', index: 2 },
      { field: 'schedule_date', header: 'SCHEDULED DATE', index: 2 },
      { field: 'pickedup_by', header: 'PICKED UP BY', index: 2 },
      { field: 'pickedup_date', header: 'PICKED UP DATE', index: 2 },
      { field: 'pickedup_remark', header: 'PICKED UP REMARK', index: 2 },
      { field: 'InwardBy', header: 'INWARD BY', index: 2 },
      { field: "request_status", header: "REQUEST STATUS", index: 4 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'request_id': el.request_id,
        'service_type': el.service_type,
        'document_type': el.document_type,
        'main_file_count': el.main_file_count,
        'collateral_file_count': el.collateral_file_count,
        'inward_main_file_count': el.inward_main_file_count,
        'inward_collateral_file_count': el.inward_collateral_file_count,
        'branch_id': el.branch_id,
        'branch_code': el.branch_code,
        'branch_name': el.branch_name,
        'request_by': el.request_by,
        'request_date': el.request_date,
        'remark': el.remark,
        'ack_by': el.ack_by,
        'ack_date': el.ack_date,
        'schedule_date': el.schedule_date ? this.formatDate(el.schedule_date) : "",
        'entry_by': el.entry_by,
        'pra_remark': el.pra_remark,
        'request_status': el.request_status,
        'created_by': el.created_by,
        'created_date': el.created_date,
        'vehicle_number': el.vehicle_number,
        'reschedule_reason': el.reschedule_reason,
        'reschedule_date': el.reschedule_date ? this.formatDate(el.reschedule_date) : "",
        'escort_name': el.escort_name,
        'escort_number': el.escort_number,
        'pickedup_by': el.pickedup_by,
        'pickedup_date': el.pickedup_date,
        'pickedup_remark': el.pickedup_remark,
        'InwardBy': el.InwardBy,
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

  onDownload() {
    this.exportToExcel(this.formattedData, "Pickup Report");
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

  downloadFile() {
    this.GetHeaderNames()
    let csvData = this._HeaderList;
    if (this._StatusList.length > 0) {
      let blob = new Blob(['\ufeff' + csvData], {
        type: 'text/csv;charset=utf-8;'
      });
      let dwldLink = document.createElement("a");
      let url = URL.createObjectURL(blob);
      let isSafariBrowser = -1;
      if (isSafariBrowser) {
        dwldLink.setAttribute("target", "_blank");
      }
      dwldLink.setAttribute("href", url);
      dwldLink.setAttribute("download", "Pickup Report" + ".csv");
      dwldLink.style.visibility = "hidden";
      document.body.appendChild(dwldLink);
      dwldLink.click();
      document.body.removeChild(dwldLink);
    } else {
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
    }
  }
  OnReset() {
    this.Reset = true;
    this.RefillingReportForm.reset();
  }
  isValid() {
    return this.RefillingReportForm.valid
  }
}
