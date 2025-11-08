import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ToastrService } from "ngx-toastr";

import swal from "sweetalert2";
import { MatDialog } from "@angular/material/dialog";
import { NewPickupRequestComponent } from "../new-pickup-request/new-pickup-request.component";
// import { Listboxclass } from '../../../Helper/Listboxclass';
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}


@Component({
  selector: 'app-update-schedule',
  templateUrl: './update-schedule.component.html',
  styleUrls: ['./update-schedule.component.scss']
})
export class UpdateScheduleComponent implements OnInit {
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
  rescheduleBoolean: boolean = true
  bsValue = new Date();
  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private dialog: MatDialog
  ) {

  }
  ngOnInit() {
    document.body.classList.add('data-entry');
    this.pickupForm = this.formBuilder.group({
      request_id: ['', Validators.required],
      schedule_date: ['', [Validators.required]],
      reschedule_date: [''],
      form_schedule_date: [''],
      form_reschedule_date: [''],
      reschedule_reason: [''],
      vehicle_number: [''],
      escort_name: [''],
      escort_number: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      pickup_address: [''],
      pickup_request_id: [],
      User_Token: localStorage.getItem('User_Token'),
      userid: localStorage.getItem('UserID'),

    });
    this.setMinDate();


    this.getPickRequest();

  }
  setMinDate() {
    this.minDate = new Date();
    // Set the minimum date to today
    this.minDate.setHours(0, 0, 0, 0);
  }

  dateValidator(control) {
    const selectedDate = control.value;
    const today = new Date();

    if (selectedDate < today) {
      return { pastDate: true };
    }

    return null;
  }
  futureDateValidator(control) {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();

    // Check if the selected date is in the future
    if (selectedDate <= currentDate) {
      return { futureDate: true };
    }

    return null;
  }

  // Function to be called on input to trigger validation
  // validateDate() {
  //   this.pickupForm.controls['schedule_date'].updateValueAndValidity();
  // }
  get FormControls() { return this.pickupForm.controls }
  //karta hoon integrate work ho raha abb
  getPickRequest() {

    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetPickupRequestSchedule?userid=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: {}) => {

      this._IndexPendingList = data;
      this._FilteredList = data;
      console.log("IndexListPending", data);
      this.prepareTableData(this._FilteredList, this._IndexPendingList);
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });
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
    } else if (this.pickupForm.get('document_type').value === 'Both') {
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


  minDate: Date; // To store the minimum selectable date
  maxDate: Date; // To store the maximum selectable date



  // Function to validate the selected date
  validateDate(event: MatDatepickerInputEvent<Date>) {
    const selectedDate = event.value;
    if (selectedDate < this.minDate || selectedDate > this.maxDate) {
      // If the selected date is before the minimum date or after the maximum date,
      // reset the input value to null
      event.target.value = null;
    }
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
      { field: 'service_type', header: 'SERVICE TYPE', index: 2 },
      { field: 'document_type', header: 'DOCUMENT TYPE', index: 3 },
      { field: 'main_file_count', header: 'MAIN FILE (NO OF FILES)', index: 3 },
      { field: 'collateral_file_count', header: 'COLLETRAL (NO OF FILES)', index: 7 },
      { field: 'branch_code', header: 'BRANCH CODE', index: 7 },
      { field: 'branch_name', header: 'BRANCH NAME', index: 7 },
      { field: 'request_by', header: 'REQUESTED BY', index: 2 },
      { field: 'request_date', header: 'REQUEST DATE', index: 2 },
      { field: 'ack_by', header: 'ACKNOWLEDGE BY', index: 2 },
      { field: 'ack_date', header: 'ACKNOWLEDGE DATE', index: 2 },
      { field: 'form_schedule_date', header: 'SCHEDULE DATE', index: 2 },
      { field: 'form_reschedule_date', header: 'RESCHEDULE DATE', index: 2 },
      { field: 'reschedule_reason', header: 'RESCHEDULE REASON', index: 2 },



    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'request_id': el.request_id,
        'pickup_address': el.pickup_address,
        'service_type': el.service_type,
        'document_type': el.document_type,
        'main_file_count': el.main_file_count,
        'collateral_file_count': el.collateral_file_count,
        'branch_code': el.branch_code,
        'branch_name': el.branch_name,
        'request_by': el.request_by,
        'request_date': el.request_date,
        'ack_by': el.ack_by,
        'ack_date': el.ack_date,
        'address': el.address,
        'schedule_date': el.schedule_date,
        'form_schedule_date': el.schedule_date ? this.formatDate(el.schedule_date) : "",
        'status': el.status,
        'pickup_request_id': el.pickup_request_id,
        'vehicle_number': el.vehicle_number,
        'reschedule_reason': el.reschedule_reason,
        'reschedule_date': el.reschedule_date,
        'escort_name': el.escort_name,
        'escort_number': el.escort_number,
        'request_status': el.request_status,
        'form_reschedule_date': el.reschedule_date ? this.formatDate(el.reschedule_date) : "",
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }
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
  SubmitAck() {
    this.submitted = true
    console.log(this.pickupForm.value)
    if (this.pickupForm.valid) {
      const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/AddEditPickupRequestSchedule';
      console.log(this.pickupForm.value)

      this._onlineExamService.postPickupRequest(this.pickupForm.value, apiUrl)
        .subscribe(data => {
          console.log(data)
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
          this.getPickRequest();
        })
    }
  }
  close() {
    this.modalRef.hide();
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





  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  hidepopup() {
    // this.modalService.hide;
    this.modalRef.hide();
    //this.modalRef.hide
  }

  // Add(template: TemplateRef<any>){
  //   var that = this;

  //   this.pickupForm.reset()
  //   this.pickupForm = this.formBuilder.group({
  //     request_id:[''],
  //     service_type: ['', Validators.required],
  //     document_type: ['', Validators.required],
  //     main_file_count: [null], // No validators, will be validated conditionally
  //     collateral_file_count: [null],  
  //     User_Token: localStorage.getItem('User_Token') ,
  //     Id: localStorage.getItem('UserID') , 

  //   });
  //   this.modalRef = this.modalService.show(template); 
  // }
  AckData: any
  Editinward(template: TemplateRef<any>, row: any) {
    // console.log(row)
    this.submitted = false
    this.pickupForm.patchValue({
      'request_id': row.request_id,
      'pickup_request_id': row.pickup_request_id,
      'schedule_date': row.schedule_date,
      // 'reschedule_date':row.reschedule_date,
      'form_schedule_date': row.form_schedule_date,
      'reschedule_date': row.form_reschedule_date,
      'reschedule_reason': row.reschedule_reason,
      'vehicle_number': row.vehicle_number,
      'escort_number': row.escort_number,
      'escort_name': row.escort_name,
      'pickup_address': row.address,

      User_Token: localStorage.getItem('User_Token'),
      userid: localStorage.getItem('UserID'),

    })
    if (row.schedule_date) {
      this.rescheduleBoolean = false;

      this.pickupForm.get('reschedule_date').setValidators([Validators.required]);
      this.pickupForm.get('reschedule_date').updateValueAndValidity()
      this.pickupForm.get('reschedule_reason').setValidators([Validators.required]);
      this.pickupForm.get('reschedule_reason').updateValueAndValidity()
    }
    else {
      this.rescheduleBoolean = true;
      this.pickupForm.get('reschedule_date').clearValidators();
      this.pickupForm.get('reschedule_date').updateValueAndValidity()
      this.pickupForm.get('reschedule_reason').clearValidators();
      this.pickupForm.get('reschedule_reason').updateValueAndValidity()
    }


    this.modalRef = this.modalService.show(template);

  }



  Edit(data: any) {
    // console.log(data.request_id)
    this.dialog.open(NewPickupRequestComponent, {
      width: "500px",
      data: data.request_id
    })

  }
  deletedata(id: any) {
    // console.log(id)
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
