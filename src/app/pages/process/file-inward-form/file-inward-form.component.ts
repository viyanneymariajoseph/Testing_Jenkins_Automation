
import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { Location } from "@angular/common";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-file-inward-form',
  templateUrl: './file-inward-form.component.html',
  styleUrls: ['./file-inward-form.component.scss']
})
export class FileInwardFormComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  _FilteredList: any;
  isReadOnly: boolean = false;
  AddFileInwardForm: FormGroup;
  submitted = false;
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
  fileBarcodeList: string[] = []; 


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
      request_id: [this.route.snapshot.params['REQ']],
      document_type: ['', Validators.required],
      service_type: ['', Validators.required],
      lan_no:  [{ value: '', disabled: true }, Validators.required], 
      carton_no: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(7), Validators.pattern('^[a-zA-Z0-9]*$')]],
      file_no: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(10), Validators.pattern('^[a-zA-Z0-9]*$')]],
      User_Token: localStorage.getItem('User_Token'),
      userid: localStorage.getItem('UserID')
    });
    this.AddFileInwardForm.get('document_type')?.valueChanges.subscribe(value => {
      if (value) {
        this.AddFileInwardForm.get('lan_no')?.enable();
      } else {
        this.AddFileInwardForm.get('lan_no')?.disable();
      }
    });

    this.GetBatchDetails();
    this.getCartonDetails()
    //this.getCartonNumber()
    this.BindHeader(this._FilteredList);
    this.fileBarcodeList= [];
  }

  isCartonDisbaled = false;
  getCartonNumber() {
    const apiUrl = this._global.baseAPIUrl + 'Refilling/GetCartonNoByRequestId?userId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token') + '&request_no=' + this.route.snapshot.params['REQ'];
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      console.log("data", data)
      if (data.length >= 1) {
        this.isCartonDisbaled = true
        this.AddFileInwardForm.controls['carton_no'].setValue(data.toString())
      }
      else {
        this.isCartonDisbaled = false
      }
    });
  }

  get FormControls() { return this.AddFileInwardForm.controls }
  // SaveData() {
  //   this.submitted = true;
  //   if (this.AddFileInwardForm.valid) {
  //     const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/AddEditFileInventory';
  //     this._onlineExamService.postData(this.AddFileInwardForm.value, apiUrl).subscribe((data: {}) => {
  //       //   console.log(data);
  //       if (data === 'File already Exists') {
  //         this.ShowErrormessage("File already Exists");
  //         return;
  //       }
  //       if (data === 'Lan already exists') {
  //         this.ShowErrormessage("Lan already exists");
  //         return;
  //       }
  //       if (data === 'Lan no not exist in dump upload') {
  //         this.ShowErrormessage("Lan no not exist in dump upload");
  //         return;
  //       }
  //       this.getCartonNumber();
  //       this.getCartonDetails()
  //       this.AllLanData = null
  //       this.AddFileInwardForm.controls['lan_no'].setValue('')
  //       this.AddFileInwardForm.controls['file_no'].setValue('')
  //       this.AddFileInwardForm.get('lan_no').setErrors(null);
  //       this.AddFileInwardForm.get('file_no').setErrors(null);
  //       this.submitted = false
  //     });
  //   }
  // }
  SaveData() {
    this.submitted = true;
    if (this.AddFileInwardForm.valid) {
      const formData = this.AddFileInwardForm.getRawValue(); 
  
      const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/AddEditFileInventory';
      this._onlineExamService.postData(formData, apiUrl).subscribe((data: {}) => {
        if (data === 'File already Exists') {
          this.ShowErrormessage("File already Exists");
          return;
        }
        if (data === 'Lan already exists') {
          this.ShowErrormessage("Lan already exists");
          return;
        }
        if (data === 'LanNo. not exist in dump upload') {
          this.ShowErrormessage("LanNo. not exist in dump upload");
          return;
        }
        
        //this.getCartonNumber();
        this.getCartonDetails();
        this.AllLanData = null;
        this.fileBarcodeList= [];
        this.AddFileInwardForm.controls['lan_no'].setValue('');
        this.AddFileInwardForm.controls['carton_no'].setValue('');
        this.AddFileInwardForm.controls['file_no'].setValue('');
        this.AddFileInwardForm.get('lan_no').setErrors(null);
        this.AddFileInwardForm.get('file_no').setErrors(null);
        this.submitted = false;
      });
    }
  }
  
  AllData: any
  GetBatchDetails() {
    //console.log(this.route.snapshot.params['REQ'])
    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetFileInwardByRequestId?request_id=' + this.route.snapshot.params['REQ'] + '&userid=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      //  console.log(data)
      this.AllData = data[0]
    });
  }

  AllLanData: any
  GetLanDetails(event: any) {
    this.toastr.clear();
    this.fileBarcodeList=[];
    //this.AddFileInwardForm.controls['carton_no'].setValue('');
    //  console.log(this.route.snapshot.params['REQ'])
    if (this.AddFileInwardForm.controls['document_type'].valid && this.AddFileInwardForm.controls['service_type'].valid) {
      const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetFileInwardByLaNo?LanNo=' + event.target.value + "&request_no=" +
        this.route.snapshot.params['REQ'] + '&user_Token=' + localStorage.getItem('User_Token') + '&document_type=' +
        this.AddFileInwardForm.controls['document_type'].value + '&service_type=' +
        this.AddFileInwardForm.controls['service_type'].value + '&UserID=' + localStorage.getItem('UserID');
      this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
        if (data[0].MSG === 'Lan Does Not exist') {
          this.ShowErrormessage("Lan Does Not exist")
          this.AddFileInwardForm.controls['lan_no'].setValue('');
          return
        }
        else if (data[0].MSG === 'Lan does not exist for this branch') {
          this.ShowErrormessage("Lan does not exist for this branch")
          this.AddFileInwardForm.controls['lan_no'].setValue('');
          return
        }
        else if (data[0].MSG === 'File is out cannot add file') {
          this.ShowErrormessage("File is out cannot add file")
          this.AddFileInwardForm.controls['lan_no'].setValue('');
          this.AddFileInwardForm.controls['carton_no'].setValue('');
          return
        }
        else if (data[0].MSG === 'File is Perm Out cannot add file') {
          this.ShowErrormessage("File is Perm Out cannot add file")
          this.AddFileInwardForm.controls['lan_no'].setValue('');
          this.AddFileInwardForm.controls['carton_no'].setValue('');
          return
        }
        else if (data[0].MSG === 'File is Destroyed cannot add file') {
          this.ShowErrormessage("File is Destroyed cannot add file")
          this.AddFileInwardForm.controls['lan_no'].setValue('');
          this.AddFileInwardForm.controls['carton_no'].setValue('');
          return
        }
        else if (data[0].MSG === 'Lan No is other Branch for this Request No') {
          this.ShowErrormessage("Lan No is other Branch for this Request No")
          this.AddFileInwardForm.controls['lan_no'].setValue('');
          return
        }
        else if (data[0].MSG === 'File Inventory not done') {
          this.ShowErrormessage("File Inventory not done")
          this.AddFileInwardForm.controls['lan_no'].setValue('');
          return
        }
        else {
          if (this.AddFileInwardForm.controls['service_type'].value == 'Insertion') {
            this.AddFileInwardForm.controls['carton_no'].setValue(data[0].carton_no);
            this.fileBarcodeList = (data as any[]).map(item => item.file_no).filter(f => f);
             if(this.fileBarcodeList.length == 1){
              this.AddFileInwardForm.controls['file_no'].setValue(data[0].file_no);
             }
          }

          this.AllLanData = data[0]
          this._FilteredList = data;
          this.Isreadonly = true;
        }

      });
    }
    else {
      this.ShowErrormessage("Please Select Document Type")
    }
  }

  getCartonDetails() {
    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetFileInventoryByCartonNo?request_id=' + this.route.snapshot.params['REQ'] + '&user_Token=' + localStorage.getItem('User_Token');
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
      this.document_typeList = data;
    });
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
      { field: 'request_id', header: 'REQUEST NO', index: 2 },
      { field: 'carton_no', header: 'CARTON NUMBER', index: 2 },
      { field: 'file_no', header: 'FILE NUMBER', index: 3 },
      { field: 'lan_no', header: 'LAN NUMBER', index: 4 },
      { field: 'document_type', header: 'DOCUMENT TYPE', index: 3 },
      { field: 'service_type', header: 'SERVICE TYPE', index: 3 },
      { field: 'applicant_name', header: 'CUSTOMER NAME', index: 3 },
      { field: 'branch_name', header: 'BRANCH NAME', index: 6 },
      { field: 'app_branch_code', header: 'BRANCH CODE', index: 5 },
    ];
    console.log("tableData", tableData);
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'carton_no': el.carton_no,
        'file_no': el.file_no,
        'lan_no': el.lan_no,
        'request_id': el.request_id,
        'applicant_name': el.applicant_name,
        'app_branch_code': el.app_branch_code,
        'branch_name': el.branch_name,
        'document_type': el.document_type,
        'service_type': el.service_type
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }
  PackCarton() {
    this.AddFileInwardForm.reset()
    this.AddFileInwardForm = this.formBuilder.group({
      request_id: [this.route.snapshot.params['REQ']],
      document_type: ['', Validators.required],
      lan_no: ['', Validators.required],
      carton_no: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(7)]],
      file_no: ['', Validators.required, Validators.minLength(10), Validators.maxLength(10)],
      User_Token: localStorage.getItem('User_Token'),
      userid: localStorage.getItem('UserID')
    });
  }

  CloseRequest() {
    if (this.formattedData.length != 0) {
      const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/CloseRequest';
      this._onlineExamService.postData(this.AddFileInwardForm.value, apiUrl)

        .subscribe((data: {}) => {
          console.log(data)
          this.toastr.show(
            '<div class="alert-text"</div> <span class="alert-title success" data-notify="title">Success ! </span> <span data-notify="message"> ' + data + ' </span></div>',
            "",
            {
              timeOut: 3000,
              closeButton: true,
              enableHtml: true,
              tapToDismiss: false,
              titleClass: "alert-title success",
              positionClass: "toast-top-center",
              toastClass: "ngx-toastr alert alert-dismissible alert-success alert-notify"
            }
          );
          this.location.back()
        });
    }
    else {
      this.ShowErrormessage("Data Not Found")
    }
  }

  BindHeader(tableData) {

    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'CartonNo', header: 'Carton No', index: 2 },
      { field: 'File_no', header: 'File No', index: 3 },
      { field: 'Lan_no', header: 'Lan No', index: 4 },
    ];
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

  OnReset() {
    this.Reset = true;
    this.AllLanData = null
    this.AddFileInwardForm.controls['document_type'].setValue('');
    this.AddFileInwardForm.controls['lan_no'].setValue('');
    this.AddFileInwardForm.controls['carton_no'].setValue('');
    this.AddFileInwardForm.controls['file_no'].setValue('');
   // this.getCartonNumber()
  }

  OnClose() {
    this.modalService.hide(1);
  }

  OnreadonlyAppc() {
    if (this.AddFileInwardForm.value.appl <= 0) {
      this.Isreadonly = false;
    }
    else {
      this.Isreadonly = true;
    }
  }

  onSubmit() {
    this.location.back()
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
      this.ShowErrormessage("Enter Batch No value");
      return false;
    }
    if (this.AddFileInwardForm.value.apac == "" || this.AddFileInwardForm.value.apac == null) {
      this.ShowErrormessage("Enter Apac value");
      return false;
    }
    if (this.AddFileInwardForm.value.File_No == "" || this.AddFileInwardForm.value.File_No == null) {
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
      .subscribe((data) => {

        if (data == 'Record save succesfully') {
          this.ShowMessage(data);
        }
        else {
          this.ShowErrormessage(data);
        }
        this.OnReset();
        this.GetBatchDetails();
      });
  }

  onServiceTypeChange(value: string) {
    if (value === 'Insertion') {
      this.isReadOnly = true;
      this.AddFileInwardForm.controls['carton_no'].setValue('');
      this.FormControls['carton_no'].disable();
    } else {
      this.isReadOnly = false;
     // this.getCartonNumber()
      this.FormControls['carton_no'].enable();
    }
    this.fileBarcodeList =[];
  //   if (value === 'Insertion') {
  //     this.fileBarcodeList = ['FILE12345', 'FILE67890', 'FILE11223', 'FILE44556'];
  //   } else {
  //     this.fileBarcodeList = [];
  //   }
 this.OnReset();
   }

}
