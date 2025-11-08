
import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { Location } from "@angular/common";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';


export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-file-inventry-qc-form',
  templateUrl: './file-inventry-qc-form.component.html',
  styleUrls: ['./file-inventry-qc-form.component.scss']
})
export class FileInventryQcFormComponent implements OnInit {

  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  _FilteredList: any;
  AddFileInwardForm: FormGroup;
  submitted = false;
  Reset = false;
  Isreadonly = false;
  //_UserList: any;
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

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }
  ngOnInit() {
    this.AddFileInwardForm = this.formBuilder.group({
      id: [],
      request_id: [this.route.snapshot.params['REQ']],
      lan_no: ['', Validators.required],
      carton_no: ['', Validators.required],
      ack_by: ['', Validators.required],
      created_date: ['', Validators.required],
      created_by: ['', Validators.required],
      file_no: ['', Validators.required],
      schedule_date: ['', Validators.required],
      User_Token: localStorage.getItem('User_Token'),
      userid: localStorage.getItem('UserID')
    });

    this.GetBatchDetails();
    this.GetTableDetailsByReqNo();

    this.BindHeader(this._FilteredList);

  }
  isValidDateFormat(inputDate: string): boolean {
    // Check if the input date string matches the "yyyy-mm-dd" format using a regular expression
    const dateFormatRegex: RegExp = /^\d{4}-\d{2}-\d{2}$/;
    return dateFormatRegex.test(inputDate);
  }
  Download() {
    let Data = [];
    let data = this.formattedData
    for (let i = 0; i < data.length; i++) {
      Data.push({
        Request_Number: data[i].request_id,
        Lan_Number: data[i].lan_no,
        Carton_No: data[i].carton_no,
        File_No: data[i].file_no,
        Acknowledge_By: data[i].ack_by,
        Created_Date: data[i].created_date,
        Created_by: data[i].created_by,
        Schedule_Date: data[i].schedule_date
      })
    }
    this.exportToExcel(Data, 'Download_Report')
  }
  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, fileName + '.xlsx');
  }

  formatDate(inputDate: string): string {
    if (!this.isValidDateFormat(inputDate)) {
      // Handle the case where the input date is not in the expected format
      console.error('Invalid date format. Expected "yyyy-mm-dd".');
      return inputDate;
    }

    const dateParts: string[] = inputDate.split('-');
    const year: number = parseInt(dateParts[0], 10);
    const month: number = parseInt(dateParts[1], 10);
    const day: number = parseInt(dateParts[2], 10);

    // Create a new Date object
    const formattedDate: Date = new Date(year, month - 1, day);

    // Format the date components
    const formattedDay: string = ('0' + formattedDate.getDate()).slice(-2);
    const formattedMonth: string = ('0' + (formattedDate.getMonth() + 1)).slice(-2);
    const formattedYear: string = formattedDate.getFullYear().toString();

    // Combine the components in the desired format
    const result: string = formattedDay + '-' + formattedMonth + '-' + formattedYear;

    return result;
  }
  GetTableDetailsByReqNo() {
    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetFileInventoryByRequestNo?request_id=' + this.route.snapshot.params['REQ'] + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log("Doc Type", data);
      this.document_typeList = data;
      this.prepareTableData(data, data)
    });
  }
  get FormControls() { return this.AddFileInwardForm.controls }
  SaveData() {
    this.submitted = true;
    if (this.AddFileInwardForm.valid) {
      // AvansePickupRequest/AddEditFileInventory
      const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/AddEditFileInventoryQC';
      this._onlineExamService.postData(this.AddFileInwardForm.value, apiUrl).subscribe((data: {}) => {
        this.getCartonDetails()
        this.AllLanData = null
        this.AddFileInwardForm.controls['lan_no'].setValue('')
        this.AddFileInwardForm.controls['file_no'].setValue('')
        this.AddFileInwardForm.controls['carton_no'].setValue('')
        this.GetTableDetailsByReqNo();
        this.AddFileInwardForm.get('lan_no').setErrors(null);
        this.AddFileInwardForm.get('file_no').setErrors(null);
        this.AddFileInwardForm.get('carton_no').setErrors(null);
        this.submitted = false

      });

    }
  }
  ld = false;
  Editinward(template: TemplateRef<any>, row: any) {
    if (row.branch_id != 0) {
      this.ld = true
    }
    var that = this;
    console.log(row)
    this.AddFileInwardForm.patchValue({
      "lan_no": row.lan_no,
      "carton_no": row.carton_no,
      "file_no": row.file_no,
      "id": row.id,
      'ack_by': row.ack_by,
      'created_date': row.created_date,
      'created_by': row.created_by,
      'schedule_date': this.formatDate(row.schedule_date)
    })



    this.modalRef = this.modalService.show(template);
    this.GetBatchDetails();
    //this.GetVerificationData(row.FileNo);

  }
  AllData: any
  GetBatchDetails() {
    console.log(this.route.snapshot.params['REQ'])
    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetFileInwardByRequestId?request_id=' + this.route.snapshot.params['REQ'] + '&userid=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {

      this.AllData = data[0]
      //  this._FilteredList = data ;
      // this.prepareTableData(data, data);   
      // this.Isreadonly=true;

    });
  }
  AllLanData: any
  GetLanDetails(event: any) {
    console.log(this.route.snapshot.params['REQ'])
    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetFileInwardByLaNo?LanNo=' + event.target.value + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log("Data", data)
      this.AllLanData = data[0]
      this.AddFileInwardForm.controls['carton_no'].setValue(data[0].carton_no)
      this.AddFileInwardForm.controls['file_no'].setValue(data[0].file_no)
      this._FilteredList = data;
      // this.prepareTableData(data, data);   
      this.Isreadonly = true;

    });
  }

  getCartonDetails() {
    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetFileInventoryByCartonNo?CartonNo=' + this.AddFileInwardForm.value.carton_no + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log("Doc Type", data);
      this.document_typeList = data;
      this.prepareTableData(data, data)
    });

  }

  onBack() {
    this.router.navigateByUrl('/process/pod-ack');
  }


  getDocumentdetails() {
    const apiUrl = this._global.baseAPIUrl + 'BranchInward/getDocumentdetails?user_Token=' + localStorage.getItem('User_Token') + "&appl=" + this.AddFileInwardForm.get("appl").value + "&apac=" + this.AddFileInwardForm.get("apac").value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      //     console.log("Doc Type" , data);
      this.document_typeList = data;
    });

  }

  // getDocumentdetails() {  


  //   const apiUrl = this._global.baseAPIUrl + 'BranchInward/getDocumentdetails';          
  //   this._onlineExamService.postData(this.AddBranchInwardForm.value,apiUrl)

  //   .subscribe((data: {}) => {       

  //     console.log("Doc Type" , data);
  //     this.document_typeList =data;  
  //   });  
  //   } 
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
    // alert(this.type);

    // if (this.type=="Checker" )
    //{
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'request_id', header: 'REQUEST NO', index: 2 },
      { field: 'lan_no', header: 'LAN NO', index: 4 },
      { field: 'service_type', header: 'SERVICE TYPE', index: 2 },

      { field: 'carton_no', header: 'CARTON NO', index: 2 },
      { field: 'file_no', header: 'FILE BAROCDE', index: 3 },

    ];
    console.log("tableData", tableData);
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'carton_no': el.carton_no,
        'file_no': el.file_no,
        'lan_no': el.lan_no,
        'request_id': el.request_id,
        'id': el.id,
        'ack_by': el.ack_by,
        'created_date': el.created_date,
        'created_by': el.created_by,
        'schedule_date': el.schedule_date,
        'branch_id': el.branch_id,
        'service_type': el.service_type
      });



    });

    this.headerList = tableHeader;
    //}

    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;

  }
  // PackCarton(){
  //   const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/UpdatePackCarton';          
  //   this._onlineExamService.postData(this.AddFileInwardForm.value,apiUrl)

  //   .subscribe((data: {}) => {       
  //     console.log(data)
  //     this.toastr.show(
  //       '<div class="alert-text"</div> <span class="alert-title success" data-notify="title">Success ! </span> <span data-notify="message"> '+ data +' </span></div>',
  //       "",
  //       {
  //         timeOut: 3000,
  //         closeButton: true,
  //         enableHtml: true,
  //         tapToDismiss: false,
  //         titleClass: "alert-title success", // Apply the success class here
  //         positionClass: "toast-top-center",
  //         toastClass: "ngx-toastr alert alert-dismissible alert-success alert-notify" // Apply success-specific class
  //       }
  //     );

  //   }); 
  // }
  // CloseRequest(){
  //     const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/CloseRequest';          
  //   this._onlineExamService.postData(this.AddFileInwardForm.value,apiUrl)

  //   .subscribe((data: {}) => {       
  //     console.log(data)
  //     this.toastr.show(
  //       '<div class="alert-text"</div> <span class="alert-title success" data-notify="title">Success ! </span> <span data-notify="message"> '+ data +' </span></div>',
  //       "",
  //       {
  //         timeOut: 3000,
  //         closeButton: true,
  //         enableHtml: true,
  //         tapToDismiss: false,
  //         titleClass: "alert-title success", // Apply the success class here
  //         positionClass: "toast-top-center",
  //         toastClass: "ngx-toastr alert alert-dismissible alert-success alert-notify" // Apply success-specific class
  //       }
  //     );
  //     this.location.back()
  //   });  

  // }


  BindHeader(tableData) {

    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'CartonNo', header: 'Carton No', index: 2 },
      { field: 'File_no', header: 'File No', index: 3 },
      { field: 'Lan_no', header: 'Lan No', index: 4 },
    ];
    this.headerList = tableHeader;
    //}

    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;

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



  OnClose() {
    this.modalService.hide(1);
  }
  close() {
    this.location.back()
  }
  OnreadonlyAppc() {
    if (this.AddFileInwardForm.value.appl <= 0) {
      // this.ShowErrormessage("Select appl value");
      // return false;    
      this.Isreadonly = false;
    }
    else {
      this.Isreadonly = true;
    }

  }
  onSubmit() {
    this.submitted = true;
    if(this.AddFileInwardForm.controls['file_no'].value == null || this.AddFileInwardForm.controls['file_no'].value == ''){
      this.ShowErrormessage('File Barcode can not be empty.');    
      return;
    }
    if(this.AddFileInwardForm.controls['carton_no'].value == null || this.AddFileInwardForm.controls['carton_no'].value == ''){
      this.ShowErrormessage('Carton Number can not be empty.');    
      return;
    }
    if (this.AddFileInwardForm.valid) {
      const apiUrl = this._global.baseAPIUrl + "AvansePickupRequest/UpdateClosedRequest";
      this._onlineExamService
        .postData(this.AddFileInwardForm.value, apiUrl)
        .subscribe((data) => {

          if (data == 'Updated Closed request successfully') {
            this.ShowMessage(data);
            this.GetBatchDetails();
            this.GetTableDetailsByReqNo();
          }
          else {
            this.ShowErrormessage(data);
          }
          this.modalRef.hide()


        });

    }



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

  validation() {



    if (this.AddFileInwardForm.value.appl <= 0) {
      this.ShowErrormessage("Select appl value");
      return false;
    }

    if (this.AddFileInwardForm.value.BatchNo == "" || this.AddFileInwardForm.value.BatchNo == null) {
      //alert(this.AddBranchInwardForm.value.apac);

      this.ShowErrormessage("Enter Batch No value");
      return false;
    }

    if (this.AddFileInwardForm.value.apac == "" || this.AddFileInwardForm.value.apac == null) {
      //alert(this.AddBranchInwardForm.value.apac);

      this.ShowErrormessage("Enter Apac value");
      return false;
    }
    if (this.AddFileInwardForm.value.File_No == "" || this.AddFileInwardForm.value.File_No == null) {
      //alert(this.AddBranchInwardForm.value.apac);

      this.ShowErrormessage("Enter File No");
      return false;
    }

    return true;
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

  DeleteFile(Row: any) {
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
          this.AddFileInwardForm.patchValue({
            apac: Row.apac,
            appl: Row.appl,
            BatchNo: Row.BatchNo,
            User_Token: localStorage.getItem('User_Token'),
          });

          const that = this;
          const apiUrl = this._global.baseAPIUrl + 'BranchInward/Delete';
          this._onlineExamService.postData(this.AddFileInwardForm.value, apiUrl)
            .subscribe(data => {
              swal.fire({
                title: "Deleted!",
                text: "Record has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });
              this.GetBatchDetails();
              //  that.getSearchResult(that.AddBranchInwardForm.get('TemplateID').value);
            });

        }
      });

  }

  NotReceived() {
    this.AddFileInwardForm.patchValue({
      file_status: "File Not Received",
    })
    const apiUrl = this._global.baseAPIUrl + "BranchInward/AddEditAppacdetailsAck";
    this._onlineExamService
      .postData(this.AddFileInwardForm.value, apiUrl)
      // .pipe(first())
      .subscribe((data) => {

        if (data == 'Record save succesfully') {
          this.ShowMessage(data);
        }
        else {
          this.ShowErrormessage(data);
        }
        // this.OnReset(); 
        this.GetBatchDetails();

      });

  }


}
