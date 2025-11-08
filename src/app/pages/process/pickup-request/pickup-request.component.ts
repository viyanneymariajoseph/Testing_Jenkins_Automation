import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import { ToastrService } from "ngx-toastr";

import swal from "sweetalert2";
import { MatDialog } from "@angular/material/dialog";
import { NewPickupRequestComponent } from "../new-pickup-request/new-pickup-request.component";
import { PodAckComponent } from "../pod-Ack/pod-Ack.component";

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-pickup-request',
  templateUrl: './pickup-request.component.html',
  styleUrls: ['./pickup-request.component.scss']
})
export class PickupRequestComponent implements OnInit {


  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  isReadonly = true;
  _IndexList: any;
  UserID: any;
  PODEntryForm: FormGroup;
  pickupForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = '';
  _FileNo: any = "";
  first: any = 0;
  rows: any = 0;
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
    private _global: Globalconstants,
    private dialog: MatDialog
  ) { }
  ngOnInit() {
    document.body.classList.add('data-entry');
    this.pickupForm = this.formBuilder.group({
      branch_id: ['', Validators.required],
      request_id: [''],
      service_type: ['', Validators.required],
      document_type: ['', Validators.required],
      main_file_count: [null], // No validators, will be validated conditionally
      collateral_file_count: [null],
      remark: [''],
      User_Token: localStorage.getItem('User_Token'),
      userid: localStorage.getItem('UserID'),

    });

    this.getPickRequest();
    this.getAllBranchList();
  }
  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, fileName + '.xlsx');
  }
  AllBranch: any
  getAllBranchList() {
    const apiUrl = this._global.baseAPIUrl + 'BranchMaster/GetbranchDeatilsByUserId?USER_ID=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token')
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log("barnch", data)
      this.AllBranch = data
    })
    console.log(this.AllBranch)
  }
  //karta hoon integrate work ho raha abb
  getPickRequest() {

    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetAvansePickupRequestAllDeatils?UserID=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: {}) => {

      this._IndexPendingList = data;
      this._FilteredList = data;
      console.log("IndexListPending", data);
      this.prepareTableData(this._FilteredList, this._IndexPendingList);
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });
  }
  getRequestNo() {


  }
  toggleValidators() {
    const mainFileCountControl = this.pickupForm.get('main_file_count');
    const collateralFileCountControl = this.pickupForm.get('collateral_file_count');

    if (this.pickupForm.get('document_type').value === 'Main File') {
      mainFileCountControl.setValidators([Validators.required]);
      collateralFileCountControl.clearValidators();
    } else if (this.pickupForm.get('document_type').value === 'Collateral File') {
      collateralFileCountControl.setValidators([Validators.required]);
      mainFileCountControl.clearValidators();
    } else if (this.pickupForm.get('document_type').value === 'Both (Main and Collateral)') {
      collateralFileCountControl.setValidators([Validators.required]);
      mainFileCountControl.setValidators([Validators.required]);
    }
    else {
      mainFileCountControl.clearValidators();
      collateralFileCountControl.clearValidators();
    }

    mainFileCountControl.updateValueAndValidity();
    collateralFileCountControl.updateValueAndValidity();
  }
  get PickupControls() { return this.pickupForm.controls }
  onSubmit() {
    this.submitted = true;
    console.log(this.pickupForm.value)
    if (!this.pickupForm.valid) {
      return;
    }
    const that = this;
    var apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/InsertUpdatePickupRequest';
    console.log(121212)
    this._onlineExamService.postPickupRequest(this.pickupForm.value, apiUrl)
      .subscribe(data => {

        this.toastr.show(
          '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message"> ' + data + ' </span></div>',
          "",
          {
            timeOut: 3000,
            closeButton: true,
            enableHtml: true,
            tapToDismiss: false,
            titleClass: "alert-title",
            positionClass: "toast-top-center",
            toastClass:
              "ngx-toastr alert alert-dismissible alert-success alert-notify"
          }
        );



        // this.modalRef
        this.modalRef.hide();
        that.getPickRequest();
        //this.OnReset();      
      });
    // }

  }
  closeModel() {
    this.modalRef.hide()
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
      { field: 'main_file_count', header: 'REQ MAIN FILE COUNT', index: 4 },
      { field: 'collateral_file_count', header: 'REQ COLLETRAL FILE COUNT', index: 4 },
      { field: 'inward_main_file_count', header: 'INWARD MAIN FILE COUNT', index: 4 },
      { field: 'inward_collateral_file_count', header: 'INWARD COLLETRAL FILE COUNT', index: 4 },
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
      });

    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }
  
  Editinward2(car: any) {
    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetPickupRequestHistory?request_no=' + car.request_id + '&USERId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      console.log(data);
      let Data = [];
      for (let i = 0; i < data.length; i++) {
        Data.push({
          Request_Number: data[i].request_id,
          Lan_Number: data[i].lan_no,
          Carton_No: data[i].carton_no,
          File_Number: data[i].file_no,
          Applicant_Name: data[i].applicant_name,
          Branch_Name: data[i].branch_name,
          Branch_Code: data[i].app_branch_code,
          Inward_Date: data[i].created_date,
          Secured_Unsecured: data[i].secured_unsecured,
          Zone_Name: data[i].zone_name,
          Scheme_Name: data[i].scheme_name,
          Smemel_Product: data[i].smemel_product,
          Disb_Date: data[i].disb_date
        })
      }
      this.exportToExcel(Data, 'Download_Pickup_History')


    });
  }
  searchTable($event) {
    // console.log($event.target.value);

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

  OnReset() {
    this.Reset = true;
    this.isReadonly = false;

  }
  AllDataShowRowWise: any
  Editinward1(template: TemplateRef<any>, row: any) {
    this.dialog.open(PodAckComponent, {
      data: row
    })
    this.AllDataShowRowWise = row
    this.modalRef = this.modalService.show(template);
  }



  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  hidepopup() {
    // this.modalService.hide;
    this.modalRef.hide();
    //this.modalRef.hide
  }
  get FormControls() { return this.pickupForm.controls }
  Add(template: TemplateRef<any>) {
    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetAvancePickUpRequestNo?userId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token') + '&request_no=';
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {
      this.pickupForm.reset()
      this.pickupForm = this.formBuilder.group({
        branch_id: ['', Validators.required],
        request_id: [data],
        service_type: ['', Validators.required],
        document_type: ['', Validators.required],
        remark: [''],
        main_file_count: [null],
        collateral_file_count: [null],
        User_Token: localStorage.getItem('User_Token'),
        userid: localStorage.getItem('UserID'),

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
      User_Token: localStorage.getItem('User_Token'),
      userid: localStorage.getItem('UserID'),

    });


    this.modalRef = this.modalService.show(template);

  }



  Edit(data: any) {
    console.log(data.request_id)
    this.dialog.open(NewPickupRequestComponent, {
      width: "500px",
      data: data.request_id
    })

  }
  deletedata(id: any) {
    console.log(id)
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

          const apiUrl = this._global.baseAPIUrl + '/AvansePickupRequest/DeletePickupRequest?request_id=' + id + '&User_Token=' + localStorage.getItem('User_Token') + '&userid=' + localStorage.getItem('UserID');
          this._onlineExamService.DELETEData(apiUrl)
            .subscribe(data => {
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
    document.body.classList.remove('data-entry')
  }

  showmessage(data: any) {
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







}
