
import { Component, Inject, OnInit, TemplateRef } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-pod-Ack",
  templateUrl: "pod-Ack.component.html",
  styleUrls : ["pod-Ack.component.css"]
})
export class PodAckComponent implements OnInit {

 AllData:any

  constructor(
    private dialogref:MatDialogRef<PodAckComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){
    this.AllData=data
  }
  ngOnInit(){
    
    
  
  }
  close(){
this.dialogref.close()
  }

}
