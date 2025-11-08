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
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { saveAs } from "file-saver";
import { MultiSelectModule } from "primeng/multiselect";

import swal from "sweetalert2";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-basic-search",
  templateUrl: "basic-search.component.html",
  styleUrls: ["basic-search.component.css"],
})
export class BasicsearchComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  isReadonly = true;
  DispatchList: any;
  _FilteredList: any;
  _HeaderList: any;
  first: any = 0;
  rows: any = 0;
  _IndexList: any;
  PODForm: FormGroup;
  ContentSearchForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  _IndexPendingList: any;
  bsValue = new Date();
  _ColNameList = [
    "RequestID",
    "CartonNo",
    "FileStatus",
    "RequestStatus",
    "Remark",
    "RetrievalBy",
    "RetrievalDate",
    "ApprovalBy",
    "ApprovalDate",
    "RetrievalDispatchBy",
    "RetrievalDispatchDate",
    "RetrievalAckBy",
    "RetrievalAckDate",
    "RejectBy",
    "RejectDate",
    "status",
    "ReturnRequestBy",
    "ReturnRequestDate",
    "approvedBy",
    "approvedDate",
    "pickupDate",
    "warehouseEntryBy",
    "warehouseEntryDate",
    "WarehouseReturnAckBy",
    "WarehouseReturnAckDate",
  ];

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  ngOnInit() {
    document.body.classList.add("data-entry");
    this.ContentSearchForm = this.formBuilder.group({
      SearchBy: ["0", Validators.required],
      FileNo: ["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });
    this.PODForm = this.formBuilder.group({
      pod_number: ["", Validators.required],
      Courier_id: ["", Validators.required],
      request_no: ["", Validators.required],
      CartonNo: ["", Validators.required],
      CourierName: ["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });
    const historyType = this.route.snapshot.params["historytype"];
    this.PickupHistory();
    this.ContentSearchForm.controls["SearchBy"].setValue("0");
  }


tabs = [
  { title: 'Inventory', fileName: 'InventoryHistory' },
  { title: 'Retrieval', fileName: 'RetrievalHistory' },
  { title: 'Refiling', fileName: 'RefillingHistory' },
  { title: 'Warehouse Location Update', fileName: 'WarehouseLocationHistory' },
  { title: 'Annual Review', fileName: 'AnnualReviewHistory' },
];


  selectedTab = 0;

  selectTab(index: number, event: Event): void {
    event.preventDefault(); // Prevent default anchor behavior
    this.selectedTab = index;
    if (index === 0) {
      this.PickupHistory();
    } else if (index === 1) {
      this.RetrievalHistory();
    } else if (index === 2) {
      this.RefilligHistory();
    }else if (index === 3) {
      this.warehouselocationhistory();
    }
    else {
      this.AnnualReviewHistory();
    }
  }


  PickupHistory() {
    const apiUrl =
      this._global.baseAPIUrl +
      "OCBC_Search/GetPickupHistorySearch?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + "&File_No=" +
      this.route.snapshot.params["CartonNo"];
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingList = data;
      this._FilteredList = data;
      this.prepareTableDataForPickupHistory(
        this._FilteredList,
        this._IndexPendingList
      );
    });
  }



  RetrievalHistory() {
    const apiUrl =
      this._global.baseAPIUrl + "OCBC_Search/Getbasicsearch?USERId=" + localStorage.getItem("UserID") + "&user_Token=" +
      localStorage.getItem("User_Token") + "&CartonNo=" + this.route.snapshot.params["CartonNo"];

    this._onlineExamService.getAllData(apiUrl).subscribe(
      (data: any[]) => {
        if (!data || data.length === 0) {

          this._IndexPendingList = data;
          this._FilteredList = data;
          this.loading = false;
          this.prepareTableData(this._FilteredList, this._IndexPendingList);
        } else {
          this._IndexPendingList = data;
          this._FilteredList = data;
          this.prepareTableData(this._FilteredList, this._IndexPendingList);
        }
      },

    );
  }

  RefilligHistory() {
    const apiUrl =
      this._global.baseAPIUrl +
      "OCBC_Search/GetRefillingistory?USERId=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token") +
      "&File_No=" +
      this.route.snapshot.params["CartonNo"];
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingList = data;
      this._FilteredList = data;
      this.prepareTableDataForReturnHistory(
        this._FilteredList,
        this._IndexPendingList
      );
    });
  }

  warehouselocationhistory() {
    const apiUrl =
      this._global.baseAPIUrl +
      "OCBC_Search/GetwarehouselocationhistorySearch?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + "&File_No=" +
      this.route.snapshot.params["CartonNo"];
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingList = data;
      this._FilteredList = data;
      this.prepareTableDataForWarehouseLocation(
        this._FilteredList,
        this._IndexPendingList
      );
    });
  }

  AnnualReviewHistory() {
    const apiUrl =
      this._global.baseAPIUrl +
      "OCBC_Search/GetAnnualHistory?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + "&File_No=" +
      this.route.snapshot.params["CartonNo"];
    this._onlineExamService.getAllData(apiUrl).subscribe(
      (data: any[]) => {
        if (!data || data.length === 0) {

          this._IndexPendingList = data;
          this._FilteredList = data;
          this.loading = false;
          this.prepareTableDataForAnnualReview(this._FilteredList, this._IndexPendingList);
        } else {
          this._IndexPendingList = data;
          this._FilteredList = data;
          this.prepareTableDataForAnnualReview(this._FilteredList, this._IndexPendingList);
        }
      },

    );
  }


  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;



  private formatDate(originalDateString: any) {
    const date = new Date(originalDateString);

    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1); // Months are zero-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  selectedColumns: any;
  modelChange(e: any) {
    console.log(e);
    this.selectedColumns = e;
    this.selectedColumns = this.selectedColumns.sort((el1, el2) =>
      el1.pos < el2.pos ? -1 : 1
    );
  }

  prepareTableDataForPickupHistory(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [

      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'BatchID', header: 'BATCH ID', index: 2 },
      { field: 'CartonNo', header: 'CARTON NUMBER', index: 3 },
      { field: 'ItemStatus', header: 'ITEM STATUS', index: 2 },
      { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 3 },
      { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 3 },
      { field: 'documents', header: 'DOCUMENT TYPE', index: 2 },
      { field: 'DocumentDetails', header: 'DOCUMENT DETAILS', index: 2 },
      { field: 'status', header: 'BATCH STATUS', index: 2 },
      { field: 'Status', header: 'CARTON STATUS', index: 2 },
      // { field: 'disb_date', header: 'DISB DATE', index: 2 },
      // { field: 'created_by', header: 'INWARD BY', index: 4 },

      { field: 'InventoryBy', header: 'INVENTORY BY', index: 2 },
      { field: 'InventoryDate', header: 'INVENTORY ON', index: 2 },
      { field: 'approvedBy', header: 'APPROVED BY', index: 2 },
      { field: 'approvedDate', header: 'APPROVED ON', index: 2 },
      { field: 'pickupDate', header: 'EXPECTED PICKUP ON', index: 3 },
      { field: 'InventoryAckBy', header: 'ACKNOWLEDGE BY', index: 2 },
      { field: 'InventoryAckDate', header: 'ACKNOWLEDGE ON', index: 2 },

      {
        field: "RejectAt",
        header: "INVENTORY REJECT AT",
        index: 3,
      },
      { field: 'rejectedBy', header: 'INVENTORY REJECTED BY', index: 2 },
      { field: 'rejectedDate', header: 'INVENTORY REJECTED ON', index: 2 },
      // { field: 'warehouseName', header: 'WAREHOUSE NAME', index: 2 },
      // { field: 'ItemLcoation', header: 'ITEM LOCATION', index: 2 },

      // { field: 'warehouseLocationUpdatedBy', header: 'WAREHOUSE UPDATED BY', index: 2 },
      // { field: 'warehouseLocationUpdatedDate', header: 'WAREHOUSE UPDATED ON', index: 2 },
      // { field: 'ReteionPeriod', header: 'RETENTION PERIOD(YEAR)', index: 2 },
      // { field: 'ExpireDate', header: 'EXPIRY ON', index: 2 },
      // { field: 'isDestruction', header: 'IS DESTRUCTION', index: 2 },
      //  { field: 'extensionBy', header: 'EXTENSION BY', index: 2 },
      // { field: 'extensionDate', header: 'EXTENSION ON', index: 2 },
      // { field: 'DestructionBy', header: 'DESTRUCTION BY', index: 2 },
      // { field: 'DestructionDate', header: 'DESTRUCTION ON', index: 2 },
    ];

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
        'disb_date': el.disb_date,
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
        'RejectAt': el.RejectAt

      });
    });

    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: "RequestID", header: "REQUEST NUMBER", index: 5 },
      { field: "CartonNo", header: "CARTON NO", index: 4 },
      { field: "FileStatus", header: "CARTON STATUS", index: 10 },
      { field: "RequestStatus", header: "REQUEST STATUS", index: 8 },
      { field: "Remark", header: "REMARK", index: 9 },
      { field: "RetrievalBy", header: "REQUESTED BY", index: 17 },
      { field: "RetrievalDate", header: "REQUESTED ON", index: 19 },
      { field: "ApprovalBy", header: "APPROVED BY", index: 3 },
      { field: "ApprovalDate", header: "APPROVED ON", index: 3 },
      { field: 'ExpDeliveryDate', header: 'EXPECTED DELIVERY ON', index: 3 },

      {
        field: "RetrievalDispatchBy",
        header: "DISPATCHED BY",
        index: 3,
      },
      {
        field: "RetrievalDispatchDate",
        header: "DISPATCHED ON",
        index: 3,
      },

      { field: "RetrievalAckBy", header: "ACK BY", index: 16 },
      { field: "RetrievalAckDate", header: "ACK ON", index: 3 },
      {
        field: "RejectAt",
        header: "REJECTED AT",
        index: 3,
      },
      {
        field: "RejectBy",
        header: "REJECTED BY",
        index: 3,
      },
      {
        field: "RejectDate",
        header: "REJECTED ON",
        index: 3,
      },
      // { field: "status", header: "RETURN REQUEST STATUS", index: 3 },
      // { field: "ReturnRequestBy", header: "RETURN REQUEST BY", index: 12 },
      // { field: "ReturnRequestDate", header: "RETURN REQUEST ON", index: 13 },
      // { field: "approvedBy", header: "RETURN REQUEST APPROVED BY", index: 13 },
      // {
      //   field: "approvedDate",
      //   header: "RETURN REQUEST APPROVED ON",
      //   index: 15,
      // },
      // {
      //   field: "pickupDate",
      //   header: "RETURN REQUEST EXPECTED PICKUP ON",
      //   index: 15,
      // },

      // {
      //   field: "WarehouseReturnAckBy",
      //   header: "RETURN REQUEST ACK BY",
      //   index: 13,
      // },
      // {
      //   field: "WarehouseReturnAckDate",
      //   header: "RETURN REQUEST ACK ON",
      //   index: 13,
      // },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        // 'branch_name': el.branch_name,
        // 'page_count': el.page_count,
        'srNo': parseInt(index + 1),
        RetrievalAckDate: el.RetrievalAckDate,
        CartonNo: el.CartonNo,
        RequestID: el.RequestID,
        RetrievalAckBy: el.RetrievalAckBy,
        RequestStatus: el.RequestStatus,
        Remark: el.Remark,
        FileStatus: el.FileStatus,
        RetrievalAckRejectBy: el.RetrievalAckRejectBy,
        RetrievalAckRejectDate: el.RetrievalAckRejectDate,
        ServiceType: el.ServiceType,
        status: el.status,
        dispatch_address: el.dispatch_address,
        RetrievalBy: el.RetrievalBy,
        RetrievalDate: el.RetrievalDate,
        ApprovalBy: el.ApprovalBy,
        ApprovalDate: el.ApprovalDate,
        RetrievalDispatchBy: el.RetrievalDispatchBy,
        RetrievalDispatchDate: el.RetrievalDispatchDate,
        RejectDate: el.RejectDate,
        RejectBy: el.RejectBy,
        ReturnRequestBy: el.ReturnRequestBy,
        ReturnRequestDate: el.ReturnRequestDate,
        approvedBy: el.approvedBy,
        approvedDate: el.approvedDate,
        warehouseEntryBy: el.warehouseEntryBy,
        WarehouseEntryDate: el.WarehouseEntryDate,
        WarehouseReturnAckBy: el.WarehouseReturnAckBy,
        WarehouseReturnAckDate: el.WarehouseReturnAckDate,
        ExpDeliveryDate: el.ExpDeliveryDate,
        RejectAt: el.RejectAt
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  prepareTableDataForReturnHistory(tableData, headerList) {
    let formattedData = [];

    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: "requestNumber", header: "RETURN REQUEST ID", index: 1 },
      { field: "CartonNo", header: "CARTON NO", index: 1 },
      { field: "ReturnRequestDate", header: "REQUESTED ON", index: 1 },
      { field: "ReturnRequestBy", header: "REQUESTED BY", index: 1 },
      //  { field: "ServiceType", header: "SERVICE TYPE", index: 1 },
      { field: "FileStatus", header: "CARTON STATUS", index: 1 },
      { field: "status", header: "STATUS", index: 1 },
      { field: "ReturnRequestApproveBy", header: "APPROVED BY", index: 1 },
      { field: "ReturnRequestApproveDate", header: "APPROVED ON", index: 1 },
      { field: "pickupDate", header: "EXPECTED PICK ON", index: 1 },
      { field: "WarehouseReturnAckDate", header: "ACK ON", index: 1 },
      { field: "WarehouseReturnAckBy", header: "ACK BY", index: 1 },
      { field: "warehousePickupLocationBy", header: "LOCATION UPDATED BY", index: 1 },
      { field: "warehousePickupLocationDate", header: "LOCATION UPDATED ON", index: 1 },

      // { field: "WarehouseEntryBy", header: "WAREHOUSE ENTRY BY", index: 1 },
      //  { field: "WarehouseEntryDate", header: "WAREHOUSE ENTRY ON", index: 1 },   
      { field: "Remark", header: "REMARK", index: 1 }, {
        field: "RejectAt", header: "REJECTED AT", index: 3,
      },
      { field: "rejectedBy", header: "REJECTED BY", index: 3, },
      { field: "rejectedDate", header: "REJECTED ON", index: 3, },
      //

    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: index + 1,
        requestNumber: el.requestNumber,
        CartonNo: el.CartonNo,
        ReturnRequestDate: el.ReturnRequestDate,
        ReturnRequestBy: el.ReturnRequestBy,
        ServiceType: el.ServiceType,
        FileStatus: el.FileStatus,
        status: el.status,
        ReturnRequestApproveBy: el.ReturnRequestApproveBy,
        ReturnRequestApproveDate: el.ReturnRequestApproveDate,
        ReturnRequestRejectedBy: el.ReturnRequestRejectedBy,
        ReturnRequestRejectDate: el.ReturnRequestRejectDate,
        ReturnRequestRejectReason: el.ReturnRequestRejectReason,
        WarehouseReturnAckDate: el.WarehouseReturnAckDate,
        WarehouseReturnAckBy: el.WarehouseReturnAckBy,
        ReturnRequestExpectedPickDate: el.ReturnRequestExpectedPickDate,
        Remark: el.Remark,

        WarehouseLcoation: el.WarehouseLcoation,
        //   requestNumber: el.requestNumber,

        WarehousePickupAckBy: el.WarehousePickupAckBy,
        WarehousePickupAckDate: el.WarehousePickupAckDate,
        itemLcoation: el.itemLcoation,
        warehousePickupLocationBy: el.warehousePickupLocationBy,
        warehousePickupLocationDate: el.warehousePickupLocationDate,
        WarehouseReturnRejectedBy: el.WarehouseReturnRejectedBy,
        WarehouseReturnRejectDate: el.WarehouseReturnRejectDate,
        ApprovedBy: el.ApprovedBy,
        ApprovedDate: el.ApprovedDate,
        rejectedBy: el.rejectedBy,
        rejectedDate: el.rejectedDate,

        pickupDate: el.pickupDate,
        WarehouseEntryBy: el.WarehouseEntryBy,
        WarehouseEntryDate: el.WarehouseEntryDate,
        RejectAt: el.RejectAt
        //  ReturnRequestBy: el.ReturnRequestBy
      });
    });

    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  prepareTableDataForWarehouseLocation(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [

      { field: 'srNo', header: "SR NO", index: 1 },
      //  { field: 'BatchID', header: 'BATCH ID', index: 2 },
      { field: 'CartonNo', header: 'CARTON NUMBER', index: 3 },
      { field: 'warehouseName', header: 'WAREHOUSE NAME', index: 2 },
      { field: 'ItemLcoation', header: 'ITEM LOCATION', index: 2 },
      { field: 'warehouseLocationUpdatedBy', header: 'LOCATION UPDATED BY', index: 2 },
      { field: 'warehouseLocationUpdatedDate', header: 'LOCATION UPDATED ON', index: 2 },

    ];

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
        'ItemStatus': el.ItemStatus,
        'warehouseName': el.warehouseName,
        'InventoryAckBy': el.InventoryAckBy,
        'InventoryAckDate': el.InventoryAckDate,
        'ItemLcoation': el.ItemLcoation,
        'warehouseLocationUpdatedDate': el.warehouseLocationUpdatedDate,
        'WarehouseId': el.WarehouseId,
        'warehouseLocationUpdatedBy': el.warehouseLocationUpdatedBy
        //WarehouseId = el.WarehouseId

      });
    });

    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

