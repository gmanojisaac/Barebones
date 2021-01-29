import { Component, OnInit, Inject, Input, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { of as observableOf } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { UserdataService, MainSectionGroup } from '../service/userdata.service';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';

import {FlatTreeControl} from '@angular/cdk/tree';
import { Injectable} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';




export class FileNode {
  id: string;
  children: FileNode[];
  filename: string;
  type: any;
  disabled:boolean;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
  constructor(
    public expandable: boolean,
    public filename: string,
    private disabled:boolean,
    public level: number,
    public type: any,
    public id: string
  ) {}
}


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
  filterValues:string[]
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

  constructor(private _bottomSheet: MatBottomSheet,
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
  openBottomSheet(){
    //console.log(this.AlltheKeys);
    this._bottomSheet.open(BottomSheetChangeOrder, {data: {mydata: this.AlltheKeys , projectname: this.latestProject}});
  }
}
@Component({
  selector: 'bottom-sheet-changeorder',
  template:`
  <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" cdkDropList (cdkDropListDropped)="drop($event)">
    <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle matTreeNodePadding cdkDrag [cdkDragData]="node" (mouseenter)="dragHover(node)" (mouseleave)="dragHoverEnd()" (cdkDragStarted)="dragStart()" (cdkDragReleased)="dragEnd()">
      <button mat-icon-button disabled></button>
      {{node.filename}} 
    </mat-tree-node>
  
    <mat-tree-node *matTreeNodeDef="let node;when: hasChild" matTreeNodePadding cdkDrag [cdkDragData]="node" (mouseenter)="dragHover(node)" (mouseleave)="dragHoverEnd()" (cdkDragStarted)="dragStart()" (cdkDragReleased)="dragEnd()">
      <button mat-icon-button matTreeNodeToggle (click)="expansionModel.toggle(node.id)"
              [attr.aria-label]="'toggle ' + node.filename">
        <mat-icon class="mat-icon-rtl-mirror">
          {{treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right'}}
        </mat-icon>
      </button>
      {{node.filename}}
    </mat-tree-node>
  </mat-tree>
  `,
  styles:[`
  
.basic-container {
  padding: 30px;
}

.version-info {
  font-size: 8pt;
  float: right;
}

/**
 * TREE DRAG AND DROP STYLING
 */

.mat-tree-node {
  background-color: rgb(66, 157, 253);
  color: white;
  user-select: none;
  cursor: move;

  &.cdk-drag-preview { // while dragging
    @include mat-elevation(12);
  }
  &.cdk-drag-placeholder { // potential drop area
    opacity: 0;
  }
}

/* items moving away to make room for drop */
.cdk-drop-list-dragging .mat-tree-node:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
/* item being dropped */
.cdk-drag-animating {
  transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
}
  `]
})
export class BottomSheetChangeOrder implements AfterViewInit {
  dataChange = new BehaviorSubject<FileNode[]>([]);
//  get data(): FileNode[] { return this.dataChange.value; }
  treeControl: FlatTreeControl<FileFlatNode>;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;
  // expansion model tracks expansion state
  expansionModel = new SelectionModel<string>(true);
  dragging = false;
  expandTimeout: any;
  expandDelay = 1000;
  validateDrop = true;
  end=0;
  constructor(private _bottomSheetRef: MatBottomSheetRef<BottomSheetChangeOrder>, 
    @Inject(MAT_BOTTOM_SHEET_DATA) public bottomdata: any,
    public developmentservice: UserdataService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<FileFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataChange.subscribe(data => this.rebuildTreeForData(data));
    this.initialize();
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
  ngAfterViewInit() {

  }
  
  initialize() {
    // Parse the string to json object.
    //console.log(this.bottomdata);
    const dataObject = JSON.parse(JSON.stringify(this.bottomdata.mydata));


    // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
    //     file node as children.
    const data = this.buildFileTree(dataObject, 0);
    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `FileNode`.
   */
  buildFileTree(obj: {[key: string]: any}, level: number, parentId: string = '0'): FileNode[] {
    return Object.keys(obj).reduce<FileNode[]>((accumulator, key, idx) => {
      const value = obj[key];
      const node = new FileNode();
      
      if(obj[key].name !== undefined){
        node.filename = obj[key].name;
        node.disabled = obj[key].disabled;
      }else{
        node.filename = obj[key].viewvalue;
      }
      
      /**
       * Make sure your node has an id so we can properly rearrange the tree during drag'n'drop.
       * By passing parentId to buildFileTree, it constructs a path of indexes which make
       * it possible find the exact sub-array that the node was grabbed from when dropped.
       */
      node.id = `${parentId}/${idx}`;

      if ((value.section)?.length != 0) {
        if ((value.section)?.length > 0) {
          node.children = this.buildFileTree(value.section, level + 1, node.id);
        } else {
          node.type = value.viewvalue;
        }
      }

      return accumulator.concat(node);
    }, []);
  }


  
  transformer = (node: FileNode, level: number) => {
    return new FileFlatNode(!!node.children, node.filename,node.disabled, level, node.type, node.id);
  }
  private _getLevel = (node: FileFlatNode) => node.level;
  private _isExpandable = (node: FileFlatNode) => node.expandable;
  private _getChildren = (node: FileNode): Observable<FileNode[]> => observableOf(node.children);
  hasChild = (_: number, _nodeData: FileFlatNode) => _nodeData.expandable;

  // DRAG AND DROP METHODS



  /**
   * This constructs an array of nodes that matches the DOM
   */
  visibleNodes(): FileNode[] {
    const result = [];

    function addExpandedChildren(node: FileNode, expanded: string[]) {
      result.push(node);
      if (expanded.includes(node.id)) {
        node.children.map((child) => addExpandedChildren(child, expanded));
      }
    }
    this.dataSource.data.forEach((node) => {
      addExpandedChildren(node, this.expansionModel.selected);
    });
    return result;
  }

  /**
   * Handle the drop - here we rearrange the data based on the drop event,
   * then rebuild the tree.
   * */
  drop(event: CdkDragDrop<string[]>) {
    // console.log('origin/destination', event.previousIndex, event.currentIndex);
  
    // ignore drops outside of the tree
    if (!event.isPointerOverContainer) return;

    // construct a list of visible nodes, this will match the DOM.
    // the cdkDragDrop event.currentIndex jives with visible nodes.
    // it calls rememberExpandedTreeNodes to persist expand state
    const visibleNodes = this.visibleNodes();

    // deep clone the data source so we can mutate it
    const changedData = JSON.parse(JSON.stringify(this.dataSource.data));

    // recursive find function to find siblings of node
    function findNodeSiblings(arr: Array<any>, id: string): Array<any> {
      let result, subResult;
      arr.forEach((item, i) => {
        if (item.id === id) {
          result = arr;
        } else if (item.children) {
          subResult = findNodeSiblings(item.children, id);
          if (subResult) result = subResult;
        }
      });
      return result;

    }

    // determine where to insert the node
    const nodeAtDest = visibleNodes[event.currentIndex];
    const newSiblings = findNodeSiblings(changedData, nodeAtDest.id);
    if (!newSiblings) return;
    const insertIndex = newSiblings.findIndex(s => s.id === nodeAtDest.id);

    // remove the node from its old place
    const node = event.item.data;
    const siblings = findNodeSiblings(changedData, node.id);
    const siblingIndex = siblings.findIndex(n => n.id === node.id);
    const nodeToInsert: FileNode = siblings.splice(siblingIndex, 1)[0];
    //console.log('474',nodeAtDest.id,nodeAtDest.id.slice(0, nodeAtDest.id.slice(nodeAtDest.id.indexOf("/") + 1).indexOf("/")),nodeToInsert.id.slice(nodeToInsert.id.indexOf("/") + 1).indexOf("/"));
    //console.log(nodeAtDest.id,nodeToInsert.id);
    if (nodeAtDest.id === nodeToInsert.id) return;
    const start=parseInt(nodeAtDest.id.slice(0, nodeAtDest.id.slice(nodeAtDest.id.indexOf("/") + 1).indexOf("/")) );
    
    // ensure validity of drop - must be same level
    console.log('487',nodeToInsert.id.slice(nodeToInsert.id.indexOf("/") + 1).indexOf("/"));
    
    //console.log('487',nodeToInsert.id, nodeToInsert.id.slice(nodeToInsert.id.indexOf("/") + 1));
    


    if(nodeToInsert.id.slice(nodeToInsert.id.indexOf("/") + 1).indexOf("/") === -1){
      this.end = parseInt(nodeToInsert.id.slice(nodeToInsert.id.indexOf("/") + 1) );
      //this.end = nodeToInsert.id.indexOf("/");
    }else{
      this.end =nodeToInsert.id.slice(nodeToInsert.id.indexOf("/") + 1).indexOf("/");
    }
    console.log(nodeToInsert.id, start,this.end);
    const nodeAtDestFlatNode = this.treeControl.dataNodes.find((n) => nodeAtDest.id === n.id);
    //console.log(nodeAtDestFlatNode.level,node.level,nodeAtDestFlatNode.level !== node.level);
    //console.log(nodeAtDestFlatNode.level,node.level, start,this.end);
    if (nodeAtDestFlatNode.level !== node.level ) {
      alert('Items can only be moved within the same level.');
      return;
    }else{
      if( start !== this.end ){
        if((nodeToInsert.id.slice(nodeToInsert.id.indexOf("/") + 1).indexOf("/") === -1)){

        }else{
          alert('Items can only be moved within the same level.');
          return;
        }

      }
    }

    // insert node 
    //console.log('490',insertIndex,nodeToInsert);
    newSiblings.splice(insertIndex, 0, nodeToInsert);
    console.log(changedData);
    let saveddata:MainSectionGroup[]=[];
    
    changedData.forEach((element,myindex) => {
      saveddata.push({
        name:element.filename,
        disabled:element.disabled,
        section:[]
      });
      if(element.children !== undefined){
        element.children.forEach(subelement => {
          saveddata[myindex].section.push({viewvalue:subelement.filename })
        });
      }else{
        saveddata[myindex].section=[];
      }
    
    });
    console.log('save',saveddata);
    this.developmentservice.addMainSection(this.bottomdata.projectname, saveddata).then(success=>{
    });
    saveddata=undefined;
    // rebuild tree with mutated data
    this.rebuildTreeForData(changedData);
  }

  /**
   * Experimental - opening tree nodes as you drag over them
   */
  dragStart() {
    this.dragging = true;
  }
  dragEnd() {
    this.dragging = false;
  }
  dragHover(node: FileFlatNode) {
    if (this.dragging) {
      clearTimeout(this.expandTimeout);
      this.expandTimeout = setTimeout(() => {
        this.treeControl.expand(node);
      }, this.expandDelay);
    }
  }
  dragHoverEnd() {
    if (this.dragging) {
      clearTimeout(this.expandTimeout);
    }
  }

  /**
   * The following methods are for persisting the tree expand state
   * after being rebuilt
   */

  rebuildTreeForData(data: any) {
    this.dataSource.data = data;
    this.expansionModel.selected.forEach((id) => {
        const node = this.treeControl.dataNodes.find((n) => n.id === id);
        this.treeControl.expand(node);
      });
  }

}