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
import { ActivatedRoute, Router } from "@angular/router";
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
  selector: "app-refilling",
  templateUrl: "./refilling.component.html",
  styleUrls: ["./refilling.component.scss"],
})
export class RefillingComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  modalRef1: BsModalRef;
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
  rows1: any = 0;
  _IndexPendingListFile: any;
  _FilteredListFile: any;
  _TotalPages: any = 0;
  _FileList: any;
  _FilteredList: any;
  _IndexPendingList: any;
  bsValue = new Date();
  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) { }
  ngOnInit() {
    document.body.classList.add("data-entry");
    this.pickupForm = this.formBuilder.group({
      request_number: ["", Validators.required],
      item_code: [""],
      item_number: ["", Validators.required],
      CSVData: [],
      User_Token: localStorage.getItem("User_Token"),
      userid: localStorage.getItem("UserID"),
    });

    this.getPickRequest();
    this.getAllBranchList();
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
  AllBranch: any;
  getAllBranchList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchMaster/GetbranchDeatilsByUserId?USER_ID=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log("barnch", data);
      this.AllBranch = data;
    });
    console.log(this.AllBranch);
  }

  getPickRequest() {
    const apiUrl =
      this._global.baseAPIUrl +
      "Retrival/GetRefillingRequest?USERId=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingList = data;
      this._FilteredList = data;
      console.log("IndexListPending", data);
      this.prepareTableData(this._FilteredList, this._IndexPendingList);
    });
  }

  getPickRequestforRequest(data: any) {
    const apiUrl1 =
    this._global.baseAPIUrl + "Retrival/GetRefilingRequestDataByRequestNo?userId=" + localStorage.getItem("UserID") + "&request_no=" + data + "&user_Token=" + localStorage.getItem("User_Token");
    this._onlineExamService
      .getAllPickupData(apiUrl1)
      .subscribe((data1: any) => {
        console.log(data1);
        this.prepareTableData1(data1, data1);
      });
  }

  getRequestNo() { }

  AllData: any;
  AllLanData: any;
  downloadFile() {
    const filename = "Refilling_Request_BulkFormat";
    let csvData = "item_number";
    let blob = new Blob(["\ufeff" + csvData], {
      type: "text/csv;charset=utf-8;",
    });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = -1;

    if (isSafariBrowser) {
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }
  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }
  _CSVData: any;
  getHeaderArray(csvRecordsArr: any) {
    var headers;
    headers = ["item_number"];
    return headers;
  }

  _ColNameList = [];
  getDisplayNames(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(",");
    let headerArray = [];
    if (headers.length != 1) {
      var msg = "Invalid No. of Column Expected :- " + 1;
      this.ShowErrormessage(msg);
      return false;
    }
    this._ColNameList[0] = "item_number";
    return true;
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

  upload() {
    this.pickupForm.patchValue({
      CSVData: this._CSVData,
    });
    let request_no = this.pickupForm.controls['request_number'].value;
    const apiUrl = this._global.baseAPIUrl + "Retrival/refilingdumpupload";
    this._onlineExamService
      .postData(this.pickupForm.value, apiUrl)
      .subscribe((data) => {
        console.log(data);
        this.downloadFilestatus(data);
        this.getPickRequest();
        this.getPickRequestforRequest(request_no);
        this.modalRef1.hide();
      });
  }

  downloadFilestatus(strmsg: any) {
    const filename = "Record Refilling upload status";
    let blob = new Blob(["\ufeff" + strmsg], {
      type: "text/csv;charset=utf-8;",
    });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = -1;
    if (isSafariBrowser) {
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  openPopup(BranchFormPopup: any) {
    this.modalRef1 = this.modalService.show(BranchFormPopup);
  }

  ShowMessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title success" data-notify="title">Success ! </span> <span data-notify="message"> ' +
      data +
      " </span></div>",
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title success",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-success alert-notify",
      }
    );
  }

  validation() {
    if (this.pickupForm.value.appl <= 0) {
      this.ShowErrormessage("Select appl value");
      return false;
    }

    if (
      this.pickupForm.value.BatchNo == "" ||
      this.pickupForm.value.BatchNo == null
    ) {
      this.ShowErrormessage("Enter Batch No value");
      return false;
    }

    if (
      this.pickupForm.value.apac == "" ||
      this.pickupForm.value.apac == null
    ) {
      this.ShowErrormessage("Enter Apac value");
      return false;
    }
    if (
      this.pickupForm.value.File_No == "" ||
      this.pickupForm.value.File_No == null
    ) {
      this.ShowErrormessage("Enter File No");
      return false;
    }

    return true;
  }

  records: any;
  fileReset() {
    this.records = [];
  }

  uploadListener($event: any): void {
    let text = [];
    let files = $event.srcElement.files;
    if (this.isValidCSVFile(files[0])) {
      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);
      $(".selected-file-name").html(input.files[0].name);
      reader.onload = () => {
        let csvData = reader.result;
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
        let headersRow = this.getHeaderArray(csvRecordsArray);
        this._CSVData = csvRecordsArray;
        this._IndexList = csvRecordsArray;
        console.log(this._CSVData);
        let validFile = this.getDisplayNames(csvRecordsArray);
        if (validFile == false) {
          this.fileReset();
        } else {
          this.records = this.getDataRecordsArrayFromCSVFile(
            csvRecordsArray,
            headersRow.length
          );
          (<HTMLInputElement>document.getElementById("csvReader")).value = "";
        }
      };

      reader.onerror = function () {
      };
    } else {
      this.fileReset();
    }
    this._FilteredList = this.records;
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    let csvArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (<string>csvRecordsArray[i]).split(",");
      if (curruntRecord.length == headerLength) {
        const single = [];
        for (let i = 0; i < this._ColNameList.length; i++) {
          single.push(curruntRecord[i].toString().trim());
        }
        csvArr.push(single);
      }
    }
    return csvArr;
  }

  toggleValidators() {
    const mainFileCountControl = this.pickupForm.get("main_file_count");
    const collateralFileCountControl = this.pickupForm.get(
      "collateral_file_count"
    );

    if (this.pickupForm.get("document_type").value === "Main File") {
      mainFileCountControl.setValidators([Validators.required]);
      collateralFileCountControl.clearValidators();
    } else if (
      this.pickupForm.get("document_type").value === "Collateral File"
    ) {
      collateralFileCountControl.setValidators([Validators.required]);
      mainFileCountControl.clearValidators();
    } else if (
      this.pickupForm.get("document_type").value ===
      "Both (Main and Collateral)"
    ) {
      collateralFileCountControl.setValidators([Validators.required]);
      mainFileCountControl.setValidators([Validators.required]);
    } else {
      mainFileCountControl.clearValidators();
      collateralFileCountControl.clearValidators();
    }

    mainFileCountControl.updateValueAndValidity();
    collateralFileCountControl.updateValueAndValidity();
  }
  get PickupControls() {
    return this.pickupForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    console.log(this.pickupForm.value);
    if (!this.pickupForm.valid) {
      return;
    }
    console.log(this.pickupForm.value);
    const that = this;
    var apiUrl = this._global.baseAPIUrl + "Retrival/AddRefilingRequest";

    this._onlineExamService
      .postPickupRequest(this.pickupForm.value, apiUrl)
      .subscribe((data) => {
        this.showmessage(data);
        apiUrl =
          this._global.baseAPIUrl +
          "Refilling/GetAvanceRefillingRequestNumber?userId=" +
          localStorage.getItem("UserID") +
          "&user_Token=" +
          localStorage.getItem("User_Token") +
          "&request_no=";
        this._onlineExamService
          .getAllPickupData(apiUrl)
          .subscribe((data: any) => {
            this.pickupForm.reset();
            this.pickupForm = this.formBuilder.group({
              request_number: [data, Validators.required],
              item_code: [""],
              CSVData: [],
              item_number: ["", Validators.required],
              User_Token: localStorage.getItem("User_Token"),
              userid: localStorage.getItem("UserID"),
            });
            const apiUrl1 =
              this._global.baseAPIUrl +
              "Retrival/GetRefilingRequestDataByRequestNo?userId=" +
              localStorage.getItem("UserID") +
              "&request_no=" +
              data +
              "&user_Token=" +
              localStorage.getItem("User_Token");
            this._onlineExamService
              .getAllPickupData(apiUrl1)
              .subscribe((data1: any) => {
                console.log(data1);
                this.prepareTableData1(data1, data1);
              });
          });
      });
  }

  closeModel() {
    this.modalRef.hide();
  }

  closeModel1() {
    this.modalRef1.hide();
  }

  closeRequest() {
    const apiUrl1 =
      this._global.baseAPIUrl +
      "Retrival/CloseRefilingRequest?USERId=" +
      localStorage.getItem("UserID") +
      "&request_number=" +
      this.pickupForm.get("request_number").value +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService
      .getAllPickupData(apiUrl1)
      .subscribe((data1: any) => {
        console.log(data1);
        this.showmessage(data1);
        this.pickupForm = this.formBuilder.group({
          request_number: ["", Validators.required],
          item_code: [""],
          CSVData: [],
          item_number: ["", Validators.required],
          User_Token: localStorage.getItem("User_Token"),
          userid: localStorage.getItem("UserID"),
        });
        this.closeModel();
      });
  }

  formattedData: any = [];
  formattedData1: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;

  headerList1: any;
  immutableFormattedData1: any;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'request_number', header: 'REF REQUEST NUMBER', index: 2 },
      { field: 'FileCount', header: 'REQUEST FILE COUNT', index: 2 },
      { field: 'crown_branch_name', header: 'CROWN BRANCH NAME', index: 2 },
      { field: 'request_status', header: 'REQUEST STATUS', index: 3 },
      { field: 'request_close_date', header: 'REF REQUEST DATE', index: 4 },
      { field: 'request_close_by', header: 'REF REQUEST BY', index: 4 },
      { field: 'ack_by', header: 'ACK BY', index: 4 },
      { field: 'ack_date', header: 'ACK DATE', index: 5 },
      { field: 'pickup_date', header: 'PICKUP DATE', index: 8 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        "request_number": el.request_number,
        'request_close_by': el.request_close_by,
        'request_close_date': el.request_close_date,
        'pickup_date': el.pickup_date,
        'ack_by': el.ack_by,
        'ack_date': el.ack_date,
        'file_ack_by': el.file_ack_by,
        'file_ack_date': el.file_ack_date,
        'request_status': el.request_status,
        'FileCount': el.FileCount,
        'crown_branch_name': el.crown_branch_name
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  Editinward2(car: any) {
    const apiUrl =
      this._global.baseAPIUrl +
      "AvansePickupRequest/GetFileInventoryByRequestNo?request_id=" +
      car.request_id +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.exportToExcel(data, "Download");
    });
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
      this.formattedData = this.immutableFormattedData1.filter(function (d) {
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

  OnReset() {
    this.Reset = true;
    this.isReadonly = false;
  }
  AllDataShowRowWise: any;
  Editinward1(template: TemplateRef<any>, row: any) {
    console.log(row);
    this.pickupForm.get("request_number").setValue(row.request_number);
    const apiUrl1 =
      this._global.baseAPIUrl +
      "Retrival/GetRefilingRequestDataByRequestNo?userId=" +
      localStorage.getItem("UserID") +
      "&request_no=" +
      row.request_number +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService
      .getAllPickupData(apiUrl1)
      .subscribe((data1: any) => {
        console.log("my", data1);
        this.prepareTableData1(data1, data1);
      });
    this.modalRef = this.modalService.show(template);
  }

  prepareTableData1(tableData, headerList) {
    console.log(tableData);
    let formattedData = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "request_number", header: "REQUEST NUMBER", index: 2 },
      { field: "item_code", header: "ITEM CODE", index: 2 },
      { field: "item_number", header: "ITEM NUMBER", index: 3 },
      { field: "created_by", header: "REFILLING BY", index: 3 },
      { field: "created_date", header: "REFILLING DATE", index: 7 },
    ];

    tableData.forEach((el, index) => {
      console.log(el);
      formattedData.push({
        srNo: parseInt(index + 1),
        request_number: el.request_number,
        item_code: el.item_code,
        item_number: el.item_number,
        created_by: el.created_by,
        created_date: el.created_date,
      });
    });
    this.headerList1 = tableHeader;
    this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
    this.formattedData1 = formattedData;
    this.loading = false;
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
  }

  get FormControls() {
    return this.pickupForm.controls;
  }

  Add(template: TemplateRef<any>) {
    const apiUrl =
      this._global.baseAPIUrl +
      "Refilling/GetAvanceRefillingRequestNumber?userId=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token") +
      "&request_no=";
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {
      this.pickupForm.reset();
      this.pickupForm = this.formBuilder.group({
        request_number: [data, Validators.required],
        item_code: [""],
        CSVData: [],
        item_number: ["", Validators.required],
        User_Token: localStorage.getItem("User_Token"),
        userid: localStorage.getItem("UserID"),
      });
      const apiUrl1 =
        this._global.baseAPIUrl +
        "Retrival/GetRefilingRequestDataByRequestNo?userId=" +
        localStorage.getItem("UserID") +
        "&request_no=" +
        data +
        "&user_Token=" +
        localStorage.getItem("User_Token");
      this._onlineExamService
        .getAllPickupData(apiUrl1)
        .subscribe((data1: any) => {
          console.log(data1);
          this.prepareTableData1(data1, data1);
        });
      this.modalRef = this.modalService.show(template);
    });
    var that = this;
  }

  Editinward(template: TemplateRef<any>, row: any) {
    var that = this;
    this.pickupForm = this.formBuilder.group({
      branch_id: [row.branch_id],
      request_id: [row.request_id],
      service_type: [row.service_type, Validators.required],
      document_type: [row.document_type, Validators.required],
      remark: [row.remark],
      main_file_count: [row.main_file_count],
      collateral_file_count: [row.collateral_file_count],
      User_Token: localStorage.getItem("User_Token"),
      userid: localStorage.getItem("UserID"),
    });

    this.modalRef = this.modalService.show(template);
  }

  Edit(data: any) {
    console.log(data.request_id);
  }

  deletedata(id: any) {
    console.log(id);
    swal
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonClass: "btn btn-danger",
        confirmButtonText: "Yes, delete it!",
        cancelButtonClass: "btn btn-secondary",
      })
      .then((result) => {
        if (result.value) {
          const apiUrl =
            this._global.baseAPIUrl +
            "/AvansePickupRequest/DeletePickupRequest?request_id=" +
            id +
            "&User_Token=" +
            localStorage.getItem("User_Token") +
            "&userid=" +
            localStorage.getItem("UserID");
          this._onlineExamService.DELETEData(apiUrl).subscribe((data) => {
            swal.fire({
              title: "Deleted!",
              text: "Folder has been deleted.",
              type: "success",
              buttonsStyling: false,
              confirmButtonClass: "btn btn-primary",
            });
          });
        }
      });
    this.getPickRequest();
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

  showmessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message"> ' +
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
}
