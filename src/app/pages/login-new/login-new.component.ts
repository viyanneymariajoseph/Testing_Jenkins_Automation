import { Component, Input, OnInit } from "@angular/core";
import { Globalconstants } from "../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../Services/online-exam-service.service";

import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { HttpEventType, HttpClient } from '@angular/common/http';
import swal from "sweetalert2";
import { AuthenticationService } from '../../Services/authentication.service';
import { DxiConstantLineModule } from "devextreme-angular/ui/nested";
//
@Component({
  selector: 'app-login-new',
  templateUrl: './login-new.component.html',
  styleUrls: ['./login-new.component.scss']
})
export class LoginNewComponent implements OnInit {
  pageNames: string[] = [];
  loginForm: FormGroup;
  submitted = false;
  _LogData: any;

  public captchaIsLoaded = false;
  public captchaSuccess = false;
  public captchaIsExpired = false;
  public captchaResponse?: string;

  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'en';
  public type: 'image' | 'audio';
  @Input() passwordControl: FormControl;
  hidePassword: boolean = true;
  showHelp = false;

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
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

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.required],
      //  recaptcha: ['', Validators.required]
    });

    localStorage.clear();
  }

  //   onSubmit() {

  //     this.submitted = true;
  //     // stop here if form is invalid
  //     if (this.loginForm.invalid) {
  //       return;
  //     }
  // this.getPageList();
  //     const apiUrl = this._global.baseAPIUrl + 'UserLogin/Create';
  //     this.authService.userLogin(this.loginForm.value, apiUrl).subscribe((data: any) => {

  //       console.log("that._LogData ", data);
  //       if (data.length > 0 && data[0].id != 0) {
  //         var that = this;
  //         that._LogData = data[0];
  //         //  console.log("that._LogData ",that._LogData.Days);      
  //         if (that._LogData.Days <= 15) {
  //           console.log(that._LogData.Days);
  //           var mess = " Your password expires in  " + that._LogData.Days + "  days. Change the password as soon as possible to prevent login problems"
  //           //var mess="Your password will be expired in  Days" 
  //           this.Message(mess);
  //         }


  //         localStorage.setItem('UserID', that._LogData.id);
  //         localStorage.setItem('currentUser', that._LogData.id);
  //         localStorage.setItem('UserType', that._LogData.UserType);
  //         localStorage.setItem('sysRoleID', that._LogData.sysRoleID);
  //         localStorage.setItem('User_Token', that._LogData.User_Token);
  //         localStorage.setItem('UserName', this.loginForm.get("username").value);

  //         if (this.loginForm.get("username").value == "admin") {
  //           this.router.navigate(['dashboards/dashboard']);
  //         }
  //         else if (this.loginForm.get("username").value == "upload") {
  //           this.router.navigate(['dashboards/dashboard']);
  //         } else {
  //           this.router.navigate(['dashboards/dashboard']);
  //         }

  //       }
  //       else {

  //         this.ErrorMessage(data[0].userid);
  //         //      alert("Invalid userid and password.");     
  //       }

  //     });
  //   }
  // getPageList() {
  //   const sysRoleId = Number(localStorage.getItem('sysRoleID'));
  //   const token = localStorage.getItem('User_Token');

  //   if (!sysRoleId || !token) {
  //     console.warn('getPageList: missing sysRoleID or token');
  //     return;
  //   }

  //   const apiUrl = `${this._global.baseAPIUrl}Role/GetPageList?ID=${sysRoleId}&user_Token=${encodeURIComponent(token)}`;

  //   this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
  //     if (!Array.isArray(data)) {
  //       console.warn('Unexpected API response:', data);
  //       return;
  //     }

  //     this.pageNames = data
  //       .map(item => item.page_name || item.PageName)
  //       .filter(name => !!name); 

  //     console.log('Page Names:', this.pageNames);
  //   });
  // }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    const apiUrl = this._global.baseAPIUrl + 'UserLogin/Create';

    this.authService.userLogin(this.loginForm.value, apiUrl).subscribe((data: any) => {
      if (!data || data.length === 0 || data[0].id === 0) {
        this.ErrorMessage('Invalid userid or password.');
        return;
      }

      const userData = data[0];
      this._LogData = userData;

      // Password expiry warning
      if (userData.Days && userData.Days <= 15) {
        const mess = `Your password expires in ${userData.Days} days. Change it soon to avoid login problems.`;
        this.Message(mess);
      }

      // Store login details
      localStorage.setItem('UserID', userData.id);
      localStorage.setItem('currentUser', userData.id);
      localStorage.setItem('UserType', userData.UserType);
      localStorage.setItem('sysRoleID', userData.sysRoleID);
      localStorage.setItem('User_Token', userData.User_Token);
      localStorage.setItem('UserName', this.loginForm.get('username').value);

      // ✅ Call getPageList only after credentials are stored
      this.getPageListAndNavigate();
    });
  }


