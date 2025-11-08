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
  selector: "app-distruction-form",
  templateUrl: "./distruction-form.component.html",
  styleUrls: ["./distruction-form.component.scss"],
})
export class DistructionFormComponent implements OnInit {
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

      id: [""],
      batchId: [""],
      documentType: [""],
      department: [""],
      cartonNo: ["", [Validators.required]],
       isDestructionOrExtension: ['', Validators.required],
  extensionYear: [{ value: '', disabled: true }, Validators.required],
      detailDocumentType: [""],
      retensionPeriod: [""],
      warehouse: [""],
      detailLocation: [""],
      dateOfDestruction: [""],
      extensionDate: [""],
      User_Token: localStorage.getItem("User_Token"),
      UserID: localStorage.getItem("UserID"),
    });

    this.GetBatchID();
    // this.getCartonDetails();
    // this.GetBatchDetails();
    // this.prepareTableData([], []);
    this.fileBarcodeList = [];
  }

  get FormControls() {
    return this.AddFileInwardForm.controls;
  }

  onSelectDocumentsss() {
  const selected = this.AddFileInwardForm.get('isDestructionOrExtension')?.value;

  if (selected === 'Extension') {
    this.AddFileInwardForm.get('extensionYear')?.enable();
  } else {
    this.AddFileInwardForm.get('extensionYear')?.disable();
    this.AddFileInwardForm.get('extensionYear')?.setValue(null);
  }
}


  SaveData() {
    this.submitted = true;
    if (this.AddFileInwardForm.valid) {
      const apiUrl =
        this._global.baseAPIUrl + "BranchInward/SubmitDestruction";
      this._onlineExamService
        .postData(
          {
            ...this.AddFileInwardForm.value,
          },
          apiUrl
        )
        .subscribe((data: {}) => {
          this.GetBatchDetails();
          this.AllLanData = null;
          this.fileBarcodeList = [];
          this.ShowMessage(data);
       //   console.log("data_1", data);
          //  this.AddFileInwardForm.controls["department"].setValue("");
          this.AddFileInwardForm.controls["cartonNo"].setValue("");
          this.AddFileInwardForm.controls["detailDocumentType"].setValue("");
          this.submitted = false;
          this.OnReset();
        });
    }
  }
onSelectDist() {
  const selectedValue = this.AddFileInwardForm.get('isDestructionOrExtension')?.value;

  if (selectedValue === 'Extension') {
    this.AddFileInwardForm.get('extensionYear')?.enable();
  } else {
    this.AddFileInwardForm.get('extensionYear')?.disable();
    this.AddFileInwardForm.get('extensionYear')?.setValue(null); // Optional: reset value
  }
}

  AllData: any;
  GetBatchID() {
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchInward/GetCartonDetails?UserID=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token") +
      "&id=" +
      this.route.snapshot.params["id"];
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data.length > 0) {
        const record = data[0];
        this.AddFileInwardForm = this.formBuilder.group({
         id: [record.id],
          batchId: [record.batchId],
          documentType: [record.documentTypeName],
          department: [record.departmentName],
          cartonNo: [record.cartonNo],
          detailDocumentType: [record.detailDocumentTypeName],
          retensionPeriod: [record.ReteionPeriod],
          warehouse: [record.warehouseName],
          detailLocation: [record.location],
          dateOfDestruction: [record.dateOfDestruction],
          isDestructionOrExtension: [""],
            extensionYear: ["", [Validators.required]],
          extensionDate: [record.ExpireDate],
          User_Token: localStorage.getItem("User_Token"),
          UserID: localStorage.getItem("UserID"),
        });
      }
    });
  }

  AllLanData: any;
  GetBatchDetails() {
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
      this.prepareTableData(data, data);
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

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "batchId", header: "BATCH ID", index: 2 },
      { field: "cartonNo", header: "CARTON NUMBER", index: 2 },
      { field: "department", header: "DEPARTMENT NAME", index: 3 },
      { field: "documentType", header: "DOCUMENT TYPE", index: 4 },
      { field: "detailDocumentType", header: "DOCUMENT DETAILS", index: 3 },
      { field: "status", header: "STATUS", index: 3 },
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        batchId: el.batchId,
        id: el.id,
        cartonNo: el.cartonNo,
        department: el.departmentName,
        documentType: el.documentTypeName,
        detailDocumentType: el.detailDocumentTypeName,
        status: el.status,
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }
  DeleteRecord(car) {
    if (confirm("Are You Sure ?")) {
      const apiUrl = this._global.baseAPIUrl + "Inventory/DeleteBatchDetails";
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
      const apiUrl = this._global.baseAPIUrl + "BranchInward/CloseBatch";
      this._onlineExamService
        .postData(this.AddFileInwardForm.value, apiUrl)

        .subscribe((data: {}) => {
          console.log(data);
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
              // this.GetBatchDetails();
            });
        }
      });
  }

  OnReset()
  {
     this.location.back();
  }
}
