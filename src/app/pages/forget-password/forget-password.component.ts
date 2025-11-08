import { Component, OnInit } from "@angular/core";
import { Globalconstants } from "../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../Services/online-exam-service.service";

import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { HttpEventType, HttpClient } from '@angular/common/http';
import swal from "sweetalert2";
import {AuthenticationService} from '../../Services/authentication.service';
import { DxiConstantLineModule } from "devextreme-angular/ui/nested";



@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {

  ForgotPasswordForm: FormGroup;
  submitted = false;
  _LogData:any;


  constructor(

    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private http: HttpClient,
    private httpService: HttpClient

  ) { }

  ngOnInit(): void {

    this.ForgotPasswordForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required])]
   
    });

    localStorage.clear();
  }

onSubmit() { //gkj_28_08
  this.submitted = true;

  if (this.ForgotPasswordForm.invalid) {
    return;
  }

  const apiUrl = `${this._global.baseAPIUrl}UserLogin/Forgotpassword`;

  this.authService.userLogin(this.ForgotPasswordForm.value, apiUrl).subscribe({
    next: (res: any) => {
      if (!res) {
        this.ShowErrormessage("Unexpected response from server.");
        return;
      }

     
      if (res?.Message) {
        const password = res?.Data?.[0]?.pwd;

        if (password) {
          this.ShowMessage("Password has been sent to your email!");
          this.OnReset();
          this.logoutAfterSuccess();  
        } else {
          this.ShowErrormessage(res.Message);
        }
        return;
      }

     
      if (Array.isArray(res) && res.length > 0) {
        this.ShowMessage("Password reset link sent!");
        this.OnReset();
        this.logoutAfterSuccess(); 
        return;
      }

    
      this.ShowErrormessage("Invalid Email ID.");
    },
    error: (err) => {
      console.error("Forgot Password Error:", err);
      this.ShowErrormessage("Something went wrong. Please try again later.");
    }
  });
}

private logoutAfterSuccess() {  //gkj_28_08
  this.authService.logout();         
  this.router.navigate(['/login']);      
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
  ShowMessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success ! </span> <span data-notify="message"> ' +
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
          "ngx-toastr alert alert-dismissible alert-success alert-notify",
      }
    );
  }
  get f(){
    return this.ForgotPasswordForm.controls;
  }

  OnReset()
  {     
 // this.Reset = true;
  this.ForgotPasswordForm.reset();      

 // this.FileStatus="New";

  }

}