getPageListAndNavigate() {
  const sysRoleId = Number(localStorage.getItem('sysRoleID'));
  const token = localStorage.getItem('User_Token');

  if (!sysRoleId || !token) {
    console.warn('getPageList: missing sysRoleID or token');
    return;
  }

  const apiUrl = `${this._global.baseAPIUrl}Role/GetPageList?ID=${sysRoleId}&user_Token=${encodeURIComponent(token)}`;

  this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
    if (!Array.isArray(data)) {
      console.warn('Unexpected API response:', data);
      return;
    }

    console.log('Full data:', data);

    // ✅ Normalize and filter checked pages
    const pages = data
      .filter(item => Boolean(item.isChecked) || Boolean(item.ischecked))
      .map(item => {
        const rawName = (item.page_name || item.PageName || item.pageName || '').toString().trim();
        const name = rawName.toLowerCase();
        const url = (item.url || item.urlPath || '').toString().trim();
        return { name, url };
      })
      .filter(p => !!p.name);

    this.pageNames = pages.map(p => p.name);
    console.log('Filtered pages:', pages);

    // ✅ Always prefer Dashboard first
    const hasDashboard = this.pageNames.includes('dashboard');
    if (hasDashboard) {
      console.log('✅ Dashboard access granted (using fixed route).');
      this.router.navigate(['dashboards/dashboard']);
      return;
    }

    // ✅ Else, try Quick Search (use actual URL if available)
    const quickPage = pages.find(
      p =>
        p.name === 'quick search' ||
        p.name === 'quicksearch' ||
        p.name.includes('quick') ||
        (p.url && p.url.toLowerCase().includes('quick'))
    );

    if (quickPage) {
      console.log('✅ Quick Search access granted.', quickPage);

      if (quickPage.url && quickPage.url !== '#' && quickPage.url !== '/') {
        if (quickPage.url.includes('quick-search') && !quickPage.url.includes('/')) {
          this.router.navigate(['search/quick-search']);
        } else {
          this.router.navigate([quickPage.url]);
        }
      } else {
        this.router.navigate(['search/quick-search']);
      }
      return;
    }

    // ✅ Inventory-related pages (5 total)
    const inventoryMapping: { [key: string]: string } = {
      'pickup schedule': 'pickup-schedule',
      'inventory acknowledge': 'inventory-acknowledge',
      'carton storage': 'carton-storage',
      'inventory approval': 'inventory-approval',
      'carton inventory': 'carton-inventory',
    };

    const inventoryPage = pages.find(p =>
      Object.keys(inventoryMapping).some(key => p.name === key)
    );

    if (inventoryPage) {
      const matchedKey = Object.keys(inventoryMapping).find(key =>
        inventoryPage.name === key
      );
      const routeSegment = matchedKey ? inventoryMapping[matchedKey] : 'pickup-schedule';
      console.log(`✅ Inventory access granted for "${matchedKey}", navigating to inventory/${routeSegment}`);
      this.router.navigate([`inventory/${routeSegment}`]);
      return;
    }

    // ✅ Retrieval-related pages
    const retrievalMapping: { [key: string]: string } = {
      'retrieval request': 'retrival-request',
      'request approval': 'request-approval',
      'retrieval dispatch': 'retrival-dispatch',
      'retrieval acknowledge': 'retrieval-acknowledge',
    };

    const retrievalPage = pages.find(p =>
      Object.keys(retrievalMapping).some(key => p.name === key)
    );

    if (retrievalPage) {
      const matchedKey = Object.keys(retrievalMapping).find(key =>
        retrievalPage.name === key
      );
      const routeSegment = matchedKey ? retrievalMapping[matchedKey] : 'retrieval-acknowledge';
      console.log(`✅ Retrieval access granted for "${matchedKey}", navigating to retrival/${routeSegment}`);
      this.router.navigate([`retrival/${routeSegment}`]);
      return;
    }

    // ✅ RE-FILING block
    const refilingMapping: { [key: string]: string } = {
      'send to storage': 'send-to-storage',
      'return approval': 'return-approval',
      'return pickup schedule': 'warehouse-schedule',
      'return acknowledgement': 'warehouse-ack',
      'carton location update': 'warehouse-location-update'
    };

    const refilingPage = pages.find(p =>
      Object.keys(refilingMapping).some(key => p.name === key)
    );

    if (refilingPage) {
      const matchedKey = Object.keys(refilingMapping).find(key => refilingPage.name === key);
      const routeSegment = matchedKey ? refilingMapping[matchedKey] : 'send-to-storage';
      console.log(`✅ Refiling access granted for "${matchedKey}", navigating to Refiling/${routeSegment}`);
      this.router.navigate([`Refiling/${routeSegment}`]);
      return;
    }

    // ✅ MASTER block
    const masterMapping: { [key: string]: string } = {
      'department master': 'department-master',
      'document master': 'documents-master',  
      'warehouse master': 'warehouse-master',
      'email notification': 'email-notification'
    };

    const masterPage = pages.find(p =>
      Object.keys(masterMapping).some(key => p.name === key)
    );

    if (masterPage) {
      const matchedKey = Object.keys(masterMapping).find(key => masterPage.name === key);
      const routeSegment = matchedKey ? masterMapping[matchedKey] : 'department-master';
      console.log(`✅ Master access granted for "${matchedKey}", navigating to master/${routeSegment}`);
      this.router.navigate([`master/${routeSegment}`]);
      return;
    }

    // ✅ REPORT block (minimal insertion only)
    const reportMapping: { [key: string]: string } = {
      'inventory report': 'inventory-report',
      'retrieval report': 'retrieval-report',
      'destruction report': 'out-report',
      'warehouse location report': 'item-status-report',
      'refilling report': 'refilling-report',
      'user logs report': 'user-logs',
      'user matrix report': 'user-matrix'
    };

    const reportPage = pages.find(p =>
      Object.keys(reportMapping).some(key => p.name === key)
    );

    if (reportPage) {
      const matchedKey = Object.keys(reportMapping).find(key => reportPage.name === key);
      const routeSegment = matchedKey ? reportMapping[matchedKey] : 'inventory-report';
      console.log(`✅ Report access granted for "${matchedKey}", navigating to report/${routeSegment}`);
      this.router.navigate([`report/${routeSegment}`]);
      return;
    }
    // ----- End REPORT block -----

    // ----- DESTRUCTION block (insert after REPORT block, before final "no match" warning) -----
const destructionMapping: { [key: string]: string } = {
  'annual review': 'annual-review',
  'pending destruction': 'pending-distruction',
  'bulk destruction': 'bulk-destruction'
};

const destructionPage = pages.find(p =>
  Object.keys(destructionMapping).some(key => p.name === key)
);

if (destructionPage) {
  const matchedKey = Object.keys(destructionMapping).find(key => destructionPage.name === key);
  const routeSegment = matchedKey ? destructionMapping[matchedKey] : 'annual-review';
  console.log(`✅ Destruction access granted for "${matchedKey}", navigating to Destruction/${routeSegment}`);
  this.router.navigate([`Destruction/${routeSegment}`]);
  return;
}
// ----- End DESTRUCTION block -----
// ----- USER MANAGEMENT block -----
const userManagementMapping: { [key: string]: string } = {
  'add user': 'users',
  'add role': 'roles',
  'change password': 'change-password'
};

const userManagementPage = pages.find(p =>
  Object.keys(userManagementMapping).some(key => p.name === key)
);

if (userManagementPage) {
  const matchedKey = Object.keys(userManagementMapping).find(key => userManagementPage.name === key);
  const routeSegment = matchedKey ? userManagementMapping[matchedKey] : 'users';
  console.log(`✅ User Management access granted for "${matchedKey}", navigating to usermanagement/${routeSegment}`);
  this.router.navigate([`usermanagement/${routeSegment}`]);
  return;
}
// ----- End USER MANAGEMENT block -----



    // 🚫 No Dashboard, Quick Search, Inventory, Retrieval, Refiling, Master, or Report found
    console.warn('🚫 Neither Dashboard, Quick Search, Inventory, Retrieval, Refiling, Master, nor Report found.');
    this.ErrorMessage('You do not have permission to access the Dashboard, Quick Search, Inventory, Retrieval, Refiling, Master, or Report pages.');
  });
}






  handleSuccess(data) {

  }
  openHelp() {
    this.showHelp = true;
  }
  onPopupClick(event: MouseEvent) {
    event.stopPropagation();
  }

  closeHelp() {
    this.showHelp = false;
  }
  get f() {
    return this.loginForm.controls;
  }

  ErrorMessage(msg: any) {

    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title"></span> <span data-notify="message"> ' + msg + ' </span></div>',
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

  Message(msg: any) {

    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title"></span> <span data-notify="message"><h4 class="text-white"> ' + msg + ' <h4></span></div>',
      "",
      {
        timeOut: 7000,
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
