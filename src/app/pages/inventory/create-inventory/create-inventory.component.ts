import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
  AbstractControl,
  ValidatorFn,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { Location } from "@angular/common";
import { CommonService } from "src/app/Services/common.service";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

export function noSpaceValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const hasSpace = (control.value || '').includes(' ');
    return hasSpace ? { noSpace: true } : null;
  };
}

export function noSpecialCharExceptAllowed(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) return null;

    // Allow everything except commas
    const valid = /^[^,]*$/.test(value);

    return valid ? null : { invalidCharacters: true };
  };
}

@Component({
  selector: "app-create-inventory",
  templateUrl: "./create-inventory.component.html",
  styleUrls: ["./create-inventory.component.scss"],
})
export class CreateInventoryComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  _FilteredList: any;
  isDepartmentDisabled = false;

  isDepartmentReadOnly: boolean = false;
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
  tableDepartmentName: string = '';
  hasDepartmentPatched: boolean = false;
  isInitialLoading: boolean = true;
  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private _commonService: CommonService,
  ) { }

  ngOnInit() {
    this.AddFileInwardForm = this.formBuilder.group({
      batchId: ['', Validators.required],
      documentType: ["", Validators.required],
      department: ["", Validators.required],
      cartonNo: ["", [Validators.required, noSpaceValidator(), noSpecialCharExceptAllowed()]],
      detailDocumentType: ["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      UserID: localStorage.getItem("UserID"),
      pickUpDate: ['']
    });

    const savedDepartment = localStorage.getItem('SavedDepartment');
    if (savedDepartment) {
      this.AddFileInwardForm.controls["department"].patchValue(+savedDepartment);
      this.AddFileInwardForm.controls["department"].disable({ emitEvent: false });
    }

    this.GetBatchID();
    this.getDepartmentDetails();
    // this.getDocumentTypeDetails();
    this.prepareTableData([]);
    this.fileBarcodeList = [];
  }


  get FormControls() {
    return this.AddFileInwardForm.controls;
  }
  SaveData() {
    debugger
    this.submitted = true;
    if (this.AddFileInwardForm.valid) {
      const rawForm = this.AddFileInwardForm.getRawValue();
      const payload = {
        ...rawForm,
        detailDocumentType: Array.isArray(rawForm.detailDocumentType)
          ? rawForm.detailDocumentType.map((item) => item.id).join(",")
          : rawForm.detailDocumentType,
      };
      this._onlineExamService.postData(payload, this._global.baseAPIUrl + "BranchInward/AddUpdateInventory")
        .subscribe((data) => {
          let response = JSON.parse(data as string);
          if (response[0].message === 'Carton No. already exists') {
            const cartonNo = this.AddFileInwardForm.get('cartonNo')?.value || '';
            this.ShowErrormessage(response[0].message

            );
          } else {
            this.ShowMessage(response[0].message);
            this.GetBatchDetails();
            const batchIdValue = this.AddFileInwardForm.get('batchId')?.value;
            const departmentValue = this.AddFileInwardForm.get('department')?.value;
            localStorage.setItem('SavedDepartment', departmentValue);
            this.AddFileInwardForm.reset();
            this.AddFileInwardForm.patchValue({
              batchId: batchIdValue,
              department: departmentValue,
              documentType: '',
              cartonNo: '',
              detailDocumentType: '',
              pickUpDate: '',
              User_Token: localStorage.getItem("User_Token"),
              UserID: localStorage.getItem("UserID")
            });
            this.AddFileInwardForm.controls["department"].disable({ emitEvent: false });
            this.AllLanData = null;
            this.fileBarcodeList = [];
          }

          this.submitted = false;
        });
    }
  }

  AllData: any;
  GetBatchID() {
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchInward/GetBatchId?UserID=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data && data.length > 0) {
        this.AddFileInwardForm.controls["batchId"].setValue(data[0].batchId);
        this.GetBatchDetails();
      }
    });
  }


  AllLanData: any;

  // GetBatchDetails() {
  //   debugger;
  //   this.fileBarcodeList = [];
  //   const apiUrl =
  //     this._global.baseAPIUrl +
  //     "BranchInward/GetBatchDetails?batchId=" +
  //     this.AddFileInwardForm.controls["batchId"].value +
  //     "&User_Token=" +
  //     localStorage.getItem("User_Token") +
  //     "&UserID=" +
  //     localStorage.getItem("UserID");

  //   this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
  //     this.prepareTableData(data);

  //     if (data && data.length > 0) {
  //       // Get department name from first row of table
  //       const departmentNameFromTable = data[0].departmentName || data[0].department || '';
  //       this.tableDepartmentName = departmentNameFromTable;

  //       // Find the department ID from dropdown matching the department name
  //       const matchingDepartment = this.departmentDropdown.find(dep => dep.label === departmentNameFromTable);

  //       // Patch the value only once, and only if not already patched (prevents blinking)
  //       if (matchingDepartment && !this.hasDepartmentPatched) {
  //         this.AddFileInwardForm.controls["department"].patchValue(matchingDepartment.value, { emitEvent: false });
  //         localStorage.setItem('SavedDepartment', matchingDepartment.value);
  //         this.AddFileInwardForm.controls["department"].disable({ emitEvent: false });
  //         this.hasDepartmentPatched = true;
  //       } else if (!matchingDepartment) {
  //         this.AddFileInwardForm.controls["department"].patchValue('');
  //         this.AddFileInwardForm.controls["department"].enable({ emitEvent: false });
  //         localStorage.removeItem('SavedDepartment');
  //       }
  //     } else {
  //       // No cartons yet => allow selection
  //       this.AddFileInwardForm.controls["department"].enable({ emitEvent: false });
  //       this.AddFileInwardForm.controls["department"].patchValue('');
  //       localStorage.removeItem('SavedDepartment');
  //       this.tableDepartmentName = '';
  //     }
     
  //     this.isInitialLoading = false;
  //   });
  // }
