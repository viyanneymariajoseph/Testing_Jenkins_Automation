import { Globalconstants } from "./../../../Helper/globalconstants";
import { OnlineExamServiceService } from "./../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup,FormControl, FormBuilder, Validators } from "@angular/forms";
import swal from "sweetalert2";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";

import { AuthenticationService } from './../../../Services/authentication.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  UserList: any;
  changepasswordform: FormGroup;
  submitted = false;
  Reset = false;
  //_UserList: any;
  sMsg: string = "";
  //RoleList: any;
  _SingleUser: any = [];
  _UserID: any;
lastToastMessage: string = "";
  public captchaIsLoaded = false;
  public captchaSuccess = false;
  public captchaIsExpired = false;
  public captchaResponse?: string;
showCurrentPwd: boolean = false;
showNewPwd: boolean = false;
showConfirmPwd: boolean = false;
  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'en';
  public type: 'image' | 'audio';

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    public toastr: ToastrService,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
        private router: Router,
         private authService: AuthenticationService //gkj_28_08
    

  ) { }
toggleCurrentPwd() {
  this.showCurrentPwd = !this.showCurrentPwd;
}
 
toggleNewPwd() {
  this.showNewPwd = !this.showNewPwd;
}
 
toggleConfirmPwd() {
  this.showConfirmPwd = !this.showConfirmPwd;
}
  ngOnInit(): void {

    this.changepasswordform = this.formBuilder.group({
      currentpwd: ["", Validators.required],
      pwd: ["", [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)]],
      confirmPass: ["", Validators.required],
      // recaptcha: ["", Validators.required],           
      User_Token: localStorage.getItem('User_Token') ,
      CreatedBy: localStorage.getItem('UserID')

    },{ 
      validator: this.ConfirmedValidator('pwd', 'confirmPass')
    });
     
  
  }
    //Newly added code 
    ConfirmedValidator(controlName: string, matchingControlName: string){
      return (formGroup: FormGroup) => {
          const control = formGroup.controls[controlName];
          const matchingControl = formGroup.controls[matchingControlName];
          if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
              return;
          }
          if (control.value !== matchingControl.value) {
              matchingControl.setErrors({ confirmedValidator: true });
          } else {
              matchingControl.setErrors(null);
          }
      }
  }
    get f(){
      return this.changepasswordform.controls;
    }

onSubmit() {//gkj_25_08
  this.submitted = true;

  Object.keys(this.changepasswordform.controls).forEach((key) => {
    const control = this.changepasswordform.get(key);
    if (control && typeof control.value === 'string') {
      control.setValue(control.value.trim());
    }
  });

  if (this.changepasswordform.invalid) {
    this.ShowMessage("Please fill all required fields", 'error');
    return;
  }

  const apiUrl = this._global.baseAPIUrl + 'UserLogin/Changepassword';

 this._onlineExamService.postData(this.changepasswordform.value, apiUrl).subscribe((data: any) => {
  const msg = data?.toString()?.trim();

  if (msg === 'Password Updated Successfully') {
    this.ShowMessage(msg, 'success');
    this.OnReset();
    this.authService.logout(); //gkj_28_08
this.router.navigate(['/login']);//gkj_28_08
  } else {
    this.ShowMessage(msg, 'error');
  }

  this.lastToastMessage = msg;
});

}


 ShowMessage(msg: string, type: 'success' | 'error' = 'success') {
  this.toastr.clear(); 
 
  const toastClass =
    type === 'success'
      ? 'ngx-toastr alert alert-dismissible alert-success alert-notify' // green
      : 'ngx-toastr alert alert-dismissible alert-danger alert-notify'; // red
 
  this.toastr.show(
    `<div class="alert-text">
      <span class="alert-title"></span>
      <span data-notify="message"><h4 class="text-white">${msg}</h4></span>
    </div>`,
    "",
    {
      timeOut: 3000,
      closeButton: true,
      enableHtml: true,
      tapToDismiss: false,
      titleClass: "alert-title",
      positionClass: "toast-top-center",
      toastClass: toastClass
    }
  );
}
 

  OnBack() {
    this.router.navigate(["/usermanagement/users"]);
  }

    
    sendMail() {
      this.submitted = true;
      //console.log(this.changepasswordform);
      if (this.changepasswordform.invalid) {
       // alert("Please Fill the Fields");
        return;
      }
      const apiUrl = this._global.baseAPIUrl + 'UserLogin/sendmailtocustomer';
      this._onlineExamService.postData(this.changepasswordform.value,apiUrl).subscribe((data: {}) => {     
    //   console.log(data);
     //   alert("Password changed successfully");

 
     
     
      });
  
      //this.studentForm.patchValue({File: formData});
    }
    
    handleSuccess(data) {
      console.log(data);
    }

OnReset(): void {
  this.changepasswordform.reset();
  this.submitted = false;

  // Optional: manually clear validators and update
  Object.keys(this.changepasswordform.controls).forEach(key => {
    this.changepasswordform.get(key)?.setErrors(null);
    this.changepasswordform.get(key)?.markAsPristine();
    this.changepasswordform.get(key)?.markAsUntouched();
    this.changepasswordform.get(key)?.updateValueAndValidity();
  });
}

 

}
