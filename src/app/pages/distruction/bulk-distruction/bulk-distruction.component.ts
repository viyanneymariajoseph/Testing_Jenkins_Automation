import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, EventEmitter, Output, TemplateRef } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { HttpParams } from "@angular/common/http";


export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-bulk-distruction',
  templateUrl: './bulk-distruction.component.html',
  styleUrls: ['./bulk-distruction.component.scss']
})
export class BulkDistructionComponent implements OnInit {

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
  DataUploadForm: FormGroup;

  public message: string;
  _HeaderList: any;
  _ColNameList = [];
  _CSVData: any;
  public records: any[] = [];
  papa: any;
  _TempID: any = 0;
selectedFileName: string = '';
  myFiles: string[] = [];
  _FileDetails: string[][] = [];
  first = 0;
  rows = 10;
totalUploaded: number = 0;
totalSuccess: number = 0;
totalFailed: number = 0;
  @Output() public onUploadFinished = new EventEmitter();
  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
  ) { }
  ngOnInit() {
    this.DataUploadForm = this.formBuilder.group({
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),
      id: [0],
      CSVData: [""]
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
  let files = $event.srcElement.files;

  if (this.isValidCSVFile(files[0])) {
    let input = $event.target;
    this.selectedFileName = input.files[0].name; // Set file name to display

    let reader = new FileReader();
    reader.readAsText(input.files[0]);
    reader.onload = () => {
      let csvData = reader.result;
      let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);

      let headersRow = this.getHeaderArray(csvRecordsArray);
      csvRecordsArray.pop();

      this._CSVData = csvRecordsArray;
      this._IndexList = csvRecordsArray;

      let validFile = this.getDisplayNames(csvRecordsArray);
      if (validFile == false) {
        this.fileReset();
      } else {
        this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
        this._FilteredList = this.records;
        this.prepareTableDataForCSV(this._FilteredList);
        (<HTMLInputElement>document.getElementById('csvReader')).value = '';
      }
    };
    reader.onerror = function () { };
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
  this._FilteredList = this.records;
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
    headers = ['cartonNo'];

    return headers;
  }

  fileReset() {
    this.records = [];
  }
// onSubmit() {
//   this.submitted = true;

//   if (!this._CSVData) {
//     this.ShowErrormessage("Please select a file.");
//     this.submitted = false;
//     return;
//   }

//   this.DataUploadForm.patchValue({
//     id: localStorage.getItem('UserID'),
//     CSVData: this._CSVData,
//     User_Token: localStorage.getItem('User_Token')
//   });

//   const apiUrl = this._global.baseAPIUrl + 'BranchInward/BulkDestruction';

//   this._onlineExamService.postData(this.DataUploadForm.value, apiUrl)
//     .subscribe(
//       (response: any) => {
//         let parsedMessages: any[] = [];
//         let successCount = 0;
//         let errorCount = 0;

//         try {
//           if (typeof response === 'string') {
//             // Case 1: response is newline-separated
//             const lines = response.split('\n').map(line => line.trim()).filter(line => line !== '');
//             parsedMessages = lines.map(line => {
//               const splitIndex = line.indexOf(':-');
//               const cartonNo = splitIndex !== -1 ? line.substring(0, splitIndex).trim() : 'Unknown';
//               const status = splitIndex !== -1 ? line.substring(splitIndex + 2).trim() : line;
//               return { cartonNo, status };
//             });
//           } else if (Array.isArray(response)) {
//             // Case 2: already array of objects
//             parsedMessages = response.map((item: any) => {
//               let cartonNo = '';
//               let status = '';
//               if (item.message) {
//                 const splitIndex = item.message.indexOf(':-');
//                 cartonNo = splitIndex !== -1 ? item.message.substring(0, splitIndex).trim() : 'Unknown';
//                 status = splitIndex !== -1 ? item.message.substring(splitIndex + 2).trim() : item.message.trim();
//               }
//               return { cartonNo, status };
//             });
//           } else {
//             throw new Error('Unsupported response format');
//           }

//           // Count
//           parsedMessages.forEach(item => {
//             const msg = (item.status || '').toLowerCase();
//             const isError = msg.includes('invalid') || msg.includes('already') || msg.includes('missing') || msg.includes('not');
//             if (isError) errorCount++;
//             else successCount++;
//           });

//           const totalCount = parsedMessages.length;

//           // Download CSV
//           const csvData = this.convertToCSV(parsedMessages);
//           this.downloadFilestatus(csvData);

//           // Show detailed toaster with counts
//           const toastOptions = {
//             positionClass: 'toast-top-center',
//             timeOut: 5000,
//             closeButton: true,
//             enableHtml: true
//           };

//           let toastMessage = `
//             <b>Bulk Destruction Status</b><br/>
//             Total No. of CTN uploaded: ${totalCount}<br/>
//             No. of CTN successfully updated: ${successCount}<br/>
//             Number of failed CTN: ${errorCount}
//           `;

//           if (successCount === 0 && errorCount > 0) {
//             this.toastr.success(toastMessage, 'Upload Failed', toastOptions);
//           } else if (successCount > 0 && errorCount === 0) {
//             this.toastr.success(toastMessage, 'Upload Successful', toastOptions);
//           } else if (successCount > 0 && errorCount > 0) {
//             this.toastr.success(toastMessage, 'Partial Upload', toastOptions);
//           } else {
//             this.toastr.info("Upload completed. Check the CSV report.", 'Upload Info', toastOptions);
//           }

//           if (successCount > 0) {
//             this.BindHeader(this._FilteredList, this._FilteredList);
//             this.DataUploadForm.reset();
//             this._CSVData = null;
//           }

//         } catch (err) {
//           // fallback
//           parsedMessages = [{ cartonNo: 'Unknown', status: (response || '').toString().trim() }];
//           errorCount = 1;

//           const csvData = this.convertToCSV(parsedMessages);
//           this.downloadFilestatus(csvData);

//           this.toastr.error('Unexpected response from server. Check CSV report.', 'Error', {
//             positionClass: 'toast-top-center',
//             timeOut: 3000,
//             closeButton: true,
//           });
//         }

//         this.submitted = false;
//       },
//       (error) => {
//         this.toastr.error('Server error during file upload.', 'Error', {
//           positionClass: 'toast-top-center',
//           timeOut: 3000,
//           closeButton: true,
//         });
//         this.submitted = false;
//       }
//     );
// }
SuccessData:any;
onSubmit(template: TemplateRef<any>) {
  this.submitted = true;
  debugger;
  if (this._CSVData != null && this._CSVData != undefined) {
    if (this._CSVData.length > 25) {
        this.ShowErrormessage(
          "CSV data should not contain more than 25 records."
        );
        return;
      }
   if (this._CSVData.length < 2) {
        this.ShowErrormessage(
          "NO data found in CSV File."
        );
        return;
      }


const hasEmptyRow = this._CSVData.some(row =>
  Object.values(row).every(value => !value || value.toString().trim() === '')
);

if (hasEmptyRow) {
  this.ShowErrormessage("NO data found in CSV File.");
  return;
}

 
    this.DataUploadForm.patchValue({
      id: localStorage.getItem('UserID'),
      CSVData: this._CSVData,
      User_Token: localStorage.getItem('User_Token')
    });
 
    const apiUrl = this._global.baseAPIUrl + 'BranchInward/BulkDestruction';
    this._onlineExamService.postData(this.DataUploadForm.value, apiUrl)
      .subscribe(data => {
         this.modalRef = this.modalService.show(template,{
          backdrop:'static',
          keyboard: false
         });
          this.SuccessData = data; 
          this.totalSuccess = data.SuccessCount;
          this.totalFailed = data.FailedCount;
          this.totalUploaded = ( this.totalSuccess  ?? 0) + (this.totalFailed  ?? 0);
 
        const lines = data.split('\n').filter(line => line.trim() !== '');

        this.totalSuccess = lines.filter(line => line.includes('Destruction succesfully')).length;
        const invalidCount = lines.filter(line => line.includes('Invalid')).length;
        const destroyedCount = lines.filter(line => line.includes('destroyed')).length;
        const OUTCount = lines.filter(line => line.includes('OUT')).length;

        this.totalFailed = invalidCount + destroyedCount + OUTCount;
       
        this.BindHeader(this._FilteredList, this._FilteredList);
 
        this.DataUploadForm.reset();
        this._CSVData = null;
        this.submitted = false;
      });
  }
  else {
    this.ShowErrormessage("please select file");
  }
}


downloadFilestatus(strmsg: any) {
  // Always use this.SuccessData (as before)
  strmsg = this.SuccessData;

  const header = 'CartonNo,Status';

  // Split rows into array
  const lines = strmsg
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  // Map lines to proper CSV columns
  const csvRows = lines.map(line => {
    const splitIndex = line.indexOf(':-');
    let cartonNo = '';
    let status = '';

    if (splitIndex !== -1) {
      cartonNo = line.substring(0, splitIndex).trim();
      status = line.substring(splitIndex + 2).trim();
    } else {
      // Fallback: whole line in status
      status = line;
    }

    // Escape quotes for CSV safety
    cartonNo = cartonNo.replace(/"/g, '""');
    status = status.replace(/"/g, '""');

    return `"${cartonNo}","${status}"`;
  });

  // Combine header + rows
  const csvContent = header + '\n' + csvRows.join('\n');

  // Filename
  const filename = 'Bulk Destruction Upload Status';

  // Create BOM+CSV Blob
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  // Create download link
  const dwldLink = document.createElement("a");
  const url = URL.createObjectURL(blob);

  dwldLink.setAttribute("href", url);
  dwldLink.setAttribute("download", filename + ".csv");
  dwldLink.style.visibility = "hidden";

  document.body.appendChild(dwldLink);
  dwldLink.click();
  document.body.removeChild(dwldLink);

  this.modalRef.hide();
}


convertToCSV(objArray: any[]): string {
  const header = 'CartonNo,Status';
  const rows = objArray.map(obj => {
    const cartonNo = (obj.cartonNo || '').replace(/"/g, '""');
    const status = (obj.status || '').replace(/"/g, '""');
    return `"${cartonNo}","${status}"`;
  });
  return `${header}\n${rows.join('\n')}`;
}


extractCartonNoAndStatus(message: string): { cartonNo: string, status: string } {
  if (!message) {
    return { cartonNo: 'Unknown', status: '' };
  }

  let cartonNo = 'Unknown';
  let status = message.trim();

  const cartonSplit = message.split(' - ');
  if (cartonSplit.length >= 2) {
    const cartonPart = cartonSplit[0].trim();
    status = cartonSplit.slice(1).join(' - ').trim();

    if (cartonPart.toLowerCase().startsWith('cartonno:')) {
      cartonNo = cartonPart.substring('cartonno:'.length).trim();
    }
  }

  return { cartonNo, status };
}



  ShowErrormessage(data: any) {
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

  onFormat(csvRecordsArr: any) {
    //   let dt;

  }

  getDisplayNames(csvRecordsArr: any) {

    //  console.log("csvRecordsArr",csvRecordsArr);

    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    if (headers.length != 1) {
      var msg = 'Invalid No. of Column Expected :- ' + 8;
      this.ShowErrormessage(msg);

      return false;
    }
    this._ColNameList[0] = "cartonNo";
    return true;
  }

downloadFile() {
  const filename = 'Bulk_Destruction';
 
  this.getDestructionDataForDownload().then(() => {
    let csvData = 'cartonNo\n';
 
    this._CSVData.forEach((item: any) => {
      csvData += `${item.cartonNo ?? ''}\n`;
    });
 
    const blob = new Blob(['\ufeff' + csvData], {
      type: 'text/csv;charset=utf-8;',
    });
 
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
 
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  });
  this.logDownloadActivity();
}

logDownloadActivity() {
  const payload = {
    pageName: 'Bulk Destruction',
    activity: 'Download',
    activityDescription: 'User downloaded the Bulk Destruction CSV File.',
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


// downloadFile() {
//   const filename = 'Bulk_Destruction';
//   const csvData = 'cartonNo\n'; // Only header, no data
 
//   const blob = new Blob(['\ufeff' + csvData], {
//     type: 'text/csv;charset=utf-8;'
//   });
 
//   const dwldLink = document.createElement("a");
//   const url = URL.createObjectURL(blob);
 
//   dwldLink.setAttribute("href", url);
//   dwldLink.setAttribute("download", filename + ".csv");
//   dwldLink.style.visibility = "hidden";
//   document.body.appendChild(dwldLink);
//   dwldLink.click();
//   document.body.removeChild(dwldLink);
// }

getDestructionData() {
  const userToken = localStorage.getItem('User_Token');
  const userId = parseInt(localStorage.getItem('UserID'));
 
  const apiUrl = this._global.baseAPIUrl + "BranchInward/GetDestruction";
  const payload = {
    User_Token: userToken,
    UserID: userId
  };
 
  this._onlineExamService.postData(payload, apiUrl).subscribe(
    (data: any) => {
      // this.records = data;
      // this._FilteredList = data;
      this._CSVData = data;
      // this.prepareTableData(data, data);
    },
    (error) => {
      this.toastr.error('Failed to fetch Destruction data', 'Error');
    }
  );
}

getDestructionDataForDownload(): Promise<void> {
  return new Promise((resolve, reject) => {
    const userToken = localStorage.getItem('User_Token');
    const userId = parseInt(localStorage.getItem('UserID'));
 
    const apiUrl = this._global.baseAPIUrl + "BranchInward/GetDestruction";
    const params = new HttpParams()
      .set('User_Token', userToken)
      .set('UserID', userId.toString());
 
    this._onlineExamService.getData(apiUrl, params).subscribe(
      (data: any) => {
        this._CSVData = data;
        resolve();
      },
      (error) => {
        this.toastr.error('Failed to fetch Destruction data', 'Error');
        reject();
      }
    );
  });
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
  // PHONE KA CHARGE GAYA EK MIN
  prepareTableDataForCSV(tableData) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'cartonNo', header: 'CARTON NO', index: 2 },
    ];
    // console.log("this.formattedData", tableData);
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'cartonNo': el[0],
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
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'cartonNo', header: 'CARTON NO', index: 2 },
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'cartonNo': el[0],
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
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'cartonNo', header: 'CARTON NO', index: 2 },
    ];
    this.headerList = tableHeader;
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


  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }




}
