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
  selector: 'app-user-matrix',
  templateUrl: './user-matrix.component.html',
  styleUrls: ['./user-matrix.component.scss'],
  providers: [MessageService, DatePipe]
})
export class UserMatrixComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  UserMatrixForm: FormGroup;
  _ActiveUserList: any[] = [];
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
  this.UserMatrixForm = this.formBuilder.group({
    selectedUser: ['', Validators.required],
    selectedType: ['', Validators.required],
    User_Token: localStorage.getItem('User_Token'),
    CreatedBy: localStorage.getItem('UserID')
  });

  // Initialize
  this.BindHeader(this._StatusList, this._StatusList);
  this.getActiveUsers();

  // 👇 Auto-fetch data when dropdowns change
  this.UserMatrixForm.valueChanges.subscribe((formValue) => {
    const { selectedUser, selectedType } = formValue;
    this.clearUserMatrixTable();

  });
}


private clearUserMatrixTable() {
  this.formattedData = [];
  this.immutableFormattedData = [];
  this._FilteredList = [];
  this._StatusList = [];
  // keep headerList if you want a consistent table header; clear it if you want header removed
  // this.headerList = []; // uncomment to remove headers as well
  this.first = 0;      
  this.loading = false;    
  this.noDataMessage = '';  
 // this.downloadEnabled = false;
}


  onFromDateChange(date: Date) {
    this.minToDate = date;

    const toDate = this.UserMatrixForm.get('DATETO')?.value;
    if (toDate && new Date(toDate) < new Date(date)) {
      this.UserMatrixForm.get('DATETO')?.setValue(null);
    }
  }

  onToDateChange(date: Date) {
    this.maxFromDate = date;

    const fromDate = this.UserMatrixForm.get('DATEFROM')?.value;
    if (fromDate && new Date(fromDate) > new Date(date)) {
      this.UserMatrixForm.get('DATEFROM')?.setValue(null);
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
    this.UserMatrixForm.reset();
  }


  // onSearch() {
  //   if (this.UserMatrixForm.invalid) {
  //     this.UserMatrixForm.markAllAsTouched();
  //     return;
  //   }
  //   this.getLogList();
  // }

 getActiveUsers() {
  debugger;
  const userId = localStorage.getItem('UserID');
  const userToken = localStorage.getItem('User_Token') || '';

  const apiUrl = `${this._global.baseAPIUrl}UserMatrix/GetActiveUsers`;

  let params = new HttpParams()
    .set('userId', userId?.toString() || '')
    .set('user_Token', userToken);

  console.log('API URL:', apiUrl);
  console.log('Params:', params.toString());

  this._onlineExamService.getData(apiUrl, params)
    .subscribe(
      (data: any[]) => {
        console.log('Raw API Response:', data);

        if (Array.isArray(data) && data.length > 0) {
          // prepend "All" option
          this._ActiveUserList = [{ userid: 'All' }, ...data];
          console.log('Active User List set:', this._ActiveUserList);
        } else {
          this._ActiveUserList = [{ userid: 'All' }];
          console.warn('No active users returned from API, added All only');
        }
      },
      (error) => {
        console.error('Error fetching active users', error);
        this._ActiveUserList = [{ userid: 'All' }];
      }
    );
}

downloadCSV() {
  if (!this.formattedData || !this.formattedData.length) return;

  const headers = this.headerList.map(col => col.header);
  const csvRows = [];
  csvRows.push(headers.join(',')); 

  this.formattedData.forEach(row => {
    const values = this.headerList.map(col => {
      let val = row[col.field];
      if (val === null || val === undefined) val = '';
      val = val.toString().replace(/"/g, '""');
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val}"`;
      }
      return val;
    });
    csvRows.push(values.join(','));
  });

  const csvData = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(csvData);
  a.download = 'UserMatrix.csv';
  a.click();
  URL.revokeObjectURL(a.href);
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

  onDownload() {
    const selectedType = this.UserMatrixForm.get('selectedType')?.value;
    debugger;
    if (selectedType === 'role') {
      this.onDownloadRole();
    } else if (selectedType === 'department') {
      this.onDownloadDepartment();
    } else {

      alert('Please select a Type before downloading');
    }
  }


  onDownloadDepartment() {
    debugger;
    const userId = localStorage.getItem("UserID");
    const user_Token = localStorage.getItem("User_Token");
    const activityId = this.UserMatrixForm.value.selectedUser || '';

    if (!activityId) {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please select a user before downloading!</span></div>',
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

    const apiUrl =
      this._global.baseAPIUrl +
      `UserMatrix/DownloadUserMatrixData_DepartmentWise?userId=${userId}&user_Token=${user_Token}&activityId=${activityId}`;

    this._onlineExamService.getAllData(apiUrl).subscribe(
      (res: any[]) => {
        if (!res || res.length === 0) {
          this.toastr.warning("No data found to download!");
          return;
        }
        const fixedHeaders = [
          { field: "srNo", header: "SR NO" },
          { field: "userid", header: "USERID" },
          { field: "email", header: "EMAIL" },
          { field: "Mobile", header: "MOBILE" },
          { field: "CreatedBy", header: "CREATED BY" },
          { field: "CreationDate", header: "CREATED ON" },
          { field: "UserType", header: "USERTYPE" },
          { field: "IsActive", header: "ISACTIVE" },
          { field: "PasswodExpiryDate", header: "PASSWORD EXPIRE ON" },
          { field: "LastLoginDatetime", header: "LAST LOGIN ON" },
          { field: "RoleName", header: "ROLE" }
        ];

        const dynamicHeaders: string[] = [];
        res.forEach(row => {
          const pageAccess = row.PageAccess || row.pageAccess;
          if (pageAccess) {
            Object.keys(pageAccess).forEach(key => {
              if (!dynamicHeaders.includes(key)) {
                dynamicHeaders.push(key);
              }
            });
          }
        });

        let csvContent = '';
        csvContent += fixedHeaders.map(h => `"${h.header}"`).join(',')
          + (dynamicHeaders.length ? ',' + dynamicHeaders.map(h => `"${h.toUpperCase()}"`).join(',') : '')
          + '\n';

        res.forEach((row: any, index: number) => {
          let rowData: string[] = [];

          rowData = fixedHeaders.map(h => {
            if (h.field === "srNo") return `"${index + 1}"`;
            return `"${String(row[h.field] ?? '').replace(/"/g, '""')}"`;
          });

          if (dynamicHeaders.length) {
            const pageAccess = row.PageAccess || row.pageAccess;
            dynamicHeaders.forEach(h => {
              const val = pageAccess ? pageAccess[h] : '';
              rowData.push(`"${String(val ?? '').replace(/"/g, '""')}"`);
            });
          }

          csvContent += rowData.join(',') + '\n';
        });

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const dwldLink = document.createElement("a");
        const url = URL.createObjectURL(blob);
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", "UserMatrixReportDepartmentWise.csv");
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
      },
      (error: any) => {
        this.toastr.error("Error while downloading Department-wise User Matrix data!");
      }
    );
  }


  onDownloadRole() {
    debugger;
    const userId = localStorage.getItem("UserID");
    const user_Token = localStorage.getItem("User_Token");
    const activityId = this.UserMatrixForm.value.selectedUser || '';

    if (!activityId) {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please select a user before downloading!</span></div>',
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

    const apiUrl =
      this._global.baseAPIUrl +
      `UserMatrix/DownloadUserMatrixData?userId=${userId}&user_Token=${user_Token}&activityId=${activityId}`;

    this._onlineExamService.getAllData(apiUrl).subscribe(
      (res: any[]) => {
        if (!res || res.length === 0) {
          this.toastr.warning("No data found to download!");
          return;
        }
        const fixedHeaders = [
          { field: "srNo", header: "SR NO" },
          { field: "userid", header: "USERID" },
          { field: "email", header: "EMAIL" },
          { field: "Mobile", header: "MOBILE" },
          { field: "CreatedBy", header: "CREATED BY" },
          { field: "CreationDate", header: "CREATED ON" },
          { field: "UserType", header: "USERTYPE" },
          { field: "IsActive", header: "ISACTIVE" },
          { field: "PasswodExpiryDate", header: "PASSWORD EXPIRE ON" },
          { field: "LastLoginDatetime", header: "LAST LOGIN ON" },
          { field: "RoleName", header: "ROLE" }
        ];
        const dynamicHeaders: string[] = [];
        res.forEach(row => {
          const pageAccess = row.PageAccess || row.pageAccess;
          if (pageAccess) {
            Object.keys(pageAccess).forEach(key => {
              if (!dynamicHeaders.includes(key)) {
                dynamicHeaders.push(key);
              }
            });
          }
        });

        let csvContent = '';
        csvContent += fixedHeaders.map(h => `"${h.header}"`).join(',')
          + (dynamicHeaders.length ? ',' + dynamicHeaders.map(h => `"${h.toUpperCase()}"`).join(',') : '')
          + '\n';

        res.forEach((row: any, index: number) => {
          let rowData: string[] = [];

          rowData = fixedHeaders.map(h => {
            if (h.field === "srNo") return `"${index + 1}"`;
            return `"${String(row[h.field] ?? '').replace(/"/g, '""')}"`;
          });

          if (dynamicHeaders.length) {
            const pageAccess = row.PageAccess || row.pageAccess;
            dynamicHeaders.forEach(h => {
              const val = pageAccess ? pageAccess[h] : '';
              rowData.push(`"${String(val ?? '').replace(/"/g, '""')}"`);
            });
          }

          csvContent += rowData.join(',') + '\n';
        });

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const dwldLink = document.createElement("a");
        const url = URL.createObjectURL(blob);
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", "UserMatrixReportRoleWise.csv");
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
      },
      (error: any) => {
        this.toastr.error("Error while downloading User Matrix data!");
      }
    );
  }





  isValid() {
    return this.UserMatrixForm.valid
  }

  getLogList() {
    debugger;

    const activityId = this.UserMatrixForm.value.selectedUser || '';
    const userId = localStorage.getItem('UserID');
    const userToken = localStorage.getItem('User_Token') || '';

    const apiUrl = `${this._global.baseAPIUrl}UserMatrix/GetUserMatrixData`;

    let params = new HttpParams()
      .set('userId', userId?.toString() || '')
      .set('user_Token', userToken)
      .set('activityId', activityId);

    this.loading = true;
    this._onlineExamService.getData(apiUrl, params)
      .subscribe(
        (data: any[]) => {
          this.loading = false;

          if (Array.isArray(data) && data.length > 0) {
            debugger
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
          this._StatusList = [];
          this._FilteredList = [];
          this.prepareTableData([], []);
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
    console.log("Raw table data:", tableData);

    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'UserID', header: 'USER ID', index: 2 },
      { field: 'UserType', header: 'USER TYPE', index: 4 },
      { field: 'Mobile', header: 'MOBILE', index: 5 },
      { field: 'Email', header: 'EMAIL', index: 6 },
      { field: 'Role', header: 'ROLE', index: 3 },
      { field: 'CreatedBy', header: 'CREATED BY', index: 7 },
      { field: 'CreatedOn', header: 'CREATED ON', index: 8 },
      { field: 'IsActive', header: 'IS ACTIVE', index: 9 },
      { field: 'PasswordExpiry', header: 'PASS EXPIRY ON', index: 10 },
      { field: 'LastLogin', header: 'LAST LOGIN ON', index: 11 },
      { field: 'IsEdit', header: 'IS EDIT RIGHT', index: 12 },
       { field: 'IsDestructionEdit', header: 'IS DESTRUCTION EDIT', index: 12 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: index + 1,
        UserID: el.userid,
        Role: el.RoleName,
        UserType: el.UserType,
        Mobile: el.Mobile,
        Email: el.email,
        CreatedBy: el.CreatedBy,
        CreatedOn: el.CreationDate,
        IsActive: el.IsActive === 'Y' ? 'YES' : 'NO',
        PasswordExpiry: el.PasswodExpiryDate,
        LastLogin: el.LastLoginDatetime,
        IsEdit: el.IsEdit,
        IsDestructionEdit:el.IsDestructionEdit
      });
    });

    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }


  BindHeader(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'UserID', header: 'USER ID', index: 2 },
      { field: 'Role', header: 'ROLE', index: 3 },
      { field: 'UserType', header: 'USER TYPE', index: 4 },
      { field: 'Mobile', header: 'MOBILE', index: 5 },
      { field: 'Email', header: 'EMAIL', index: 6 },
      { field: 'CreatedBy', header: 'CREATED BY', index: 7 },
      { field: 'CreatedOn', header: 'CREATED ON', index: 8 },
      { field: 'IsActive', header: 'IS ACTIVE', index: 9 },
      { field: 'PasswordExpiry', header: 'PASS EXP', index: 10 },
      { field: 'LastLogin', header: 'LAST LOGIN ON', index: 11 },
      { field: 'IsEdit', header: 'IS EDIT', index: 12 },

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
