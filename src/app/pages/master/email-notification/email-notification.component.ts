import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { ThirdPartyDraggable } from "@fullcalendar/interaction";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

// function multipleEmails(control: AbstractControl): { [key: string]: any } | null {
//   const emails = control.value.split(',').map(email => email.trim());
//   const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//   for (const email of emails) {
//     if (!emailPattern.test(email)) {
//       return { invalidEmail: true };
//     }
//   }

//   return null;
// }
function multipleEmails(
  control: AbstractControl
): { [key: string]: boolean } | null {
  if (!control.value) return null;

  const emails = control.value.split(",").map((email) => email.trim());
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  const invalid = emails.some((email) => !emailRegex.test(email));
  return invalid ? { invalidEmails: true } : null;
}

@Component({
  selector: "app-email-notification",
  templateUrl: "./email-notification.component.html",
  styleUrls: ["./email-notification.component.css"],
})
export class EmailNotificationComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  AddBranchForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  _BranchList: any;
  BranchForm: FormGroup;
  _FilteredList: any;
  _BranchID: any = 0;
  // _FilteredList:any;
  //_IndexPendingList:any;
  first = 0;
  rows = 10;

  activityTypes = [
  { label: 'Inventory', value: 'Inventory' },
  { label: 'Retrieval', value: 'Retrieval' },
  { label: 'Refiling', value: 'Refiling' },
  { label: 'Destruction', value: 'Destruction' },
];

serviceTypesMaster = {
  Inventory: [
    // { label: 'Inventory', value: 'Inventory' },
    { label: 'Create Inventory', value: 'Create Inventory' },
    { label: 'Inventory Approval', value: 'Inventory Approval' },
    { label: 'Inventory Reject', value: 'Inventory Reject' },
    { label: 'Pickup Schedule', value: 'Pickup Schedule' },
    { label: 'Pickup Reject', value: 'Pickup Reject' },
    { label: 'Inventory Acknowledge', value: 'Inventory Acknowledge' },
    { label: 'Inventory Not Received', value: 'Inventory Not Received' },
    { label: 'Carton Storage', value: 'Carton Storage' }
  ],
  Retrieval: [
    { label: 'Retrieval Request', value: 'Retrieval Request' },
    { label: 'Request Approval', value: 'Request Approval' },
    { label: 'Request Reject', value: 'Request Reject' },
    { label: 'Retrieval Dispatch', value: 'Retrieval Dispatch' },
    { label: 'Retrieval Acknowledge', value: 'Retrieval Acknowledge' },
    { label: 'Retrieval Not Acknowledged', value: 'Retrieval Not Acknowledged' }
  ],
  Refiling: [
    { label: 'Send To Storage', value: 'Send To Storage' },
    { label: 'Return Approval', value: 'Return Approval' },
    { label: 'Return Reject', value: 'Return Reject' },
    { label: 'Return Pickup Schedule', value: 'Return Pickup Schedule' },
    { label: 'Return Acknowledgement', value: 'Return Acknowledgement' },
    { label: 'Return Not Acknowledgement', value: 'Return Not Acknowledgement' },
    { label: 'Carton Location Update', value: 'Carton Location Update' }
  ],
  Destruction:[
    { label: 'Annual Review', value: 'Annual Review'},
    { label: 'Pending Destruction', value: 'Pending Destruction'},
    { label: 'Bulk Destruction', value: 'Bulk Destruction'}
  ]
};

