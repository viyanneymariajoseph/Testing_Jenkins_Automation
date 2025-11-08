import { Globalconstants } from "./../../../Helper/globalconstants";
import { OnlineExamServiceService } from "./../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormControl, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { HttpEventType, HttpClient } from '@angular/common/http';
import swal from "sweetalert2";
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Router } from "@angular/router";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: 'app-retirval-dispatch',
  templateUrl: './retirval-dispatch.component.html',
  styleUrls: ['./retirval-dispatch.component.scss']
})
export class RetirvalDispatchComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  deliverytypeforaccess: any;
  DispatchList: any;
  _FilteredList: any;
  _HeaderList: any; n
  AddPODEntryForm: FormGroup;
  AddSoftCopyForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  _IndexPendingListFile: any;
  _FilteredListFile: any;
  _FileNoList: any;
  PODEntry: any;
  first = 0;
  firstAccess = 0;
  firstDispatch = 0;
  currentDate: Date;
   minDeliveryDate: Date;
  rows = 10;
  myFiles: string[] = [];
  showBulkRequest: boolean = false;
  first1: any = 0;
  rows1: any = 0;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    public router: Router,
    private httpService: HttpClient,
  ) { }

 ngOnInit() {
  this.currentDate = new Date();

  // tomorrow as min date
  this.minDeliveryDate = new Date();
  this.minDeliveryDate.setDate(this.minDeliveryDate.getDate() + 1);

  this.AddPODEntryForm = this.formBuilder.group({
    request_number: [''],
    ExpDeliveryDate: ['', [Validators.required, this.futureDateValidator]],
    Remark: [''],
    CreatedBy: localStorage.getItem('UserID'),
    User_Token: localStorage.getItem('User_Token'),
  });

  this.getRetrievalDispatchList();
  this.PODEntry = "Create POD Entry";
}
futureDateValidator(control: FormControl) {
  if (!control.value) return null;

  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // tomorrow as minimum
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return selectedDate >= tomorrow ? null : { futureDate: true };
}


  get f() {
    return this.AddPODEntryForm.controls;
  }

  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, fileName + '.xlsx');
  }

  getRetrievalDispatchList() {
    const apiUrl = this._global.baseAPIUrl + 'OCBCRetrival/GetDispatchPendingData?&USERId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this._FilteredList = data;
      this.prepareTableData(this._FilteredList, this._FilteredList)
    });
  }

  GetTableData(request_number: any) {
    const apiUrl = this._global.baseAPIUrl + 'OCBCRetrival/GetDispatchDataByRequestNo?&USERId=' + localStorage.getItem('UserID') + '&request_number=' + request_number + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this._FilteredList = data;
      this.prepareTableData1(this._FilteredList, this._FilteredList)
    });
  }


    DispatchRequest(template: TemplateRef<any>, row: any) {
  this.modalRef = this.modalService.show(template);
 
  // Reset form fields when opening the modal
  this.AddPODEntryForm.patchValue({
    request_number: row.request_number,
    ExpDeliveryDate: '',
    Remark: ''
  });
 
  // If needed, reset validation state
  this.AddPODEntryForm.markAsPristine();
  this.AddPODEntryForm.markAsUntouched();
  this.AddPODEntryForm.updateValueAndValidity();
 
  this.GetTableData(row.request_number);
}
 

  get PickupControls() { return this.AddPODEntryForm.controls }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'request_number', header: 'REQUEST NUMBER', index: 1 },
      { field: 'department', header: 'DEPARTMENT NAME', index: 1 },
 //     { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },
  //    { field: "WarehouseName", header: "WAREHOUSE NAME", index: 3 },
   //   { field: "ItemLcoation", header: "ITEM LOCATION", index: 3 },      
      { field: 'NoOfCartons', header: 'NO OF CARTONS', index: 2 },
            { field: 'RequestStatus', header: 'REQUEST STATUS', index: 8 },

      { field: 'RetrievalBy', header: 'REQUEST BY', index: 3 },
      { field: 'RetrievalDate', header: 'REQUEST ON', index: 4 },
      { field: 'ApprovalBy', header: 'APPROVED BY', index: 3 },
      { field: 'ApprovalDate', header: 'APPROVED ON', index: 4 },
      // { field: 'BatchStatus', header: 'BATCH STATUS', index: 9 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'request_number': el.request_number,
        'department': el.department,
        'NoOfCartons': el.NoOfCartons,
        'RetrievalBy': el.RetrievalBy,
        'RetrievalDate': el.RetrievalDate,
        'ApprovalBy': el.ApprovalBy,
        'ApprovalDate': el.ApprovalDate,
        'RequestStatus': el.RequestStatus,
        'BatchStatus': el.BatchStatus,
        'DepartmentCode':el.DepartmentCode,
        'ItemLcoation': el.ItemLcoation,
        'WarehouseName': el.WarehouseName
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  formattedData1: any = [];
  headerList1: any;
  immutableFormattedData1: any;
  loading1: boolean = true;
  prepareTableData1(tableData, headerList) {
    let formattedData1 = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'request_number', header: 'REQUEST NO', index: 2 },
      { field: 'carton_number', header: 'CARTON NUMBER', index: 2 },
      { field: 'department', header: 'DEPARTMENT NAME', index: 2 },
 //   { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },
      { field: 'document_type', header: 'DOCUMENT TYPE', index: 3 },
      { field: 'detail_document_type', header: 'DETAIL DOCUMENT TYPE', index: 3 },
  // { field: 'retention_period', header: 'RETENTION PERIOD', index: 3 },
    { field: "WarehouseName", header: "WAREHOUSE NAME", index: 3 },  
  { field: 'detail_location', header: 'ITEM LOCATION', index: 4 },
      // { field: 'ApprovalBy', header: 'APPROVAL BY', index: 3 },
      // { field: 'ApprovalDate', header: 'APPROVAL DATE', index: 4 },
      { field: 'status', header: 'CARTON STATUS', index: 3 },
    ];
    tableData.forEach((el, index) => {
      formattedData1.push({
        'srNo': parseInt(index + 1),
        'id': el.id,
        'request_number': el.request_number,
        'carton_number': el.carton_number,
        'department': el.department,
        'document_type': el.document_type,
        'detail_document_type': el.detail_document_type,
        'retention_period': el.retention_period,
        'detail_location': el.detail_location,
        'ApprovalBy': el.ApprovalBy,
        'ApprovalDate': el.ApprovalDate,
        'status': el.status,
        'DepartmentCode':el.DepartmentCode,
        'WarehouseName' : el.WarehouseName
      });
    })
    this.headerList1 = tableHeader;
    this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData1));
    this.formattedData1 = formattedData1;
    this.loading1 = false;
  }


  AddApprovalForm: FormGroup
  onSubmit() {
    this.AddApprovalForm = this.formBuilder.group({
      request_number: this.AddPODEntryForm.controls['request_number'].value,
      ExpDeliveryDate: this.AddPODEntryForm.controls['ExpDeliveryDate'].value,
      Remark: this.AddPODEntryForm.controls['Remark'].value,
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),
    })
    const apiUrl = this._global.baseAPIUrl + 'OCBCRetrival/AddDispatchDetails';
    this._onlineExamService.postData(this.AddApprovalForm.value, apiUrl)
      .subscribe(data => {
        if (data == 'Request Dispatched Succesfully.') {
          this.ShowMessage(data);
        }
        else {
          this.ShowErrormessage(data);
        }
        this.getRetrievalDispatchList()
        this.modalRef.hide();
      });
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

  searchTable1($event) {
    let val = $event.target.value;
    if (val == '') {
      this.formattedData1 = this.immutableFormattedData1;
    } else {
      let filteredArr = [];
      const strArr = val.split(',');
      this.formattedData1 = this.immutableFormattedData1.filter(function (d) {
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
      this.formattedData1 = filteredArr;
    }
  }

  // DispatchRequest(template: TemplateRef<any>, row: any) {
  //   this.modalRef = this.modalService.show(template);
  //   this.AddPODEntryForm.patchValue({
  //     request_number: row.request_number
  //   })
  //   this.GetTableData(row.request_number);
  // }

  OnReset() {
    this.Reset = true;
    this.AddPODEntryForm.patchValue({
      ExpDeliveryDate: '',
      Remark: ''
    })
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

  ShowErrormessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error ! </span> <span data-notify="message"> ' + data + ' </span></div>',
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

  ShowMessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success ! </span> <span data-notify="message"> ' + data + ' </span></div>',
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
  }
getStatusClass(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.toUpperCase()) {
    case 'REQUEST APPROVED':
      return 'status-badge status-accepted';
    case 'RETRIEVAL REQUEST':
      return 'status-badge status-review';
    case 'OPEN':
      return 'status-badge status-offered';
    case 'INV ACK':
      return 'status-badge status-ack';
    case 'BATCH INV REJECTED':
      return 'status-badge status-rejected';
    case 'PICKUP SCHEDULED':
      return 'status-badge status-scheduled';
    case 'PARTIALLY INV ACK':
      return 'status-badge status-partial-ack';
    default:
      return 'status-badge status-default';
  }
}
 
 
getStatusClass1(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.trim().toUpperCase()) {
    case 'CARTON APPROVED':
      return 'status-badge status-accepted'; // green
    case 'RETRIEVAL REQUEST':
      return 'status-badge status-review'; // yellow
    case 'CARTON INV NOT RECEIVED':
      return 'status-badge status-rejected'; // red
    default:
      return 'status-badge status-default'; // grey-blue
  }
}
}