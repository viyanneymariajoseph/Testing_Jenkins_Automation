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
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { Location } from "@angular/common";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: "app-return-to-storage-form",
  templateUrl: "./return-to-storage-form.component.html",
  styleUrls: ["./return-to-storage-form.component.scss"],
})
export class ReturnToStorageFormComponent implements OnInit {
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
  async ngOnInit() {
    this.AddFileInwardForm = this.formBuilder.group({
      reuqestId: ["", Validators.required],
      documentType: ["", Validators.required],
      department: ["", Validators.required],
      cartonNo: ["", [Validators.required]],
      detailDocumentType: ["", Validators.required],
      WarehouseName: [""],
      detailLocation: [""],
      User_Token: localStorage.getItem("User_Token"),
      UserID: localStorage.getItem("UserID"),
    });

    try {
      const requestNumber = await this.GetreuqestId();
      if (requestNumber) {
        this.GetBatchDetails();
      }
    } catch (err) {
      console.error("Initialization failed:", err);
    }

    this.getCartonDetails();
    this.prepareTableData([], []);
    this.fileBarcodeList = [];
  }

  get FormControls() {
    return this.AddFileInwardForm.controls;
  }
 
getDetailsByCarton(cartonNo: string): void {
  if (!cartonNo || cartonNo.trim() === "") return;

  const userId = localStorage.getItem("UserID");
  const userToken = localStorage.getItem("User_Token");

  const apiUrl =
    this._global.baseAPIUrl +
    "Refilling/GetRecordByCartonNumber?carton_number=" +
    encodeURIComponent(cartonNo) +
    "&UserID=" +
    encodeURIComponent(userId || "") +
    "&User_Token=" +
    encodeURIComponent(userToken || "");

  this._onlineExamService.getAllData(apiUrl).subscribe(
    (data: any) => {
      const msg = data?.[0]?.MSG;

     
      if (data[0].MSG === "User is not mapped to the department for Refiling.") {
        this.ShowErrormessage("User is not mapped to the department for Refiling.");
        this.OnReset();
        return;
      }
       if (data[0].MSG === "Item status must be OUT for the given carton number.") {
        this.ShowErrormessage("Item status must be OUT for the given carton number.");
        this.OnReset();
        return;
      }
         if (data[0].MSG === "Carton number not found.") {
        this.ShowErrormessage("Carton number not found.");
        this.OnReset();
        return;
      }
      if (data[0].MSG === "Request status must be Acknowledged for the given carton number.") {
        this.ShowErrormessage("Request status must be Acknowledged for the given carton number.");
        this.OnReset();
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const record = data[0];
        this.AddFileInwardForm.patchValue({
          WarehouseName: record.WarehouseName || "",
          detailLocation: record.detailLocation || "",
          department: record.department || "",
          documentType: record.documentType || "",
          detailDocumentType: record.detailDocumentType || "",
        });
      } else {
        this.ShowErrormessage("No details found for this carton number.");
        this.AddFileInwardForm.patchValue({
          WarehouseName: "",
          detailLocation: "",
          department: "",
          documentType: "",
          detailDocumentType: "",
        });
      }
    },
    (error) => {
      console.error("Error fetching carton details:", error);

      this.ShowErrormessage("Server error occurred while fetching carton details.");

      this.AddFileInwardForm.patchValue({
        WarehouseName: "",
        detailLocation: "",
        department: "",
        documentType: "",
        detailDocumentType: "",
      });
    }
  );
}

  
  GetreuqestId(): Promise<string> {
    return new Promise((resolve, reject) => {
      const userId = localStorage.getItem("UserID");
      const userToken = localStorage.getItem("User_Token");

      const apiUrl =
        this._global.baseAPIUrl +
        "Refilling/GetRequestNumber?UserID=" +
        encodeURIComponent(userId) +
        "&user_Token=" +
        encodeURIComponent(userToken);

      this._onlineExamService.getAllData(apiUrl).subscribe(
        (res: any) => {
          console.log("Request number response:", res);

          if (res && Array.isArray(res) && res.length > 0) {
            const requestNumber = res[0].requestNumber || "";
            this.AddFileInwardForm.patchValue({ reuqestId: requestNumber });
            resolve(requestNumber);
          } else {
            this.toastr.warning("No request number found in the response.");
            resolve("");
          }
        },
        (error) => {
          console.error("Error fetching request number:", error);
          this.toastr.error(
            "Server error occurred while fetching request number."
          );
          reject(error);
        }
      );
    });
  }