GetBatchDetails() {
  debugger;
  this.fileBarcodeList = [];
  const apiUrl =
    this._global.baseAPIUrl +
    "BranchInward/GetBatchDetails?batchId=" +
    this.AddFileInwardForm.controls["batchId"].value +
    "&User_Token=" +
    localStorage.getItem("User_Token") +
    "&UserID=" +
    localStorage.getItem("UserID");

  this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
    this.prepareTableData(data);

    if (data && data.length > 0) {
      const departmentNameFromTable = data[0].departmentName || data[0].department || '';
      this.tableDepartmentName = departmentNameFromTable;

      const matchingDepartment = this.departmentDropdown.find(dep => dep.label === departmentNameFromTable);

      if (matchingDepartment && !this.hasDepartmentPatched) {
        this.AddFileInwardForm.controls["department"].patchValue(matchingDepartment.value, { emitEvent: false });
        localStorage.setItem('SavedDepartment', matchingDepartment.value);
        this.AddFileInwardForm.controls["department"].disable({ emitEvent: false });
        this.hasDepartmentPatched = true;

        // ✅ Call getDocumentTypeDetails here
        this.getDocumentTypeDetails(matchingDepartment.value);
      } else if (!matchingDepartment) {
        this.AddFileInwardForm.controls["department"].patchValue('');
        this.AddFileInwardForm.controls["department"].enable({ emitEvent: false });
        localStorage.removeItem('SavedDepartment');
      }
    } else {
      this.AddFileInwardForm.controls["department"].enable({ emitEvent: false });
      this.AddFileInwardForm.controls["department"].patchValue('');
      localStorage.removeItem('SavedDepartment');
      this.tableDepartmentName = '';
    }

    this.isInitialLoading = false;
  });
}

  departmentDropdown = [];
  documentTypeDropdown = [];

  onDepartmentChange(event: any) {
    const selectedDeptId = event.target.value;

    if (selectedDeptId) {
      this.getDocumentTypeDetails(selectedDeptId);
      this.AddFileInwardForm.patchValue({ documentType: '', detailDocumentType: '' });
    }
  }

  getDepartmentDetails() {
    const apiUrl =
      this._global.baseAPIUrl +
      "Department/GetDetails?ID=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data) {
        console.log("Department", data);
        this.departmentDropdown = (data || []).map((item) => {
          return {
            label: item.DepartmentName,
            value: item.id,
          };
        });
      }
    });
  }

  getDocumentTypeDetails(departmentId: number) {
    const apiUrl =
      this._global.baseAPIUrl +
      "Department/GetDocumentType?ID=" + departmentId +
      "&user_Token=" + localStorage.getItem("User_Token");

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data) {
        this.documentTypeDropdown = (data || []).map((item) => {
          return {
            label: item.documents,
            value: item.id,
          };
        });
      }
    });
  }



  onBack() {
    this.router.navigateByUrl("/process/pod-ack");
  }
  document_id: any[];
