import { TreeData, DialogData } from '../nested-tree.component';
import { Component, Inject, Output, AfterViewInit, EventEmitter, Input,ChangeDetectionStrategy } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserdataService,MainSectionGroup } from '../../service/userdata.service';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-add-node',
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.scss']
})
export class AddNodeComponent implements AfterViewInit {
  @Input() isTop: boolean;
  @Input() latestaddProject: string;  
  @Input() currentNode: TreeData;
  @Input() AlltheKeys:any[];
  @Input() masterdata: any;
  @Output() changemyorder = new EventEmitter;
  name: string;
  description: string;
  options: string[] = [];
  constructor(public dialog: MatDialog,
    public developmentservice: UserdataService) {
    }

  openDialog(): void {
    this.options=[];
    console.log('isTop',this.isTop,'latestaddProject',this.latestaddProject,'currentNode',this.currentNode,'AlltheKeys', this.AlltheKeys,'masterdata',this.masterdata);
    if(this.isTop){
      this.masterdata.forEach(mykey=>{
        this.options.push(mykey.Name);
      });
    }else{
      this.currentNode.Children.forEach(mykey=>{
        this.options.push(mykey.Name);
      });  
    }

    const dialogRef = this.dialog.open(NewNodeDialog, {
      width: '250px',
      data: {nodeName: this.name,  Component: 'Add',filterValues:this.options}
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
  selector: 'app-new-node',
  templateUrl: '../node-dialog/node-dialog.html'
})
export class NewNodeDialog {
  myControl = new FormControl();
  filteredOptions: Observable<string[]>;
  constructor(
    public dialogRef: MatDialogRef<NewNodeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      console.log('112',data);
    }

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
}



