import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
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
@Component({
  selector: "app-approval",
  templateUrl: "approval.component.html",
})
export class ApprovalComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  AddBranchForm: FormGroup;
  submitted = false;
  Reset = false;     
  sMsg: string = '';    
 _BranchList :any;
  BranchForm: FormGroup;
  _FilteredList :any; 
 _BranchID: any =0;
// _FilteredList:any;
 //_IndexPendingList:any;
 first = 0;
rows = 10;

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) {}
  ngOnInit() {
    this.AddBranchForm = this.formBuilder.group({
      branch_id: ['', Validators.required],
      user_id: ['', Validators.required],     
      User_Token: localStorage.getItem('User_Token') ,
      userid: localStorage.getItem('UserID') ,
      id:[]
    });
    this.getApprovalList();
    this.geCrownBranchList();
    this.getApprovalUser();

  }
  get FormControls(){return this.AddBranchForm.controls}

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
  getApprovalList() {
    
    const apiUrl=this._global.baseAPIUrl+'Retrival/GetRetrivalPprooval?user_Token='+ localStorage.getItem('User_Token') 
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {   
      
      this._BranchList = data;
      this._FilteredList = data
this.prepareTableData( this._BranchList,  this._FilteredList); 

    });
  }
  AllCrownBranch:any
  geCrownBranchList() {
    
    const apiUrl=this._global.baseAPIUrl+'BranchMaster/GetBranchList?user_Token='+ localStorage.getItem('User_Token') 
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {   
   console.log(data)
this.AllCrownBranch=data
    });
  }
  AllApprovalUser:any
  getApprovalUser() {
    
    const apiUrl=this._global.baseAPIUrl+'Retrival/GetApprovalUser?user_Token='+ localStorage.getItem('User_Token') 
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {   
  //  console.log(data)
this.AllApprovalUser=data
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
  let tableHeader: any = [
    { field: 'srNo', header: "SR NO", index: 1 },
    { field: 'user_name', header: 'USER NAME', index: 2 },
    { field: 'branch_name', header: 'BRANCH NAME', index: 3 },
   

 
  ];
 
  tableData.forEach((el, index) => {
    formattedData.push({
      'srNo': parseInt(index + 1),
      'user_name': el.user_name,
       'branch_name': el.branch_name,
        'id': el.id,
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
  if(val == '') {
    this.formattedData = this.immutableFormattedData;
  } else {
    let filteredArr = [];
    const strArr = val.split(',');
    this.formattedData = this.immutableFormattedData.filter(function (d) {
      for (var key in d) {
        strArr.forEach(el => {
          if (d[key] && el!== '' && (d[key]+ '').toLowerCase().indexOf(el.toLowerCase()) !== -1) {
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
  
    this.modalRef.hide();  

  }

  _DepartmentList:any
  getDepartmentList() {
    const apiUrl=this._global.baseAPIUrl+'Department/GetList?user_Token='+ localStorage.getItem('User_Token') 
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {     
      this._DepartmentList = data;
    //  this._FilteredList = data
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });
  }

  onSubmit() {
    this.submitted = true;
 //   console.log(this.AddBranchForm.value);
    if (this.AddBranchForm.invalid) {
      return;
    }
   var apiUrl = this._global.baseAPIUrl + 'Retrival/AddEditApprovalDetails';
    this._onlineExamService.postData(this.AddBranchForm.value,apiUrl).subscribe((data: {}) => {     
    // console.log(data);
     this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message">Folder Saved</span></div>',
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
     this.getApprovalList();
     this.OnReset()
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });


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
          
          const apiUrl = this._global.baseAPIUrl + 'Retrival/DeleteApproval?id='+id+'&User_Token='+ localStorage.getItem('User_Token')+'&userid='+localStorage.getItem('UserID');
          this._onlineExamService.DELETEData(apiUrl)     
          .subscribe( data => {
              swal.fire({
                title: "Deleted!",
                text: "Approval has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });
              this.getApprovalList();
            });
        }
      });
  }
  _SingleDepartment:any
  editBranch(template: TemplateRef<any>, row: any) {
      var that = this;
      that._SingleDepartment = row;
    //  console.log('data', row);
      this.AddBranchForm.patchValue({
        id: that._SingleDepartment.id,
        branch_code: that._SingleDepartment.branch_code,
        branch_name: that._SingleDepartment.branch_name,
      address:that._SingleDepartment.address,
      crown_branch_name:that._SingleDepartment.crown_branch_name,
        User_Token: localStorage.getItem('User_Token') ,
        userid: localStorage.getItem('UserID') ,
         
      })
     // console.log('form', this.AddBranchForm);
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    this.modalRef = this.modalService.show(template);
  }
  // BRANCH CODE UNQUIE CHAHIYE
  addBranch(template: TemplateRef<any>) {
    this.submitted=false
    this.AddBranchForm.reset()
    this.AddBranchForm = this.formBuilder.group({
      branch_id: ['', Validators.required],
      user_id: ['', Validators.required],     
      User_Token: localStorage.getItem('User_Token') ,
      userid: localStorage.getItem('UserID') ,
      id:[]
    });
    this.modalRef = this.modalService.show(template);
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }
}
