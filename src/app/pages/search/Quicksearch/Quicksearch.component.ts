import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import swal from "sweetalert2";
// import { Listboxclass } from '../../../Helper/Listboxclass';
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-Quicksearch",
  templateUrl: "Quicksearch.component.html",
  styleUrls: ["Quicksearch.component.css"]
})
export class QuicksearchComponent implements OnInit {

  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  isReadonly = true;
  AddWarehouseForm: FormGroup;
  DispatchList: any;
  _FilteredList: any;
  _HeaderList: any;
  selectedDepartmentIds: number[] = [];
  first: any = 0;
  rows: any = 0
editRights:any;
  //_ColNameList:any;
  _IndexList: any;
  currentPage: number = 0;
  PODForm: FormGroup;
  ContentSearchForm: FormGroup;
  submitted = false;
  isAllSelected = false;
  Reset = false;
  sMsg: string = '';
  //warehouseDropdown: any[] = [];
  _IndexPendingList: any;
  bsValue = new Date();

  _ColNameList = ["BatchID", "documents", "CartonNo", "DepartmentName", "DocumentDetails", "status", "ItemStatus", "ItemLcoation", "warehouseName", "ReteionPeriod", "ExpireDate"];
  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private route: ActivatedRoute,
    private router: Router,
  ) { }
  ngOnInit() {
    document.body.classList.add('data-entry');
    this.editRights = (localStorage.getItem('Edit') || '').trim() === 'true';
    this.ContentSearchForm = this.formBuilder.group({
      SearchBy: ["0", Validators.required],
      FileNo: ['', Validators.required],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),
      DeptID: localStorage.getItem('DeptID'),

    });
    //RUCHI
    this.AddWarehouseForm = this.formBuilder.group({
      batchId: ['', Validators.required],
      warehouseId: ['', Validators.required],
      cartonNo: ['', Validators.required],
      ItemLcoation: ['', Validators.required]
      //RUCHI
    });
     
    // this.getWarehouseDropdown();
    this.GetDumpdata();
    this.getWareHouseetails();
    this.ContentSearchForm.controls['SearchBy'].setValue("0");
  }

  returnToListView() {
    this.first = this.currentPage * this.rows;
  } 

  closeModal() {
    // Logic to close the modal
    this.modalRef.hide();
    this.returnToListView();
  }

  GetDumpdata() {

    const apiUrl = this._global.baseAPIUrl + 'OCBC_Search/GetDumpdataSearch?USERId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log(data);
      this._IndexPendingList = data;
      this._FilteredList = data;
      this.prepareTableData(this._FilteredList, this._IndexPendingList);

    });
  }
 
  GetFilterSearch() {
    const apiUrl = this._global.baseAPIUrl + 'OCBC_Search/SearchRecordsByFilter?USERId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token') + '&FileNo=' + this.ContentSearchForm.get('FileNo').value + '&SearchBy=' + this.ContentSearchForm.get('SearchBy').value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingList = data;
      this._FilteredList = data

      this.prepareTableData(this._FilteredList, this._IndexPendingList);

    });
  }


  OnReset() {
    this.Reset = true;
    this.ContentSearchForm = this.formBuilder.group({
      SearchBy: ["0", Validators.required],
      FileNo: ['', Validators.required],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),

    });
    this.GetDumpdata()

    this.isReadonly = false;
    this.onClose();
    if (this.modalRef) {
      this.modalRef.hide(); // ✅ This closes the modal
    }
  }

  hidepopup() {

    this.modalRef.hide();

  }

  entriesChange($event) {
    this.entries = $event.target.value;
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(selected);
  }
  onActivate(event) {
    this.activeRow = event.row;
  }

  ngOnDestroy() {
    document.body.classList.remove('data-entry')
  }


  showmessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Validation ! </span> <span data-notify="message"> ' + data + ' </span></div>',
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

  selectedEntries = [];
  allSelected = false;
  selectRow(e, fileNo) {
    if (e.target.checked) {
      this.selectedEntries.push(fileNo);
    } else {
      this.selectedEntries.splice(this.selectedEntries.indexOf(fileNo), 1);
    }

    // check if all rows are individually selected
    if (this._FilteredList.length === this.selectedEntries.length) {
      setTimeout(() => {
        this.allSelected = true;
      }, 100);
    } else {
      setTimeout(() => {
        this.allSelected = false;
      }, 100);
    }
    
  }

 
 

  convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(row => Object.values(row).join(',')).join('\n');

    return headers + rows;
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  selectedColumns: any[] = [];
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    const tableHeader = [
      { field: 'srNo', header: "SR NO", visible: true },
      { field: 'BatchID', header: 'BATCH ID', visible: true },
      { field: 'CartonNo', header: 'CARTON NUMBER', visible: true },
      { field: 'ItemStatus', header: 'ITEM STATUS', visible: true },
      { field: 'DepartmentName', header: 'DEPARTMENT NAME', visible: true },
      { field: 'DepartmentCode', header: 'DEPARTMENT CODE', visible: true },
      { field: 'documents', header: 'DOCUMENT TYPE', visible: true },
      { field: 'DocumentDetails', header: 'DETAIL DOCUMENT TYPE', visible: true },
      // { field: 'status', header: 'BATCH STATUS', visible: true },
      { field: 'Status', header: 'CARTON STATUS', visible: true },
      { field: 'InventoryBy', header: 'INVENTORY BY', visible: true },
      { field: 'InventoryDate', header: 'INVENTORY ON', visible: true },
      { field: 'approvedBy', header: 'INVENTORY APPROVED BY', visible: true },
      { field: 'approvedDate', header: 'INVENTORY APPROVED ON', visible: true },
      { field: "RejectAt", header: "REJECTED AT", visible: true },
      { field: 'rejectedBy', header: 'INVENTORY REJECTED BY', visible: true },
      { field: 'rejectedDate', header: 'INVENTORY REJECTED ON', visible: true },
      { field: 'pickupDate', header: 'EXPECTED PICKUP ON', visible: true },
            { field: "warehouseEntryBy", header: "INVENTORY SCHEDULED BY", index: 1 },

      { field: 'InventoryAckBy', header: 'ACKNOWLEDGE BY', visible: true },
      { field: 'InventoryAckDate', header: 'ACKNOWLEDGE ON', visible: true },
      { field: 'warehouseName', header: 'WAREHOUSE NAME', visible: true },
      { field: 'ItemLcoation', header: 'ITEM LOCATION', visible: true },
      { field: 'warehouseLocationUpdatedBy', header: 'LOCATION UPDATED BY', visible: true },
      { field: 'warehouseLocationUpdatedDate', header: 'LOCATION UPDATED ON', visible: true },
      { field: 'ReteionPeriod', header: 'RETENTION PERIOD(YEAR)', visible: true },
      { field: 'ExpireDate', header: 'EXPIRY ON', visible: true },
      { field: 'isDestruction', header: 'IS DESTRUCTION', visible: true },
      { field: 'extensionBy', header: 'EXTENSION BY', visible: true },
      { field: 'extensionDate', header: 'EXTENSION ON', visible: true },
      { field: 'DestructionBy', header: 'DESTRUCTION BY', visible: true },
      { field: 'DestructionDate', header: 'DESTRUCTION ON', visible: true },
    ];

    // console.log("this.formattedData", tableData);
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'BatchID': el.BatchID,
        'documents': el.documents,
        'retrival_type': el.retrival_type,
        'CartonNo': el.CartonNo,
        'DepartmentName': el.DepartmentName,
        'DepartmentCode': el.DepartmentCode,
        'created_by': el.created_by,
        "created_date": el.created_date,
        'customer_name': el.customer_name,
        'status': el.status,
        'Status': el.Status,
        'DocumentDetails': el.DocumentDetails,        
        'pickupDate': el.pickupDate,
        'ItemStatus': el.ItemStatus,
        'warehouseName': el.warehouseName,
        'InventoryAckBy': el.InventoryAckBy,
        'InventoryAckDate': el.InventoryAckDate,
        'ItemLcoation': el.ItemLcoation,
        'ReteionPeriod': el.ReteionPeriod,
        'ExpireDate': el.ExpireDate,
        'InventoryDate': el.InventoryDate,
        'InventoryBy': el.InventoryBy,
        'approvedBy': el.approvedBy,
        'approvedDate': el.approvedDate,
        'isDestruction': el.isDestruction,
        'DestructionBy': el.DestructionBy,
        'DestructionDate': el.DestructionDate,
        'rejectedBy': el.rejectedBy,
        'rejectedDate': el.rejectedDate,
        'warehouseLocationUpdatedDate': el.warehouseLocationUpdatedDate,
        'extensionBy': el.extensionBy,
        'extensionDate': el.extensionDate,
        'WarehouseId': el.WarehouseId,
        'RRCount': el.RRCount,
        'warehouseLocationUpdatedBy': el.warehouseLocationUpdatedBy,
        //WarehouseId = el.WarehouseId
        'RejectAt': el.RejectAt,
        'warehouseEntryBy': el.warehouseEntryBy,
        'warehouseEntryDate': el.warehouseEntryDate 

      });

    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
    this.selectedColumns = [...tableHeader];
    //    console.log(this.formattedData);

  }

  searchTable($event) {
    // console.log($event.target.value);

    let val = $event.target.value;
    if (val == '') {
      this.formattedData = this.immutableFormattedData;
    } else {
      let filteredArr = [];
      const strArr = val.split(',');
      this.formattedData = this.immutableFormattedData.filter(function (d) {
        for (var key in d) {
          strArr.forEach(el => {
            if (d[key] && el !== '' && (d[key] + '').toLowerCase().indexOf(el.toLowerCase()) !== -1) {
              if (filteredArr.filter(el => el.srNo === d.srNo).length === 0) {
                filteredArr.push(d);
              }
            }
          });
        }
      });
      this.formattedData = filteredArr;
    }
  }

