import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, AbstractControl, ValidationErrors } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { Location } from "@angular/common";
import { CommonService } from "src/app/Services/common.service";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-retrieval-request-form',
  templateUrl: './retrieval-request-form.component.html',
  styleUrls: ['./retrieval-request-form.component.scss']
})
export class RetrievalRequestFormComponent implements OnInit {

  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  _FilteredList: any;
  AddFileInwardForm: FormGroup;
  submitted = false;
  submitteds = false;
  Reset = false;
  Isreadonly = false;
  sMsg: string = "";
  _message = "";
  _UserID: any;
  document_typeList: any;
  User: any;
  first = 0;
  rows = 10;
  class: any;
  myFiles: string[] = [];
  _FileDetails: string[][] = [];
  FileUPloadForm: any;
  httpService: any;
  IsreadonlyFileno = false;
  carton_number: any;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
        private _commonService: CommonService,

  ) { }
  dispatchForm: FormGroup
  ngOnInit() {
    this.AddFileInwardForm = this.formBuilder.group({
      request_number: ['', Validators.required],
      id: [''],
      department: [''],
      document_type: [''],
      detail_document_type: [''],
      WarehouseName: [''],
      detail_location: [''],
      carton_number: ["", [Validators.required, this.noSpaceValidator]],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),
    });
    this.dispatchForm = this.formBuilder.group({
      dispatch_address: ['', [Validators.required, this.noWhitespaceValidator]]
    });

    this.GetRequestNo();
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'noWhitespace': true };
  }

  noSpaceValidator(control: AbstractControl): ValidationErrors | null {
    const hasSpace = (control.value || '').includes(' ');
    return hasSpace ? { 'hasSpace': true } : null;
  }

  get FormControls() { return this.AddFileInwardForm.controls }
  get FormControlss() { return this.dispatchForm.controls }

SaveData() {
  this.submitted = true;

  if (this.AddFileInwardForm.valid) {
    const apiUrl = this._global.baseAPIUrl + 'OCBCRetrival/AddRetrivalRequest';

    this._onlineExamService.postData(this.AddFileInwardForm.value, apiUrl)
      .subscribe((data: any) => {
        
        if (data === 'Carton Number is already raised for Retrieval Request.') {
          this.ShowErrormessage('Carton Number is already raised for Retrieval Request.');
        }
        else if (data === 'Retrieval Request raised for the Carton Number.') {
          this.ShowMessage('Retrieval Request raised for the Carton Number.');
        }
        else if (data === 'Department is not mapped. Invalid Carton No.') {
          this.ShowErrormessage('Department is not mapped. Invalid Carton No.');
        }
        else {
          this.ShowErrormessage(data); // fallback for unexpected messages
        }

        this.OnReset();
        this.GetTableData();
      });
  }
}


  getCartonDetails() {
    const apiUrl = this._global.baseAPIUrl + 'OCBCRetrival/GetRecordByCartonNumber?User_Token=' + localStorage.getItem('User_Token') + '&carton_number=' + this.AddFileInwardForm.controls['carton_number'].value + '&UserID=' + this.AddFileInwardForm.controls['CreatedBy'].value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {

      if (data[0].MSG === "Carton Number is already raised for Retrieval Request.") {
        this.ShowErrormessage("Carton Number is already raised for Retrieval Request.");
        this.OnReset();
        return;
      }
      else if (data[0].MSG === "Carton Number does not exists.") {
        this.ShowErrormessage("Carton Number does not exists.");
        this.OnReset();
        return;
      }
         else if (data[0].MSG === "You do not have access to this carton.") {
        this.ShowErrormessage("You do not have access to this carton.");
        this.OnReset();
        return;
      }
      else if (data[0].MSG === "Carton Number is processed for Retrieval Request.") {
        this.ShowErrormessage("Carton Number is processed for Retrieval Request.");
        this.OnReset();
        return;
      }
      else if (data[0].MSG === "Carton Number is Already OUT") {
        this.ShowErrormessage("Carton Number is Already OUT");
        this.OnReset();
        return;
      }
      else if (data[0].MSG === "Inward process is not completed for the Carton Number.") {
        this.ShowErrormessage("Inward process is not completed for the Carton Number.");
        this.OnReset();
        return;
      }
       else if (data[0].MSG === "Carton Number location is not updated.") {
        this.ShowErrormessage("Carton Number location is not updated.");
        this.OnReset();
        return;
      }
        else if (data[0].MSG === "User is not mapped to the department for Retrieval.") {
        this.ShowErrormessage("User is not mapped to the department for Retrieval.");
        this.OnReset();
        return;
      }



      if (data !== '') {
        this.AddFileInwardForm.controls['department'].setValue(data[0].department || '');
        this.AddFileInwardForm.controls['document_type'].setValue(data[0].document_type || '');
        this.AddFileInwardForm.controls['detail_document_type'].setValue(data[0].detail_document_type || '');
        this.AddFileInwardForm.controls['WarehouseName'].setValue(data[0].WarehouseName || '');
        this.AddFileInwardForm.controls['detail_location'].setValue(data[0].detail_location || '');
      }
    });
  }

  GetRequestNo() {
    const apiUrl = this._global.baseAPIUrl + 'Retrival/GetRequestNumber?&USERId=' + localStorage.getItem('UserID') + '&request_number=' + this.AddFileInwardForm.value.request_number + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this.AddFileInwardForm.controls['request_number'].setValue(data[0].request_number)
      this.GetTableData();
    });
  }

  GetTableData() {
    const apiUrl = this._global.baseAPIUrl + 'OCBCRetrival/GetRetrievalDataByRequestNo?&USERId=' + localStorage.getItem('UserID') + '&request_number=' + this.AddFileInwardForm.value.request_number + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this._FilteredList = data;
      this.prepareTableData(this._FilteredList, this._FilteredList)
    });
  }

  onBack() {
    this.router.navigateByUrl('/retrival/retrival-request');
  }

  downloadFile() {
    const filename = 'Retrieval_Request_BulkUpload';
    let csvData = "carton_number";
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
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  _CSVData: any
  _IndexList: any
  getHeaderArray(csvRecordsArr: any) {
    var headers;
    headers = ['carton_number'];
    return headers;
  }

  _ColNameList = [];
  getDisplayNames(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    if (headers.length != 1) {
      var msg = 'Invalid No. of Column Expected :- ' + 1;
      this.ShowErrormessage(msg);
      return false;
    }
    console.log(this._CSVData)
    this._ColNameList[0] = "carton_number";
    console.log(this._CSVData)
    return true;
  }

  records: any
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
        console.log(this._CSVData)
        let validFile = this.getDisplayNames(csvRecordsArray);
        if (validFile == false) {
          this.fileReset();
        } else {

          this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
          (<HTMLInputElement>document.getElementById('csvReader')).value = '';
        }
      };

      reader.onerror = function () {
      };

    } else {
      this.fileReset();
    }
    this._FilteredList = this.records
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    let csvArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (<string>csvRecordsArray[i]).split(',');
      if (curruntRecord.length == headerLength) {
        const single = []
        for (let i = 0; i < this._ColNameList.length; i++) {
          single.push(curruntRecord[i].toString().trim())
        }
        csvArr.push(single)
      }
    }
    return csvArr;
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
      { field: 'request_number', header: 'REQUEST NO', index: 2 },
      { field: 'carton_number', header: 'CARTON NUMBER', index: 2 },
      { field: 'department', header: 'DEPARTMENT NAME', index: 2 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },

      { field: 'document_type', header: 'DOCUMENT TYPE', index: 3 },
      { field: 'detail_document_type', header: 'DOCUMENT DETAILS', index: 3 },
      { field: 'WarehouseName', header: 'WAREHOUSE NAME', index: 3 },
      { field: 'detail_location', header: 'DETAIL LOCATION', index: 4 },
      { field: 'status', header: 'CARTON STATUS', index: 3 },
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'id': el.id,
        'request_number': el.request_number,
        'carton_number': el.carton_number,
        'department': el.department,
        'document_type': el.document_type,
        'detail_document_type': el.detail_document_type,
        'WarehouseName': el.WarehouseName,
        'detail_location': el.detail_location,
        'status': el.status,
        'DepartmentCode': el.DepartmentCode
      });
    })
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