prepareTableDataForAnnualReview(tableData, headerList) {
  let formattedData = [];
  let tableHeader: any = [
    { field: 'srNo', header: "SR NO", index: 1 },
    { field: 'CartonNo', header: 'CARTON NUMBER', index: 2 },
    { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 3 },
    { field: 'documentTypeName', header: 'DOCUMENT TYPE', index: 4 },
    { field: 'detailDocumentTypeName', header: 'DOCUMENT DETAILS', index: 5 },
    { field: 'warehouseName', header: 'WAREHOUSE NAME', index: 6 },
    { field: 'ReteionPeriod', header: 'RETENTION PERIOD(YEAR)', index: 7 },
    { field: 'isDestructionOrExtension', header: 'DESTRUCTION / EXTENSION', index: 8 },
    { field: 'extensionBy', header: 'EXTENSION BY', index: 9 },
    { field: 'extensionDate', header: 'EXTENSION ON', index: 10 },
    { field: 'destructionBy', header: 'DESTRUCTION BY', index: 11 },
    { field: 'destructionDate', header: 'DESTRUCTION ON', index: 12 }
  ];

  tableData.forEach((el, index) => {
    formattedData.push({
      'srNo': index + 1,
      'BatchID': el.BatchID,
      'documentTypeName': el.documentTypeName,
      'retrival_type': el.retrival_type,
      'CartonNo': el.CartonNo,
      'DepartmentName': el.DepartmentName,
      'DepartmentCode': el.DepartmentCode,
      'created_by': el.created_by,
      'created_date': el.created_date,
      'ItemStatus': el.ItemStatus,
      'warehouseName': el.warehouseName,
      'detailDocumentTypeName': el.detailDocumentTypeName,
      'ReteionPeriod': el.ReteionPeriod,
      'isDestructionOrExtension': el.isDestructionOrExtension,

      // same vars mapped conditionally
      'extensionBy': el.isDestructionOrExtension === 'Extension' ? el.extensionBy : null,
      'extensionDate': el.isDestructionOrExtension === 'Extension' ? el.extensionDate : null,
      'destructionBy': el.isDestructionOrExtension === 'Destruction' ? el.extensionBy : null,
      'destructionDate': el.isDestructionOrExtension === 'Destruction' ? el.extensionDate : null
    });
  });

  this.headerList = tableHeader;
  this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
  this.formattedData = formattedData;
  this.loading = false;
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
    this.Reset = true;
    this.PODForm.reset();
    this.isReadonly = false;
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
    document.body.classList.remove("data-entry");
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

  selectedEntries = [];
  allSelected = false;
  selectRow(e, fileNo) {
    if (e.target.checked) {
      this.selectedEntries.push(fileNo);
    } else {
      this.selectedEntries.splice(this.selectedEntries.indexOf(fileNo), 1);
    }
    if (this._FilteredList.length === this.selectedEntries.length) {
      setTimeout(() => {
        this.allSelected = true;
      }, 100);
    } else {
      setTimeout(() => {
        this.allSelected = false;
      }, 100);
    }
    console.log(this.selectedEntries);
  }


  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  GetHeaderNames() {
    this._HeaderList = "";

    for (let j = 0; j < this.headerList.length; j++) {
      this._HeaderList +=
        this.headerList[j].header + (j < this.headerList.length - 1 ? "," : "");
    }
    this._HeaderList += "\n";

    // Add corresponding data rows
    this.formattedData.forEach((row) => {
      for (let j = 0; j < this.headerList.length; j++) {
        const fieldName = this.headerList[j].field;
        let cell = row[fieldName] != null ? row[fieldName] : "";
        // Escape quotes
        cell =
          typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell;
        this._HeaderList += cell + (j < this.headerList.length - 1 ? "," : "");
      }
      this._HeaderList += "\n";
    });
  }


downloadFile() {
  this.GetHeaderNames();
  let csvData = this._HeaderList;
  var csvDatas = csvData.replace("null", "");

  if (this._FilteredList.length > 0) {
    const selectedFileName = this.tabs[this.selectedTab]?.fileName || "History";

    const blob = new Blob(["\ufeff" + csvDatas], {
      type: "text/csv;charset=utf-8;",
    });
    const downloadLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
    downloadLink.setAttribute("href", url);
    downloadLink.setAttribute("download", selectedFileName + ".csv");
    downloadLink.style.visibility = "hidden";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } else {
    this.toastr.show(
      `<div class="alert-text"></div> 
       <span class="alert-title">Error!</span> 
       <span>There should be some data before you download!</span>`,
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass: "ngx-toastr alert alert-dismissible alert-danger alert-notify",
      }
    );
  }
}

  closmodel() {
    this.modalRef.hide();
  }

}