onSelectDocument() {
  debugger;
  this.document_id = []; 
  const documentTypeId = this.AddFileInwardForm.controls["documentType"].value;
  const departmentId = this.AddFileInwardForm.controls["department"].value; 

  if (!documentTypeId || !departmentId) return;

  const apiUrl = this._global.baseAPIUrl +
    "Department/GetDetailDocumentType?ID=" + documentTypeId +
    "&departmentId=" + departmentId +
    "&user_Token=" + localStorage.getItem("User_Token");

  this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
    this.document_id = data.map((item: any) => ({
      name: item.DocumentDetails,
      id: item.id,
    }));
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
  prepareTableData(tableData) {
    let formattedData = [];
    this.headerList = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "batchId", header: "BATCH ID", index: 2 },
      { field: "cartonNo", header: "CARTON NUMBER", index: 2 },
      { field: "departmentName", header: "DEPARTMENT NAME", index: 3 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },
      { field: "documentType", header: "DOCUMENT TYPE", index: 4 },
      { field: "detailDocumentType", header: "DETAIL DOCUMENT TYPE", index: 3 },
      { field: "status", header: "CARTON STATUS", index: 3 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: index + 1,
        batchId: el.batchId,
        id: el.id,
        cartonNo: el.cartonNo,
        departmentId: el.departmentId || el.DepartmentID || '',
        departmentName: el.departmentName || el.department || '',
        documentType: el.documentTypeName,
        detailDocumentType: el.detailDocumentTypeName,
        status: el.status,
        DepartmentCode: el.DepartmentCode
      });
    });

    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  // DeleteRecord(car) {
  //   if (confirm("Are You Sure ?")) {
  //     const apiUrl = this._global.baseAPIUrl + "BranchInward/DeleteBatchDetails";
  //     this._onlineExamService
  //       .postData(
  //         {
  //           ...this.AddFileInwardForm.value,
  //           id: car.id,
  //         },
  //         apiUrl
  //       )
  //       .subscribe((data: {}) => {
  //         this.GetBatchDetails();
  //       });
  //   }
  // }

  // CloseRequest() {
  //   if (this.formattedData.length != 0) {
  //     const apiUrl =
  //       this._global.baseAPIUrl + "BranchInward/CloseBatch";
  //     this._onlineExamService
  //       .postData(this.AddFileInwardForm.value, apiUrl)

  //       .subscribe((data: {}) => {
  //         console.log(data);
  // this.location.back();
  //         this.ShowMessage(data);      });
  //   } else {
  //     this.ShowErrormessage("Data Not Found");
  //   }
  // }
  DeleteRecord(car: any) {
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
          // this.AddFileInwardForm.patchValue({
          //   id: Row.id,
          //   carton_number: Row.carton_number,
          //   User_Token: localStorage.getItem('User_Token'),
          // });

          const that = this;
          const apiUrl = this._global.baseAPIUrl + "BranchInward/DeleteBatchDetails";
          this._onlineExamService.postData(
            {
              ...this.AddFileInwardForm.value,
              id: car.id,
            },
            apiUrl
          )
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


  CloseRequest() {
    this.toastr.clear();
    if (this.formattedData.length != 0) {
      const apiUrl = this._global.baseAPIUrl + "BranchInward/CloseBatch";
      this._onlineExamService
        .postData(this.AddFileInwardForm.getRawValue(), apiUrl)
        .subscribe((data: any) => {
          this.location.back();
          this._commonService.setMessage(data);
        });
    } else {
      this.ShowErrormessage("Data Not Found");
    }
  }

  searchTable($event) {
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



  OnClose() {
    this.modalService.hide(1);
  }


  onSubmit() {
    this.location.back();
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

  showmessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Validation ! </span> <span data-notify="message"> ' +
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
            User_Token: localStorage.getItem("User_Token"),
          });

          const that = this;
          const apiUrl = this._global.baseAPIUrl + "BranchInward/Delete";
          this._onlineExamService
            .postData(this.AddFileInwardForm.value, apiUrl)
            .subscribe((data) => {
              swal.fire({
                title: "Deleted!",
                text: "Record has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });
            });
        }
      });
  }

  OnReset() {
    const currentDepartment = this.AddFileInwardForm.get('department')?.value;
    this.GetBatchID();
    this.AddFileInwardForm.reset({
      batchId: '',
      department: currentDepartment,
      documentType: '',
      cartonNo: '',
      detailDocumentType: '',
      User_Token: localStorage.getItem("User_Token"),
      UserID: localStorage.getItem("UserID"),
      pickUpDate: ''
    });
    if (currentDepartment) {
      this.AddFileInwardForm.controls["department"].disable({ emitEvent: false });
    }
    this.submitted = false;
  }

}
