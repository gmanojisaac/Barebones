import { Component, OnInit, Input} from '@angular/core';
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import {of as observableOf} from 'rxjs';

export interface TreeData {
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
  templateUrl: './nested-tree.component.html',
  styleUrls: ['./nested-tree.component.scss']
})
export class NestedTreeComponent implements OnInit {
  @Input() Sections: Observable<any>;
  nestedTreeControl: NestedTreeControl<TreeData>;
  nestedDataSource: MatTreeNestedDataSource<TreeData>;
  AddedMainSec=false;
  constructor(   ) { }

  ngOnInit(): void {
    this.nestedTreeControl = new NestedTreeControl<TreeData>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this._dataChange.subscribe(
      data => (this.nestedDataSource.data = data)
    );
  }
  _dataChange = new BehaviorSubject<TreeData[]>(
    [{
      Id: 1,
      Name: 'John Heart 1',

      Children: [
        {
          Id: 3,
          Name: 'Ken Bond 1',

          Children: []
        },
        {
          Id: 4,
          Name: 'Ken Bond 2',

          Children: []
        }
      ]
    },
    {
      Id: 2,
      Name: 'John Heart 2',

      Children: [
        {
          Id: 6,
          Name: 'Ken Bond 1',

          Children: []
        }
      ]
    }
  ]
  );
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
    this.nestedDataSource.data.push(node);
    this.refreshTreeData();
  }

  addChildNode(childrenNodeData) {
    this.AddedMainSec=false;
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
