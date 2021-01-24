import { Component, OnInit, Input, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { of as observableOf } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { UserdataService, MainSectionGroup } from '../service/userdata.service';


export class TreeData {
  Id: number;
  Name: string;
  Description?: string;
  Children: TreeData[];
}

export interface DialogData {
  Name: string;
  Description: string;
  Component: string;
}


@Component({
  selector: 'app-nested-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nested-tree.component.html',
  styleUrls: ['./nested-tree.component.scss']
})
export class NestedTreeComponent implements OnInit, AfterViewInit {
  @Input() Sections: Observable<any>;
  @Input() latestProject: string;
  nestedTreeControl: NestedTreeControl<TreeData>;
  nestedDataSource: MatTreeNestedDataSource<TreeData>;
  AddedMainSec = false;
  dataObject: any;
  mydata: any;
  Project = '';
  AlltheKeys: any[];
  AlltheKeysbk: any[];
  _dataChange = new BehaviorSubject<TreeData[]>([]);
  private _getChildren = (node: TreeData) => observableOf(node.Children);
  hasNestedChild = (_: number, nodeData: TreeData) => nodeData.Children.length > 0;

  constructor(
    public developmentservice: UserdataService) {
    this.nestedTreeControl = new NestedTreeControl<TreeData>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this._dataChange.subscribe(
      data => (this.nestedDataSource.data = 
        [{
          Id: 1,
          Name: 'John Heart ',
          Description: 'Father 1',
          Children: []
        }])
    );
  }

  ngOnInit(): void {

  }

  refreshTreeData() {
    const data = this.nestedDataSource.data;
    this.nestedDataSource.data = null;
    this.nestedDataSource.data = data;
  }

  editNode(nodeToBeEdited) {
    const fatherElement: TreeData = this.findFatherNode(nodeToBeEdited.currentNode.Id, this.nestedDataSource.data);
    nodeToBeEdited.node.Id = this.findNodeMaxId(this.nestedDataSource.data) + 1;
    if (fatherElement[0]) {
      this.AlltheKeys.forEach((mainsec, myindex) => {
        if (mainsec.name === fatherElement[0].Name) {
          this.AlltheKeys[myindex].section.forEach((subsec, mysubindex) =>{
            if (subsec.viewvalue === nodeToBeEdited.currentNode.Name) {
              this.AlltheKeys[myindex].section[mysubindex].viewvalue=nodeToBeEdited.node.Name;
            }
          });
        }
      });
      this.developmentservice.updateSubSection(this.latestProject, fatherElement[0].Name, nodeToBeEdited.currentNode.Name, this.AlltheKeys);
    
    } else {
        //parent
      this.AlltheKeys.forEach((mainsec, myindex) => {
          if (mainsec.name === nodeToBeEdited.currentNode.Name) {
            this.AlltheKeys[myindex].name = nodeToBeEdited.node.Name;
          }          
        });
        this.developmentservice.UpdateMainSection(this.latestProject, this.AlltheKeys);
    }    
    this.refreshTreeData();
    this.AlltheKeys= this.AlltheKeysbk;
  }

  deleteNode(nodeToBeDeleted: any) {
    let elementPosition: number;
    const deletedElement: TreeData = this.findFatherNode(nodeToBeDeleted.currentNode.Id, this.nestedDataSource.data);
    if (window.confirm('Are you sure you want to delete ' + nodeToBeDeleted.currentNode.Name + '?')) {
      if(deletedElement[0]){
      //child
      //console.log(deletedElement[0]);
      this.AlltheKeys.forEach((mainsec, myindex) => {
        if (mainsec.name === deletedElement[0].Name) {
          this.AlltheKeys[myindex].section = mainsec.section.filter(mysubkeys => mysubkeys.viewvalue !== nodeToBeDeleted.currentNode.Name);
        }
      });
      this.developmentservice.deleteSubSection(this.latestProject, deletedElement[0].Name, nodeToBeDeleted.currentNode.Name, this.AlltheKeys);
    
      }else{
        //parent
        this.AlltheKeys.forEach((mainsec) => {
          if (mainsec.name === nodeToBeDeleted.currentNode.Name) {
            this.AlltheKeys = this.AlltheKeys.filter(myMainkey => myMainkey.name !== nodeToBeDeleted.currentNode.Name);
          }         
        });
        this.developmentservice.deleteMainSection(this.latestProject, this.AlltheKeys);
      }    
      this.refreshTreeData();
      this.AlltheKeys= this.AlltheKeysbk;
    }    
  }

  flatJsonArray(flattenedAray: Array<TreeData>, node: TreeData[]) {
    const array: Array<TreeData> = flattenedAray;
    node.forEach(element => {
      if (element.Children) {
        array.push(element);
        this.flatJsonArray(array, element.Children);
      }
    });
    return array;
  }

  findNodeMaxId(node: TreeData[]) {
    const flatArray = this.flatJsonArray([], node);
    const flatArrayWithoutChildren = [];
    flatArray.forEach(element => {
      flatArrayWithoutChildren.push(element.Id);
    });
    return Math.max(...flatArrayWithoutChildren);
  }

  findPosition(id: number, data: TreeData[]) {
    for (let i = 0; i < data.length; i += 1) {
      if (id === data[i].Id) {
        return i;
      }
    }
  }
  initialize() {

    this.Sections.pipe(filter(myobj => myobj !== null), map((data: any) => {
      this.nestedDataSource.data=        [{
        Id: 1,
        Name: 'John Heart ',
        Description: 'Father 1',
        Children: []
      }];
      this.Project = this.latestProject;
      this.AlltheKeys = data;
      this.AlltheKeysbk=data;
      data.forEach(element => {
        const node: TreeData = {
          Id: this.findNodeMaxId(this.nestedDataSource.data) + 1,
          Name: element.name,
          Description: 'Parent',
          Children: []
        };
        this.addNode(node);
        element.section.forEach(subelement=>{
          const childnode: TreeData = {
            Id: null,
            Name: subelement.viewvalue,
            Description: 'Child',
            Children: []
          };
          this.addChildNode({currentNode:node, node: childnode});
        });
      });
    })).subscribe(_ => {
      let elementPosition: number;
      const node: TreeData = {
        Id: 1,
        Name:'as',
        Description: 'Parent',
        Children: []
      };
      elementPosition = this.findPosition(1, this.nestedDataSource.data);
      this.nestedDataSource.data.splice(elementPosition, 1);
      this.refreshTreeData();
    });
  }

  ngAfterViewInit() {
    this.initialize();
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

  
  addNode(node: TreeData) {
    node.Id = this.findNodeMaxId(this.nestedDataSource.data) + 1;
    this.nestedDataSource.data.push(node);
    this.refreshTreeData();
  }

  addChildNode(childrenNodeData) {
    childrenNodeData.node.Id = this.findNodeMaxId(this.nestedDataSource.data) + 1;
    childrenNodeData.currentNode.Children.push(childrenNodeData.node);
    this.refreshTreeData();
  }
}
