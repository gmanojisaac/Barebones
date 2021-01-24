import { TreeData, DialogData } from '../nested-tree.component';
import { Component, Inject, Output, AfterViewInit, EventEmitter, Input,ChangeDetectionStrategy } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserdataService,MainSectionGroup } from '../../service/userdata.service';


@Component({
  selector: 'app-add-node',
  changeDetection:ChangeDetectionStrategy.OnPush,
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.scss']
})
export class AddNodeComponent implements AfterViewInit {
  @Input() isTop: boolean;
  @Input() latestaddProject: string;  
  @Input() currentNode: TreeData;
  @Input() AlltheKeys:any[];

  name: string;
  description: string;

  constructor(public dialog: MatDialog,
    public developmentservice: UserdataService) {}

  openDialog(): void {
    console.log('27',this.latestaddProject);
    const dialogRef = this.dialog.open(NewNodeDialog, {
      width: '250px',
      data: {nodeName: this.name, nodeDescription: this.description, Component: 'Add'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.isTop) {
          const node: TreeData = {
            Id: null,
            Name: result.nodeName,
            Description: 'Parent',
            Children: []
          };
          this.AlltheKeys.push({name:result.nodeName, disabled: false, section:[] });
          this.developmentservice.addMainSection(this.latestaddProject, this.AlltheKeys).then(success=>{
          });
        } else {
          const node: TreeData = {
            Id: null,
            Name: result.nodeName,
            Description: 'Child',
            Children: []
          };
          this.AlltheKeys.forEach(mainsec=>{
            if(mainsec.name === this.currentNode.Name){
              mainsec.section.push({viewvalue:node.Name});
            }
          });
          this.developmentservice.addSubSection(this.latestaddProject,this.currentNode.Name,node.Name,  this.AlltheKeys).then(success=>{
          });
        }
      }
    });
  }
  ngAfterViewInit() {
  }

}

@Component({
  selector: 'app-new-node',
  templateUrl: '../node-dialog/node-dialog.html'
})
export class NewNodeDialog {

  constructor(
    public dialogRef: MatDialogRef<NewNodeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
