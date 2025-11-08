import { Component, Inject, OnInit, NgZone, PLATFORM_ID, ViewChild, TemplateRef } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import dataviz from "@amcharts/amcharts4/themes/dataviz";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
am4core.useTheme(am4themes_animated);
import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
am4core.useTheme(dataviz);
am4core.useTheme(am4themes_animated);
import { AxisRenderer } from '@amcharts/amcharts4/charts';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import moment from "moment";
import { from } from "rxjs";
import * as XLSX from 'xlsx';

@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.css"]
})

export class DashboardComponent implements OnInit {
  readonly DEFAULT_SLICE_STROKE_WIDTH: number = 0;
  readonly DEFAULT_SLICE_OPACITY: number = 1;
  readonly DEFAULT_ANIMATION_START_ANGLE: number = -90;
  readonly DEFAULT_ANIMATION_END_ANGLE: number = -90;
  private chart: am4charts.XYChart;
  downloadCount: any;
  displayStyle: string;
  type: any;
  private _TempFilePath: any;
  FilePath: any;
  fileExt: any;
  pieData: any;
  pieData1: any;
  pieData2: any;
  ContentSearchForm: FormGroup
  MonthForm: FormGroup;
  pieData3: any;
  chartOptions: any;
  basicData: any;
  BatchDispatch: any;
  LANDispatch: any;
  BatchInward: any;
  LANInward: any;
  BatchHealth: any;
  LANHealth: any;
  BatchExpection: number = 25;
  LANExpection: any;
  SubFolderCnt: any;
  JPGFIles: any;
  LoginLastWeek: any;
  LoginTillDate: any;
  BEYOUNDTAT: any;
  TATIN: any;
  OCRFilesInProcess: any;
  OCRFilesConverted: any;
  PageCount: any;
  FileNotReceived: any;
  Reject: any;
  Searched: any;
  Month: any;
  Viewed: any;
  currentDate: Date = new Date();
  _FilteredList: any;
  _IndexPendingList: any;
  FileAckPending: any;
  FileAckDone: any;
  CourierAckPending: any;
  CourierAckDone: any;
  monthyear: any;
  selectedMonth = new Date();
  periodOptions = [
    { label: 'All', value: '0' },
    { label: 'Current Month', value: '1' },
    { label: 'Past Month', value: '2' },
    { label: 'Past 3 Months', value: '3' }
  ];
  dateselection = true;
  selectedPeriod: string = '0';
  selectedPeriodRetrieval: string = '0';
  fromdate: string;
  todate: string;
  fromdateret: string;
  todateret: string;
  PODACk: any;
  NotYetDisptach: any;
  PODInstratt: any;
  DumpACk: any;
  DumpNotYetDisptach: any;
  DumpInstratt: any;
  Extra: any;
  Missing: number = 9;
  InComplete: any;
  Complete: any;
  first = 0;
  rows = 10;
  _HeaderList: any;
  MakerUploaded: any;
  first1: any = 0;
  rows1: any = 0;
  basicOptions: any;
  modelRef: BsModalRef;
  tableH: any;
  formBuilder: any;
  maxDate: Date;
  chartData: any[] = [];
  departmentchartData: any[] = [];
  warehousechartData: any[] = [];

  @ViewChild('InwardFormPopup') InwardFormPopup: any;