  onDepartmentChange(event: any): void {
    this.GetreuqestId();
  }



  SaveData(): void {
  this.toastr.clear();
  this.submitted = true;
 
  if (this.AddFileInwardForm.valid) {
    const formData = this.AddFileInwardForm.value;
 
    const requestPayload = {
      requestNumber: formData.reuqestId,
      cartonNumber: formData.cartonNo,
      CreatedBy: formData.UserID,
      User_Token: formData.User_Token,
    };
 
    const apiUrl = this._global.baseAPIUrl + "Refilling/AddRefillingRequest";
 
    this._onlineExamService.postData(requestPayload, apiUrl).subscribe(
      (response: any) => {
        const message = response || "No message returned from server.";
        const isSuccess = message.toLowerCase().includes("return request created");
 
        // ✅ Toastr for SUCCESS
        if (isSuccess) {
          this.toastr.show(
            `<div class="alert-text">
              <span class="alert-title" style="color: white; font-weight: bold;">Success !</span>
              <span style="color: white;">Record saved successfully</span>
            </div>`,
            '',
            {
              timeOut: 3000,
              closeButton: true,
              enableHtml: true,
              tapToDismiss: false,
              positionClass: 'toast-top-center',
              toastClass: 'ngx-toastr alert alert-dismissible alert-success alert-notify',
            }
          );
          this.OnReset();
          this.handleAfterSuccess();
        } else {
          // ❌ Toastr for FAILURE (response does not contain success keyword)
          this.toastr.show(
            `<div class="alert-text">
              <span class="alert-title" style="color: white; font-weight: bold;">Failed !</span>
              <span style="color: white;">${message}</span>
            </div>`,
            '',
            {
              timeOut: 3000,
              closeButton: true,
              enableHtml: true,
              tapToDismiss: false,
              positionClass: 'toast-top-center',
              toastClass: 'ngx-toastr alert alert-dismissible alert-danger alert-notify',
            }
          );
        }
 
        this.submitted = false;
      },
      (error) => {
        // ❌ Toastr for SERVER ERROR
        this.toastr.show(
          `<div class="alert-text">
            <span class="alert-title" style="color: white; font-weight: bold;">Error !</span>
            <span style="color: white;">Server error occurred</span>
          </div>`,
          '',
          {
            timeOut: 3000,
            closeButton: true,
            enableHtml: true,
            tapToDismiss: false,
            positionClass: 'toast-top-center',
            toastClass: 'ngx-toastr alert alert-dismissible alert-danger alert-notify',
          }
        );
        this.submitted = false;
      }
    );
  } else {
    // ❌ Validation error Toastr
    this.toastr.show(
      `<div class="alert-text">
        <span class="alert-title" style="color: white; font-weight: bold;">Error !</span>
        <span style="color: white;">Please fill all required fields.</span>
      </div>`,
      '',
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        positionClass: 'toast-top-center',
        toastClass: 'ngx-toastr alert alert-dismissible alert-danger alert-notify',
      }
    );
  }
}
 
  async handleAfterSuccess() {
    const reqId = await this.GetreuqestId();
    if (reqId) {
      this.GetBatchDetails();
    }
  }

  AllData: any;
  // GetreuqestId() {
  //   const apiUrl =
  //     this._global.baseAPIUrl +
  //     "BranchInward/GetreuqestId?UserID=" +
  //     localStorage.getItem("UserID") +
  //     "&user_Token=" +
  //     localStorage.getItem("User_Token");
  //   this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
  //     if (data.length > 0) {
  //       this.AddFileInwardForm.controls["reuqestId"].setValue(data[0].reuqestId);
  //       this.GetBatchDetails();
  //     }
  //   });
  // }

  AllLanData: any;
  GetBatchDetails() {
    const requestNumber = this.AddFileInwardForm.controls["reuqestId"].value;
    const userToken = localStorage.getItem("User_Token");
    const userId = localStorage.getItem("UserID");

    if (!requestNumber || !userToken || !userId) {
      console.error("Missing required parameters");
      return;
    }

    const apiUrl =
      this._global.baseAPIUrl +
      "Refilling/GetRefillingDataByRequestNo" +
      "?request_number=" +
      encodeURIComponent(requestNumber) +
      "&user_Token=" +
      encodeURIComponent(userToken) +
      "&UserID=" +
      encodeURIComponent(userId);

    this._onlineExamService.getAllData(apiUrl).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          console.log(data);
          this.prepareTableData(data, data);
        } else {
          this.prepareTableData([], []);
        }
      },
      error: (err) => {
        console.error("API error:", err);
      },
    });
  }

  departmentDropdown = [];
  documentTypeDropdown = [];
  getCartonDetails() {
    const apiUrl =
      this._global.baseAPIUrl +
      "Department/GetDetails?ID=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data) {
        this.departmentDropdown = (data || []).map((item) => {
          return {
            label: item.DepartmentName,
            value: item.id,
          };
        });
      }
      console.log("uyf8yg9ug", this.departmentDropdown);
    });

    const apiUrl1 =
      this._global.baseAPIUrl +
      "Department/GetDocumentType?ID=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl1).subscribe((data: any) => {
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

 OnReset(): void {//gkj this method
  const currentRequestId = this.AddFileInwardForm.get('reuqestId')?.value;
 
  this.AddFileInwardForm.reset({
    reuqestId: currentRequestId,
    documentType: "",
    department: "",
    cartonNo: "",
    detailDocumentType: "",
    WarehouseName: "",
    detailLocation: "",
    User_Token: localStorage.getItem("User_Token"),
    UserID: localStorage.getItem("UserID"),
  });
 
  this.submitted = false;
  this.AddFileInwardForm.markAsUntouched();
}

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "requestNumber", header: "RETURN REQUEST ID", index: 2 },
      { field: "cartonNumber", header: "CARTON NUMBER", index: 2 },
      { field: "department", header: "DEPARTMENT NAME", index: 3 },
       { field: "WarehouseName", header: "WAREHOUSE NAME", index: 4 }, 
      { field: "documentType", header: "DOUCMENT TYPE", index: 4 },
      { field: "detailDocumentType", header: "DETAIL DOC TYPE", index: 3 }, 
      { field: "detailLocation", header: "DETAIL LOCATION", index: 4 },

      
      { field: "status", header: "CARTON STATUS", index: 3 },
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        requestNumber: el.requestNumber,
        id: el.id,
        cartonNumber: el.cartonNumber,
        department: el.department,
        documentType: el.documentType,
        detailDocumentType: el.detailDocumentType,
        WarehouseName: el.WarehouseName,
        detailLocation: el.detailLocation,
        status: el.status,

      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }
 

  DeleteRecord(car: any): void {
    swal
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        buttonsStyling: false,
        confirmButtonClass: "btn btn-danger",
        cancelButtonClass: "btn btn-secondary",
      })
      .then((result) => {
        if (result.value) {
          const requestPayload = {
            requestNumber: car.requestNumber,
            cartonNumber: car.cartonNumber,
            User_Token: localStorage.getItem("User_Token"),
             userId:localStorage.getItem("UserID"),
          };

          const apiUrl =
            this._global.baseAPIUrl + "Refilling/DeleteRefillingRequest";

          this._onlineExamService.postData(requestPayload, apiUrl).subscribe(
            (response: any) => {
              const message = response || "No message returned from server.";
              const isSuccess = message.toLowerCase().includes("deleted");

              swal.fire({
                title: isSuccess ? "Deleted!" : "Failed!",
                text: message,
                type: isSuccess ? "success" : "error",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });

              // this.toastr.show(
              //   `<div class="alert-text"></div>
              //  <span class="alert-title ${
              //    isSuccess ? "success" : "danger"
              //  }" data-notify="title">
              //    ${isSuccess ? "Success!" : "Failed!"}
              //  </span>
              //  <span data-notify="message"> ${message} </span>`,
              //   "",
              //   {
              //     timeOut: 3000,
              //     closeButton: true,
              //     enableHtml: true,
              //     tapToDismiss: false,
              //     titleClass: `alert-title ${isSuccess ? "success" : "danger"}`,
              //     positionClass: "toast-top-center",
              //     toastClass: `ngx-toastr alert alert-dismissible alert-${
              //       isSuccess ? "success" : "danger"
              //     } alert-notify`,
              //   }
              // );
              if (isSuccess) {
                this.OnReset();
                this.handleAfterSuccess();
              }
            },
            (error) => {
              swal.fire({
                title: "Error!",
                text: "Server error occurred.",
                type: "error",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });

              // this.toastr.show(
              //   `<div class="alert-text"></div>
              //  <span class="alert-title danger" data-notify="title"> Error! </span>
              //  <span data-notify="message"> Server error occurred. </span>`,
              //   "",
              //   {
              //     timeOut: 3000,
              //     closeButton: true,
              //     enableHtml: true,
              //     tapToDismiss: false,
              //     titleClass: "alert-title danger",
              //     positionClass: "toast-top-center",
              //     toastClass:
              //       "ngx-toastr alert alert-dismissible alert-danger alert-notify",
              //   }
              // );
            }
          );
        }
      });
  }
