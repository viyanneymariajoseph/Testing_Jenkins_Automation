

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
  selector: 'app-inventory-upload-report',
  templateUrl: './inventory-upload-report.component.html',
  styleUrls: ['./inventory-upload-report.component.scss']
})
export class InventoryUploadReportComponent implements OnInit {
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
  currentDate :Date;
  _ColNameList = [
    "request_id",
    "lan_no",
    "carton_no",
    "document_type",
    "file_no",
    "created_by",
    "created_date",
    "request_status",
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
  ) {}
  ngOnInit() {
    this.currentDate = new Date();
    this.RefillingReportForm = this.formBuilder.group({
      ToDate: [],
      FromDate: [],
      status: [0],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    //this.getreffilingreport();
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
    const month = this.padZero(date.getMonth() + 1); // Months are zero-based
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
        { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'file_no', header: "file_no", index: 1 },
      { field: 'box_barcode', header: "box_barcode", index: 1 }, 
      { field: 'account_code', header: 'account_code NO', index: 2 },

      { field: 'add_date', header: "add_date", index: 1 }, 
      { field: 'description', header: 'description', index: 2 },
      { field: 'item_status', header: 'item_status', index: 2 },
      { field: 'lan_no', header: 'lan_no', index: 2 },
      { field: 'storage_type', header: 'storage_type', index: 2 },

    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        file_no: el.file_no,
        box_barcode: el.box_barcode,
        account_code: el.account_code,
        add_date: el.add_date,
        description: el.description,
        item_status: el.item_status,
        lan_no: el.lan_no,


        branch_name: el.branch_name,
        request_by: el.request_by,
        request_date: el.request_date,
        remark: el.remark,
        ack_by: el.ack_by,
        ack_date: el.ack_date,
        schedule_date: el.schedule_date
          ? this.formatDate(el.schedule_date)
          : "",
        entry_by: el.entry_by,
        pra_remark: el.pra_remark,
        request_status: el.request_status,
        created_by: el.created_by,
        created_date: el.created_date,
        carton_no: el.carton_no,
     
        disb_date: el.disb_date,
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;

     console.log(this.formattedData);
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

  getreffilingreport() {
    const apiUrl =
      this._global.baseAPIUrl + "Report/GetFileInventoryUploadReport";
    this._onlineExamService
      .postData(this.RefillingReportForm.value, apiUrl)
      // .pipe(first())

      .subscribe((data) => {
        console.log(data);
        this._StatusList = data;
        this._FilteredList = data;
        this.prepareTableData(this._StatusList, this._FilteredList);
      });
  }

  onDownload() {
    this.RefillingReportForm.controls["status"].setValue(true);
    const apiUrl =
      this._global.baseAPIUrl + "Report/GetFileInventoryUploadReport";
    this._onlineExamService
      .postData(this.RefillingReportForm.value, apiUrl)
      // .pipe(first())

      .subscribe((data) => {
        let formattedData = [];
        console.log(data);
        data.forEach((el, index) => {
          formattedData.push({

            file_no: el.file_no,
            box_barcode: el.box_barcode,
            account_code: el.account_code,
            add_date: el.add_date,
            description: el.description,
            item_status: el.item_status,
            lan_no: el.lan_no,
    
            Request_ID: el.request_id,
            Document_Type: el.document_type,
        
            app_branch_code: el.app_branch_code,
            Branch_Name: el.branch_name,
            disb_date: el.disb_date,
            zone_name: el.zone_name,
            disb_number: el.disb_number,
            applicant_name: el.applicant_name,
            scheme_name: el.scheme_name,
            smemel_product: el.smemel_product,
            total_disb_amt: el.total_disb_amt,
            pos: el.pos,
            bal_disb_amt: el.bal_disb_amt,
            schedule_date: el.schedule_date
              ? this.formatDate(el.schedule_date)
              : "",
              Inventory_By: el.created_by,
              Inventory_Date: el.created_date,
            request_status: el.request_status,
            File_Status: el.file_status,

          });
        });
        this.exportToExcel(formattedData, "Inventory Upload Report");
      });
  }

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

  downloadFile() {}
  OnReset() {
    this.Reset = true;
    this.RefillingReportForm.reset();
  }
  isValid() {
    return this.RefillingReportForm.valid;
  }
}
