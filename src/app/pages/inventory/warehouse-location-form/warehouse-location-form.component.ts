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
import { CommonService } from "src/app/Services/common.service";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-warehouse-location-form',
  templateUrl: './warehouse-location-form.component.html',
  styleUrls: ['./warehouse-location-form.component.scss']
})
export class WarehouseLocationFormComponent implements OnInit {
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
   isSaved: boolean = false;
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
    private location: Location,
        private _commonService: CommonService,
    
  ) { }

  ngOnInit() {
    this.AddFileInwardForm = this.formBuilder.group({
      batchId: [this.route.snapshot.params['id'], Validators.required],
      warehouseId: ["", Validators.required],
      location: ["", Validators.required],
      cartonNo: ["", [Validators.required]],
      User_Token: localStorage.getItem("User_Token"),
      UserID: localStorage.getItem("UserID"),
    });
    this.getWareHouseetails();
    this.GetBatchDetails()
    this.fileBarcodeList = [];
  }

  get FormControls() {
    return this.AddFileInwardForm.controls;
  }
  setCartonNumber(car){
    this.AddFileInwardForm.controls['cartonNo'].setValue(car.cartonNo)
  }

  SaveData() {
    this.submitted = true;
    if (this.AddFileInwardForm.valid) {
      const apiUrl = this._global.baseAPIUrl + "BranchInward/WarhouseLocationUpdate";
      this._onlineExamService
        .postData(
          {
            ...this.AddFileInwardForm.value,
          },
          apiUrl
        )
        .subscribe((data: {}) => {

          console.log(data);
          if (data == "Carton No Already Exist") {
            this.ShowErrormessage(data);
            return;
          }
          else if (data == "Carton Number Not Found") {
            this.ShowErrormessage(data);
            return;
          }
          else if (data == "Carton No Not Found In Batch") {
            this.ShowErrormessage(data);
            return;
          }
          else if (data == "Carton No Not Found In Warehouse") {
            this.ShowErrormessage(data);
            return;
          }

          this.ShowMessage(data);

          this.GetBatchDetails();
          this.AllLanData = null;
          this.fileBarcodeList = [];
          // this.AddFileInwardForm.controls["warehouseId"].setValue("");
          this.AddFileInwardForm.controls["cartonNo"].setValue("");
          //  this.AddFileInwardForm.controls["location"].setValue("");
          this.submitted = false;
        });
    }
  this.isSaved = true; 
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
      if (data.length > 0) {
        this.AddFileInwardForm.controls["batchId"].setValue(data[0].batchId);
        this.GetBatchDetails();
      }
    });
  }

  AllLanData: any;
  GetBatchDetails() {
    this.fileBarcodeList = [];
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchInward/GetBatchDetailsForCartonStorage?batchId=" +
      this.AddFileInwardForm.controls["batchId"].value +
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
    const apiUrl =
      this._global.baseAPIUrl +
      "Department/GetWarehouseDetails?ID=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data) {

        //   console.log("data_",data);

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
      { field: "batchId", header: "BATCH ID", index: 2 },
      { field: "cartonNo", header: "CARTON NUMBER", index: 2 },
      { field: "department", header: "DEPARTMENT NAME", index: 3 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 3 },

      { field: "documentType", header: "DOCUMENT TYPE", index: 4 },
      { field: "detailDocumentType", header: "DETAIL DOCUMENT TYPE", index: 3 },
      { field: "WarehouseName", header: "WAREHOUSE NAME", index: 3 },
      { field: "ItemLcoation", header: "DETAIL LOCATION", index: 3 },
      { field: "status", header: "CARTON STATUS", index: 3 },
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
        ItemLcoation: el.ItemLcoation,
        WarehouseName: el.warehouseName,
        DepartmentCode: el.DepartmentCode
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }


    isBatchClosable(): boolean {
  if (!this.formattedData.length) return false;
 
  return this.formattedData.every(item =>
    item.batchId &&
    item.cartonNo &&
    item.department &&
    item.documentType &&
    item.detailDocumentType &&
    item.status &&
    item.ItemLcoation &&
    item.WarehouseName &&
    item.DepartmentCode
  );
}
 
  DeleteRecord(car) {
    if (confirm("Are You Sure ?")) {
      const apiUrl = this._global.baseAPIUrl + "BranchInward/DeleteBatchDetails";
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
    this.toastr.clear();
    if (this.formattedData.length != 0) {
      const apiUrl =
        this._global.baseAPIUrl + "BranchInward/WarhouseLocationClose";
      this._onlineExamService
        .postData(this.AddFileInwardForm.value, apiUrl)

        .subscribe((data: any) => {

          console.log(data);
          if (data == "Files are in File Inward please close it") {
            this.ShowErrormessage(data);
            return;
          }


          this.location.back();
          // this.ShowMessage(data);
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

  OnReset() {
    this.GetBatchID();
    this.Reset = true;
    // this.AddFileInwardForm.reset({ User_Token: localStorage.getItem('User_Token') });
    // this.AddFileInwardForm.get('warehouseId')?.value;

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
 getStatusClass(status: string) { // gkj 01-08
  if (!status) return 'status-badge status-default';
 
  switch (status.toUpperCase()) {
    case 'CARTON INV RECEIVED':
      return 'status-badge status-accepted';
    case 'INVENTORY APPROVED':
      return 'status-badge status-review';
    case 'OPEN':
      return 'status-badge status-offered';
    case 'CARTON LOCATION UPDATED':
      return 'status-badge status-ack';
    case 'BATCH INV REJECTED':
      return 'status-badge status-rejected';
    default:
      return 'status-badge status-default';
  }
}


}