//  CloseRequest(): void {
//   this.submitted = true;
// debugger
//   // Step 1: Validate table data
//   if (!this.formattedData || this.formattedData.length === 0) {
//     this.toastr.warning(
//       "No data available to close the request.",
//       "Warning",
//       {
//         timeOut: 3000,
//         positionClass: "toast-top-center",
//       }
//     );
//     this.submitted = false;
//     return;
//   }

//   this.AddFileInwardForm.patchValue({
//     UserID: localStorage.getItem("UserID"),
//     User_Token: localStorage.getItem("User_Token")
//   });

//   // Step 3: Override department if table has 1 row
//   let department = this.AddFileInwardForm.get('department')?.value;
//   if (this.formattedData.length) {
//     department = this.formattedData[0].department;
//   }

//   // Step 4: Validate department
//   if (!department) {
//     this.ShowErrormessage('Department is missing. Please check the carton number or table data.');
//     this.submitted = false;
//     return;
//   }

//   // Step 5: Build final payload
//   const payload = {
//     requestNumber: this.AddFileInwardForm.get('reuqestId')?.value,
//     CreatedBy: this.AddFileInwardForm.get('UserID')?.value,
//     User_Token: this.AddFileInwardForm.get('User_Token')?.value,
//     department: department
//   };

//   // Validate requestNumber
//   if (!payload.requestNumber) {
//     this.ShowErrormessage('Request Number is missing. Please enter it.');
//     this.submitted = false;
//     return;
//   }

