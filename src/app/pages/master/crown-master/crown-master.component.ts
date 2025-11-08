import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, ValidationErrors, AbstractControl, FormControl } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import swal, { SweetAlertResult } from "sweetalert2";
import { ThirdPartyDraggable } from "@fullcalendar/interaction";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-crown-master",
  templateUrl: "./crown-master.component.html",
  styleUrls: ["./crown-master.component.scss"],
})
export class CrownMasterComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  AddBranchForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  _BranchList: any;
  BranchForm: FormGroup;
  _FilteredList: any;
  _BranchID: any = 0;
  @ViewChild('dt') dt: any;
  // _FilteredList:any;
  //_IndexPendingList:any;
  first = 0;
  rows = 10;
  TempDDMId: any;
  isEditModeDoc: boolean = false;
  isEditModeDocDetails: boolean = false;
  editDocumentId: any;

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) { }
  ngOnInit() {
    this.AddBranchForm = this.formBuilder.group({
      branch_name: ["", Validators.required],
      branch_code: ["", Validators.required],
      address: ["", Validators.required],
      retention_period: ["", Validators.required], //ruchi
      crown_branch_name: ["", Validators.required],
      detailDocType: [
        "",
        [
          Validators.required,
          this.noWhitespaceValidator,
          this.notOnlyNumberValidator.bind(this) // added here
        ]
      ],
      DocType: ["", [Validators.required, this.noWhitespaceValidator]],
      User_Token: localStorage.getItem("User_Token"),
      userid: localStorage.getItem("UserID"),
      id: [],
    });
    this.geBranchList();
    this.geCrownBranchList();
    this.getDeptCodeList()
  }

 // replace your noWhitespaceValidator with this (same name/signature)
noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';

  // 1. Check for leading/trailing spaces
  const hasLeadingOrTrailingSpaces = value !== value.trim();

  // 2. Check for multiple spaces in between (unicode-aware)
  const hasMultipleSpaces = /\s{2,}/u.test(value);

  const isValid = !hasLeadingOrTrailingSpaces && !hasMultipleSpaces;

  return isValid ? null : { invalidSpaces: true };
}

