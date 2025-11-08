import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, Inject, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";

import { ToastrService } from "ngx-toastr";

import swal from "sweetalert2";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";



@Component({
  selector: 'app-new-pickup-request',
  templateUrl: './new-pickup-request.component.html',
  styleUrls: ['./new-pickup-request.component.scss']
})
export class NewPickupRequestComponent implements OnInit {
  
   
  submitted = false; 
 

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
  ){}
  pickupForm: FormGroup;
  ngOnInit(){
    document.body.classList.add('data-entry');
   
    this.pickupForm = this.formBuilder.group({
      service_type: ['', Validators.required],
      document_type: ['', Validators.required],
      main_file_count: [null], // No validators, will be validated conditionally
      collateral_file_count: [null],  
      User_Token: localStorage.getItem('User_Token') ,
      Id: localStorage.getItem('UserID') , 
      
    });
    if(true){
    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetAvansePickupRequestById?UserID='+localStorage.getItem('UserID')+'&user_Token='+ localStorage.getItem('User_Token')+'&id='+true;

      this._onlineExamService.getPickupDataById(apiUrl).subscribe({
        next:(res)=>{

        },
        error:(error)=>{

        }
      })
    }   
  }
toggleValidators() {
  const mainFileCountControl = this.pickupForm.get('main_file_count');
  const collateralFileCountControl = this.pickupForm.get('collateral_file_count');

  if (this.pickupForm.get('documentType').value === 'mainFile') {
    mainFileCountControl.setValidators([Validators.required]);
    collateralFileCountControl.clearValidators();
  } else if (this.pickupForm.get('documentType').value === 'collateralFile') {
    collateralFileCountControl.setValidators([Validators.required]);
    mainFileCountControl.clearValidators();
  } else {
    mainFileCountControl.clearValidators();
    collateralFileCountControl.clearValidators();
  }

  mainFileCountControl.updateValueAndValidity();
  collateralFileCountControl.updateValueAndValidity();
}
get PickupControls(){return this.pickupForm.controls}
onSubmit() {
this.submitted = true;
console.log(this.pickupForm.value)
if(!this.pickupForm.valid) {
  return;
}



const that = this;
const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/InsertUpdatePickupRequest';
this._onlineExamService.postPickupRequest(this.pickupForm.value,apiUrl)
.subscribe( data => {
    
this.toastr.show(
  '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message"> '+ data +' </span></div>',
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
// this.modalRef.hide();
// that.GetPODDetails();
//this.OnReset();      
});
// }

}
}