serviceTypes: any[] = [];




  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) {}


  ngOnInit() {
    this.AddBranchForm = this.formBuilder.group({ 
      activity_type: [null, Validators.required],
      service_type: ["", Validators.required],
      //branch_id: ['', Validators.required],
      // to_email_id: ["", [Validators.required, multipleEmails]],
      // bcc_email_id: ["", multipleEmails],
      // cc_email_id: ["", Validators.required, multipleEmails],
      to_email_id: [""],
      cc_email_id: [""],
      subject: ["", Validators.required],
      body: [""],
      User_Token: localStorage.getItem("User_Token"),
      userid: localStorage.getItem("UserID"),
      id: [],
    });
    this.getEmailList();
    this.getAllBranchList();

    
  }
  
  bootstrap: any;
  ngAfterViewInit() {
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(el => new this.bootstrap.Tooltip(el));
}


  get FormControls() {
    return this.AddBranchForm.controls;
  }
  

  showSubActivityTooltip = false;
  onActivityChange(selectedActivity: any) {
    debugger
    const activityValue = selectedActivity?.value;
  this.serviceTypes = this.serviceTypesMaster[activityValue] || [];
  this.AddBranchForm.controls['service_type'].reset();

  
  this.showSubActivityTooltip = !!activityValue;
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
  AllBranch: any;
  getAllBranchList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchMaster/GetbranchDeatilsByUserId?USER_ID=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log(data);
      this.AllBranch = data;
    });
  }
  getEmailList() {
    debugger
    const apiUrl =
      this._global.baseAPIUrl +
      "EmailNotification/GetEmailNotificationAll?user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log(data);
      this._BranchList = data;
      this._FilteredList = data;
      this.prepareTableData(this._BranchList, this._FilteredList);
    });
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
    // let tableHeader: any = [
    //   { field: 'srNo', header: "SR NO", index: 1 },
    //   { field: 'branch_code', header: 'BRANCH CODE', index: 2 },
    //   { field: 'service_type', header: 'SERVICE TYPE', index: 2 },
    //   { field: 'cc_email_id', header: 'CC', index: 2 },
    //   { field: 'subject', header: 'SUBJECT', index: 2 },

    // ];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      //{ field: 'branch_code', header: 'BRANCH CODE', index: 2 },
      { field: "service_type", header: "ACTIVITY", index: 2 },
      // { field: "to_email_id", header: "TO EMAIL", index: 2 },
      // { field: "cc_email_id", header: "CC EMAIL", index: 2 },
      // { field: "bcc_email_id", header: "BCC", index: 2 },
      { field: "subject", header: "SUBJECT", index: 2 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        cc_email_id: el.cc_email_id,
        service_type: el.service_type,
        subject: el.subject,
        // 'branch_code':el.branch_code,
        body: el.body,
        branch_id: el.branch_id,
        id: el.id,
        to_email_id: el.to_email_id,
        bcc_email_id: el.bcc_email_id,
      });
    });
    this.headerList = tableHeader;
    //}

    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
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

  OnReset() {
    this.modalRef.hide();
  }

  currentAddress: string;
  ShowAddress(id: any) {
    // console.log(id)
    for (let i = 0; i < this.AllBranch.length; i++) {
      if (id == this.AllBranch[i].id) {
        this.currentAddress = this.AllBranch[i].address;
        // console.log(this.AllBranch[i])
        break;
      }
    }
    // console.log(this.AllBranch[id].address)
    // this.currentAddress=this.AllBranch[id].address
    //array me se filter karna hoga eddress ko
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

  onSubmit() {
    this.submitted = true;
    debugger;
    console.log(this.AddBranchForm.value);
    if (this.AddBranchForm.invalid) {
      this.ShowErrormessage("Please fill in all required fields correctly.");
      return;
    }

    var apiUrl =
      this._global.baseAPIUrl + "EmailNotification/InsertEmailNotification";

    console.log(this.AddBranchForm.value);
    this._onlineExamService
      .postData(this.AddBranchForm.value, apiUrl)
      .subscribe((data: {}) => {
        // console.log(data);
        if (data === "Record Already Exists") {
          this.ShowErrormessage("Record Already Exists");
        } else
          this.toastr.show(
            '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message">New Email notification addedd successfully!</span></div>',
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
        this.getEmailList();
        this.OnReset();
        //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
      });

    //this.studentForm.patchValue({File: formData});
  }

  deleteBrnach(id: any) {
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
            "EmailNotification/DeleteEmailNotification?id=" +
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
            this.getEmailList();
          });
        }
      });
  }
  _SingleDepartment: any;
editBranch(template: TemplateRef<any>, row: any) {
  this.FormText = "Update Email Notification";
  this._SingleDepartment = row;

  // Step 1: Find the activity by checking which key in serviceTypesMaster includes the service_type
  let matchedActivity: string | null = null;
  for (const activity in this.serviceTypesMaster) {
    if (this.serviceTypesMaster[activity].some(st => st.value === row.service_type)) {
      matchedActivity = activity;
      break;
    }
  }

  // Step 2: Populate serviceTypes list based on found activity
  if (matchedActivity) {
    this.serviceTypes = this.serviceTypesMaster[matchedActivity];
  }

  // Step 3: Initialize the form
  this.AddBranchForm = this.formBuilder.group({
    activity_type: [matchedActivity, Validators.required],
    service_type: [row.service_type, Validators.required],
    // to_email_id: [row.to_email_id, Validators.required],
    // cc_email_id: [row.cc_email_id, Validators.required],
    
    to_email_id: [row.to_email_id],
    cc_email_id: [row.cc_email_id],
    subject: [row.subject, Validators.required],
    body: [row.body, Validators.required],
    User_Token: localStorage.getItem("User_Token"),
    userid: localStorage.getItem("UserID"),
    id: [row.id],
  });

  this.ShowAddress(row.branch_id);

   this.modalRef = this.modalService.show(template, {
      class: "modal-lg custom-modal-width",
      keyboard: true,
      backdrop: "static",
    });
}

  FormText = "Add Email Notification";
  addBranch(template: TemplateRef<any>) {
    this.FormText = "Add Email Notification";
    this.AddBranchForm.reset();
    this.submitted = false;
    this.AddBranchForm = this.formBuilder.group({
       activity_type: [null, Validators.required],
      service_type: ["", Validators.required],
      //branch_id: ['', Validators.required],
      // to_email_id: ["", [Validators.required, multipleEmails]],
      // cc_email_id: ["", Validators.required, multipleEmails],
      to_email_id: [""],
      cc_email_id: [""],
      // bcc_email_id: ["", multipleEmails],
      subject: ["", Validators.required],
      body: ["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      userid: localStorage.getItem("UserID"),
      id: [],
    });

    // this.AddBranchForm = this.formBuilder.group({
    //   service_type: ['', Validators.required],
    //   branch_id: ['', Validators.required],
    //   cc_email_id: ['', Validators.required],
    //   subject: ['', Validators.required],
    //   body: ['', Validators.required],
    //   User_Token: localStorage.getItem('User_Token') ,
    //   userid: localStorage.getItem('UserID') ,
    //   id:[]
    // });
    this.modalRef = this.modalService.show(template, {
      class: "modal-lg custom-modal-width",
      keyboard: true,
      backdrop: "static",
    });
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }
}
function ngAfterViewInit() {
  throw new Error("Function not implemented.");
}

