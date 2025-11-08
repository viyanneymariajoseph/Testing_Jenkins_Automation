import { Globalconstants } from "./Helper/globalconstants";
import { Listboxclass } from "./Helper/listboxclass";
import { AuthGuardService } from "./Services/auth-guard.service";
import { AuthenticationService } from "./Services/authentication.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ToastrModule } from "ngx-toastr";
import { TagInputModule } from "ngx-chips";
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppComponent } from "./app.component";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";
import { PresentationModule } from "./pages/presentation/presentation.module";

import { AppRoutingModule } from "./app-routing.module";
import { ComponentsModule } from "./components/components.module";
import { OnlineExamServiceService } from './Services/online-exam-service.service';

import { LoginNewComponent } from './pages/login-new/login-new.component';

import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HttpRequestInterceptor } from './Services/http-request-interceptor';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component';
// import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxCaptchaModule } from 'ngx-captcha';
import { BrowserModule } from '@angular/platform-browser';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
     TabViewModule ,
    BsDropdownModule.forRoot(),
    AppRoutingModule,
    ToastrModule.forRoot(),
    CollapseModule.forRoot(),
    TagInputModule,
    PresentationModule,
    MatProgressSpinnerModule,
    // NgMultiSelectDropDownModule.forRoot(),
    NgxCaptchaModule,
    BsDatepickerModule.forRoot(),
    TableModule
  ],
  declarations: [AppComponent, AdminLayoutComponent, AuthLayoutComponent,LoginNewComponent, ForgetPasswordComponent],
  providers: [AuthGuardService, Listboxclass, Globalconstants, { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule {}
