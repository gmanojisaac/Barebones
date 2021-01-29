import { Component, Input,OnInit, Output, EventEmitter, Inject,ChangeDetectionStrategy } from '@angular/core';
import { TreeData, DialogData } from '../nested-tree.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-edit-node',
  templateUrl: './edit-node.component.html',
  styleUrls: ['./edit-node.component.scss']
})
export class EditNodeComponent {
  @Input() checkTop: string;
  @Input() currentNode: TreeData;
  @Input() masterdata: any;
  @Output() edittedNode = new EventEmitter;

  options: string[] = [];
  constructor(public dialog: MatDialog) {}
  openDialog(): void {
    this.options=[];
    const fatherElement: TreeData = this.findFatherNode(this.currentNode.Id, this.masterdata);
    if(fatherElement[0]){
      fatherElement[0].Children.forEach(mykey=>{
        this.options.push(mykey.Name);
      });      
    }else{
      this.masterdata.forEach(mykey=>{
        this.options.push(mykey.Name);
      });
    }
    const dialogRef = this.dialog.open(EditNodeDialog, {
      width: '250px',
      data: {Name: this.currentNode.Name, Description: this.currentNode.Description, Component: 'Edit',filterValues:this.options}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        const node: TreeData = {
          Id: null,
          Name: result.nodeName,
          Description: this.currentNode.Description,
          Children: this.currentNode.Children
        };
        this.edittedNode.emit({currentNode: this.currentNode, node: node});
      }
    });
  }
  findFatherNode(id: number, data: TreeData[]) {
    for (let i = 0; i < data.length; i += 1) {
      const currentFather = data[i];
      for (let z = 0; z < currentFather.Children.length; z += 1) {
        if (id === currentFather.Children[z]['Id']) {
          return [currentFather, z];
        }
      }
      for (let z = 0; z < currentFather.Children.length; z += 1) {
        if (id !== currentFather.Children[z]['Id']) {
          const result = this.findFatherNode(id, currentFather.Children);
          if (result !== false) {
            return result;
          }
        }
      }
    }
    return false;
  }
}

@Component({
  selector: 'app-edit-node-dialog',
  styles:[`
  .example-form {
    min-width: 150px;
    max-width: 500px;
    width: 100%;
  }
  
  .example-full-width {
    width: 100%;
  }
  `],
  templateUrl: '../node-dialog/node-dialog.html',
})

export class EditNodeDialog implements OnInit {
  myControl = new FormControl();
  filteredOptions: Observable<string[]>;
  constructor(
    public dialogRef: MatDialogRef<EditNodeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.data.filterValues.filter(option => option.toLowerCase().includes(filterValue));
  }
  displayFn(item: any): string {
    console.log(item);
    return item ;
  }
}