notOnlyNumberValidator(control: FormControl) {
  const raw = control.value;

  if (raw === null || raw === undefined) return null;

  const value = (typeof raw === 'string') ? raw.trim() : String(raw).trim();

  if (!value) return null;

  // only-number check (digits only)
  const onlyNumber = /^\d+$/.test(value);

  // only allowed characters check
  //const hasInvalidChar = /[^\p{L}\p{N}()\s\/-]/u.test(value);
    const hasInvalidChar = /,/.test(value);

  // check if it contains at least one letter or number
  const hasLetterOrNumber = /[\p{L}\p{N}]/u.test(value);

  if (onlyNumber) {
    return { onlyNumber: true };
  }

  if (hasInvalidChar) {
    return { specialCharacterNotAllowed: true };
  }

  if (!hasLetterOrNumber) {
    return { onlySpecialChars: true };
  }

  return null;
}





  get FormControls() {
    return this.AddBranchForm.controls;
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
  geBranchList() {
    const userToken = localStorage.getItem("User_Token");
    const userId = localStorage.getItem("UserID");

    const apiUrl =
      this._global.baseAPIUrl +
      "DocumentController/GetList?user_Token=" +
      userToken +
      "&userid=" +
      userId;

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      console.log(data);
      this._BranchList = data;
      this._FilteredList = data;
      this.prepareTableData(this._BranchList, this._FilteredList);
    });
  }

  AllCrownBranch: any;
  AllDeptCode: any;

  geCrownBranchList() {
    const userToken = localStorage.getItem("User_Token");
    const userId = localStorage.getItem("UserID");

    const apiUrl =
      this._global.baseAPIUrl +
      "DocumentController/GetDocumentsNamesList?user_Token=" +
      userToken +
      "&userid=" +
      userId;

    this._onlineExamService.getAllData(apiUrl).subscribe(
      (data: any) => {
        console.log("AllCrownBranch", data);
        this.AllCrownBranch = data;

      },
      (error) => {
        console.error("API Error:", error);
      }
    );
  }

  geCrownBranchListForEdit() {
    const userToken = localStorage.getItem("User_Token");
    const userId = localStorage.getItem("UserID");

    const apiUrl =
      this._global.baseAPIUrl +
      "DocumentController/GetDocumentsNamesListForEdit?user_Token=" +
      userToken +
      "&userid=" +
      userId;

    this._onlineExamService.getAllData(apiUrl).subscribe(
      (data: any) => {
        console.log("AllCrownBranch", data);
        this.AllCrownBranch = data;

      },
      (error) => {
        console.error("API Error:", error);
      }
    );
  }




  getDeptCodeList() {
    const userToken = localStorage.getItem("User_Token");
    const userId = localStorage.getItem("UserID");

    const apiUrl =
      this._global.baseAPIUrl +
      "DocumentController/GetDeptCodeList?user_Token=" +
      userToken +
      "&userid=" +
      userId;

    this._onlineExamService.getAllData(apiUrl).subscribe(
      (data: any) => {
        console.log("AllDeptCode", data);
        this.AllDeptCode = data;
      },
      (error) => {
        console.error("API Error:", error);
      }
    );
  }




  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;


  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "DocumentType", header: "DOCUMENT TYPE", index: 3 },
      { field: "DetailDocumentType", header: "DETAIL DOCUMENT TYPE", index: 2 },
      { field: "RetentionPeriod", header: "RETENTION PERIOD", index: 2 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 2 },
      { field: "CreatedDate", header: "CREATED DATE", index: 2 },
      { field: "CreatedBy", header: "CREATED BY", index: 2 },
      { field: "Status", header: "STATUS", index: 2 },
    ];

    tableData.forEach((el, index) => {
      let retention = '';
      if (el.RetentionPeriod) {
        retention = el.RetentionPeriod === 999 ? 'NA' : `${el.RetentionPeriod} Years`;
      }

      const status = el.isActive === 'Y' ? 'Active' : 'Inactive';

      formattedData.push({
        srNo: index + 1,
        DetailDocumentType: el.DetailDocumentType,
        DocumentType: el.DocumentType,
        RetentionPeriod: retention,
        id: el.Id,
        Status: status,
        documentID: el.documentID,
        DepartmentCode: el.DepartmentCode,
        CreatedDate: el.CreatedDate ? this.formatDateToDDMMYYYY(el.CreatedDate) : '',
        CreatedBy: el.CreatedBy
      });
    });


    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }



  formatDateToDDMMYYYY(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  searchTable($event) {
    // console.log($event.target.value);

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
    this.AddBranchForm.reset();
    this.submitted = false;
    this.isEditModeDoc = false;
    this.editDocumentId = null;
    this.modalRef.hide();
  }




  toggleDocStatus(car: any) {
    const isActivating = car.Status !== 'Active';
    const actionText = isActivating ? 'Activate' : 'Deactivate';

    swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${actionText.toLowerCase()} this document?`,
      type: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonClass: "btn btn-danger",
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonClass: "btn btn-secondary",
      html: `
      <div style="margin-top:10px; text-align:left;">
        <input type="radio" id="childOnly" name="toggleOption" value="childOnly" checked>
        <label for="childOnly">${actionText} only child document details</label><br>
        <input type="radio" id="parentToo" name="toggleOption" value="parentToo">
        <label for="parentToo">${actionText} parent document type as well</label>
      </div>
    `
    }).then((result: any) => {
      if (result.value) {
        const applyToParent = (document.querySelector('input[name="toggleOption"]:checked') as HTMLInputElement).value === 'parentToo';

        const payload = {
          Id: car.id,
          documentID: car.documentID,
          departmentID: car.departmentID ?? 0,
          DetailDocumentType: car.DetailDocumentType,
          isActive: isActivating ? 'Y' : 'N',
          applyToParent: applyToParent,
          User_Token: localStorage.getItem('User_Token'),
          userid: localStorage.getItem("UserID")
        };

        const apiUrl = this._global.baseAPIUrl + "DocumentController/ToggleStatus";

        this._onlineExamService.postData(payload, apiUrl).subscribe(
          (msg: string) => {
            let alertType: 'success' | 'error' | 'warning' = 'success';

            if (msg.toLowerCase().includes('success')) {
              alertType = 'success';
            } else if (
              msg.toLowerCase().includes('cannot') ||
              msg.toLowerCase().includes('not allowed') ||
              msg.toLowerCase().includes('already')
            ) {
              alertType = 'warning';
            } else {
              alertType = 'error';
            }

            swal.fire({
              title: alertType === 'success' ? "Status Updated!" : "Notice",
              text: msg,
              type: alertType,
              buttonsStyling: false,
              confirmButtonClass: "btn btn-primary",
            });

            if (alertType === 'success') {
              this.geBranchList();
            }
          },
          (error) => {
            swal.fire({
              title: "Error!",
              text: "Failed to update document status.",
              type: "error",
              confirmButtonClass: "btn btn-danger",
            });
          }
        );
      }
    });
  }






  _DepartmentList: any;
  getDepartmentList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "Department/GetList?user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._DepartmentList = data;
      //  this._FilteredList = data
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });
  }


  isRightEditDisabled(row: any): boolean {
    return !row.DetailDocumentType || row.DetailDocumentType.trim().length === 0;
  }

  onSubmit() {
    this.submitted = true;

    console.log("AddBranchForm", this.AddBranchForm.value);

    const userToken = localStorage.getItem("User_Token");
    const apiUrl = `${this._global.baseAPIUrl}DocumentController/Insert?user_Token=${userToken}`;

    const body: any = {
      DocumentType: this.AddBranchForm.value.branch_name,
      userid: localStorage.getItem("UserID"),
    };

    if (this.isEditModeDoc && this.editDocumentId) {
      body.DocumentID = this.editDocumentId;
    }

    this._onlineExamService.postData(body, apiUrl).subscribe(
      (data: any) => {
        const resultMessage = (data?.Message || "").trim();

        if (resultMessage.toLowerCase() === "document already exists.") {
          // Show error toast if document already exists
          this.toastr.show(
            `<div class="alert-text"></div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">${resultMessage}</span>`,
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
          this.handleAfterSubmit();


          return;
        }

        // Otherwise show success toast
        this.toastr.show(
          `<div class="alert-text"> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message">${resultMessage}</span></div>`,
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

        this.geBranchList();
        this.OnReset();
      },
      (error) => {
        console.error("Error saving document:", error);

        this.toastr.show(
          `<div class="alert-text"></div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Failed to save document. Please try again.</span>`,
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
    );

    this.geCrownBranchList();
    this.getDeptCodeList();
  }



  handleAfterSubmit() {
    this.OnReset();
    this.modalRef.hide();
  }



  onSubmitDetails() {
    this.submitted = true;

    if (this.AddBranchForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.', 'Validation Error');
      return;
    }
    debugger;
    const formData: any = {
      documentId: 0,
      id: this.AddBranchForm.value.id,
      userid: Number(localStorage.getItem("UserID")),
      departmentID: this.AddBranchForm.value.branch_code,
      DetailDocumentType: this.AddBranchForm.value.detailDocType,
      DocumentType: this.AddBranchForm.value.DocType,
      RetentionPeriod: this.AddBranchForm.value.retention_period === 'NA' ? '999' : this.AddBranchForm.value.retention_period
    };

    if (this.TempDDMId) {
      formData.Id = this.TempDDMId;
    }

    const userToken = localStorage.getItem("User_Token");
    const apiUrl = this._global.baseAPIUrl + "DocumentController/InsertDetails?user_Token=" + userToken;

    this._onlineExamService.postData(formData, apiUrl).subscribe({
      next: (res) => {
        const rawMessage = res?.Message || 'Document Details submitted successfully.';
        const message = rawMessage.trim().toLowerCase();

        const isDuplicate = message.includes("already exists") || message.includes("already exits");

        const title = isDuplicate ? "Error!" : "Success!";
        const toastClass = isDuplicate
          ? "ngx-toastr alert alert-dismissible alert-danger alert-notify"
          : "ngx-toastr alert alert-dismissible alert-success alert-notify";

        this.toastr.show(
          `<span class="alert-title">${title}</span> <span data-notify="message">${rawMessage}</span>`,
          "",
          {
            timeOut: 3000,
            closeButton: true,
            enableHtml: true,
            tapToDismiss: false,
            positionClass: "toast-top-center",
            toastClass,
          }
        );
        this.handleAfterSubmit();


        if (!isDuplicate) {
          this.AddBranchForm.reset();
          this.OnReset();
          this.geBranchList();
          this.submitted = false;
          this.TempDDMId = null;
        }
      },
      error: (err) => {
        this.toastr.error('Failed to submit Document Details', 'Error');
        console.error(err);
      }
    });
  }


  _SingleDepartment: any;


  extractNumber(value: string): number | null {
    if (!value || value.trim() === "") {
      return null;
    }

    if (value.toLowerCase().includes("permanent")) {
      return 0;
    }

    const match = value.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }


downloadCSV() {
  const data = this.dt?.filteredValue || this.formattedData;

  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = this.headerList.map(h => h.header);
  const rows = data.map(row =>
    this.headerList.map(col => {
      let val = row[col.field];
      return val !== null && val !== undefined ? String(val).replace(/"/g, '""') : "";
    })
  );

  const csvContent =
    headers.join(",") +
    "\n" +
    rows.map(r => r.map(x => `"${x}"`).join(",")).join("\n");


  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "DocumentList.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  this.logDownloadActivity();
}


logDownloadActivity() {
  const payload = {
    pageName: 'Documents Master',
    activity: 'Download',
    activityDescription: 'User downloaded the documents master list.',
    entryBy: localStorage.getItem('UserID'),
    User_Token: localStorage.getItem('User_Token')
  };

  const apiUrl = this._global.baseAPIUrl + "Role/InsertActivityDetail";

  this._onlineExamService.postData(payload, apiUrl).subscribe(
    () => {
      console.log("InsertActivityDetail API call successful."); 
    },
    (error) => {
      console.error("InsertActivityDetail API call failed:", error); 
    }
  );
}


  editBranch(template: TemplateRef<any>, row: any) {
    this._SingleDepartment = row;
    this.submitted = false;
    this.TempDDMId = null;
    this.isEditModeDocDetails = true;
    Promise.all([this.geCrownBranchListForEdit(), this.getDeptCodeList()])
      .then(() => {
        const apiUrl = this._global.baseAPIUrl + "DocumentController/GetDepartmentByDetails";
        const userToken = localStorage.getItem("User_Token");

        const payload = {
          DetailDocumentType: row.DetailDocumentType,
          DocumentType: row.DocumentType,
          RetentionPeriod: this.extractNumber(row.RetentionPeriod)
        };

        const finalUrl = `${apiUrl}?user_Token=${userToken}`;

        this._onlineExamService.postData(payload, finalUrl).subscribe({
          next: (response: any) => {
            console.log("RESPONSES", response);

            const deptId = response?.departmentID === 0 ? null : response?.departmentID;
            this.TempDDMId = response?.Id ?? null;

            // 🔹 Find matching IDs from names
            const docTypeId = this.getDocTypeIdByName(row.DocumentType);
            const deptCodeId = this.getDeptIdByCode(response?.DepartmentCode); // helper below
            console.log("docTypeId", docTypeId, "deptCodeId", deptCodeId);
            this.AddBranchForm = this.formBuilder.group({
              detailDocType: [
                "",
                [
                  Validators.required,
                  this.noWhitespaceValidator,
                  this.notOnlyNumberValidator.bind(this) // added here
                ]
              ],
              DocType: [{ value: docTypeId, disabled: true }, Validators.required],

              // DocType: [docTypeId, Validators.required],                   // dropdown uses ID
              retention_period: [this.extractNumber(row.RetentionPeriod), Validators.required],
              branch_code: [deptCodeId, Validators.required],              // dropdown uses ID
              User_Token: [userToken],
              userid: [localStorage.getItem("UserID")],
              id: [row.id || 0]
            });

            setTimeout(() => {
              this.modalRef = this.modalService.show(template);
            });
          },
          error: (err) => {
            this.toastr.error("Unable to fetch department info", "Error");
            console.error("API Error:", err);
          }
        });
      })
      .catch((err) => {
        this.toastr.error("Failed to load dropdown data", "Error");
        console.error("Dropdown loading error:", err);
      });
  }

  editDocuments(template: TemplateRef<any>, row: any) {
    console.log("row wow", row);
    debugger;

    this.submitted = false;
    this.isEditModeDoc = true;
    this.editDocumentId = row.documentID;

    // Reinitialize the form
    this.AddBranchForm = this.formBuilder.group({
      branch_name: [row.DocumentType || '', [Validators.required, this.noWhitespaceValidator, this.notOnlyNumberValidator]]
    });

    // Open the modal
    this.modalRef = this.modalService.show(template);
  }

  getDocTypeIdByName(name: string): number | null {
    const match = this.AllCrownBranch.find(doc => doc.DocumentType === name);
    return match ? match.Id : null;
  }

  getDeptIdByCode(code: string): number | null {
    const match = this.AllDeptCode.find(dept => dept.DepartmentCode === code);
    return match ? match.departmentID : null;
  }


  deleteDocumentDetail(template: TemplateRef<any>, value: any) {
    debugger;

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
          const userId = Number(localStorage.getItem("UserID"));
          const userToken = localStorage.getItem("User_Token");

          if (!userId || !userToken) {
            swal.fire("Error", "Missing user credentials. Please login again.", "error");
            return;
          }

          const deletePayload = {
            Id: value.id,
            documentID: value.documentID,
            userid: userId,
            User_Token: userToken,
          };

          console.log("Sending delete payload:", deletePayload);

          const apiUrl = this._global.baseAPIUrl + "DocumentDetails/Delete";

          // ✅ Fixed param order: postData(data, url)
          this._onlineExamService.postData(deletePayload, apiUrl).subscribe(
            (res) => {
              console.log("Delete response:", res);
              swal.fire({
                title: "Deleted!",
                text: "Document detail has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });

              this.geBranchList();
            },
            (error) => {
              console.error("Delete error:", error);
              swal.fire({
                title: "Error!",
                text: "Failed to delete record.",
                type: "error",
                confirmButtonClass: "btn btn-danger",
              });
            }
          );
        }
      });
  }


  // addBranch(template: TemplateRef<any>) {
  //   this.submitted = false;
  //     this.TempDDMId = null;
  //   this.AddBranchForm.reset();
  //   this.AddBranchForm = this.formBuilder.group({
  //     branch_name: ["", Validators.required],
  //     branch_code: ["", Validators.required],
  //     address: ["", Validators.required],
  //     crown_branch_name: ["", Validators.required],
  //     retention_period: ["", Validators.required], //ruchi
  //   detailDocType:["", Validators.required],
  //   DocType :["", Validators.required],
  //     User_Token: localStorage.getItem("User_Token"),
  //     userid: localStorage.getItem("UserID"),
  //     id: [],
  //   });
  //   this.modalRef = this.modalService.show(template);
  //   this.geCrownBranchList();
  //   this.getDeptCodeList();
  // }

  // addDocumentType(template: TemplateRef<any>) {
  //   this.submitted = false;
  //   this.AddBranchForm.reset();
  //   this.AddBranchForm = this.formBuilder.group({
  //     branch_name: ["", Validators.required],
  //     branch_code: ["", Validators.required],
  //     address: ["", Validators.required],
  //     crown_branch_name: ["", Validators.required],
  //     retention_period: ["", Validators.required], //ruchi
  //          detailDocType:["", Validators.required],
  //          DocType:["", Validators.required],
  //     User_Token: localStorage.getItem("User_Token"),
  //     userid: localStorage.getItem("UserID"),
  //     id: [],
  //   });
  //   this.modalRef = this.modalService.show(template);
  // }


  addBranch(template: TemplateRef<any>) {
    this.submitted = false;
    this.TempDDMId = null;
    this.isEditModeDocDetails = false;

    debugger;
    this.AddBranchForm = this.formBuilder.group({
      detailDocType: [
        "",
        [
          Validators.required,
          this.noWhitespaceValidator,
          this.notOnlyNumberValidator.bind(this)
        ]
      ],
      DocType: ["", Validators.required],
      retention_period: ["", Validators.required],
      branch_code: ["", Validators.required],
      User_Token: [localStorage.getItem("User_Token")],
      userid: [localStorage.getItem("UserID")],
      id: [],
    });


    this.modalRef = this.modalService.show(template);
    this.geCrownBranchList();
    this.getDeptCodeList();
  }


  addDocumentType(template: TemplateRef<any>) {
    debugger;
    this.submitted = false;
    this.isEditModeDoc = false;

    this.AddBranchForm = this.formBuilder.group({
      branch_name: ["", [Validators.required, this.noWhitespaceValidator, this.notOnlyNumberValidator]],
    });

    this.modalRef = this.modalService.show(template);
  }



  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }
}