//   // Step 6: Call API
//   const apiUrl = this._global.baseAPIUrl + "Refilling/CloseRefilling";
//   this._onlineExamService.postData(payload, apiUrl).subscribe(
//     (response: any) => {
//       const message = response || "No message returned from server.";
//       const isSuccess = message.toLowerCase().includes("request closed");

//       this.toastr.show(
//         `<div class="alert-text"></div>
//          <span class="alert-title ${isSuccess ? "success" : "danger"}" data-notify="title">
//            ${isSuccess ? "Success!" : "Failed!"}
//          </span>
//          <span data-notify="message"> ${message} </span>`,
//         "",
//         {
//           timeOut: 3000,
//           closeButton: true,
//           enableHtml: true,
//           tapToDismiss: false,
//           titleClass: `alert-title ${isSuccess ? "success" : "danger"}`,
//           positionClass: "toast-top-center",
//           toastClass: `ngx-toastr alert alert-dismissible alert-${isSuccess ? "success" : "danger"} alert-notify`,
//         }
//       );

//       if (isSuccess) {
//         this.OnReset();
//         this.handleAfterSuccess();
//       }

//       this.submitted = false;
//     },
//     (error) => {
//       this.toastr.show(
//         `<div class="alert-text"></div>
//          <span class="alert-title danger" data-notify="title"> Error! </span>
//          <span data-notify="message"> Server error occurred. </span>`,
//         "",
//         {
//           timeOut: 3000,
//           closeButton: true,
//           enableHtml: true,
//           tapToDismiss: false,
//           titleClass: "alert-title danger",
//           positionClass: "toast-top-center",
//           toastClass: "ngx-toastr alert alert-dismissible alert-danger alert-notify",
//         }
//       );
//       this.submitted = false;
//     }
//   );
// }
 CloseRequest(): void {
    this.submitted = true;
    debugger
    // Step 1: Validate table data
    if (!this.formattedData || this.formattedData.length === 0) {
      this.toastr.warning(
        "No data available to close the request.",
        "Warning",
        {
          timeOut: 3000,
          positionClass: "toast-top-center",
        }
      );
      this.submitted = false;
      return;
    }
 
    this.AddFileInwardForm.patchValue({
      UserID: localStorage.getItem("UserID"),
      User_Token: localStorage.getItem("User_Token")
    });
 
    // Step 3: Override department if table has 1 row
    let department = this.AddFileInwardForm.get('department')?.value;
    if (this.formattedData.length) {
      department = this.formattedData[0].department;
    }
 
    // Step 4: Validate department
    if (!department) {
      this.ShowErrormessage('Department is missing. Please check the carton number or table data.');
      this.submitted = false;
      return;
    }
 
    // Step 5: Build final payload
    const payload = {
      requestNumber: this.AddFileInwardForm.get('reuqestId')?.value,
      CreatedBy: this.AddFileInwardForm.get('UserID')?.value,
      User_Token: this.AddFileInwardForm.get('User_Token')?.value,
      department: department
    };
 
    // Validate requestNumber
    if (!payload.requestNumber) {
      this.ShowErrormessage('Request Number is missing. Please enter it.');
      this.submitted = false;
      return;
    }
 
    // Step 6: Call API
    const apiUrl = this._global.baseAPIUrl + "Refilling/CloseRefilling";
    this._onlineExamService.postData(payload, apiUrl).subscribe(
      (response: any) => {
        const message = response || "No message returned from server.";
        const isSuccess = message.toLowerCase().includes("request closed");
 
        this.toastr.show(
          `<div class="alert-text">
     <div style="font-weight: bold; font-size: 16px; color: ${isSuccess ? "#28a745" : "#dc3545"
          };">
       ${isSuccess ? "Success!" : "Failed!"}
     </div>
     <div style="font-size: 14px; color: #000;">
       ${message}
     </div>
   </div>`,
          "",
          {
            timeOut: 3000,
            closeButton: true,
            enableHtml: true,
            tapToDismiss: false,
            positionClass: "toast-top-center",
            toastClass: `ngx-toastr alert alert-dismissible alert-${isSuccess ? "success" : "danger"
              } alert-notify`,
          }
        );
 
 
        if (isSuccess) {
          this.OnReset();
          this.handleAfterSuccess();
        }
        this.location.back()
        this.submitted = false;
      },
      (error) => {
        this.toastr.show(
          `<div class="alert-text">
     <div style="font-weight: bold; font-size: 16px; color: #dc3545;">
       Error!
     </div>
     <div style="font-size: 14px; color: #000;">
       Server error occurred.
     </div>
   </div>`,
          "",
          {
            timeOut: 3000,
            closeButton: true,
            enableHtml: true,
            tapToDismiss: false,
            positionClass: "toast-top-center",
            toastClass: "ngx-toastr alert alert-dismissible alert-danger alert-notify",
          }
        );
 
        this.submitted = false;
      }
    );
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

 ShowErrormessage(msg: string) {
  this.toastr.show(
    `<div class="alert-text">
       <span class="alert-title danger" data-notify="title"> Error! </span>
       <span data-notify="message"> ${msg} </span>
     </div>`,
    "",
    {
      timeOut: 3000,
      closeButton: true,
      enableHtml: true,
      tapToDismiss: false,
      titleClass: "alert-title danger",
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
              // this.GetBatchDetails();
            });
        }
      });
  }
}
