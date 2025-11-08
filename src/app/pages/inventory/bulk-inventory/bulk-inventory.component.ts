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
  selector: "app-bulk-inventory",
  templateUrl: "./bulk-inventory.component.html",
  styleUrls: ["./bulk-inventory.component.scss"],
})
export class BulkInventoryComponent implements OnInit {
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
  public records: any[] = [];
  _ColNameList = [];
  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {
    this.AddFileInwardForm = this.formBuilder.group({
      batchId: ["", Validators.required],
      department: ["", Validators.required],
      file: [""],
      User_Token: localStorage.getItem("User_Token"),
      UserID: localStorage.getItem("UserID"),
    });
    if (this.formattedData && this.formattedData.length > 0) {
      const deptValue = this.formattedData[0].departmentId;
      console.log("rbfiufhfiuhfiuh", deptValue);
      if (deptValue) {
        this.AddFileInwardForm.patchValue({
          department: deptValue
        });
      }
    }

    this.GetBatchID();
    this.getCartonDetails();
    this.GetBatchDetails();
    this.prepareTableData([], []);
    this.fileBarcodeList = [];
  }

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


  get FormControls() {
    return this.AddFileInwardForm.controls;
  }

  downloadCSV() {

    const filename = "InventoryUpload_Format_CSV";
    let csvData = "cartonNo,documentType,detailDocumentType";
    let blob = new Blob(["\ufeff" + csvData], {
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
  }





  downloadFile(strmsg: any) {
    const filename = 'File upload status';
    let blob = new Blob(['\ufeff' + strmsg], {
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

  convertToCSV(objArray: any[]) {
    const header = 'CartonNo,Status';

    const rows = objArray
      .map(obj => {
        const message = obj.message || '';
        const parsed = this.extractCartonNoAndStatus(message);

        const cartonNo = parsed.cartonNo?.replace(/"/g, '""'); // escape double quotes
        const status = parsed.status?.replace(/"/g, '""');     // escape double quotes

        return `"${cartonNo}","'${status}"`;  // prefix status with single quote to force Excel to treat as text
      })
      .join('\n');

    return `${header}\n${rows}`;
  }
  _CSVData: any;
  _IndexList: any;


  async SaveData() {
    debugger;
    this.submitted = true;
    if (this.AddFileInwardForm.valid) {
      if (!this.records || this.records.length === 0) {
        this.ShowErrormessage("Invalid data found. Upload rejected.");
        this.submitted = false;
        return;
      }

      const apiUrl = this._global.baseAPIUrl + "BranchInward/AddUpdateBulkInventory";
     const formValue = this.AddFileInwardForm.getRawValue();

      const payload = {
        ...formValue,
        documentType: formValue.documentType?.name || formValue.documentType,
        detailDocumentType: formValue.detailDocumentType?.name || formValue.detailDocumentType,
        file: this.records.map(r => `${r.cartonNo},${r.documentTypeName},${r.detailDocumentTypeName}`)
      };

    console.log("oiofij", payload);

      await this._onlineExamService.postData(payload, apiUrl).subscribe(
        (response: any) => {
          let parsedMessages = [];
          try {
            parsedMessages = typeof response === 'string' ? JSON.parse(response) : response;
          } catch (e) {
            this.toastr.error('Unexpected response from server.', 'Error', {
              positionClass: 'toast-top-center',
              timeOut: 3000,
              closeButton: true,
            });
            this.submitted = false;
            return;
          }

          let errorCount = 0;
          let successCount = 0;

          parsedMessages.forEach((msgObj: any) => {
            const rawMsg = (msgObj.message || '').trim();
            const msgLower = rawMsg.toLowerCase();

            const isError = msgLower.includes('already exist') || msgLower.includes('invalid') || msgLower.includes('missing') || msgLower.includes('mapped');
            if (isError) {
              errorCount++;
            } else {
              successCount++;
            }
          });

          const csvData = this.convertToCSV(parsedMessages);
          this.downloadFile(csvData);

          // Show global toast
          const toastOptions = {
            positionClass: 'toast-top-center',
            timeOut: 3000,
            closeButton: true,
          };

          if (successCount > 0 && errorCount > 0) {
            this.ShowMessage("uploaded successfully. Please refer to the Inventory Status Report for details.");
          } else if (successCount === 0 && errorCount > 0) {
            this.ShowMessage("Uploaded successfully. Please refer to the Inventory Status Report for details.");
          } else if (successCount > 0 && errorCount === 0) {
            this.ShowMessage("Uploaded successfully! Check the file status report.");
          }

          // Reset form if successful
          if (successCount > 0) {
            this.GetBatchDetails();
            this.fileBarcodeList = [];
            this.AddFileInwardForm.controls['cartonNo'].setValue('');
            this.AddFileInwardForm.controls['detailDocumentType'].setValue('');
            this.OnReset();
          }

          this.submitted = false;
        },
        (error) => {
          this.toastr.error('Failed to save data.', 'Server Error', {
            positionClass: 'toast-top-center',
            timeOut: 3000,
            closeButton: true,
          });
          this.submitted = false;
        }
      );

      this.location.back();
    }
  }

  isValidDoc(value: string): boolean {
    if (!value) return false;

    value = value.trim();

    // Must contain only allowed characters (anything except comma)
    const allowedChars = /^[^,]+$/;
    if (!allowedChars.test(value)) return false;

    // Must contain at least one letter (English or Chinese)
    const hasLetter = /[a-zA-Z\u4e00-\u9fff]/.test(value);
    if (!hasLetter) return false;

    return true;
  }


  // uploadListener($event: any): void {
  //   debugger;
  //   const files = $event.srcElement.files;
  //   if (!files || files.length === 0) {
  //     this.toastr.error("No file selected.", "Error", {
  //       positionClass: "toast-top-center",
  //       timeOut: 3000,
  //       closeButton: true,
  //     });
  //     return;
  //   }

  //   if (this.isValidCSVFile(files[0])) {
  //     const input = $event.target;
  //     const reader = new FileReader();

  //     $(".selected-file-name").html(input.files[0].name);
  //     reader.readAsText(files[0]);

  //     reader.onload = () => {
  //       const csvData = reader.result;
  //       let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
  //       csvRecordsArray = csvRecordsArray.filter(line => line.trim() !== '');

  //       if (!csvRecordsArray || csvRecordsArray.length <= 1) {
  //         this.ShowErrormessage("No data found in CSV File.");
  //         this.fileReset();
  //         return;
  //       }

  //       const headersRow = this.getHeaderArray(csvRecordsArray);
  //       this._CSVData = csvRecordsArray;
  //       this._IndexList = csvRecordsArray;

  //       const validFile = this.getDisplayNames(csvRecordsArray);

  //       if (!validFile) {
  //         this.fileReset();
  //         return;
  //       }

  //       const headerLength = headersRow.length;
  //       const csvRawRecords = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headerLength);

  //      console.log("headersRow",headersRow);
  // console.log("csvRawRecords",csvRawRecords);
  //       // Carton No validation using regex: only letters, numbers, dash (-), and slash (/)
  //       const cartonNoRegex = /^[a-zA-Z0-9\-\/()]+$/;
  //       const validRecords = [];
  //       const invalidCartons: string[] = [];

  //       for (let i = 0; i < csvRawRecords.length; i++) {
  //         const cartonNo = csvRawRecords[i][0]?.trim(); // assuming first column is cartonNo
  //         if (!cartonNo || !cartonNoRegex.test(cartonNo)) {
  //           invalidCartons.push(cartonNo || `Row ${i + 2}`);
  //           continue; // skip invalid row
  //         }
  //         validRecords.push(csvRawRecords[i]); // only push valid rows
  //       }
  // if (invalidCartons.length > 0) {
  //   this.ShowErrormessage(
  //     "Invalid carton numbers found. Only letters, numbers, dash (-), and slash (/) are allowed."
  //   );
  // }


  //       if (validRecords.length === 0) {
  //         this.ShowErrormessage("No valid data found in CSV File.");
  //         this.fileReset();
  //         return;
  //       }

  //       const batchId = this.AddFileInwardForm.controls['batchId']?.value;
  //       const departmentId = this.AddFileInwardForm.controls['department']?.value;
  //       const department = this.departmentDropdown.find((d: any) => d.value == departmentId);
  //       const departmentName = department?.label;

  //       this.records = validRecords.map((row, index) => {
  //         return {
  //           srNo: index + 1,
  //           cartonNo: row[0],
  //           batchId: batchId,
  //           departmentName: departmentName,
  //           documentTypeName: row[1],
  //           detailDocumentTypeName: row[2],
  //           status: "Pending"
  //         };
  //       });

  //       this._FilteredList = this.records;
  //       this.prepareTableData(this._FilteredList, this._FilteredList);

  //       (<HTMLInputElement>document.getElementById('csvReader')).value = '';
  //     };

  //     reader.onerror = () => {
  //       this.toastr.error("Error reading file!", "File Read Error", {
  //         positionClass: "toast-top-center",
  //         timeOut: 3000,
  //         closeButton: true,
  //       });
  //     };

  //   } else {
  //     this.toastr.show(
  //       '<div class="alert-text"></div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please Select A Valid CSV File And Template</span></div>',
  //       "",
  //       {
  //         timeOut: 3000,
  //         closeButton: true,
  //         enableHtml: true,
  //         tapToDismiss: false,
  //         titleClass: "alert-title",
  //         positionClass: "toast-top-center",
  //         toastClass: "ngx-toastr alert alert-dismissible alert-danger alert-notify",
  //       }
  //     );
  //     this.fileReset();
  //   }
  // }


  uploadListener($event: any): void {
    debugger;
    const files = $event.srcElement.files;
    if (!files || files.length === 0) {
      this.toastr.error("No file selected.", "Error", {
        positionClass: "toast-top-center",
        timeOut: 3000,
        closeButton: true,
      });
      return;
    }

    if (this.isValidCSVFile(files[0])) {
      const input = $event.target;
      const reader = new FileReader();

      $(".selected-file-name").html(input.files[0].name);
      reader.readAsText(files[0]);

      reader.onload = () => {
        const csvData = reader.result;
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
        csvRecordsArray = csvRecordsArray.filter(line => line.trim() !== '');

        if (!csvRecordsArray || csvRecordsArray.length <= 1) {
          this.ShowErrormessage("No data found in CSV File.");
          this.fileReset();
          return;
        }

        const headersRow = this.getHeaderArray(csvRecordsArray);
        this._CSVData = csvRecordsArray;
        this._IndexList = csvRecordsArray;

        const validFile = this.getDisplayNames(csvRecordsArray);

        if (!validFile) {
          this.fileReset();
          return;
        }

        const headerLength = headersRow.length;
        const templen = csvRecordsArray.length; 
        const csvRawRecords = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headerLength);

        console.log("headersRow", headersRow);
        console.log("csvRawRecords", csvRawRecords);

        // Validation regexes
        const cartonNoRegex = /^[^,]+$/;
        const docRegex = /^(?=.*[\p{L}])[0-9\p{L}\-\/()]+$/u;

        const validRecords = [];
        const invalidRows: string[] = [];

        for (let i = 0; i < csvRawRecords.length; i++) {
          const cartonNo = csvRawRecords[i][0]?.trim();
          const docType = csvRawRecords[i][1]?.trim();
          const detailDocType = csvRawRecords[i][2]?.trim();

          if (!cartonNo || !cartonNoRegex.test(cartonNo) ||
            !this.isValidDoc(docType) || !this.isValidDoc(detailDocType)) {
            invalidRows.push(`Row ${i + 2}`);
            continue;
          }

          validRecords.push(csvRawRecords[i]); // push valid row
        }
        debugger;
        if (validRecords.length < (templen -2)) {
          this.ShowErrormessage(
            "Invalid data in CSV File."
          );
        }

        if (validRecords.length === 0) {
          this.ShowErrormessage("No valid data found in CSV File.");
          this.fileReset();
          return;
        }

        const batchId = this.AddFileInwardForm.controls['batchId']?.value;
        const departmentId = this.AddFileInwardForm.controls['department']?.value;
        const department = this.departmentDropdown.find((d: any) => d.value == departmentId);
        const departmentName = department?.label;

        this.records = validRecords.map((row, index) => {
          return {
            srNo: index + 1,
            cartonNo: row[0],
            batchId: batchId,
            departmentName: departmentName,
            documentTypeName: row[1],
            detailDocumentTypeName: row[2],
            status: "Pending"
          };
        });

        this._FilteredList = this.records;
        this.prepareTableData(this._FilteredList, this._FilteredList);

        (<HTMLInputElement>document.getElementById('csvReader')).value = '';
      };

      reader.onerror = () => {
        this.toastr.error("Error reading file!", "File Read Error", {
          positionClass: "toast-top-center",
          timeOut: 3000,
          closeButton: true,
        });
      };

    } else {
      this.toastr.show(
        '<div class="alert-text"></div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please Select A Valid CSV File And Template</span></div>',
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
      this.fileReset();
    }
  }





  fileReset() {
    this.records = [];
  }
  getDisplayNames(csvRecordsArr: any) {

    //  console.log("csvRecordsArr",csvRecordsArr);

    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    if (headers.length != 3) {
      var msg = 'Invalid No. of Column Expected :- ' + 8;
      this.ShowErrormessage(msg);

      return false;
    }
    // this._ColNameList[0] = "batchId";
    this._ColNameList[0] = "cartonNo";
    // this._ColNameList[0] = "departmentName";
    this._ColNameList[1] = "documentType";
    this._ColNameList[2] = "detailDocumentType";
    // this._ColNameList[0] = "status";
    return true;
  }
  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }
  getHeaderArray(csvRecordsArr: any) {
    var headers;
    headers = ['cartonNo', 'documentType', 'detailDocumentType'];

    return headers;
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
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file && file.type === "text/csv") {
      const reader = new FileReader();

      reader.onload = () => {
        const text = reader.result as string;
        const lines: string[] = text
          .split(/\r?\n/)
          .filter((line) => line.trim() !== "");
        this.AddFileInwardForm.controls["file"].setValue(lines);
      };

      reader.readAsText(file);
    } else {
      console.error("Please upload a valid .csv file");
    }
  }
  extractCartonNoAndStatus(message: string): { cartonNo: string, status: string } {
    if (!message) {
      return { cartonNo: 'Unknown', status: '' };
    }

    const match = message.match(/CartonNo\s*:\s*(\S+)\s*(.*)/i);

    if (match) {
      const cartonNo = match[1].trim();
      const status = match[2].trim();
      return { cartonNo, status };
    }

    return { cartonNo: 'Unknown', status: message.trim() };
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

  AllData: any;
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



  getDocumentdetails() {
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchInward/getDocumentdetails?user_Token=" +
      localStorage.getItem("User_Token") +
      "&appl=" +
      this.AddFileInwardForm.get("appl").value +
      "&apac=" +
      this.AddFileInwardForm.get("apac").value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this.document_typeList = data;
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
      { field: "detailDocumentType", header: "DETAIL DOCUMENT TYPE", index: 3 },
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

    if (this.formattedData.length > 0) {
      const deptName = this.formattedData[0].department;

      const deptItem = this.departmentDropdown.find(
        d => d.label.toLowerCase() === deptName.toLowerCase()
      );

      if (deptItem) {
        this.AddFileInwardForm.patchValue({
          department: deptItem.value
        });

        this.AddFileInwardForm.get('department')?.disable();
      }
    }


  }



  PackCarton() {
    this.AddFileInwardForm.reset();
    this.AddFileInwardForm = this.formBuilder.group({
      request_id: [this.route.snapshot.params["REQ"]],
      document_type: ["", Validators.required],
      lan_no: ["", Validators.required],
      carton_no: [
        "",
        [Validators.required, Validators.minLength(7), Validators.maxLength(7)],
      ],
      file_no: [
        "",
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
      ],
      User_Token: localStorage.getItem("User_Token"),
      userid: localStorage.getItem("UserID"),
    });
  }

  // DeleteRecord(car) {
  //   if (confirm("Are You Sure ?")) {
  //     const apiUrl = this._global.baseAPIUrl + "BranchInward/DeleteBatchDetails";
  //     this._onlineExamService
  //       .postData(
  //         {
  //           ...this.AddFileInwardForm.value,
  //           id: car.id,
  //         },
  //         apiUrl
  //       )
  //       .subscribe((data: {}) => {
  //         this.GetBatchDetails();
  //       });
  //   }
  // }
  DeleteRecord(car: any) {
    swal
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning", // Use 'icon' instead of 'type'
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonClass: "btn btn-danger",
        confirmButtonText: "Yes, delete it!",
        cancelButtonClass: "btn btn-secondary",
      })
      .then((result) => {
        if (result.value) {
          const formValues = {
            id: car.id,
            carton_number: car.cartonNo,
            User_Token: localStorage.getItem('User_Token'),
          };

          const apiUrl = this._global.baseAPIUrl + 'BranchInward/DeleteBatchDetails';
          this._onlineExamService.postData(formValues, apiUrl)
            .subscribe((data: any) => {
              swal.fire({
                title: "Deleted!",
                text: "Record has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });
              this.GetBatchDetails();
            });
        }
      });
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
    // this.AddFileInwardForm.controls["document_type"].setValue("");
    // this.AddFileInwardForm.controls["lan_no"].setValue("");
    // this.AddFileInwardForm.controls["carton_no"].setValue("");
    // this.AddFileInwardForm.controls["file_no"].setValue("");
    // this.getCartonNumber()
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
}
