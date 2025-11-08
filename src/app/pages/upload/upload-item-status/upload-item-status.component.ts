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
  selector: "app-upload-item-status",
  templateUrl: "upload-item-status.component.html",
})
export class UploaditemstatusComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  _SingleDepartment: any;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  _FilteredList = [];
  _StatusList: any;
  _IndexList: any;
  _Records: any;
  DataUploadForm: FormGroup;

  public message: string;
  _HeaderList: any;
  _HeaderColList: any;
  _ColNameList = [];
  _CSVData: any;
  public records: any[] = [];
  papa: any;
  _TempID: any = 0;
  myFiles: string[] = [];
  _FileDetails: string[][] = [];
  first = 0;
  rows = 10;
  
  _ColList = [
      "srNo",
    //  "lan_no",
      "file_no",
   //   "carton_no",
      "item_status",
 //     "applicant_name", 
  //    "crown_branch",
   //   "client_branch",        
  ];

  @Output() public onUploadFinished = new EventEmitter();
  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) {}
  ngOnInit() {
    this.DataUploadForm = this.formBuilder.group({
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
      id: [0],
      CSVData: [""],
      branch_name: [""],
      app_branch_code: [""],
    });
    //this.BindHeader(this._FilteredList,this._FilteredList);
    this.prepareTableData(this._FilteredList, this._FilteredList);
   // this.getAllBranchList();
  }
  barnchName: string;
  branchCode: string;
  AddBranchCode(event){
 //   console.log(event.target.value)
    if(event.target.value){
      const record = event.target.value.split('-')
      if(record.length > 1){
        this.barnchName = record[0]
        this.branchCode = record[0]
      }
    }
  }
  AllBranch: any;
  // getAllBranchList() {
  //   const apiUrl =
  //     this._global.baseAPIUrl +
  //     "BranchMaster/GetbranchDeatilsByUserId?USER_ID=" +
  //     localStorage.getItem("UserID") +
  //     "&user_Token=" +
  //     localStorage.getItem("User_Token");
  //   this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
  //     this.AllBranch = data;
  //   });
  //   console.log(this.AllBranch);
  // }

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

  OnReset() {}
  handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    //console.log(this.DataUploadForm);

    if (this.DataUploadForm.valid && files.length > 0) {
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
                age: results.data[i].Age,
              };
              this._Records.push(orderDetails);
            }
            // console.log(this.test);
            // console.log('Parsed: k', results.data);
          },
        });
      };
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
            "ngx-toastr alert alert-dismissible alert-danger alert-notify",
        }
      );
    }
  }

  uploadListener($event: any): void {
    // if(!this.branchCode){
    //   this.toastr.show(
    //     '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please Select Branch First</span></div>',
    //     "",
    //     {
    //       timeOut: 3000,
    //       closeButton: true,
    //       enableHtml: true,
    //       tapToDismiss: false,
    //       titleClass: "alert-title",
    //       positionClass: "toast-top-center",
    //       toastClass:
    //         "ngx-toastr alert alert-dismissible alert-danger alert-notify",
    //     }
    //   );

    //   (<HTMLInputElement>document.getElementById("csvReader")).value = "";
    //   return;
    // }
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

        // Filter out empty rows or unwanted rows, e.g. by checking if they are blank or don't match the expected number of columns
      csvRecordsArray = csvRecordsArray.filter(row => row.trim() !== "" && row.split(",").length === this.getHeaderArray(csvRecordsArray).length);

        let headersRow = this.getHeaderArray(csvRecordsArray);

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
          this.records = this.getDataRecordsArrayFromCSVFile(
            csvRecordsArray,
            headersRow.length
          );

          this._FilteredList = this.records;

          //  console.log(this.records);
          //console.log("_FilteredList",this._FilteredList);

          this.prepareTableDataForCSV(this._FilteredList);

          (<HTMLInputElement>document.getElementById("csvReader")).value = "";
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
            "ngx-toastr alert alert-dismissible alert-danger alert-notify",
        }
      );
      this.fileReset();
    }
    this._FilteredList = this.records;
  }

  checkDateFormat(date) {
    //  console.log("Date",date);

    if (date != "") {
      let dateArr = date.split("-");
      const dateString = dateArr[1] + "/" + dateArr[0] + "/" + dateArr[2];
      if (isNaN(dateArr[0]) || isNaN(dateArr[1]) || isNaN(dateArr[2])) {
        return false;
      }
      if (isNaN(new Date(dateString).getTime())) {
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    console.log(csvRecordsArray, headerLength)
    let csvArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (<string>csvRecordsArray[i]).split(",");
      if (curruntRecord.length == headerLength) {
        const single = [];
        for (let i = 0; i < this._ColNameList.length; i++) {
          single.push(curruntRecord[i].toString().trim());
        }
        csvArr.push(single);
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
    headers = [
   //   "lan_no",
      "file_no",
    //  "carton_no",
      "item_status",
   //   "applicant_name",
   //   "crown_branch",
    //  "client_branch", 
           
    ];

    return headers;
  }

  fileReset() {
    //this.csvReader.nativeElement.value = "";
    this.records = [];
  }
  

  onSubmit() {
    this.submitted = true;

    if (this._CSVData != null && this._CSVData != undefined) {
        this.DataUploadForm.patchValue({
            id: localStorage.getItem("UserID"),
            CSVData: this._CSVData,
            User_Token: localStorage.getItem("User_Token"),
            branch_name: this.barnchName,
            app_branch_code: this.branchCode,
        });

        const apiUrl = this._global.baseAPIUrl + "DataUpload/ItemStatusupload";
        this._onlineExamService.postData(this.DataUploadForm.value, apiUrl)
            .subscribe((data) => {
                this.downloadFilestatus(data);
                this.showSuccessmessage(data);
                this.BindHeader(this._FilteredList, this._FilteredList);

                // Reset form, variables, and UI
                this.DataUploadForm.reset(); // Reset form controls
                this._CSVData = null; // Clear file data
                this._FilteredList = null; // Clear filtered list
                this.barnchName = ''; // Clear branch name
                this.branchCode = ''; // Clear branch code
                this.buttonDisabled = true; // Disable button
                this.submitted = false; // Reset submission state

                // Clear UI elements
                (<HTMLInputElement>document.getElementById("csvReader")).value = ""; // Clear file input
                $(".selected-file-name").html(''); // Clear selected file name
            });
    } else {
        this.showmessage("please select file");
    }
}


  downloadFilestatus(strmsg: any) {
    const filename = "Item status";

    // let csvData = "FileNo,";
    //console.log(csvData)
    let blob = new Blob(["\ufeff" + strmsg], {
      type: "text/csv;charset=utf-8;",
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
    //}
  }

  ShowErrormessage(data: any) {
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


  buttonDisabled: boolean = true;


  getDisplayNames(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(",");
    let headerArray = [];
//    console.log(headers);
    if (headers.length != 2) {
      var msg = "Invalid No. of Column Expected :- " + this._ColNameList.length;
      this.ShowErrormessage(msg);

      return false;
    }

//  const requiredColumns = ['file_no', 'carton_no'];
//  const missingColumns = requiredColumns.filter(col => !headers.includes(col));


//  if (missingColumns.length > 0) {
//    const missingColsMsg = `Missing required columns: ${missingColumns.join(", ")}`;
//    this.ShowErrormessage(missingColsMsg);
//    return false;
//  }


 let isValid = true; 


//  for (let i = 1; i < csvRecordsArr.length; i++) {  
//    const row = (<string>csvRecordsArr[i]).split(",");
//    const file_no = row[12];  
//    if (!file_no || file_no.trim() === '' || file_no === 'NULL' || file_no === null|| file_no === undefined) {
//      var msg = `Please enter a valid 'File_no'`;
//      this.ShowErrormessage(msg);
//      isValid = false;;
//    }
//  }
 
 
//  for (let i = 1; i < csvRecordsArr.length; i++) {  
//    const row = (<string>csvRecordsArr[i]).split(",");
//    const carton_no = row[11];  
//    if (!carton_no || carton_no.trim() === ''|| carton_no === 'NULL' || carton_no === null || carton_no === undefined) {
//      var msg = `Please enter a valid 'Carton_no'`;  
//      this.ShowErrormessage(msg);
//      isValid = false;;
//    }
//  }
 
  
    this.buttonDisabled = !isValid;

    this._ColNameList[0] = "lan_no";
    this._ColNameList[1] = "file_no";
    this._ColNameList[2] = "carton_no";
    this._ColNameList[3] = "item_status";
    this._ColNameList[4] = "applicant_name";
    this._ColNameList[5] = "crown_branch";
    this._ColNameList[6] = "client_branch";
 
    return isValid;
  }

  GetHeaderNames() {
    //  this._HeaderList = "";
    this._HeaderList =
      "file_no,item_status";
  }

  downloadFile() {
    const filename = "INVUpload_CSVFileUpload";

    let csvData =
      "file_no,item_status";
    //console.log(csvData)
    let blob = new Blob(["\ufeff" + csvData], {
      type: "text/csv;charset=utf-8;",
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
          "ngx-toastr alert alert-dismissible alert-success alert-notify",
      }
    );
  }

  showSuccessmessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title"> </span> <span data-notify="message"> ' +
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

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;

  // PODNo,AppNo,CartonNo,FileNo,Status
//  "lan_no,file_no,carton_no,item_status,applicant_name";
  prepareTableDataForCSV(tableData) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      //{ field: "lan_no", header: "Loan Account Number", index: 1 },
      { field: "file_no", header: "File No", index: 1 },
    //  { field: "carton_no", header: "CARTON NO", index: 2 },
      { field: "item_status", header: "ITEM STATUS", index: 1 },
      //{ field: "applicant_name", header: "APPLICATION NAME", index: 2 },
      //{ field: "crown_branch", header: "CROWN BRANCH", index: 2 },
      //{ field: "client_branch", header: "CLIENT BRANCH", index: 2 }, 
     
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        // lan_no: el[0],
        // file_no: el[1],
        // carton_no: el[2],
        // item_status: el[3],
        // applicant_name: el[4], 
        // crown_branch: el[5], 
        // client_branch: el[6], 
           file_no: el[0],
         item_status: el[1],
      });
    });
    this.headerList = tableHeader;
    //}

    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
    //  { field: "lan_no", header: "Loan Account Number", index: 1 },
      { field: "file_no", header: "File No", index: 1 },
    //  { field: "carton_no", header: "CARTON NO", index: 2 },
      { field: "item_status", header: "ITEM STATUS", index: 1 },
    //  { field: "applicant_name", header: "APPLICATION NAME", index: 2 },
     // { field: "crown_branch", header: "CROWN BRANCH", index: 2 },
    //  { field: "client_branch", header: "CLIENT BRANCH", index: 2 }, 
    ];
    tableData.forEach((el, index) => {
      let formattedRow = { srNo: parseInt(index + 1) };

      tableHeader.forEach((header) => {
        if (header.field !== "srNo") {
          formattedRow[header.field] =
            el[header.field] !== undefined ? el[header.field] : null;
        }
      });

      formattedData.push(formattedRow);
    });
    this.headerList = tableHeader;
    //}

    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  BindHeader(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
   //   { field: "lan_no", header: "Loan Account Number", index: 1 },
      { field: "file_no", header: "File No", index: 1 },
      //{ field: "carton_no", header: "CARTON NO", index: 2 },
      { field: "item_status", header: "ITEM STATUS", index: 1 },
  //    { field: "applicant_name", header: "APPLICATION NAME", index: 2 },
   //   { field: "crown_branch", header: "CROWN BRANCH", index: 2 },
    //  { field: "client_branch", header: "CLIENT BRANCH", index: 2 }, 
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

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }
 
 

  
}
