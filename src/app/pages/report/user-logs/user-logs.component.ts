//import { Component, OnInit } from '@angular/core';
import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpEventType, HttpClient, HttpParams } from '@angular/common/http';
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from '@angular/router';
import noUiSlider from "nouislider";
import { MessageService } from 'primeng/api';
import Dropzone from "dropzone";
Dropzone.autoDiscover = false;
import Quill from "quill";
import Selectr from "mobius1-selectr";

import swal from "sweetalert2";
import { DatePipe } from "@angular/common";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-user-logs',
  templateUrl: './user-logs.component.html',
  styleUrls: ['./user-logs.component.scss'],
  providers: [MessageService, DatePipe]
})
export class UserLogsComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  LogReportForm: FormGroup;
  _SingleDepartment: any;
  submitted = false;
  Reset = false;
  sMsg: string = '';
  _FilteredList: any;
  _StatusList: any;
  _HeaderList: any;

  _ColNameList = ["UserName", "FileNo", "Activity", "LogDate"];


  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  minToDate: Date | undefined;
  maxFromDate: Date | undefined;
  first = 0;
  rows = 10;
  noDataMessage: string;


  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private http: HttpClient,
    private httpService: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private datePipe: DatePipe,
  ) { }

ngOnInit(): void {
  this.LogReportForm = this.formBuilder.group({
    DATEFROM: ['', Validators.required],
    DATETO: ['', Validators.required],
    ActiivtyID: ['', Validators.required],
    User_Token: localStorage.getItem('User_Token'),
    CreatedBy: localStorage.getItem('UserID')
  });

  this.LogReportForm.controls['ActiivtyID'].setValue('');
  this.BindHeader(this._StatusList, this._StatusList);

  
  this.LogReportForm.get('ActiivtyID')?.valueChanges.subscribe(() => {
    this.clearLogTable();
  });

  this.LogReportForm.get('DATEFROM')?.valueChanges.subscribe(() => {
    this.clearLogTable();
  });

  this.LogReportForm.get('DATETO')?.valueChanges.subscribe(() => {
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
  this.noDataMessage = '';
  this.rows = 10;
}



  onFromDateChange(date: Date) {
    this.minToDate = date;

    const toDate = this.LogReportForm.get('DATETO')?.value;
    if (toDate && new Date(toDate) < new Date(date)) {
      this.LogReportForm.get('DATETO')?.setValue(null);
    }
  }

  onToDateChange(date: Date) {
    this.maxFromDate = date;

    const fromDate = this.LogReportForm.get('DATEFROM')?.value;
    if (fromDate && new Date(fromDate) > new Date(date)) {
      this.LogReportForm.get('DATEFROM')?.setValue(null);
    }
  }
  entriesChange($event) {
    this.entries = $event.target.value;
  }


  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  onActivate(event) {
    this.activeRow = event.row;
  }

  OnReset() {
    this.Reset = true;
    this.LogReportForm.reset();
  }

  onSearch() {
    if (this.LogReportForm.invalid) {
      this.LogReportForm.markAllAsTouched();
      return;
    }
    this.getLogList();
  }

  onDownload() {
    this.downloadFile();
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
    if (!this.formattedData || this.formattedData.length === 0) {
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
      return;
    }

    // Prepare CSV headers from tableHeader
    let csvContent = '';
    csvContent += this.headerList.map(h => `"${h.header}"`).join(',') + '\n';

    // Add table rows
    this.formattedData.forEach(row => {
      let rowData = this.headerList.map(h => {
        let value = row[h.field] ?? '';
        return `"${String(value).replace(/"/g, '""')}"`; // escape quotes
      });
      csvContent += rowData.join(',') + '\n';
    });

    // Create and trigger download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", "LogReport.csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }


  isValid() {
    return this.LogReportForm.valid
  }

  // getLogList() {
  //   debugger
  //   const fromDate = this.LogReportForm.value.DATEFROM
  //     ? this.datePipe.transform(this.LogReportForm.value.DATEFROM, 'yyyy-MM-dd')
  //     : '';
  //   const toDate = this.LogReportForm.value.DATETO
  //     ? this.datePipe.transform(this.LogReportForm.value.DATETO, 'yyyy-MM-dd')
  //     : '';

  //   const activityId = this.LogReportForm.value.ActiivtyID || '';
  //   const userId = localStorage.getItem('UserID');
  //   const userToken = localStorage.getItem('User_Token') || '';

  //   const apiUrl = `${this._global.baseAPIUrl}Report/GetActivityDetails`;

  //   let params = new HttpParams()
  //     .set('user_Token', userToken)
  //     .set('FromDate', fromDate)
  //     .set('ToDate', toDate)
  //     .set('UserId', userId)
  //     .set('Activity', activityId);

  //   this.loading = true;
  //   this._onlineExamService.getData(apiUrl, params)
  //     .subscribe(
  //       (data: any[]) => {
  //         this.loading = false;

  //         if (Array.isArray(data) && data.length > 0) {
  //           debugger
  //           this.noDataMessage = '';
  //           this._StatusList = data;
  //           this._FilteredList = data;
  //           this.prepareTableData(this._StatusList, this._FilteredList);
  //         } else {
  //           this.noDataMessage = `No records found for activity "${activityId || 'Selected'}"`;
  //           this._StatusList = [];
  //           this._FilteredList = [];
  //           this.prepareTableData([], []);
  //         }
  //       },
  //       (error) => {
  //         this.loading = false;
  //         console.error('Error fetching log data', error);
  //         this.noDataMessage = 'Error loading data. Please try again.';
  //         this.formattedData = [];
  //       }
  //     );
  // }


getLogList(formData?: any) {
  debugger;

  const formValue = formData || this.LogReportForm.value;

  const fromDate = formValue.DATEFROM
    ? this.datePipe.transform(formValue.DATEFROM, 'yyyy-MM-dd')
    : '';
  const toDate = formValue.DATETO
    ? this.datePipe.transform(formValue.DATETO, 'yyyy-MM-dd')
    : '';

  const activityId = formValue.ActiivtyID || '';
  const userId = localStorage.getItem('UserID');
  const userToken = localStorage.getItem('User_Token') || '';

  const apiUrl = `${this._global.baseAPIUrl}Report/GetActivityDetails`;

  let params = new HttpParams()
    .set('user_Token', userToken)
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('UserId', userId)
    .set('Activity', activityId);

  this.loading = true;

  this._onlineExamService.getData(apiUrl, params).subscribe(
    (data: any[]) => {
      this.loading = false;

      if (Array.isArray(data) && data.length > 0) {
        debugger;
        this.noDataMessage = '';
        this._StatusList = data;
        this._FilteredList = data;
        this.prepareTableData(this._StatusList, this._FilteredList);
      } else {
        this.noDataMessage = `No records found for activity "${activityId || 'Selected'}"`;
        this._StatusList = [];
        this._FilteredList = [];
        this.prepareTableData([], []);
      }
    },
    (error) => {
      this.loading = false;
      console.error('Error fetching log data', error);
      this.noDataMessage = 'Error loading data. Please try again.';
      this.formattedData = [];
    }
  );
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
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'pageName', header: 'PAGE NAME', index: 3 },
      { field: 'activity', header: 'ACTIVITY', index: 3 },
      { field: 'activityDescription', header: 'ACTIVITY DESCRIPTION', index: 3 },
      { field: 'UserName', header: 'ENTRY BY', index: 3 },
      { field: 'createdDate', header: 'ENTRY DATE', index: 3 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'UserName': el.createdBy,
        'id': el.id,
        'pageName': el.pageName,
        'activity': el.activity,
        'createdDate': el.createdDate,
        'activityDescription': el.activityDescription
      });

    });
    this.headerList = tableHeader;
    //}

    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;

  }


  BindHeader(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'UserName', header: 'USER NAME', index: 3 },
      { field: 'FileNo', header: 'ACTION', index: 2 },
      { field: 'Activity', header: 'ACTION TYPE', index: 3 },
      { field: 'LogDate', header: 'LOG DATE', index: 3 },

    ];


    this.headerList = tableHeader;
    //}

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

}