getStatusClass(status: string): string {
  if (!status || status.trim() === '') {
    return 'status-badge status-empty'; 
  }

  const normalized = status.trim().toUpperCase();

  switch (true) {
    case normalized.includes('WAREHOUSE LOCATION'):
      return 'status-badge status-accepted';  // green
    case normalized.includes('INVENTORY APPROVED'):
      return 'status-badge status-review';    // yellow
    case normalized === 'OPEN':
      return 'status-badge status-offered';   // blue
    case normalized === 'INV ACK':
      return 'status-badge status-ack';       // purple
    case normalized.includes('REJECTED'):
      return 'status-badge status-rejected';  // red
    case normalized.includes('PICKUP'):
      return 'status-badge status-scheduled'; // orange
    case normalized.includes('PARTIALLY'):
      return 'status-badge status-partial-ack'; // cyan
    case normalized.includes('RECEIVED'):
      return 'status-badge status-received'; // orange
    case normalized === 'OUT':
      return 'status-badge status-out'; // 🔴 red
    case normalized === 'DESTRUCTION':
      return 'status-badge status-destruction'; // 🟢 light green
      case normalized === 'IN':
  return 'status-badge status-in';
    default:
      return 'status-badge status-default';  // fallback
  }
}


  GetHeaderNames() {
    this._HeaderList = '';

    const tableHeader = [
      { field: 'srNo', header: "SR NO" },
      { field: 'BatchID', header: 'BATCH ID' },
      { field: 'CartonNo', header: 'CARTON NUMBER' },
            { field: 'ItemStatus', header: 'ITEM STATUS' },
      { field: 'DepartmentName', header: 'DEPARTMENT NAME' },
      { field: 'DepartmentCode', header: 'DEPARTMENT CODE' },
      { field: 'documents', header: 'DOCUMENT TYPE' },
      { field: 'DocumentDetails', header: 'DETAIL DOCUMENT TYPE' },
      { field: 'status', header: 'BATCH STATUS' },
      { field: 'Status', header: 'CARTON STATUS' },
      { field: 'pickupDate', header: 'EXPECTED PICKUP ON' },

      { field: 'InventoryBy', header: 'INVENTORY BY' },
      { field: 'InventoryDate', header: 'INVENTORY ON' },
      { field: 'approvedBy', header: 'APPROVED BY' },
      { field: 'approvedDate', header: 'APPROVED ON' },
     { field: "RejectAt", header: "REJECTED AT", index: 2 },
      { field: 'rejectedBy', header: 'REJECTED BY' },
      { field: 'rejectedDate', header: 'REJECTED ON' },
      { field: 'warehouseName', header: 'WAREHOUSE NAME' },       
      { field: 'InventoryAckBy', header: 'ACKNOWLEDGE BY' },
      { field: 'InventoryAckDate', header: 'ACKNOWLEDGE ON' },
      { field: 'warehouseLocationUpdatedBy', header: 'LOCATION UPDATED BY', index: 2 },
      { field: 'warehouseLocationUpdatedDate', header: 'LOCATION UPDATED ON', index: 2 },
      { field: 'ItemLcoation', header: 'ITEM LOCATION' },
      { field: 'ReteionPeriod', header: 'RETENTION PERIOD(YEAR)' },
      { field: 'ExpireDate', header: 'EXPIRY ON' },
      { field: 'isDestruction', header: 'IS DESTRUCTION' },
      { field: 'extensionBy', header: 'EXTENSION BY' },
      { field: 'extensionDate', header: 'EXTENSION ON' },
      { field: 'DestructionBy', header: 'DESTRUCTION BY' },
      { field: 'DestructionDate', header: 'DESTRUCTION ON' }
    ];

    // Add CSV header
    this._HeaderList += tableHeader.map(col => col.header).join(',') + '\n';

    // Add rows
    this._FilteredList.forEach((row, index) => {
      const rowData = tableHeader.map(col => {
        if (col.field === 'srNo') return index + 1; // Add serial number
        return row[col.field] != null ? row[col.field] : '';
      });
      this._HeaderList += rowData.join(',') + '\n';
    });
  }


  downloadFile() {
    this.GetHeaderNames()
    let csvData = this._HeaderList;
    var csvDatas = csvData.replace("null", "");

    // console.log(csvData) 
    if (this._FilteredList.length > 0) {
      let blob = new Blob(['\ufeff' + csvDatas], {
        type: 'text/csv;charset=utf-8;'
      });
      let dwldLink = document.createElement("a");
      let url = URL.createObjectURL(blob);
      let isSafariBrowser = -1;
      // let isSafariBrowser = navigator.userAgent.indexOf( 'Safari') != -1 & amp; & amp; 
      // navigator.userAgent.indexOf('Chrome') == -1; 

      //if Safari open in new window to save file with random filename. 
      if (isSafariBrowser) {
        dwldLink.setAttribute("target", "_blank");
      }
      dwldLink.setAttribute("href", url);
      dwldLink.setAttribute("download", "QuickSearch_Data" + ".csv");
      dwldLink.style.visibility = "hidden";
      document.body.appendChild(dwldLink);
      dwldLink.click();
      document.body.removeChild(dwldLink);
    } else {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">There should be some data before you download!</span></div>',
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

    this.logDownloadActivity();
  }
  


  logDownloadActivity() {
  const payload = {
    pageName: 'Quick Search',
    activity: 'Download',
    activityDescription: 'User downloaded Quick Search list.',
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


  ViewPODDetails(template: TemplateRef<any>, Row: any) {

    this.PODForm.patchValue({
      Courier_id: Row.Courier_id,
      pod_number: Row.pod_number,
      request_no: Row.request_no,
      lanno: Row.lanno,
    })

    this.modalRef = this.modalService.show(template);

  }


  validation() {

    if (this.PODForm.get('pod_number').value == "") {
      this.showmessage("Please Enter POD No");
      return false;
    }
    if (this.PODForm.get('Courier_id').value <= 0) {
      this.showmessage("Please select Courier Name");
      return false;
    }

    return true;

  }

  closmodel() {

    this.modalRef.hide();
  }

  downloadLC(_File: any) {

    if (_File.request_reason != "Loan Closure") {
      return;
    }

    if (_File.lc_filepath == null || _File.lc_filepath == "" || _File.lc_filepath.length == 0) {
      this.showmessage("LC Attachment not available");
      return;
    }
    const fileExt = _File.lc_filepath.substring(_File.lc_filepath.lastIndexOf('.'), _File.lc_filepath.length);
    const apiUrl = this._global.baseAPIUrl + 'Retrival/DownlaodAttachment?ID=' + localStorage.getItem('UserID') + '&file_path=' + _File.lc_filepath + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
      if (res) {

        //   console.log("res",res);
        saveAs(res, _File.lanno + fileExt);
      }
    });

  }

  downloadAttachment(_File: any) {


    if (_File.file_path == null || _File.Attachment == "" || _File.Attachment.length == 0) {
      this.showmessage("Mail attachment not available");
      return;
    }
    const fileExt = _File.Attachment.substring(_File.Attachment.lastIndexOf('.'), _File.Attachment.length);
    const apiUrl = this._global.baseAPIUrl + 'Retrival/DownlaodAttachment?ID=' + localStorage.getItem('UserID') + '&file_path=' + _File.Attachment + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
      if (res) {

        //   console.log("res",res);
        saveAs(res, _File.request_no + '_' + _File.lanno + fileExt);
      }
    });

  }
 

  onClose() {
    // Reset form fields
    this.AddWarehouseForm.reset();

    // Reset checkbox selections
    this.selectedDepartmentIds = []; // if you're tracking selected IDs
    this.isAllSelected = false;

    // Optionally mark all controls as untouched
    this.AddWarehouseForm.markAsPristine();
    this.AddWarehouseForm.markAsUntouched();
  }
  editBranch(template: TemplateRef<any>, rowData: any) {
    this.AddWarehouseForm.patchValue({
      batchId: rowData.BatchID,
      warehouseId: Number(rowData.WarehouseId),  // Ensure `warehouseId` is available in rowData
      cartonNo: rowData.CartonNo,
      ItemLcoation: rowData.ItemLcoation // or the actual field name from your data
    });
    this.modalRef = this.modalService.show(template, {
      backdrop: 'static',
      keyboard: false
    });
  }
  // getWarehouseDropdown() {
  //   const apiUrl = this._global.baseAPIUrl + 'Master/GetWarehouseList?user_Token=' + localStorage.getItem('User_Token');

  //   this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
  //     this.warehouseDropdown = data.map((item: any) => ({
  //       label: item.WarehouseName,
  //       value: item.warehouseId
  //     }));
  //   });
  // }

  get FormControls() {
    return this.AddWarehouseForm?.controls || {};
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
 

  onSubmit() {
    this.submitted = true;
    if (this.AddWarehouseForm.invalid) {
      this.showmessage("Please fill all required fields.");
      return;
    }

    const formData = {
      ...this.AddWarehouseForm.value,
      CreatedBy: localStorage.getItem('UserID'),

      user_Token: localStorage.getItem("User_Token")
    };



    const apiUrl = this._global.baseAPIUrl + 'OCBC_Search/EditWarehouseDetailsForCarton';

    this._onlineExamService.postData(formData, apiUrl).subscribe({
      next: (data) => {
        this.toastr.show(
          `<div class="alert-text">
     <span class="alert-title" data-notify="title">Success!</span> 
     <span data-notify="message">Warehouse and Item-Location details updated successfully</span></div>`,
          "",
          {
            timeOut: 3000,
            closeButton: true,
            enableHtml: true,
            tapToDismiss: false,
            titleClass: "alert-title",
            positionClass: "toast-top-center",
            toastClass: "ngx-toastr alert alert-dismissible alert-success alert-notify"
          }
        );
        //this.toastr.success('Warehouse details updated successfully!');
        this.modalRef.hide();
        this.GetDumpdata(); // Refresh the data
      },
      error: (err) => {
        console.error("Error while saving:", err);
        this.toastr.error('Error updating warehouse details!');
      }
    });
  }

}