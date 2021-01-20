import { Component, OnInit, Input,AfterViewInit,ChangeDetectionStrategy} from '@angular/core';
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import {of as observableOf} from 'rxjs';
import { map, filter } from 'rxjs/operators';

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
  changeDetection:ChangeDetectionStrategy.OnPush,
  templateUrl: './nested-tree.component.html',
  styleUrls: ['./nested-tree.component.scss']
})
export class NestedTreeComponent implements OnInit,AfterViewInit {
  @Input() Sections: Observable<any>;
  @Input() latestProject: string;
  nestedTreeControl: NestedTreeControl<TreeData>;
  nestedDataSource: MatTreeNestedDataSource<TreeData>;
  AddedMainSec=false;
  dataObject: any;
  mydata: any;
  Project='';
  AlltheKeys:any[];
  constructor(   ) {
    this.nestedTreeControl = new NestedTreeControl<TreeData>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this._dataChange.subscribe(
      data => (this.nestedDataSource.data = data)
    );
   }

  ngOnInit(): void {

  }
  _dataChange = new BehaviorSubject<TreeData[]>([]);
  private _getChildren = (node: TreeData) => observableOf(node.Children);
  hasNestedChild = (_: number, nodeData: TreeData) => nodeData.Children.length > 0;

  refreshTreeData() {
    const data = this.nestedDataSource.data;
    this.nestedDataSource.data = null;    
    this.nestedDataSource.data = data;
  }

  addNode(node: TreeData) {
    this.AddedMainSec=true;
    node.Id = this.findNodeMaxId(this.nestedDataSource.data) + 1;
    node.Children=[];
    this.nestedDataSource.data.push(node);

    this.refreshTreeData();
  }

  addChildNode(childrenNodeData) {
    this.AddedMainSec=false;
    childrenNodeData.node.Children=null;
    childrenNodeData.node.Id = this.findNodeMaxId(this.nestedDataSource.data) + 1;
    childrenNodeData.currentNode.Children.push(childrenNodeData.node);
    this.refreshTreeData();
  }



  editNode(nodeToBeEdited) {
    const fatherElement: TreeData = this.findFatherNode(nodeToBeEdited.currentNode.Id, this.nestedDataSource.data);
    let elementPosition: number;
    nodeToBeEdited.node.Id = this.findNodeMaxId(this.nestedDataSource.data) + 1;
    if (fatherElement[0]) {
       fatherElement[0].Children[fatherElement[1]] = nodeToBeEdited.node;
   } else {
       elementPosition = this.findPosition(nodeToBeEdited.currentNode.Id, this.nestedDataSource.data);
       this.nestedDataSource.data[elementPosition] = nodeToBeEdited.node;
   }
    this.refreshTreeData();
  }
  deleteNode(nodeToBeDeleted: TreeData) {
    const deletedElement: TreeData = this.findFatherNode(nodeToBeDeleted.Id, this.nestedDataSource.data);
    let elementPosition: number;
    if (window.confirm('Are you sure you want to delete ' + nodeToBeDeleted.Name + '?' )) {
        if (deletedElement[0]) {
          deletedElement[0].Children.splice(deletedElement[1], 1);
        } else {
          elementPosition = this.findPosition(nodeToBeDeleted.Id, this.nestedDataSource.data);
          this.nestedDataSource.data.splice(elementPosition, 1);
      }
      this.refreshTreeData();
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
    // Parse the string to json object.
    this.Sections.pipe(filter(myobj => myobj !== null), map((data: any) => {
      this.AlltheKeys=data;
      let AllSections = {};
      let SubSection = {};
      data.forEach(element => {
        AllSections[element.name] = {};

        let Subindex = 1;
        element.section.forEach(subelement => {
          SubSection[Subindex] = subelement.viewvalue;
          Subindex++;
        });
        AllSections[element.name] = SubSection;
        SubSection = {};
      });
     
     this.dataObject = JSON.parse(JSON.stringify(AllSections));
     this.mydata = this.buildFileTree(this.dataObject, 0);
     this._dataChange.next(this.mydata);

    })).subscribe(_ => {
    });
  }
  buildFileTree(
    obj: { [key: string]: any },
    level: number,
    parentId: string = "0"
  ): TreeData[] {
    return Object.keys(obj).reduce<TreeData[]>((accumulator, key, idx) => {
      const value = obj[key];
      const node: TreeData = {
        Id: null,
        Name: '',
        Description: '',
        Children: []
      };
      node.Name = key;
      node.Id =  Number(idx);
      /**
       * Make sure your node has an id so we can properly rearrange the tree during drag'n'drop.
       * By passing parentId to buildFileTree, it constructs a path of indexes which make
       * it possible find the exact sub-array that the node was grabbed from when dropped.
       */
      //node.id = `${parentId}/${idx}`;

      if (value != null) {
        if (typeof value === "object") {
          node.Description='Parent';
          node.Children = this.buildFileTree(value, level + 1, node.Id.toString());
        } else {
          node.Children=[];
          node.Description='Child';
          node.Name = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }
  ngAfterViewInit() {
    //this.tree.treeControl.expandAll();
    this.initialize();
    console.log('193',this.AlltheKeys);
    this.Project= this.latestProject;


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