CloseRequest() {
  this.submitted = true;

  const apiUrl = this._global.baseAPIUrl + 'OCBCRetrival/CloseRetrivalBatch';

  // Step 1: get the department value from the form
  let department = this.AddFileInwardForm.get('department')?.value;

  // Step 2: If table has exactly 1 row, override with that
  if (this.formattedData && this.formattedData.length > 0) {
    department = this.formattedData[0].department;
  }

  // Step 3: Check if department is still empty
  if (!department) {
    this.ShowErrormessage('Department is missing. Please check the carton number or table data.');
    return;
  }

  // Step 4: Build payload
  const payload = {
    ...this.AddFileInwardForm.getRawValue(),
    department: department
  };
  this._onlineExamService.postData(payload, apiUrl).subscribe((data: any) => {
    if (data === 'Request Closed Successfully') {
      this.ShowMessage("Request Closed Successfully.");
    } else {
      this.ShowErrormessage('Data Not Found.');
    }

    this.OnReset();
    this.router.navigate(['/retrival/retrival-request']);
       this._commonService.setMessage(data);

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

  OnReset() {
    this.modalService.hide(1);
    this.AddFileInwardForm.controls['carton_number'].setValue('');
    this.AddFileInwardForm.controls['department'].setValue('');
    this.AddFileInwardForm.controls['document_type'].setValue('');
    this.AddFileInwardForm.controls['detail_document_type'].setValue('');
    this.AddFileInwardForm.controls['WarehouseName'].setValue('');
    this.AddFileInwardForm.controls['detail_location'].setValue('');
      this.AddFileInwardForm.markAsUntouched();

  }
  OnClose() {
    this.modalService.hide(1);
  }

  upload() {
    this.AddFileInwardForm.patchValue({
      CSVData: this._CSVData
    })
    console.log(this.AddFileInwardForm.value)
    const apiUrl = this._global.baseAPIUrl + "DataUpload/CreateBulkRequest";
    this._onlineExamService
      .postData(this.AddFileInwardForm.value, apiUrl)
      .subscribe((data) => {
        this.downloadFilestatus(data);
        this.GetRequestNo();
      });
    this.modalRef.hide();
  }

  downloadFilestatus(strmsg: any) {
    const filename = 'Record Retrieval upload status';
    let blob = new Blob(['\ufeff' + strmsg], {
      type: 'text/csv;charset=utf-8;'
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

  DeleteRecord(Row: any) {
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
          // this.AddFileInwardForm.patchValue({
          //   id: Row.id,
          //   carton_number: Row.carton_number,
          //   User_Token: localStorage.getItem('User_Token'),
          // });
          const formValues = {
            id: Row.id,
            carton_number: Row.carton_number,
            User_Token: localStorage.getItem('User_Token'),
             UserID: localStorage.getItem('UserID'),
          };

          const that = this;
          const apiUrl = this._global.baseAPIUrl + 'OCBCRetrival/DeleteRetrievalRequestDetails';
          this._onlineExamService.postData(formValues, apiUrl)
            .subscribe(data => {
              swal.fire({
                title: "Deleted!",
                text: "Record has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });
              this.OnReset();
              this.GetTableData();
            });
        }
      });
  }
}