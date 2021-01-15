import { TreeData, DialogData } from '../nested-tree.component';
import { Component, ChangeDetectionStrategy,Inject, Output, EventEmitter, Input } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.scss']
})
export class AddNodeComponent {
  @Input() isTop: boolean;
  @Input() currentNode: TreeData;
  @Output() addedNode = new EventEmitter;
  name: string;
  description: string;

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
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
          this.addedNode.emit(node);
        } else {
          const node: TreeData = {
            Id: null,
            Name: result.nodeName,
            Description: 'Child',
            Children: []
          };
          this.addedNode.emit({currentNode: this.currentNode, node: node});
        }
      }
    });
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
