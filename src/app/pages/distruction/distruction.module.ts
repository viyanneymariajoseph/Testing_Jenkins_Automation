import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnualReviewComponent } from './annual-review/annual-review.component';
import { DistructionFormComponent } from './distruction-form/distruction-form.component';
import { PendingDistructionComponent } from './pending-distruction/pending-distruction.component';
import { BulkDistructionComponent } from './bulk-distruction/bulk-distruction.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { DepartmentRoutes } from './distruction.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsDatepickerModule, BsDropdownModule, ModalModule, PaginationModule, ProgressbarModule, TooltipModule } from 'ngx-bootstrap';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { MatDialogModule } from '@angular/material/dialog';
import { CalendarModule } from 'primeng/calendar';


@NgModule({
  declarations: [
    AnnualReviewComponent,
    DistructionFormComponent,
    PendingDistructionComponent,
    BulkDistructionComponent
  ],
  imports: [
    CommonModule,
        CommonModule,
        MatDatepickerModule,
        MatInputModule,
        MatFormFieldModule,
        MultiSelectModule,
        MatNativeDateModule,
        RouterModule.forChild(DepartmentRoutes),
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        ProgressbarModule.forRoot(),
        BsDropdownModule.forRoot(),
        BsDatepickerModule.forRoot(),
        PaginationModule.forRoot(),
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        // NgxPrintModule,
        CheckboxModule,
        TableModule,
        MatDialogModule,
        CalendarModule,
  ]
})
export class DistructionModule { }
