import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";


export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: 'app-access-refilling',
  templateUrl: './access-refilling.component.html',
  styleUrls: ['./access-refilling.component.scss']
})
export class AccessRefillingComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  _SingleDepartment: any;
  submitted = false;
  Reset = false;
  sMsg: string = '';
  _FilteredList = [];

  _IndexList: any;
  _Records: any;
  AccessRefillingForm: FormGroup;
  manualForm: FormGroup;

  public message: string;
  _HeaderList: any;
  _ColNameList = [];
  _CSVData: any;
  public records: any[] = [];
  papa: any;
  _TempID: any = 0;

  myFiles: string[] = [];
  _FileDetails: string[][] = [];
  first = 0;
  rows = 10;

  @Output() public onUploadFinished = new EventEmitter();
  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
  ) { }
  ngOnInit() {
    this.AccessRefillingForm = this.formBuilder.group({
      User_Token: localStorage.getItem('User_Token'),
      created_by: localStorage.getItem('UserID'),
      refillingAccess_number: ["", Validators.required],
      item_Code: ['', Validators.required],
      id: [0],
      CSVData: [""]
    });

    this.manualForm = this.formBuilder.group({
      User_Token: localStorage.getItem('User_Token'),
      created_by: localStorage.getItem('UserID'),
      item_Code: ['', Validators.required],
      itemnumber: ['', [Validators.required]],
      workorderNO: ['', Validators.required],
      refillingAccess_number: ["", Validators.required]
    });
    this.BindHeader(this._FilteredList, this._FilteredList);
    this.prepareTableData(this._FilteredList, this._FilteredList);
  }


  entriesChange($event) {
    this.entries = $event.target.value;
  }
  filterTable($event) {
    //   console.log($event.target.value);

    let val = $event.target.value;
    let that = this
    this._FilteredList = this.records.filter(function (d) {
      //  console.log(d);
      for (var key in d) {
        if (d[key].toLowerCase().indexOf(val) !== -1) {
          return true;
        }
      }
      return false;
    });
  }
  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  onActivate(event) {
    this.activeRow = event.row;
  }

  OnReset() {

  }
  handleFileSelect(evt) {
    var files = evt.target.files;

    if (this.AccessRefillingForm.valid && files.length > 0) {
      var file = files[0];
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (event: any) => {
        var csv = event.target.result; // Content of CSV file
        this.papa.parse(csv, {
          skipEmptyLines: true,
          header: true,
          complete: (results) => {
            for (let i = 0; i < results.data.length; i++) {
              let orderDetails = {
                order_id: results.data[i].Address,
                age: results.data[i].Age
              };
              this._Records.push(orderDetails);
            }
            // console.log(this.test);
            // console.log('Parsed: k', results.data);
          }
        });
      }
    } else {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please Select <br> <b>Csv File</b><br><b>Template</b><br> before uploading!</span></div>',
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
  }

  uploadListener($event: any): void {

    let text = [];
    let files = $event.srcElement.files;

    if (this.isValidCSVFile(files[0])) {

      let input = $event.target;
      let reader = new FileReader();
      // console.log(input.files[0]);
      reader.readAsText(input.files[0]);
      $(".selected-file-name").html(input.files[0].name);
      reader.onload = () => {
        let csvData = reader.result;
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);

        let headersRow = this.getHeaderArray(csvRecordsArray);
        csvRecordsArray.pop()

        console.log(csvRecordsArray)
        this._CSVData = csvRecordsArray;
        this._IndexList = csvRecordsArray;

        // alert(headersRow);
        // alert(this._ColNameList);
        //let ColName = 
        let validFile = this.getDisplayNames(csvRecordsArray);
        if (validFile == false) {
          //  console.log('Not Valid File', csvRecordsArray);
          this.fileReset();
        } else {
          this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);

          this._FilteredList = this.records;

          console.log(this.records);
          //console.log("_FilteredList",this._FilteredList);

          this.prepareTableDataForCSV(this._FilteredList);

          (<HTMLInputElement>document.getElementById('csvReader')).value = '';
          //  console.log('Records', this._FilteredList);
        }


      };

      reader.onerror = function () {
        // console.log('error is occurred while reading file!');
      };

    } else {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please Select A Valid CSV File And Template</span></div>',
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
      this.fileReset();
    }
    console.log(this._FilteredList)
    this._FilteredList = this.records
  }

  checkDateFormat(date) {
    //  console.log("Date",date);

    if (date != "") {
      let dateArr = date.split('-');
      const dateString = dateArr[1] + '/' + dateArr[0] + '/' + dateArr[2];
      if (isNaN(dateArr[0]) || isNaN(dateArr[1]) || isNaN(dateArr[2])) {
        return false;
      }
      if (isNaN(new Date(dateString).getTime())) {
        return false;
      }
      return true;
    }
    else {
      return true;
    }
  }
  isValidDateFormat(dateString: string): boolean {
    const pattern = /^(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[0-2])[-/]\d{4}$/;
    return pattern.test(dateString);
  }


  tocheckDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    const csvArr = [];
    for (let i = 1; i < csvRecordsArray.length; i++) {
      const data = csvRecordsArray[i].split(',');
      if (data.length == headerLength) {
        const record: any = {};
        for (let j = 0; j < headerLength; j++) {
          if (j == 8) {
            if (!this.isValidDateFormat(data[j])) {
              this.toastr.show(
                '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Invalid Disburse Date format for ' + data[1] + ' Lan No. in CSV File </span></div>',
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
              return false;
            }
          }

          record[this._ColNameList[j]] = data[j].trim();
        }
        csvArr.push(record);
      }
    }
    return csvArr;
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    let csvArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (<string>csvRecordsArray[i]).split(',');
      if (curruntRecord.length == headerLength) {
        const single = []
        for (let i = 0; i < this._ColNameList.length; i++) {
          single.push(curruntRecord[i].toString().trim())
        }
        csvArr.push(single)
      }
    }
    return csvArr;
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    var headers;
    // headers ="NewCBSAccountNo,ApplicationNo,CBSCUSTIC,Team,HandliedBy,ProductCode,Product,ProductDescription,JCCode,JCName,Zone,CustomerName,DBDate,FinalRemarks,DisbursedMonth";
    headers = ['Item Number', 'Work Order Number'];
    // console.log("headers_1",headers);
    //  // let headerArray = [];
    // for (let j = 0; j < headers.length; j++) {
    //   headerArray.push(headers[j]);
    // }

    return headers;


  }

  fileReset() {
    //this.csvReader.nativeElement.value = "";  
    this.records = [];
  }

  onSubmit() {

    this.submitted = true;

    if (this._CSVData != null && this._CSVData != undefined) {
      this.AccessRefillingForm.patchValue({
        created_by: localStorage.getItem('UserID'),
        CSVData: this._CSVData,
        request_number: this.AccessRefillingForm.get('refillingAccess_number'),
        item_Code: this.AccessRefillingForm.value.item_Code,
        User_Token: localStorage.getItem('User_Token')

      });
      console.log(this.AccessRefillingForm.get('item_Code'))
      const apiUrl = this._global.baseAPIUrl + 'DataUpload/AccessUploadData';
      this._onlineExamService.postData(this.AccessRefillingForm.value, apiUrl)
        .subscribe(data => {
          this.downloadFilestatus(data);
          this.BindHeader(this._FilteredList, this._FilteredList);
          this.AccessRefillingForm.reset();
        });
    }
    else {
      this.showmessage("please select file");

    }
  }

  onManualUpdate() {
    this.submitted = true;

    if (this.manualForm.valid) {
      this.manualForm.patchValue({
        created_by: localStorage.getItem('UserID'),
        request_number: this.manualForm.get('refillingAccess_number').value,
        item_Code: this.manualForm.get('item_Code').value,
        workorderNO: this.manualForm.get('workorderNO').value,
        itemnumber: this.manualForm.get('itemnumber').value,
        User_Token: localStorage.getItem('User_Token')
      });

      console.log(localStorage.getItem('User_Token'));

      const apiUrl = this._global.baseAPIUrl + 'DataUpload/AccessUploadData';
      this._onlineExamService.postData(this.manualForm.value, apiUrl)
        .subscribe(data => {
          if (data == 'Successfully Access Refilled') {
            this.showSuccessmessage("Successfully Access Refilled");
            return;
          }
          this.ShowErrormessage(data);
          this.manualForm.reset();
        }, error => {
          console.error("Error updating data", error);
          this.ShowErrormessage("Failed to update record");
        });
    } else {
      this.showmessage("Please fill all required fields");
    }
  }


  downloadFilestatus(strmsg: any) {
    const filename = 'Record upload status';

    // let csvData = "FileNo,";    
    //console.log(csvData)
    let blob = new Blob(['\ufeff' + strmsg], {
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
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
    //}
  }

  ShowErrormessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error ! </span> <span data-notify="message"> ' + data + ' </span></div>',
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

  onFormat(csvRecordsArr: any) {
    //   let dt;

  }

  getDisplayNames(csvRecordsArr: any) {

   // console.log("csvRecordsArr", csvRecordsArr);

    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    if (headers.length != 2) {
      var msg = 'Invalid No. of Column Expected :- ' + 2;
      this.ShowErrormessage(msg);

      return false;
    }
    this._ColNameList[0] = "Item Number";
    this._ColNameList[1] = "Work Order Number";
    return true;
  }

  GetHeaderNames() {
    //  this._HeaderList = "";
    this._HeaderList = "loan_account_number,secured_unsecured,zone_name,branch_name,app_branch_code,applicant_name,scheme_name,smemel_product,disb_date,disb_number,total_disb_amt,pos,bal_disb_amt";

  }

  downloadFile() {
    const filename = 'AccessRefilling_Format_CSV';
    let csvData = "Item Number ,Work Order Number";
    let blob = new Blob(['\ufeff' + csvData], {
      type: 'text/csv;charset=utf-8;'
    });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = -1;
    if (isSafariBrowser) {
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);

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
          "ngx-toastr alert alert-dismissible alert-success alert-notify"
      }
    );


  }

  showSuccessmessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title"> </span> <span data-notify="message"> ' + data + ' </span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-success alert-notify"
      }
    );


  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableDataForCSV(tableData) {
    let formattedData = [];
    let csvData = "Item Number ,Work Order Number";
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'itemnumber', header: "ITEM NUMBER", index: 1 },
      { field: 'workorder_number', header: 'WORK ORDER NUMBER', index: 2 },
    ];
    // console.log("this.formattedData", tableData);
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'itemnumber': el[0],
        'workorder_number': el[1],

      });

    });
    this.headerList = tableHeader;
    //}

    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;

    // console.log("this.formattedData", this.formattedData);
  }

  prepareTableData(tableData, headerList) {
    let formattedData = [];
    // alert(this.type);

    // if (this.type=="Checker" )
    //{
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'itemnumber', header: "ITEM NUMBER", index: 1 },
      { field: 'workorder_number', header: 'WORK ORDER NUMBER', index: 2 },
    ];
    // console.log("this.formattedData", tableData);
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'loan_account_number': el[0],
        'secured_unsecured': el[1],
        'zone_name': el[2],
        'branch_name': el[3],
        'app_branch_code': el[4],

        'applicant_name': el[5],
        'scheme_name': el[6],
        'smemel_product': el[7],
        'disb_date': el[8],
        'disb_number': el[9],
        'total_disb_amt': el[10],
        'pos': el[11],
        'bal_disb_amt': el[12],

      });

    });
    this.headerList = tableHeader;
    //}

    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;

    // console.log("this.formattedData", this.formattedData);
  }

  BindHeader(tableData, headerList) {
    let formattedData = [];
    // alert(this.type);

    // if (this.type=="Checker" )
    //{
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'itemnumber', header: "ITEM NUMBER", index: 1 },
      { field: 'workorder_number', header: 'WORK ORDER NUMBER', index: 2 },
    ];

    this.headerList = tableHeader;
    //}

    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;

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

  Generate_Batch_id() {
    const apiUrl =
      this._global.baseAPIUrl +
      "DataUpload/GetNextRefillingAccessNumber?userId=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token") +
      "&refillingAccess_number=";
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {
      console.log("refillingAccess_number", data);
      this.AccessRefillingForm.controls["refillingAccess_number"].setValue(data || "");
    });
  }


  Generate_Batch_id2() {
    const apiUrl =
      this._global.baseAPIUrl +
      "DataUpload/GetNextRefillingAccessNumber?userId=" +
      localStorage.getItem("UserID") +
      "&user_Token=" +
      localStorage.getItem("User_Token") +
      "&refillingAccess_number=";
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {
      console.log("refillingAccess_number", data);
      this.manualForm.controls["refillingAccess_number"].setValue(data || "");
    });
  }
  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }



}
