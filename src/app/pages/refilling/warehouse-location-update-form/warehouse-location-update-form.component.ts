import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { Location } from "@angular/common";
import { OnlineExamServiceService } from "src/app/Services/online-exam-service.service";
import { Globalconstants } from "src/app/Helper/globalconstants";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: "app-warehouse-location-update-form",
  templateUrl: "./warehouse-location-update-form.component.html",
  styleUrls: ["./warehouse-location-update-form.component.scss"],
})
export class WarehouseLocationUpdateFormComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  _FilteredList: any;
  isReadOnly: boolean = false;
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

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    this.AddFileInwardForm = this.formBuilder.group({
      requestId: [this.route.snapshot.params["id"], Validators.required],
      warehouseId: ["", Validators.required],
      location: ["", Validators.required],
      cartonNo: ["", [Validators.required]],
      User_Token: localStorage.getItem("User_Token"),
      UserID: localStorage.getItem("UserID"),
    });
    this.getWareHouseetails();
    this.GetBatchDetails();
    this.fileBarcodeList = [];
    this.prepareTableData([], []);
  }

  get FormControls() {
    return this.AddFileInwardForm.controls;
  }

 

  // SaveData(): void {
  //   debugger;
  //   this.submitted = true;

  //   if (this.AddFileInwardForm.valid) {
  //     const formData = this.AddFileInwardForm.value;

  //     const requestPayload = {
  //       requestNumber: formData.requestId,
  //       cartonNumber: formData.cartonNo,
  //       location: formData.location,
  //       warehouseId: formData.warehouseId,
  //       CreatedBy: formData.UserID,
  //       User_Token: formData.User_Token,
  //     };

  //     const apiUrl =
  //       this._global.baseAPIUrl + "Refilling/WarhouseReturnItemLocationUpdate";

  //     this._onlineExamService.postData(requestPayload, apiUrl).subscribe(
  //       (response: any) => {
  //         const message = response || "No response from server.";
  //         const isSuccess = message.toLowerCase().includes("success");

  //         this.toastr.show(
  //           `<div class="alert-text"></div>
  //          <span class="alert-title ${
  //            isSuccess ? "success" : "danger"
  //          }" data-notify="title">
  //            ${isSuccess ? "Success!" : "Failed!"}
  //          </span>
  //          <span data-notify="message"> ${message} </span>`,
  //           "",
  //           {
  //             timeOut: 3000,
  //             closeButton: true,
  //             enableHtml: true,
  //             tapToDismiss: false,
  //             titleClass: `alert-title ${isSuccess ? "success" : "danger"}`,
  //             positionClass: "toast-top-center",
  //             toastClass: `ngx-toastr alert alert-dismissible alert-${
  //               isSuccess ? "success" : "danger"
  //             } alert-notify`,
  //           }
  //         );

  //         if (isSuccess) {
  //           this.GetBatchDetails();
  //           this.AllLanData = null;
  //           this.fileBarcodeList = [];
  //           this.AddFileInwardForm.controls["cartonNo"].setValue("");
  //           // this.AddFileInwardForm.controls["location"].setValue("");
  //           //  this.AddFileInwardForm.controls["warehouseId"].setValue("");
  //         }
  //         this.location.back();

  //         this.submitted = false;
  //       },
  //       (error) => {
  //         const errorMessage =
  //           error?.error?.Message || "Server error occurred.";

  //         this.toastr.show(
  //           `<div class="alert-text"></div>
  //    <span class="alert-title danger" data-notify="title"> Error! </span>
  //    <span data-notify="message"> ${errorMessage} </span>`,
  //           "",
  //           {
  //             timeOut: 3000,
  //             closeButton: true,
  //             enableHtml: true,
  //             tapToDismiss: false,
  //             titleClass: "alert-title danger",
  //             positionClass: "toast-top-center",
  //             toastClass:
  //               "ngx-toastr alert alert-dismissible alert-danger alert-notify",
  //           }
  //         );

  //         this.submitted = false;
  //       }
  //     );
  //   }
  // }


  SaveData(): void {
  debugger;
  this.submitted = true;

  if (!this.AddFileInwardForm.valid) {
    this.toastr.show(
      '<div class="alert-text"></div><span class="alert-title" data-notify="title">Validation ! </span>' +
        '<span data-notify="message"> Please fill required fields. </span>',
      '',
      {
        timeOut: 3000,
      closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: 'alert-title',
        positionClass: 'toast-top-center',
        toastClass: 'ngx-toastr alert alert-dismissible alert-danger alert-notify',
      }
    );
    this.submitted = false;
    return;
  }

  const formData = this.AddFileInwardForm.value;
  const requestPayload = {
    requestNumber: formData.requestId,
    cartonNumber: formData.cartonNo,
    location: formData.location,
    warehouseId: formData.warehouseId,
    CreatedBy: formData.UserID,
    User_Token: formData.User_Token,
  };

  const apiUrl = this._global.baseAPIUrl + 'Refilling/WarhouseReturnItemLocationUpdate';

  // disable button via submitted flag while request is in-progress
  this.submitted = true;

  this._onlineExamService.postData(requestPayload, apiUrl).subscribe(
    (response: any) => {
      const message = response || 'No response from server.';
      const isSuccess = (message + '').toLowerCase().includes('success');

      this.toastr.show(
        `<div class="alert-text"></div>
         <span class="alert-title ${isSuccess ? 'success' : 'danger'}" data-notify="title">
           ${isSuccess ? 'Success!' : 'Failed!'}
         </span>
         <span data-notify="message"> ${message} </span>`,
        '',
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          titleClass: `alert-title ${isSuccess ? 'success' : 'danger'}`,
          positionClass: 'toast-top-center',
          toastClass: `ngx-toastr alert alert-dismissible alert-${isSuccess ? 'success' : 'danger'} alert-notify`,
        }
      );

      if (isSuccess) {
        // after successful save, re-fetch server-side batch/list for this request
        const listApi =
          this._global.baseAPIUrl +
          'Refilling/GetWarehouseReturnItemLocData?request_number=' +
          encodeURIComponent(this.AddFileInwardForm.controls['requestId'].value) +
          '&User_Token=' +
          encodeURIComponent(localStorage.getItem('User_Token')) +
          '&UserID=' +
          encodeURIComponent(localStorage.getItem('UserID'));

        this._onlineExamService.getAllData(listApi).subscribe(
          (data: any) => {
            // update the table UI with fresh data
            this.prepareTableData(data || [], data || []);

            // if server returned no more records for this request, navigate back
            if (!data || (Array.isArray(data) && data.length === 0)) {
              this.location.back();
            } else {
              // otherwise remain on page and clear inputs for next entry
              this.AllLanData = null;
              this.fileBarcodeList = [];
              this.AddFileInwardForm.controls['cartonNo'].setValue('');
              // optional: keep warehouse/location set so user can continue scanning multiple cartons
            }
            this.submitted = false;
          },
          (err) => {
            // if list fetch fails, keep user on page and show error
            const errMsg = err?.error?.Message || 'Failed to refresh list after save.';
            this.ShowErrormessage(errMsg);
            this.submitted = false;
          }
        );
      } else {
        // save failed — remain on page for user to correct & retry
        this.submitted = false;
      }
    },
    (error) => {
      const errorMessage = error?.error?.Message || 'Server error occurred.';
      this.toastr.show(
        `<div class="alert-text"></div>
         <span class="alert-title danger" data-notify="title"> Error! </span>
         <span data-notify="message"> ${errorMessage} </span>`,
        '',
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          titleClass: 'alert-title danger',
          positionClass: 'toast-top-center',
          toastClass: 'ngx-toastr alert alert-dismissible alert-danger alert-notify',
        }
      );

      this.submitted = false;
    }
  );
}

  AllData: any;
  GetrequestId() {
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchInward/GetrequestId?UserID=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data.length > 0) {
        this.AddFileInwardForm.controls["requestId"].setValue(
          data[0].requestId
        );
        this.GetBatchDetails();
      }
    });
  }

  setCartonNumber(car) {
    this.AddFileInwardForm.controls["cartonNo"].setValue(car.cartonNo);
    this.AddFileInwardForm.controls["warehouseId"].setValue(car.warehouseId);
    this.AddFileInwardForm.controls["location"].setValue(car.location);
  }

  AllLanData: any;
  GetBatchDetails() {
    this.fileBarcodeList = [];
    const apiUrl =
      this._global.baseAPIUrl +
      "Refilling/GetWarehouseReturnItemLocData?request_number=" +
      this.AddFileInwardForm.controls["requestId"].value +
      "&User_Token=" +
      localStorage.getItem("User_Token") +
      "&UserID=" +
      localStorage.getItem("UserID");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.prepareTableData(data, data);
    });
  }
  warehouseDropdown = [];
  getWareHouseetails() {
    debugger;
    const apiUrl =
      this._global.baseAPIUrl +
      "Department/GetWarehouseDetails?ID=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data) {
        this.warehouseDropdown = (data || []).map((item) => {
          return {
            label: item.WarehouseName,
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
    const apiUrl =
      this._global.baseAPIUrl +
      "Department/GetDetailDocumentType?ID=" +
      this.AddFileInwardForm.controls["documentType"].value +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      let city = [];
      for (let i = 0; i < data.length; i++) {
        city.push({ name: data[i].DocumentDetails, id: data[i].id });
      }
      this.document_id = city;
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
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "requestId", header: "RETURN REQUEST ID", index: 2 },
      { field: "cartonNo", header: "CARTON NUMBER", index: 2 },
      { field: "department", header: "DEPARTMENT", index: 3 },
      { field: "documentType", header: "DOUCMENT TYPE", index: 4 },
      { field: "detailDocumentType", header: "DETAIL DOC TYPE", index: 3 },
      { field: "warehouse", header: "WAREHOUSE", index: 3 },
      { field: "location", header: "DETAIL LOCATION", index: 3 },
      { field: "status", header: "CARTON STATUS", index: 3 },//GKJ_09_01
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        requestId: el.requestNumber,
        id: el.id,
        cartonNo: el.cartonNumber,
        department: el.department,
        documentType: el.documentType,
        detailDocumentType: el.detailDocumentType,
        warehouse: el.WarehouseName,
        location: el.location,
        status: el.status,
        warehouseId: el.warehouseId,
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }
  DeleteRecord(car) {
    if (confirm("Are You Sure ?")) {
      const apiUrl =
        this._global.baseAPIUrl + "BranchInward/DeleteBatchDetails";
      this._onlineExamService
        .postData(
          {
            ...this.AddFileInwardForm.value,
            id: car.id,
          },
          apiUrl
        )
        .subscribe((data: {}) => {
          this.GetBatchDetails();
        });
    }
  }

  CloseRequest() {
    if (this.formattedData.length != 0) {
      const apiUrl =
        this._global.baseAPIUrl + "BranchInward/WarhouseLocationClose";
      this._onlineExamService
        .postData(this.AddFileInwardForm.value, apiUrl)

        .subscribe((data: {}) => {
          console.log(data);
          if (data == "Files are in File Inward please close it") {
            this.ShowErrormessage(data);
            return;
          }

          this.toastr.show(
            '<div class="alert-text"</div> <span class="alert-title success" data-notify="title">Success ! </span> <span data-notify="message"> ' +
              data +
              " </span></div>",
            "",
            {
              timeOut: 3000,
              closeButton: true,
              enableHtml: true,
              tapToDismiss: false,
              titleClass: "alert-title success",
              positionClass: "toast-top-center",
              toastClass:
                "ngx-toastr alert alert-dismissible alert-success alert-notify",
            }
          );
          this.location.back();
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

  OnReset() {
    this.AddFileInwardForm.controls["cartonNo"].setValue("");
    this.AddFileInwardForm.controls["warehouseId"].setValue("");
    this.AddFileInwardForm.controls["location"].setValue("");
  }

  OnClose() {
    this.modalService.hide(1);
  }

  OnreadonlyAppc() {
    if (this.AddFileInwardForm.value.appl <= 0) {
      this.Isreadonly = false;
    } else {
      this.Isreadonly = true;
    }
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
getStatusClass(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.toUpperCase()) {
    case 'RETURN REQUEST LOCATION UPDATED':
      return 'status-badge status-accepted';
    case 'RETURN REQUEST CARTON ACKNOWLEDGED':
      return 'status-badge status-review';
   
    default:
      return 'status-badge status-default';
  }
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
              // this.GetBatchDetails();
            });
        }
      });
  }
}