  constructor(
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {
    this.basicData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",],
      datasets: [
        {
          label: "Pickup Request",
          backgroundColor: "#FF5733", // Bright Orange-Red
          borderColor: "#FF4500", // Orange Red
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Courier Ack",
          backgroundColor: "#33FF57", // Bright Green
          borderColor: "#228B22", // Forest Green
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "File Ack",
          backgroundColor: "#3357FF", // Bright Blue
          borderColor: "#0000CD", // Medium Blue
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Scrutiny",
          backgroundColor: "#FF33FF", // Bright Magenta
          borderColor: "#8A2BE2", // Blue Violet
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Branch Exception",
          backgroundColor: "#FFD700", // Gold
          borderColor: "#FFA500", // Orange
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Storage",
          backgroundColor: "#8A2BE2", // Blue Violet
          borderColor: "#4B0082", // Indigo
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Storage Ack",
          backgroundColor: "#FF4500", // Orange Red
          borderColor: "#FF6347", // Tomato
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Outward",
          backgroundColor: "#00CED1", // Dark Turquoise
          borderColor: "#4682B4", // Steel Blue
          data: [65, 59, 80, 81, 56, 55, 40],
        },
      ],
    };

    this.basicOptions = {
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Months",
          },
        },
        y: {
          title: {
            display: true,
            text: "Value",
          },
          min: 0,
          max: 100,
        },
      },
    };

    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem: any) {
              return tooltipItem.label + ": " + tooltipItem.raw;
            },
          },
        },
      },
    };
  }

  data1: any;
  BatchID: any;
  PickupIN_TAT: any;
  PickupOUT_TAT: any;
  CartonNo: any;
  data3: any;
  Rejected: any;
  HR: any;
  IT: any;
  data4: any;
  Approved: any;
  data5: any;
  Pending: any;
  data6: any;
  Carton_Received: any;
  Carton_Not_Received: any;
  Carton_Pending: any;
  data7: any;
  data8: any;
  data9: any;
  Carton_sent_to_storage: any;
  Carton_not_sent_to_storage: any;
  data10: any;
  Retrieval_Request: any;
  Retrieval_Request_Carton: any;
  data11: any;
  data12: any;
  data13: any;
  data14: any;
  data15: any;
  data16: any;
  data17: any;
  OutFiles: any;
  InFiles: any;
  PermOutFiles: any;
  DestroyedFiles: any;
  RetrievalRequestFiles: any;
  SchedulePending: any;
  Request_Approved_Cartons: any;
  Request_Rejected_Cartons: any;
  Request_Pending_Cartons: any;
  Request_Dispatched_Cartons: any;
  Request_Dispatched_Cartons_Pending: any;
  Request_Ack: any;
  Request_Ack_Rejected: any;
  Request_Ack_Pending: any;
  lan_inv_done_disbdate: any;
  lan_inv_pending_disbdate: any;
  Return_Carton_Pending: any;
  ReturnPending: any;
  Return_Carton_Not_Received: any;
  Return_Carton_not_sent_to_storage: any;
  ReturnRejected: any;
  Return_Carton_sent_to_storage: any;
  Return_Carton_Received: any;
  ReturnApproved: any;
  ReturnBatch: any;
  ReturnCartonNo: any;

  ngOnInit() {
    const userID = localStorage.getItem('UserID');
    if (!userID) {
      console.error('UserID not found in localStorage');
      return;
    }

    const timeperiod = Number(this.selectedPeriod);
    const timeperiodRetrieval = Number(this.selectedPeriodRetrieval);
    this.ContentSearchForm = this.fb.group({
      SearchBy: ["0", Validators.required],
      File_No: ['', Validators.required],
      fromdate: ["", Validators.required],
      todate: ['', Validators.required],
      fromdateretrieval: ["", Validators.required],
      todateretrieval: ['', Validators.required],
      id: localStorage.getItem('UserID'),
    });

    const currentDate = new Date();
    const formattedDate = `${('0' + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()}`;

    this.MonthForm = this.fb.group({
      fromMonth: [formattedDate]
    });

    this.maxDate = new Date();

    this.ContentSearchForm.get('fromdate')?.valueChanges.subscribe((fromDate) => {
      const toDateControl = this.ContentSearchForm.get('todate');
      if (fromDate) {
        toDateControl?.setValidators([
          Validators.required,
          (control) => {
            const toDate = control.value;
            return toDate && new Date(toDate) >= new Date(fromDate)
              ? null
              : { invalidToDate: true };
          },
        ]);
        toDateControl?.updateValueAndValidity();
      }
    });

    this.ContentSearchForm.get('fromdateretrieval')?.valueChanges.subscribe((fromDate) => {
      const toDateControl = this.ContentSearchForm.get('todateretrieval');
      if (fromDate) {
        toDateControl?.setValidators([
          Validators.required,
          (control) => {
            const toDate = control.value;
            return toDate && new Date(toDate) >= new Date(fromDate)
              ? null
              : { invalidToDate: true };
          },
        ]);
        toDateControl?.updateValueAndValidity(); // Ensure changes are reflected
      }
    });

    this.monthyear = "";
    this.StatusList(Number(userID), timeperiod, "", "", formattedDate);
    this.StatusList1(Number(userID), timeperiod, "", "", formattedDate);
    this.StatusList2(Number(userID), timeperiod, "", "", formattedDate);
    this.In_Out_Chart(Number(userID), timeperiod, "", "", formattedDate);
    this.Department_Chart(Number(userID), timeperiod, "", "", formattedDate);
    this.WareHouse_Chart(Number(userID), timeperiod, "", "", formattedDate);
    this.StatusListRetrieval(Number(userID), timeperiodRetrieval, "", "");
  }

  searchData() {
    debugger;
    this.fromdate = this.ContentSearchForm.get('fromdate')?.value;
    this.todate = this.ContentSearchForm.get('todate')?.value;
    this.timeperiod1 = 4;
    this.Month = "All"
    this.selectedPeriod = "0";
    this.ContentSearchForm.patchValue({
      timeperiod: "All"
    });

    if (this.fromdate && new Date(this.fromdate) > this.currentDate) {
      alert('From Date cannot exceed the current date. Please select a valid From Date.');
      return;
    }

    if (this.fromdate && this.todate && new Date(this.todate) < new Date(this.fromdate)) {
      alert('To Date cannot be earlier than From Date. Please select a valid date range.');
      return;
    }

    const userID = localStorage.getItem('UserID')
    this.StatusList(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
    this.StatusList1(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
    this.StatusList2(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
    this.In_Out_Chart(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
    this.Department_Chart(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
    this.WareHouse_Chart(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);

  }

  searchDataRetrieval() {
    debugger;
    this.fromdateret = this.ContentSearchForm.get('fromdateretrieval')?.value;
    this.todateret = this.ContentSearchForm.get('todateretrieval')?.value;
    this.timeperiodretrieval = 4;
    this.Month = "All"
    this.selectedPeriod = "0";
    this.ContentSearchForm.patchValue({
      timeperiod: "All"
    });

    if (this.fromdateret && new Date(this.fromdateret) > this.currentDate) {
      alert('From Date cannot exceed the current date. Please select a valid From Date.');
      return;
    }

    if (this.fromdateret && this.todateret && new Date(this.todateret) < new Date(this.fromdateret)) {
      alert('To Date cannot be earlier than From Date. Please select a valid date range.');
      return;
    }

    const userID = localStorage.getItem('UserID')
    this.StatusListRetrieval(Number(userID), this.timeperiodretrieval, this.fromdateret, this.todateret);
  }

  refreshPage() {
    setTimeout(() => {
      window.location.reload();
    }, 0);
  }

  timeperiod1: number = 0;
  FilterData(ID: string) {
    debugger;
    if (ID === '0') {
      this.dateselection = true;
    }
    else {
      this.dateselection = false;
    }
    this.ContentSearchForm.patchValue({
      fromdate: '',
      todate: ''
    });
    const selectedOption = this.periodOptions.find(option => option.value === ID);
    this.Month = selectedOption ? selectedOption.label : "Today";
    const timeperiod = Number(ID);
    this.timeperiod1 = timeperiod;
    this.StatusList(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
    this.StatusList1(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
    this.StatusList2(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
    this.In_Out_Chart(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
    this.Department_Chart(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
    this.WareHouse_Chart(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
  }

  MonthYearFilter() {
    this.monthyear = this.MonthForm.controls['fromMonth'].value;

    if (this.timeperiod1 === 0 || this.timeperiod1 === 4) {
      this.fromdate = this.ContentSearchForm.get('fromdate')?.value;
      this.todate = this.ContentSearchForm.get('todate')?.value;
      this.timeperiod1 = 4;
      this.Month = "All"
      this.selectedPeriod = "0";
      this.ContentSearchForm.patchValue({
        timeperiod: "All"
      });

      const userID = localStorage.getItem('UserID')
      this.StatusList(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
      this.StatusList1(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
      this.StatusList2(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
      this.In_Out_Chart(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
      this.Department_Chart(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
      this.WareHouse_Chart(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
    }
    else {
      this.StatusList(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
      this.StatusList1(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
      this.StatusList2(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
      this.In_Out_Chart(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
      this.Department_Chart(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
      this.WareHouse_Chart(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
    }
  }

  timeperiodretrieval: number = 0;
  FilterDataRetrieval(ID: string) {
    if (ID === '0') {
      this.dateselection = true;
    }
    else {
      this.dateselection = false;
    }
    this.ContentSearchForm.patchValue({
      fromdateretrieval: '',
      todateretrieval: ''
    });
    const selectedOption = this.periodOptions.find(option => option.value === ID);
    this.Month = selectedOption ? selectedOption.label : "Today";
    const timeperiod = Number(ID);
    this.timeperiodretrieval = timeperiod;
    this.StatusListRetrieval(Number(localStorage.getItem('UserID')), this.timeperiodretrieval, "", "");
  }

  StatusList(id: any, timeperiod: number, fromdate: any, todate: any, monthyear: any) {
    const formattedFromDate = fromdate && moment(fromdate).isValid() ? moment(fromdate).format('YYYY-MM-DD') : null;
    const formattedToDate = todate && moment(todate).isValid() ? moment(todate).format('YYYY-MM-DD') : null;

    const apiUrl = this._global.baseAPIUrl + "AvansePickupRequest/DashboardCount?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + "&timeperiod=" + timeperiod + "&fromDate=" + formattedFromDate + "&toDate=" + formattedToDate;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.BatchID = data.filter(
        (item) => item.activity === "BatchID").length > 0 ? data.filter(
          (item) => item.activity === "BatchID")[0].Counts : 0;

      this.PickupIN_TAT = data.filter(
        (item) => item.activity === "PickupIN_TAT").length > 0 ? data.filter(
          (item) => item.activity === "PickupIN_TAT")[0].Counts : 0;

      this.Rejected = data.filter(
        (item) => item.activity === "Rejected").length > 0 ? data.filter(
          (item) => item.activity === "Rejected")[0].Counts : 0;

      this.CartonNo = data.filter(
        (item) => item.activity === "CartonNo").length > 0 ? data.filter(
          (item) => item.activity === "CartonNo")[0].Counts : 0;

      this.SchedulePending = data.filter(
        (item) => item.activity === "SchedulePending").length > 0 ? data.filter(
          (item) => item.activity === "SchedulePending")[0].Counts : 0;

      this.Approved = data.filter(
        (item) => item.activity === "Approved").length > 0 ? data.filter(
          (item) => item.activity === "Approved")[0].Counts : 0;

      this.Rejected = data.filter(
        (item) => item.activity === "Rejected").length > 0 ? data.filter(
          (item) => item.activity === "Rejected")[0].Counts : 0;

      this.Pending = data.filter(
        (item) => item.activity === "Pending").length > 0 ? data.filter(
          (item) => item.activity === "Pending")[0].Counts : 0;

      this.Carton_Received = data.filter(
        (item) => item.activity === "Carton_Received").length > 0 ? data.filter(
          (item) => item.activity === "Carton_Received")[0].Counts : 0;


      this.Carton_Not_Received = data.filter(
        (item) => item.activity === "Carton_Not_Received").length > 0 ? data.filter(
          (item) => item.activity === "Carton_Not_Received")[0].Counts : 0;


      this.Carton_Pending = data.filter(
        (item) => item.activity === "Carton_Pending").length > 0 ? data.filter(
          (item) => item.activity === "Carton_Pending")[0].Counts : 0;

      this.Carton_sent_to_storage = data.filter(
        (item) => item.activity === "Carton_sent_to_storage").length > 0 ? data.filter(
          (item) => item.activity === "Carton_sent_to_storage")[0].Counts : 0;

      this.Carton_not_sent_to_storage = data.filter(
        (item) => item.activity === "Carton_not_sent_to_storage").length > 0 ? data.filter(
          (item) => item.activity === "Carton_not_sent_to_storage")[0].Counts : 0;

      this.OutFiles = data.filter(
        (item) => item.activity === "OutFiles").length > 0 ? data.filter(
          (item) => item.activity === "OutFiles")[0].Counts : 0;

      this.InFiles = data.filter(
        (item) => item.activity === "InFiles").length > 0 ? data.filter(
          (item) => item.activity === "InFiles")[0].Counts : 0;

      this.PermOutFiles = data.filter(
        (item) => item.activity === "PermOutFiles").length > 0 ? data.filter(
          (item) => item.activity === "PermOutFiles")[0].Counts : 0;

      this.DestroyedFiles = data.filter(
        (item) => item.activity === "DestroyedFiles").length > 0 ? data.filter(
          (item) => item.activity === "DestroyedFiles")[0].Counts : 0;

      this.RetrievalRequestFiles = data.filter(
        (item) => item.activity === "RetrievalRequestFiles").length > 0 ? data.filter(
          (item) => item.activity === "RetrievalRequestFiles")[0].Counts : 0;

      this.lan_inv_done_disbdate = data.filter(
        (item) => item.activity === "lan_inv_done_disbdate").length > 0 ? data.filter(
          (item) => item.activity === "lan_inv_done_disbdate")[0].Counts : 0;

      this.lan_inv_pending_disbdate = data.filter(
        (item) => item.activity === "lan_inv_pending_disbdate").length > 0 ? data.filter(
          (item) => item.activity === "lan_inv_pending_disbdate")[0].Counts : 0;

      this.loadChartsData()
    });
  }



  StatusList1(id: any, timeperiod: number, fromdate: any, todate: any, monthyear: any) {
    const formattedFromDate = fromdate && moment(fromdate).isValid() ? moment(fromdate).format('YYYY-MM-DD') : null;
    const formattedToDate = todate && moment(todate).isValid() ? moment(todate).format('YYYY-MM-DD') : null;

    const apiUrl = this._global.baseAPIUrl + "AvansePickupRequest/RetrivalCount?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + "&timeperiod=" + timeperiod + "&fromDate=" + formattedFromDate + "&toDate=" + formattedToDate;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {

      this.Retrieval_Request = data.filter(
        (item) => item.activity === "Retrieval_Request").length > 0 ? data.filter(
          (item) => item.activity === "Retrieval_Request")[0].Counts : 0;

      this.Retrieval_Request_Carton = data.filter(
        (item) => item.activity === "Retrieval_Request_Carton").length > 0 ? data.filter(
          (item) => item.activity === "Retrieval_Request_Carton")[0].Counts : 0;

      this.Request_Approved_Cartons = data.filter(
        (item) => item.activity === "Request_Approved_Cartons").length > 0 ? data.filter(
          (item) => item.activity === "Request_Approved_Cartons")[0].Counts : 0;

      this.Request_Rejected_Cartons = data.filter(
        (item) => item.activity === "Request_Rejected_Cartons").length > 0 ? data.filter(
          (item) => item.activity === "Request_Rejected_Cartons")[0].Counts : 0;

      this.Request_Pending_Cartons = data.filter(
        (item) => item.activity === "Request_Pending_Cartons").length > 0 ? data.filter(
          (item) => item.activity === "Request_Pending_Cartons")[0].Counts : 0;

      this.Request_Dispatched_Cartons = data.filter(
        (item) => item.activity === "Request_Dispatched_Cartons").length > 0 ? data.filter(
          (item) => item.activity === "Request_Dispatched_Cartons")[0].Counts : 0;

      this.Request_Dispatched_Cartons_Pending = data.filter(
        (item) => item.activity === "Request_Dispatched_Cartons_Pending").length > 0 ? data.filter(
          (item) => item.activity === "Request_Dispatched_Cartons_Pending")[0].Counts : 0;

      this.Request_Ack = data.filter(
        (item) => item.activity === "Request_Ack").length > 0 ? data.filter(
          (item) => item.activity === "Request_Ack")[0].Counts : 0;

      this.Request_Ack_Rejected = data.filter(
        (item) => item.activity === "Request_Ack_Rejected").length > 0 ? data.filter(
          (item) => item.activity === "Request_Ack_Rejected")[0].Counts : 0;

      this.Request_Ack_Pending = data.filter(
        (item) => item.activity === "Request_Ack_Pending").length > 0 ? data.filter(
          (item) => item.activity === "Request_Ack_Pending")[0].Counts : 0;


      this.Carton_Not_Received = data.filter(
        (item) => item.activity === "Carton_Not_Received").length > 0 ? data.filter(
          (item) => item.activity === "Carton_Not_Received")[0].Counts : 0;


      this.Carton_Pending = data.filter(
        (item) => item.activity === "Carton_Pending").length > 0 ? data.filter(
          (item) => item.activity === "Carton_Pending")[0].Counts : 0;

      this.Carton_sent_to_storage = data.filter(
        (item) => item.activity === "Carton_sent_to_storage").length > 0 ? data.filter(
          (item) => item.activity === "Carton_sent_to_storage")[0].Counts : 0;

      this.Carton_not_sent_to_storage = data.filter(
        (item) => item.activity === "Carton_not_sent_to_storage").length > 0 ? data.filter(
          (item) => item.activity === "Carton_not_sent_to_storage")[0].Counts : 0;

      this.OutFiles = data.filter(
        (item) => item.activity === "OutFiles").length > 0 ? data.filter(
          (item) => item.activity === "OutFiles")[0].Counts : 0;

      this.InFiles = data.filter(
        (item) => item.activity === "InFiles").length > 0 ? data.filter(
          (item) => item.activity === "InFiles")[0].Counts : 0;

      this.PermOutFiles = data.filter(
        (item) => item.activity === "PermOutFiles").length > 0 ? data.filter(
          (item) => item.activity === "PermOutFiles")[0].Counts : 0;

      this.DestroyedFiles = data.filter(
        (item) => item.activity === "DestroyedFiles").length > 0 ? data.filter(
          (item) => item.activity === "DestroyedFiles")[0].Counts : 0;

      this.RetrievalRequestFiles = data.filter(
        (item) => item.activity === "RetrievalRequestFiles").length > 0 ? data.filter(
          (item) => item.activity === "RetrievalRequestFiles")[0].Counts : 0;


      this.loadChartsData()
    });
  }


  StatusList2(id: any, timeperiod: number, fromdate: any, todate: any, monthyear: any) {
    const formattedFromDate = fromdate && moment(fromdate).isValid() ? moment(fromdate).format('YYYY-MM-DD') : null;
    const formattedToDate = todate && moment(todate).isValid() ? moment(todate).format('YYYY-MM-DD') : null;

    const apiUrl = this._global.baseAPIUrl + "AvansePickupRequest/RefilingCount?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + "&timeperiod=" + timeperiod + "&fromDate=" + formattedFromDate + "&toDate=" + formattedToDate;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {

      this.Return_Carton_Pending = data.filter(
        (item) => item.activity === "Return_Carton_Pending").length > 0 ? data.filter(
          (item) => item.activity === "Return_Carton_Pending")[0].Counts : 0;

      this.ReturnPending = data.filter(
        (item) => item.activity === "ReturnPending").length > 0 ? data.filter(
          (item) => item.activity === "ReturnPending")[0].Counts : 0;

      this.Return_Carton_Not_Received = data.filter(
        (item) => item.activity === "Return_Carton_Not_Received").length > 0 ? data.filter(
          (item) => item.activity === "Return_Carton_Not_Received")[0].Counts : 0;

      this.Return_Carton_not_sent_to_storage = data.filter(
        (item) => item.activity === "Return_Carton_not_sent_to_storage").length > 0 ? data.filter(
          (item) => item.activity === "Return_Carton_not_sent_to_storage")[0].Counts : 0;

      this.ReturnRejected = data.filter(
        (item) => item.activity === "ReturnRejected").length > 0 ? data.filter(
          (item) => item.activity === "ReturnRejected")[0].Counts : 0;

      this.Return_Carton_sent_to_storage = data.filter(
        (item) => item.activity === "Return_Carton_sent_to_storage").length > 0 ? data.filter(
          (item) => item.activity === "Return_Carton_sent_to_storage")[0].Counts : 0;

      this.Return_Carton_Received = data.filter(
        (item) => item.activity === "Return_Carton_Received").length > 0 ? data.filter(
          (item) => item.activity === "Return_Carton_Received")[0].Counts : 0;

      this.ReturnApproved = data.filter(
        (item) => item.activity === "ReturnApproved").length > 0 ? data.filter(
          (item) => item.activity === "ReturnApproved")[0].Counts : 0;

      this.ReturnBatch = data.filter(
        (item) => item.activity === "ReturnBatch").length > 0 ? data.filter(
          (item) => item.activity === "ReturnBatch")[0].Counts : 0;

      this.ReturnCartonNo = data.filter(
        (item) => item.activity === "ReturnCartonNo").length > 0 ? data.filter(
          (item) => item.activity === "ReturnCartonNo")[0].Counts : 0;


      this.loadChartsData()
    });
  }

  //----------------------------------------------------IN/OUT CHART API---------------------------------------
  In_Out_Chart(id: any, timeperiod: number, fromdate: any, todate: any, monthyear: any) {
    const formattedFromDate = fromdate && moment(fromdate).isValid() ? moment(fromdate).format('YYYY-MM-DD') : null;
    const formattedToDate = todate && moment(todate).isValid() ? moment(todate).format('YYYY-MM-DD') : null;

    const apiUrl = this._global.baseAPIUrl +
      "AvansePickupRequest/ChartCount?USERId=" + localStorage.getItem("UserID") +
      "&user_Token=" + localStorage.getItem("User_Token") +
      "&timeperiod=" + timeperiod +
      "&fromDate=" + formattedFromDate +
      "&toDate=" + formattedToDate + '&status=1';

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
      // Reset and prepare dynamic chart data
      this.chartData = [];


      data.forEach(dept => {
        this.chartData.push({
          department: dept.DepartmentName,
          inCount: dept.InCount,
          outCount: dept.OutCount
        });
      });

      // Now load the chart with this.chartData
      this.loadChartsData();
    });
  }

  //------------------------------------------------DEPARTMENT CHART ----------------------------------------------------------------------------------
  Department_Chart(id: any, timeperiod: number, fromdate: any, todate: any, monthyear: any) {
    const formattedFromDate = fromdate && moment(fromdate).isValid() ? moment(fromdate).format('YYYY-MM-DD') : null;
    const formattedToDate = todate && moment(todate).isValid() ? moment(todate).format('YYYY-MM-DD') : null;

    const apiUrl = this._global.baseAPIUrl +
      "AvansePickupRequest/ChartCount?USERId=" + localStorage.getItem("UserID") +
      "&user_Token=" + localStorage.getItem("User_Token") +
      "&timeperiod=" + timeperiod +
      "&fromDate=" + formattedFromDate +
      "&toDate=" + formattedToDate + '&status=2';

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
      // Reset and prepare dynamic chart data
      this.departmentchartData = [];


      data.forEach(dept => {
        this.departmentchartData.push({
          DepartmentName: dept.DepartmentName,
          CartonCount: dept.CartonCount
        });
      });

      // Now load the chart with this.chartData
      this.loadChartsData();
    });
  }
  //------------------------------------------------WAREHOUSE CHART ----------------------------------------------------------------------------------
  WareHouse_Chart(id: any, timeperiod: number, fromdate: any, todate: any, monthyear: any) {
    const formattedFromDate = fromdate && moment(fromdate).isValid() ? moment(fromdate).format('YYYY-MM-DD') : null;
    const formattedToDate = todate && moment(todate).isValid() ? moment(todate).format('YYYY-MM-DD') : null;

    const apiUrl = this._global.baseAPIUrl +
      "AvansePickupRequest/ChartCount?USERId=" + localStorage.getItem("UserID") +
      "&user_Token=" + localStorage.getItem("User_Token") +
      "&timeperiod=" + timeperiod +
      "&fromDate=" + formattedFromDate +
      "&toDate=" + formattedToDate + '&status=3';

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
      // Reset and prepare dynamic chart data
      this.warehousechartData = [];


      data.forEach(dept => {
        this.warehousechartData.push({
          WarehouseName: dept.WarehouseName,
          CartonCountForWarehouse: dept.CartonCountForWarehouse
        });
      });

      // Now load the chart with this.chartData
      this.loadChartsData();
    });
  }



  OpenData(status: number, template: any, tableH: any) {
    let timeperiod = this.timeperiod1;
    let formattedFromDate = '';
    let formattedToDate = '';
    const formattedMonthYear = this.monthyear ? moment(this.monthyear, 'MM/YYYY').isValid() ? moment(this.monthyear, 'MM/YYYY').format('MM/YYYY') : '' : '';

    if (timeperiod === 4) {
      formattedFromDate = this.fromdate ? moment(this.fromdate).format('YYYY-MM-DD') : '';
      formattedToDate = this.todate ? moment(this.todate).format('YYYY-MM-DD') : '';
    }
    else {
      formattedFromDate = '';
      formattedToDate = '';
    }

    let apiUrl = this._global.baseAPIUrl + "AvansePickupRequest/Dashboard?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + "&timeperiod=" + timeperiod + "&fromDate=" + formattedFromDate + "&toDate=" + formattedToDate + "&monthyear=" + formattedMonthYear;
    if (status >= 1 && status <= 30) {
      apiUrl += "&status=" + status;
    }

    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {
      this.prepareTableData1(data, data, status);
      this.tableH = tableH;
      this.modelRef = this.modalService.show(template);
    });
  }



  StatusListRetrieval(id: any, timeperiod: number, fromdate: any, todate: any) {
    
    const formattedFromDate = fromdate ? moment(fromdate).format('YYYY-MM-DD') : '';
    const formattedToDate = todate ? moment(todate).format('YYYY-MM-DD') : '';

    const apiUrl = this._global.baseAPIUrl + "Retrival/RetrievalDashboard?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + '&status=' + 7 + "&timeperiod=" + timeperiod + "&fromDate=" + formattedFromDate + "&toDate=" + formattedToDate;
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {

      this.data10 = data.filter(
        (item) => item.activity === "RetrievalRequest").length > 0 ? data.filter(
          (item) => item.activity === "RetrievalRequest")[0].Counts : 0;

      this.data11 = data.filter(
        (item) => item.activity === "RetrievalDispatched").length > 0 ? data.filter(
          (item) => item.activity === "RetrievalDispatched")[0].Counts : 0;

      // this.data12 = data.filter(
      //   (item) => item.activity === "Approved").length > 0 ? data.filter(
      //     (item) => item.activity === "Approved")[0].Counts : 0;

      this.data13 = data.filter(
        (item) => item.activity === "Rejected").length > 0 ? data.filter(
          (item) => item.activity === "Rejected")[0].Counts : 0;

      this.data15 = data.filter(
        (item) => item.activity === "RefillingRequest").length > 0 ? data.filter(
          (item) => item.activity === "RefillingRequest")[0].Counts : 0;

      this.data16 = data.filter(
        (item) => item.activity === "RefillingAck").length > 0 ? data.filter(
          (item) => item.activity === "RefillingAck")[0].Counts : 0;

      this.loadChartsData()
    });
  }

  callFuntion(status: number, template: any) {
    
    let timeperiod = this.timeperiodretrieval;
    let formattedFromDate = '';
    let formattedToDate = '';

    if (timeperiod === 4) {
      formattedFromDate = this.fromdateret ? moment(this.fromdateret).format('YYYY-MM-DD') : '';
      formattedToDate = this.todateret ? moment(this.todateret).format('YYYY-MM-DD') : '';
    }
    else {
      formattedFromDate = '';
      formattedToDate = '';
    }

    let apiUrl = this._global.baseAPIUrl + "Retrival/RetrievalDashboard?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + "&timeperiod=" + timeperiod + "&fromDate=" + formattedFromDate + "&toDate=" + formattedToDate;
    if (status >= 1 && status <= 6) {
      apiUrl += "&status=" + status;
    }

    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {

      if (status == 1) {
        this.prepareTableData1(data, data, 20);
        this.modelRef = this.modalService.show(template);
      }
      if (status == 2) {
        this.prepareTableData1(data, data, 11);
        this.modelRef = this.modalService.show(template);
      }
      if (status == 3) {
        this.prepareTableData1(data, data, 12);
        this.modelRef = this.modalService.show(template);
      }
      if (status == 4) {
        this.prepareTableData1(data, data, 13);
        this.modelRef = this.modalService.show(template);
      }
      if (status == 5) {
        this.prepareTableData1(data, data, 15);
        this.modelRef = this.modalService.show(template);
      }
      if (status == 6) {
        this.prepareTableData1(data, data, 16);
        this.modelRef = this.modalService.show(template);
      }
    });
  }

  private formatDate(originalDateString: any) {
    const date = new Date(originalDateString);
    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private padZero(value: number): string {
    return value < 18 ? `0${value}` : `${value}`;
  }

  headerList1: any;
  prepareTableData1(tableData, headerList, status) {
    if (status == 1) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'BATCH ID', index: 3 },
        { field: 'CartonNo', header: 'NO OF CARTON', index: 3 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'createdBy', header: 'CREATED BY', index: 3 },
        { field: 'createdDate', header: 'CREATED ON', index: 7 },
        { field: 'filestatus', header: 'BATCH STATUS', index: 2 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'batchId': el.batchId,
          'CartonNo': el.CartonNo,
          'createdBy': el.createdBy,
          // 'approvedBy': el.approvedBy,
          // 'warehouseEntryBy': el.warehouseEntryBy,
          // 'warehouseApprovedBy': el.warehouseApprovedBy,
          // 'rejectedBy': el.rejectedBy,
          'createdDate': el.createdDate,
          // 'approvedDate': el.approvedDate,
          // 'rejectedDate': el.rejectedDate,
          // 'warehouseEntryDate': el.warehouseEntryDate,
          // 'warehouseApprovedDate': el.warehouseApprovedDate,
          // 'pickupDate': el.pickupDate,
          // 'warehouseLocationUpdatedDate': el.warehouseLocationUpdatedDate,
           'filestatus': el.filestatus,
          // 'remark': el.remark,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 2) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'BATCH ID', index: 3 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'createdBy', header: 'INVENTORY BY', index: 3 },
        { field: 'createdDate', header: 'INVENTORY ON', index: 7 },
        { field: 'filestatus', header: 'CARTON STATUS', index: 2 },
        { field: 'remark', header: 'REMARK', index: 2 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'DepartmentName': el.DepartmentName,
          'batchId': el.batchId,
          'createdBy': el.createdBy,
          'approvedBy': el.approvedBy,
          'warehouseEntryBy': el.warehouseEntryBy,
          'warehouseApprovedBy': el.warehouseApprovedBy,
          'rejectedBy': el.rejectedBy,
          'createdDate': el.createdDate,
          'approvedDate': el.approvedDate,
          'rejectedDate': el.rejectedDate,
          'warehouseEntryDate': el.warehouseEntryDate,
          'warehouseApprovedDate': el.warehouseApprovedDate,
          'pickupDate': el.pickupDate,
          'warehouseLocationUpdatedDate': el.warehouseLocationUpdatedDate,
          'filestatus': el.filestatus,
          'remark': el.remark,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 3) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'BATCH ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'INVENTORY BY', index: 3 },
        { field: 'CreatedDate', header: 'INVENTORY ON', index: 3 },
        { field: 'approvedBy', header: 'APPROVED BY', index: 7 },
        { field: 'approvedDate', header: 'APPROVED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'DepartmentName': el.DepartmentName,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'approvedDate': el.approvedDate,
          'approvedBy': el.approvedBy,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 4) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'BATCH ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'INVENTORY BY', index: 3 },
        { field: 'CreatedDate', header: 'INVENTORY ON', index: 3 },
        { field: 'rejectedBy', header: 'REJECTED BY', index: 7 },
        { field: 'rejectedDate', header: 'REJECTED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'DepartmentName': el.DepartmentName,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'rejectedDate': el.rejectedDate,
          'rejectedBy': el.rejectedBy,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }
    if (status == 5) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'BATCH ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'INVENTORY BY', index: 3 },
        { field: 'CreatedDate', header: 'INVENTORY ON', index: 3 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'BATCH STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'DepartmentName': el.DepartmentName,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'BatchStatus': el.BatchStatus,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 6 || status == 10) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'BATCH ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'INVENTORY BY', index: 3 },
        { field: 'CreatedDate', header: 'INVENTORY ON', index: 3 },
        { field: 'approvedBy', header: 'APPROVED BY', index: 7 },
        { field: 'approvedDate', header: 'APPROVED ON', index: 7 },
        { field: 'InventoryAckBy', header: 'INV ACKNOWLEDGE BY', index: 7 },
        { field: 'InventoryAckDate', header: 'INV ACKNOWLEDGE ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'BATCH STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'DepartmentName': el.DepartmentName,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'approvedDate': el.approvedDate,
          'approvedBy': el.approvedBy,
          'InventoryAckBy': el.InventoryAckBy,
          'InventoryAckDate': el.InventoryAckDate,
          'BatchStatus': el.BatchStatus,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 7) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'BATCH ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'INVENTORY BY', index: 3 },
        { field: 'CreatedDate', header: 'INVENTORY ON', index: 3 },
        { field: 'approvedBy', header: 'APPROVED BY', index: 7 },
        { field: 'approvedDate', header: 'APPROVED ON', index: 7 },
        { field: 'rejectedBy', header: 'INV REJECTED BY', index: 7 },
        { field: 'rejectedDate', header: 'INV REJECTED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'BATCH STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'DepartmentName': el.DepartmentName,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'approvedDate': el.approvedDate,
          'approvedBy': el.approvedBy,
          'rejectedBy': el.rejectedBy,
          'rejectedDate': el.rejectedDate,
          'BatchStatus': el.BatchStatus,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 8) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'BATCH ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'INVENTORY BY', index: 3 },
        { field: 'CreatedDate', header: 'INVENTORY ON', index: 3 },
        { field: 'approvedBy', header: 'APPROVED BY', index: 7 },
        { field: 'approvedDate', header: 'APPROVED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'BATCH STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'DepartmentName': el.DepartmentName,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'approvedDate': el.approvedDate,
          'approvedBy': el.approvedBy,
          'BatchStatus': el.BatchStatus,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 9) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'BATCH ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'INVENTORY BY', index: 3 },
        { field: 'CreatedDate', header: 'INVENTORY ON', index: 3 },
        { field: 'approvedBy', header: 'APPROVED BY', index: 7 },
        { field: 'approvedDate', header: 'APPROVED ON', index: 7 },
        { field: 'InventoryAckBy', header: 'INV ACKNOWLEDGE BY', index: 7 },
        { field: 'InventoryAckDate', header: 'INV ACKNOWLEDGE ON', index: 7 },
        { field: 'warehouseLocationUpdatedBy', header: 'WAREHOUSE LOCATION UPDATED BY', index: 7 },
        { field: 'warehouseLocationUpdatedDate', header: 'WAREHOUSE LOCATION UPDATED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'BATCH STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'approvedDate': el.approvedDate,
          'approvedBy': el.approvedBy,
          'InventoryAckBy': el.InventoryAckBy,
          'InventoryAckDate': el.InventoryAckDate,
          'warehouseLocationUpdatedBy': el.warehouseLocationUpdatedBy,
          'warehouseLocationUpdatedDate': el.warehouseLocationUpdatedDate,
          'BatchStatus': el.BatchStatus,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 11) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'RequestID', header: 'REQUEST ID', index: 2 },
        { field: 'CartonNo', header: 'NO OF CARTONS', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'RetrievalBy', header: 'CREATED BY', index: 7 },
        { field: 'CreatedDate', header: 'CREATED ON', index: 7 },
        { field: 'BatchStatus', header: 'REQUEST STATUS', index: 3 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'RequestID': el.RequestID,
          'CartonNo': el.CartonNo,
          'BatchStatus': el.BatchStatus,
          'RequestStatus': el.RequestStatus,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'CreatedDate': el.CreatedDate,
          'RetrievalBy': el.RetrievalBy,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 20) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'RequestID', header: 'REQUEST ID', index: 2 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'RetrievalBy', header: 'REQUEST BY', index: 7 },
        { field: 'RetrievalDate', header: 'REQUEST ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 3 },
        { field: 'BatchStatus', header: 'REQUEST STATUS', index: 3 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'RequestID': el.RequestID,
          'CartonNo': el.CartonNo,
          'BatchStatus': el.BatchStatus,
          'CartonStatus': el.CartonStatus,
          'RetrievalDate': el.RetrievalDate,
          'RetrievalBy': el.RetrievalBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 12) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'RequestID', header: 'REQUEST ID', index: 2 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'RetrievalBy', header: 'REQUEST BY', index: 7 },
        { field: 'RetrievalDate', header: 'REQUEST ON', index: 7 },
        { field: 'ApprovalBy', header: 'APPROVED BY', index: 7 },
        { field: 'ApprovalDate', header: 'APPROVED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 3 },
        { field: 'BatchStatus', header: 'REQUEST STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'RequestID': el.RequestID,
          'CartonNo': el.CartonNo,
          'CartonStatus': el.CartonStatus,
          'RequestStatus': el.RequestStatus,
          'BatchStatus': el.BatchStatus,
          'RetrievalDate': el.RetrievalDate,
          'RetrievalBy': el.RetrievalBy,
          'ApprovalDate': el.ApprovalDate,
          'ApprovalBy': el.ApprovalBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }


    if (status == 13) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'RequestID', header: 'REQUEST ID', index: 2 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'RetrievalBy', header: 'REQUEST BY', index: 7 },
        { field: 'RetrievalDate', header: 'REQUEST ON', index: 7 },
        { field: 'RejectBy', header: 'REJECTED BY', index: 7 },
        { field: 'RejectDate', header: 'REJECTED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 3 },
        { field: 'BatchStatus', header: 'REQUEST STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'RequestID': el.RequestID,
          'CartonNo': el.CartonNo,
          'CartonStatus': el.CartonStatus,
          'RequestStatus': el.RequestStatus,
          'BatchStatus': el.BatchStatus,
          'RetrievalDate': el.RetrievalDate,
          'RetrievalBy': el.RetrievalBy,
          'RejectDate': el.RejectDate,
          'RejectBy': el.RejectBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }


    if (status == 14) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'RequestID', header: 'REQUEST ID', index: 2 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'RetrievalBy', header: 'REQUEST BY', index: 7 },
        { field: 'RetrievalDate', header: 'REQUEST ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 3 },
        { field: 'BatchStatus', header: 'REQUEST STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'RequestID': el.RequestID,
          'CartonNo': el.CartonNo,
          'CartonStatus': el.CartonStatus,
          'RequestStatus': el.RequestStatus,
          'BatchStatus': el.BatchStatus,
          'RetrievalDate': el.RetrievalDate,
          'RetrievalBy': el.RetrievalBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }


    if (status == 15 || status == 19) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'RequestID', header: 'REQUEST ID', index: 2 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'RetrievalBy', header: 'REQUEST BY', index: 7 },
        { field: 'RetrievalDate', header: 'REQUEST ON', index: 7 },
        { field: 'ApprovalBy', header: 'APPROVED BY', index: 7 },
        { field: 'ApprovalDate', header: 'APPROVED ON', index: 7 },
        { field: 'RetrievalDispatchBy', header: 'DISPATCH BY', index: 7 },
        { field: 'RetrievalDispatchDate', header: 'DISPATCH ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 3 },
        { field: 'BatchStatus', header: 'REQUEST STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'RequestID': el.RequestID,
          'CartonNo': el.CartonNo,
          'CartonStatus': el.CartonStatus,
          'RequestStatus': el.RequestStatus,
          'BatchStatus': el.BatchStatus,
          'RetrievalDate': el.RetrievalDate,
          'RetrievalBy': el.RetrievalBy,
          'ApprovalDate': el.ApprovalDate,
          'ApprovalBy': el.ApprovalBy,
          'RetrievalDispatchDate': el.RetrievalDispatchDate,
          'RetrievalDispatchBy': el.RetrievalDispatchBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }


    if (status == 16) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'RequestID', header: 'REQUEST ID', index: 2 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'RetrievalBy', header: 'REQUEST BY', index: 7 },
        { field: 'RetrievalDate', header: 'REQUEST ON', index: 7 },
        { field: 'ApprovalBy', header: 'APPROVED BY', index: 7 },
        { field: 'ApprovalDate', header: 'APPROVED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 3 },
        { field: 'BatchStatus', header: 'REQUEST STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'RequestID': el.RequestID,
          'CartonNo': el.CartonNo,
          'CartonStatus': el.CartonStatus,
          'RequestStatus': el.RequestStatus,
          'BatchStatus': el.BatchStatus,
          'RetrievalDate': el.RetrievalDate,
          'RetrievalBy': el.RetrievalBy,
          'ApprovalDate': el.ApprovalDate,
          'ApprovalBy': el.ApprovalBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 17) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'RequestID', header: 'REQUEST ID', index: 2 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'RetrievalBy', header: 'REQUEST BY', index: 7 },
        { field: 'RetrievalDate', header: 'REQUEST ON', index: 7 },
        { field: 'ApprovalBy', header: 'APPROVED BY', index: 7 },
        { field: 'ApprovalDate', header: 'APPROVED ON', index: 7 },
        { field: 'RetrievalDispatchBy', header: 'DISPATCH BY', index: 7 },
        { field: 'RetrievalDispatchDate', header: 'DISPATCH ON', index: 7 },
        { field: 'RetrievalAckBy', header: 'ACK APPROVED BY', index: 7 },
        { field: 'RetrievalAckDate', header: 'ACK APPROVED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 3 },
        { field: 'BatchStatus', header: 'REQUEST STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'RequestID': el.RequestID,
          'CartonNo': el.CartonNo,
          'CartonStatus': el.CartonStatus,
          'RequestStatus': el.RequestStatus,
          'BatchStatus': el.BatchStatus,
          'RetrievalDate': el.RetrievalDate,
          'RetrievalBy': el.RetrievalBy,
          'ApprovalDate': el.ApprovalDate,
          'ApprovalBy': el.ApprovalBy,
          'RetrievalDispatchDate': el.RetrievalDispatchDate,
          'RetrievalDispatchBy': el.RetrievalDispatchBy,
          'RetrievalAckDate': el.RetrievalAckDate,
          'RetrievalAckBy': el.RetrievalAckBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 18) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'RequestID', header: 'REQUEST ID', index: 2 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'RetrievalBy', header: 'REQUEST BY', index: 7 },
        { field: 'RetrievalDate', header: 'REQUEST ON', index: 7 },
        { field: 'ApprovalBy', header: 'APPROVED BY', index: 7 },
        { field: 'ApprovalDate', header: 'APPROVED ON', index: 7 },
        { field: 'RetrievalDispatchBy', header: 'DISPATCH BY', index: 7 },
        { field: 'RetrievalDispatchDate', header: 'DISPATCH ON', index: 7 },
        { field: 'RejectBy', header: 'ACK REJECTED BY', index: 7 },
        { field: 'RejectDate', header: 'ACK REJECTED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 3 },
        { field: 'BatchStatus', header: 'REQUEST STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'RequestID': el.RequestID,
          'CartonNo': el.CartonNo,
          'CartonStatus': el.CartonStatus,
          'RequestStatus': el.RequestStatus,
          'BatchStatus': el.BatchStatus,
          'RetrievalDate': el.RetrievalDate,
          'RetrievalBy': el.RetrievalBy,
          'ApprovalDate': el.ApprovalDate,
          'ApprovalBy': el.ApprovalBy,
          'RetrievalDispatchDate': el.RetrievalDispatchDate,
          'RetrievalDispatchBy': el.RetrievalDispatchBy,
          'RejectDate': el.RejectDate,
          'RejectBy': el.RejectBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 21) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'RequestID', header: 'RETURN REQUEST ID', index: 2 },
        { field: 'CartonNo', header: 'NO OF CARTONS', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'RetrievalBy', header: 'CREATED BY', index: 7 },
        { field: 'CreatedDate', header: 'CREATED ON', index: 7 },
        { field: 'BatchStatus', header: 'RETURN STATUS', index: 3 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'RequestID': el.RequestID,
          'CartonNo': el.CartonNo,
          'BatchStatus': el.BatchStatus,
          'RequestStatus': el.RequestStatus,
          'CreatedDate': el.CreatedDate,
          'RetrievalBy': el.RetrievalBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 22) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'RequestID', header: 'RETURN REQUEST ID', index: 2 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'RetrievalBy', header: 'RETURN REQUEST BY', index: 7 },
        { field: 'RetrievalDate', header: 'RETURN REQUEST ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 3 },
        { field: 'BatchStatus', header: 'RETURN STATUS', index: 3 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'RequestID': el.RequestID,
          'CartonNo': el.CartonNo,
          'BatchStatus': el.BatchStatus,
          'CartonStatus': el.CartonStatus,
          'RetrievalDate': el.RetrievalDate,
          'RetrievalBy': el.RetrievalBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 23) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'RETURN REQUEST ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'RETURN REQUEST BY', index: 3 },
        { field: 'CreatedDate', header: 'RETURN REQUEST ON', index: 3 },
        { field: 'approvedBy', header: 'APPROVED BY', index: 7 },
        { field: 'approvedDate', header: 'APPROVED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'RETURN STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'BatchStatus': el.BatchStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'approvedDate': el.approvedDate,
          'approvedBy': el.approvedBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 24) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'RETURN REQUEST ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'RETURN REQUEST BY', index: 3 },
        { field: 'CreatedDate', header: 'RETURN REQUEST ON', index: 3 },
        { field: 'rejectedBy', header: 'REJECTED BY', index: 7 },
        { field: 'RejectDate', header: 'REJECTED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'RETURN STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'RejectDate': el.RejectDate,
          'BatchStatus': el.BatchStatus,
          'rejectedBy': el.rejectedBy,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }
    if (status == 25) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'RETURN REQUEST ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'RETURN REQUEST BY', index: 3 },
        { field: 'CreatedDate', header: 'RETURN REQUEST ON', index: 3 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'RETURN STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'BatchStatus': el.BatchStatus,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 26 || status == 30) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'RETURN REQUEST ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'RETURN REQUEST BY', index: 3 },
        { field: 'CreatedDate', header: 'RETURN REQUEST ON', index: 3 },
        { field: 'approvedBy', header: 'APPROVED BY', index: 7 },
        { field: 'approvedDate', header: 'APPROVED ON', index: 7 },
        { field: 'InventoryAckBy', header: 'RETURN REQUEST ACK BY', index: 7 },
        { field: 'InventoryAckDate', header: 'RETURN REQUEST ACK ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'RETURN STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'approvedDate': el.approvedDate,
          'approvedBy': el.approvedBy,
          'InventoryAckBy': el.InventoryAckBy,
          'InventoryAckDate': el.InventoryAckDate,
          'BatchStatus': el.BatchStatus,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 27) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'RETURN REQUEST ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'RETURN REQUEST BY', index: 3 },
        { field: 'CreatedDate', header: 'RETURN REQUEST ON', index: 3 },
        { field: 'approvedBy', header: 'APPROVED BY', index: 7 },
        { field: 'approvedDate', header: 'APPROVED ON', index: 7 },
        { field: 'rejectedBy', header: 'RETURN REQUEST REJECTED BY', index: 7 },
        { field: 'rejectedDate', header: 'RETURN REQUEST REJECTED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'RETURN STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'approvedDate': el.approvedDate,
          'approvedBy': el.approvedBy,
          'rejectedBy': el.rejectedBy,
          'rejectedDate': el.rejectedDate,
          'BatchStatus': el.BatchStatus,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 28) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'RETURN REQUEST ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'RETURN REQUEST BY', index: 3 },
        { field: 'CreatedDate', header: 'RETURN REQUEST ON', index: 3 },
        { field: 'approvedBy', header: 'APPROVED BY', index: 7 },
        { field: 'approvedDate', header: 'APPROVED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'RETURN STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'approvedDate': el.approvedDate,
          'approvedBy': el.approvedBy,
          'BatchStatus': el.BatchStatus,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 29) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'batchId', header: 'RETURN REQUEST ID', index: 7 },
        { field: 'CartonNo', header: 'CARTON NO', index: 2 },
        { field: 'DepartmentName', header: 'DEPARTMENT NAME', index: 2 },
        { field: 'DepartmentCode', header: 'DEPARTMENT CODE', index: 2 },
        { field: 'DocumentType', header: 'DOCUMENT TYPE', index: 2 },
        { field: 'DetailDocumentType', header: 'DETAIL DOCUMENT TYPE', index: 2 },
        { field: 'CreatedBy', header: 'RETURN REQUEST BY', index: 3 },
        { field: 'CreatedDate', header: 'RETURN REQUEST ON', index: 3 },
        { field: 'approvedBy', header: 'APPROVED BY', index: 7 },
        { field: 'approvedDate', header: 'APPROVED ON', index: 7 },
        { field: 'InventoryAckBy', header: 'RETURN REQUEST ACK BY', index: 7 },
        { field: 'InventoryAckDate', header: 'RETURN REQUEST ACK ON', index: 7 },
        { field: 'warehouseLocationUpdatedBy', header: 'WAREHOUSE LOCATION UPDATED BY', index: 7 },
        { field: 'warehouseLocationUpdatedDate', header: 'WAREHOUSE LOCATION UPDATED ON', index: 7 },
        { field: 'CartonStatus', header: 'CARTON STATUS', index: 7 },
        { field: 'BatchStatus', header: 'RETURN STATUS', index: 7 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'CartonNo': el.CartonNo,
          'CreatedBy': el.CreatedBy,
          'batchId': el.batchId,
          'CartonStatus': el.CartonStatus,
          'closedDate': el.closedDate,
          'CreatedDate': el.CreatedDate,
          'approvedDate': el.approvedDate,
          'approvedBy': el.approvedBy,
          'InventoryAckBy': el.InventoryAckBy,
          'InventoryAckDate': el.InventoryAckDate,
          'warehouseLocationUpdatedBy': el.warehouseLocationUpdatedBy,
          'warehouseLocationUpdatedDate': el.warehouseLocationUpdatedDate,
          'BatchStatus': el.BatchStatus,
          'DepartmentName': el.DepartmentName,
          'DepartmentCode': el.DepartmentCode,
          'DetailDocumentType': el.DetailDocumentType,
          'DocumentType': el.DocumentType,
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }
    this.loading1 = false;
  }

  downloadData(type) {
    this.type = type;
    this.displayStyle = "block";
  }

  loadChartsData() {



    //==================================================DEPARTMENT CHART=====================================================================================
    var DepartmentChart = am4core.create("DepartmentChart", am4charts.PieChart);
    DepartmentChart.logo.disabled = true;

    // Create Pie Series
    var pieSeries = DepartmentChart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    DepartmentChart.innerRadius = am4core.percent(0);

    // Slice Styling
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = "{count}";

    // Label Styling
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;

    // Legend
    DepartmentChart.legend = new am4charts.Legend();
    DepartmentChart.legend.itemContainers.template.togglable = false;
    DepartmentChart.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });

    // ✅ Prepare Data: DepartmentName and CartonCount
    const fixedColors = ['#00d480', '#0A424A', '#d4c4fa', '#fadeb5', '#d3f8d3ff', '#5A5A5A'];
    const chartDisplayData1: any[] = [];
    const totalCount = this.departmentchartData.reduce((sum, d) => sum + (d.CartonCount || 0), 0);

    this.departmentchartData.forEach((dept, index) => {
      const per = ((dept.CartonCount / totalCount) * 100).toFixed(2);
      chartDisplayData1.push({
        ocrStatus: dept.DepartmentName,
        count: dept.CartonCount,
        color: am4core.color(index < 6 ? fixedColors[index] : "#" + Math.floor(Math.random() * 16777215).toString(16)),
        fontSize: 12,
        per: per
      });
    });

    DepartmentChart.data = chartDisplayData1;

    // Label text as percentage
    pieSeries.labels.template.text = "";
    //==================================================WAREHOUSE CHART=====================================================================================
    var WarehouseChart = am4core.create("WarehouseChart", am4charts.PieChart);
    WarehouseChart.logo.disabled = true;

    // Create Pie Series
    var pieSeries = WarehouseChart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    WarehouseChart.innerRadius = am4core.percent(0);

    // Slice Styling
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = "{count}";

    // Label Styling
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;

    // Legend
    WarehouseChart.legend = new am4charts.Legend();
    WarehouseChart.legend.itemContainers.template.togglable = false;
    WarehouseChart.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });

    // ✅ Prepare Data: WarehouseName and CartonCountForWarehouse
    const fixedColorss = ['#00d480', '#0A424A', '#d4c4fa', '#fadeb5', '#edfaed', '#5A5A5A'];
    const chartDisplayDataWarehouse: any[] = [];
    const totalWarehouseCount = this.warehousechartData.reduce((sum, d) => sum + (d.CartonCountForWarehouse || 0), 0);

    this.warehousechartData.forEach((warehouse, index) => {
      const per = ((warehouse.CartonCountForWarehouse / totalWarehouseCount) * 100).toFixed(2);
      chartDisplayDataWarehouse.push({
        ocrStatus: warehouse.WarehouseName,
        count: warehouse.CartonCountForWarehouse,
        color: am4core.color(index < 6 ? fixedColorss[index] : "#" + Math.floor(Math.random() * 16777215).toString(16)),
        fontSize: 12,
        per: per
      });
    });

    WarehouseChart.data = chartDisplayDataWarehouse;

    // Label text as percentage
    pieSeries.labels.template.text = "";


    //=======================================================================================================================================

    var courierInwardChart = am4core.create("courierInwardChart", am4charts.PieChart);
    courierInwardChart.logo.disabled = true;
    var pieSeries = courierInwardChart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    courierInwardChart.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    courierInwardChart.legend = new am4charts.Legend();
    courierInwardChart.legend.itemContainers.template.togglable = false;
    courierInwardChart.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const CIPPer = ((this.Carton_sent_to_storage / (this.Carton_sent_to_storage + this.Carton_not_sent_to_storage)) * 100).toFixed(2);
    const beyondCIPPer = ((this.Carton_not_sent_to_storage / (this.Carton_sent_to_storage + this.Carton_not_sent_to_storage)) * 100).toFixed(2);
    courierInwardChart.data = [
      {
        "ocrStatus": "Inventory Request Pending",
        "count": this.Carton_sent_to_storage,
        "color": am4core.color("#00d480"),
        "fontSize": 12,
        "per": CIPPer
      }, {
        "ocrStatus": "Inventory Request Done",
        "count": this.Carton_not_sent_to_storage,
        "color": am4core.color("#d4c4fa"),
        "fontSize": 12,
        "per": beyondCIPPer
      }];
    pieSeries.labels.template.text = "";

    //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    var MissingChart = am4core.create("MissingChart", am4charts.PieChart);
    MissingChart.logo.disabled = true;
    var pieSeries = MissingChart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    MissingChart.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    MissingChart.legend = new am4charts.Legend();
    MissingChart.legend.itemContainers.template.togglable = false;
    MissingChart.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const Dis = ((this.lan_inv_pending_disbdate / (this.lan_inv_pending_disbdate + this.lan_inv_done_disbdate)) * 100).toFixed(2);
    const Diss = ((this.lan_inv_done_disbdate / (this.lan_inv_pending_disbdate + this.lan_inv_done_disbdate)) * 100).toFixed(2);
    MissingChart.data = [
      {
        "ocrStatus": "Inventory Pending",
        "count": this.lan_inv_pending_disbdate,
        "color": am4core.color("#00d480"),
        "fontSize": 12,
        "per": Dis
      }, {
        "ocrStatus": "Inventory Done",
        "count": this.lan_inv_done_disbdate,
        "color": am4core.color("#d4c4fa"),
        "fontSize": 12,
        "per": Diss
      }];
    pieSeries.labels.template.text = "";

    //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    var ReturnAcknowledgeStatus = am4core.create("ReturnAcknowledgeStatus", am4charts.PieChart);
    ReturnAcknowledgeStatus.logo.disabled = true;
    var pieSeries = ReturnAcknowledgeStatus.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    ReturnAcknowledgeStatus.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = "{count}";
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    ReturnAcknowledgeStatus.legend = new am4charts.Legend();
    ReturnAcknowledgeStatus.legend.itemContainers.template.togglable = false;
    ReturnAcknowledgeStatus.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const totalFiles = this.Carton_Not_Received + this.Carton_Received + this.Carton_Pending + this.DestroyedFiles + this.RetrievalRequestFiles;
    const OUTFILES = ((this.Carton_Not_Received / totalFiles) * 100).toFixed(2);
    const INFILES = ((this.Carton_Received / totalFiles) * 100).toFixed(2);
    const PERMOUTFILES = ((this.Carton_Pending / totalFiles) * 100).toFixed(2);


    ReturnAcknowledgeStatus.data = [
      {
        "ocrStatus": "Cartons Received",
        "count": this.Return_Carton_Received,
        "color": am4core.color("#d4c4fa"),
        "per": INFILES
      },
      {
        "ocrStatus": "Cartons Not Received",
        "count": this.Return_Carton_Not_Received,
        "color": am4core.color("#00d480"),
        "per": OUTFILES
      },
      {
        "ocrStatus": "Cartons Pending",
        "count": this.Return_Carton_Pending,
        "color": am4core.color("#fadeb5"),
        "per": PERMOUTFILES
      }
    ];
    pieSeries.labels.template.text = "";

    var CartonStorageStatus = am4core.create("CartonStorageStatus", am4charts.PieChart);
    CartonStorageStatus.logo.disabled = true;
    var pieSeries = CartonStorageStatus.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    CartonStorageStatus.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    CartonStorageStatus.legend = new am4charts.Legend();
    CartonStorageStatus.legend.itemContainers.template.togglable = false;
    CartonStorageStatus.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const tatPer2 = ((this.Request_Dispatched_Cartons / (this.Request_Dispatched_Cartons + this.Request_Dispatched_Cartons_Pending)) * 100).toFixed(2);
    const beyondtatPer2 = ((this.Request_Dispatched_Cartons_Pending / (this.Request_Dispatched_Cartons + this.Request_Dispatched_Cartons_Pending)) * 100).toFixed(2);
    CartonStorageStatus.data = [
      {
        "ocrStatus": "Cartons Send To Storage",
        "count": this.Return_Carton_sent_to_storage,
        "color": am4core.color("#00d480"),
        "fontSize": 12,
        "per": tatPer2
      }, {
        "ocrStatus": "Cartons Not Send To Storage",
        "count": this.Return_Carton_not_sent_to_storage,
        "color": am4core.color("#d4c4fa"),
        "fontSize": 12,
        "per": beyondtatPer2
      }];
    pieSeries.labels.template.text = "";
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    var ocrStatusChart = am4core.create("ocrStatusChart", am4charts.PieChart);
    ocrStatusChart.logo.disabled = true;
    var pieSeries = ocrStatusChart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    ocrStatusChart.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    ocrStatusChart.legend = new am4charts.Legend();
    ocrStatusChart.legend.itemContainers.template.togglable = false;
    ocrStatusChart.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const total = this.Request_Approved_Cartons + this.Request_Rejected_Cartons + this.Request_Pending_Cartons || 1;

    const tatPer = ((this.Request_Approved_Cartons / total) * 100).toFixed(2);
    const beyondtatPer = ((this.Request_Rejected_Cartons / total) * 100).toFixed(2);
    const tatPerr = ((this.Request_Pending_Cartons / total) * 100).toFixed(2);
    ocrStatusChart.data = [
      {
        "ocrStatus": "Cartons Approved",
        "count": this.Request_Approved_Cartons,
        "color": am4core.color("#00d480"),
        "fontSize": 12,
        "per": tatPer
      },
      {
        "ocrStatus": "Cartons Rejected",
        "count": this.Request_Rejected_Cartons,
        "color": am4core.color("#d4c4fa"),
        "fontSize": 12,
        "per": beyondtatPer
      }, {
        "ocrStatus": "Cartons Pending",
        "count": this.Request_Pending_Cartons,
        "color": am4core.color("#fadeb5"),
        "fontSize": 12,
        "per": tatPerr
      }];
    pieSeries.labels.template.text = "";

    //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    var ocrStatusChart1 = am4core.create("ocrStatusChart1", am4charts.PieChart);
    ocrStatusChart1.logo.disabled = true;
    var pieSeries = ocrStatusChart1.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    ocrStatusChart1.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    ocrStatusChart1.legend = new am4charts.Legend();
    ocrStatusChart1.legend.itemContainers.template.togglable = false;
    ocrStatusChart1.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const tatPer1 = ((this.Request_Dispatched_Cartons / (this.Request_Dispatched_Cartons + this.Request_Dispatched_Cartons_Pending)) * 100).toFixed(2);
    const beyondtatPer1 = ((this.Request_Dispatched_Cartons_Pending / (this.Request_Dispatched_Cartons + this.Request_Dispatched_Cartons_Pending)) * 100).toFixed(2);
    ocrStatusChart1.data = [
      {
        "ocrStatus": "Cartons Dispatched",
        "count": this.Request_Dispatched_Cartons,
        "color": am4core.color("#00d480"),
        "fontSize": 12,
        "per": tatPer1
      }, {
        "ocrStatus": "Cartons Dispatch Pending",
        "count": this.Request_Dispatched_Cartons_Pending,
        "color": am4core.color("#d4c4fa"),
        "fontSize": 12,
        "per": beyondtatPer1
      }];
    pieSeries.labels.template.text = "";

    var RetrievalRequestAck = am4core.create("RetrievalRequestAck", am4charts.PieChart);
    RetrievalRequestAck.logo.disabled = true;
    var pieSeries = RetrievalRequestAck.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    RetrievalRequestAck.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    RetrievalRequestAck.legend = new am4charts.Legend();
    RetrievalRequestAck.legend.itemContainers.template.togglable = false;
    RetrievalRequestAck.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const total1 = this.Request_Ack + this.Request_Ack_Rejected + this.Request_Ack_Pending || 1;

    const RefillingReq = ((this.Request_Ack / total1) * 100).toFixed(2);
    const RefillingAck = ((this.Request_Ack_Rejected / total1) * 100).toFixed(2);
    const RefillingAckK = ((this.Request_Ack_Pending / total1) * 100).toFixed(2);
    RetrievalRequestAck.data = [
      {
        "ocrStatus": "Cartons Acknowledged",
        "count": this.Request_Ack,
        "color": am4core.color("#00d480"),
        "fontSize": 12,
        "per": RefillingReq
      },
      {
        "ocrStatus": "Cartons Rejected",
        "count": this.Request_Ack_Rejected,
        "color": am4core.color("#d4c4fa"),
        "fontSize": 12,
        "per": RefillingAck
      }, {
        "ocrStatus": "Cartons Pending",
        "count": this.Request_Ack_Pending,
        "color": am4core.color("#fadeb5"),
        "fontSize": 12,
        "per": RefillingAckK
      }];
    pieSeries.labels.template.text = "";

    //---------------------------------------------------------------------CHART-------------------------CHART--------------------------CHART--------------------------------------------------------------------
    // Create chart
    var MissingChart1 = am4core.create("MissingChart1", am4charts.XYChart);
    MissingChart1.logo.disabled = true;
    MissingChart1.responsive.enabled = true;
    MissingChart1.padding(20, 20, 20, 20);
    MissingChart1.colors.step = 2;
    MissingChart1.fontSize = 13;
    MissingChart1.fontFamily = "Segoe UI, sans-serif";

    // Prepare chart data
    const chartDisplayData: any[] = [];
    this.chartData.forEach(dept => {
      chartDisplayData.push({
        department: dept.department,
        inCount: dept.inCount || 0,
        outCount: dept.outCount || 0
      });
    });
    MissingChart1.data = chartDisplayData;

    // Category Axis (Y-Axis)
    let categoryAxis = MissingChart1.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "department";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;
    categoryAxis.renderer.labels.template.fill = am4core.color("#495057");
    categoryAxis.renderer.grid.template.strokeDasharray = "2,2";

    // Value Axis (X-Axis)
    let valueAxis = MissingChart1.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.strictMinMax = true;
    valueAxis.extraMax = 0.1;
    valueAxis.maxPrecision = 0;
    valueAxis.renderer.minGridDistance = 40;
    valueAxis.renderer.labels.template.fill = am4core.color("#495057");
    valueAxis.renderer.grid.template.strokeDasharray = "2,2";
    valueAxis.numberFormatter.numberFormat = "#";

    // ✅ Force whole number labels only
    valueAxis.renderer.labels.template.adapter.add("text", (text, target) => {
      return parseInt(text).toString();
    });

    // IN Series
    let inSeries = MissingChart1.series.push(new am4charts.ColumnSeries());
    inSeries.dataFields.valueX = "inCount";
    inSeries.dataFields.categoryY = "department";
    inSeries.name = "IN";
    inSeries.columns.template.fill = am4core.color("#00d480");
    inSeries.stacked = true;
    inSeries.columns.template.height = am4core.percent(70);
    inSeries.columns.template.strokeWidth = 0;
    (inSeries.columns.template as any).cornerRadiusTopRight = 5;
    (inSeries.columns.template as any).cornerRadiusBottomLeft = 5;
    inSeries.columns.template.tooltipText = "IN - {department}: {valueX}";

    // IN Label
    let inLabelBullet = inSeries.bullets.push(new am4charts.LabelBullet());
    inLabelBullet.label.text = "{valueX}";
    inLabelBullet.label.fill = am4core.color("#fff");
    inLabelBullet.label.fontSize = 12;
    inLabelBullet.label.horizontalCenter = "middle";
    inLabelBullet.locationX = 0.5;

    // OUT Series
    let outSeries = MissingChart1.series.push(new am4charts.ColumnSeries());
    outSeries.dataFields.valueX = "outCount";
    outSeries.dataFields.categoryY = "department";
    outSeries.name = "OUT";
    outSeries.columns.template.fill = am4core.color("#0A424A");
    outSeries.stacked = true;
    outSeries.columns.template.height = am4core.percent(70);
    outSeries.columns.template.strokeWidth = 0;
    (outSeries.columns.template as any).cornerRadiusTopRight = 5;
    (outSeries.columns.template as any).cornerRadiusBottomRight = 5;
    outSeries.columns.template.tooltipText = "OUT - {department}: {valueX}";

    // OUT Label
    let outLabelBullet = outSeries.bullets.push(new am4charts.LabelBullet());
    outLabelBullet.label.text = "{valueX}";
    outLabelBullet.label.fill = am4core.color("#fff");
    outLabelBullet.label.fontSize = 12;
    outLabelBullet.label.horizontalCenter = "middle";
    outLabelBullet.locationX = 0.5;

    // Add legend
    MissingChart1.legend = new am4charts.Legend();
    MissingChart1.legend.position = "top";
    MissingChart1.legend.itemContainers.template.togglable = false;

    // Legend click event (if needed)
    MissingChart1.legend.itemContainers.template.events.on("hit", (ev: any) => {
      const category = ev.target.dataItem.dataContext.name;
      this.downloadData(category);
    });


    //--------------------------------Inventory Approval Status--------------------------------------------------------------------------------------------------------------------------------------

    var ReturnApprovalStatus = am4core.create("ReturnApprovalStatus", am4charts.PieChart);
    ReturnApprovalStatus.logo.disabled = true;
    var pieSeries = ReturnApprovalStatus.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    ReturnApprovalStatus.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    ReturnApprovalStatus.legend = new am4charts.Legend();
    ReturnApprovalStatus.legend.itemContainers.template.togglable = false;
    ReturnApprovalStatus.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });

    const totalCartons = this.Approved + this.Rejected + this.Pending || 1;

    const CartonsApproved = ((this.Approved / totalCartons) * 100).toFixed(2);
    const CartonsRejected = ((this.Rejected / totalCartons) * 100).toFixed(2);
    const CartonsPending = ((this.Pending / totalCartons) * 100).toFixed(2);
    ReturnApprovalStatus.data = [
      {
        "ocrStatus": "Cartons Approved",
        "count": this.ReturnApproved,
        "color": am4core.color("#00d480"),
        "fontSize": 12,
        "PerP": CartonsApproved
      }
      , {
        "ocrStatus": "Cartons Rejected",
        "count": this.ReturnRejected,
        "color": am4core.color("#d4c4fa"),
        "fontSize": 12,
        "PerP": CartonsRejected
      },
      {
        "ocrStatus": "Cartons Pending",
        "count": this.ReturnPending,
        "color": am4core.color("#fadeb5"),
        "fontSize": 12,
        "PerP": CartonsPending
      }
    ];
    pieSeries.labels.template.text = "";

    //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    var activityChart = am4core.create("activityChart", am4charts.PieChart);
    activityChart.logo.disabled = true;
    var pieSeries = activityChart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "value";
    pieSeries.dataFields.category = "country";
    activityChart.innerRadius = am4core.percent(70);;
    pieSeries.ticks.template.disabled = true;
    pieSeries.labels.template.hidden = true;
    pieSeries.tooltip.disabled = true;
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{value}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    pieSeries.labels.template.disabled = true;
    activityChart.legend = new am4charts.Legend();
    activityChart.legend.position = "right";
    activityChart.legend.valign = "middle";
    activityChart.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    activityChart.data = [{
      "country": "Complete",
      "value": this.Complete,
      "color": am4core.color("#FFA7BE")
    }, {
      "country": "InComplete",
      "value": this.InComplete,
      "color": am4core.color("#69DDFF")
    }, {
      "country": "Missing",
      "value": this.Missing,
      "color": am4core.color("#A9FFF7")
    }, {
      "country": "Extra",
      "value": this.Extra,
      "color": am4core.color("#B8E1FF")
    }, {
      "country": "POD Intransit",
      "value": this.PODInstratt,
      "color": am4core.color("#ff00ff")
    }, {
      "country": "NotYetDisptach",
      "value": this.NotYetDisptach,
      "color": am4core.color("#ff6666")
    }
      , {
      "country": "PODACk",
      "value": this.PODACk,
      "color": am4core.color("#ffbf00")
    }
    ];


  }

  searchTable1($event) {
    let val = $event.target.value;
    if (val == "") {
      this.formattedData1 = this.immutableFormattedData1;
    } else {
      let filteredArr = [];
      const strArr = val.split(",");
      this.formattedData1 = this.immutableFormattedData1.filter(function (d) {
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
      this.formattedData1 = filteredArr;
    }
  }

  paginate1(e) {
    this.first1 = e.first;
    this.rows1 = e.rows;
  }

  Closepopup() {
    this.modelRef.hide();
  }

  immutableFormattedData: any;
  immutableFormattedData1: any;
  formattedData1: any;
  loading: boolean = true;
  loading1: boolean = true;

 

onDownload(fileName: any) {
  const formatted = this.formattedData1.map(row => {
    const obj: any = {};
    this.headerList1.forEach(col => {
      obj[col.header] = row[col.field]; 
    });
    return obj;
  });

  this.exportToExcel(formatted, fileName);
}



  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveExcelFile(excelBuffer, fileName);
  }

  private saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const excelFile: File = new File([data], `${fileName}.xlsx`, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = fileName + '.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }


}
