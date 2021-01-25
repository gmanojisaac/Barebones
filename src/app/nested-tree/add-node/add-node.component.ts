import { TreeData, DialogData } from '../nested-tree.component';
import { Component, Inject, Output, AfterViewInit, EventEmitter, Input,ChangeDetectionStrategy } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserdataService,MainSectionGroup } from '../../service/userdata.service';

import {FlatTreeControl} from '@angular/cdk/tree';
import { Injectable} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {BehaviorSubject, Observable, of as observableOf} from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';

export class FileNode {
  id: string;
  children: FileNode[];
  filename: string;
  type: any;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
  constructor(
    public expandable: boolean,
    public filename: string,
    public level: number,
    public type: any,
    public id: string
  ) {}
}

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
  @Input() sections:any;
  @Output() changemyorder = new EventEmitter;
  name: string;
  description: string;



  constructor(public dialog: MatDialog,
    public developmentservice: UserdataService,private _bottomSheet: MatBottomSheet) {
    }

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
  openBottomSheet(){
    console.log(this.sections);
    this._bottomSheet.open(BottomSheetChangeOrder, {
      data: this.sections });
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
  get data(): FileNode[] { return this.dataChange.value; }
  treeControl: FlatTreeControl<FileFlatNode>;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;
  // expansion model tracks expansion state
  expansionModel = new SelectionModel<string>(true);
  dragging = false;
  expandTimeout: any;
  expandDelay = 1000;
  validateDrop = false;
  constructor(private _bottomSheetRef: MatBottomSheetRef<BottomSheetChangeOrder>, 
    @Inject(MAT_BOTTOM_SHEET_DATA) public bottomdata: []) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<FileFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataChange.subscribe(data => this.rebuildTreeForData(data));
    this.validateDrop= true;
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
    console.log(this.bottomdata);
    const dataObject = JSON.parse(JSON.stringify(this.bottomdata));


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
      console.log(value, key,value.section);
      const node = new FileNode();
      if(obj[key].name !== undefined){
        node.filename = obj[key].name;
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
    return new FileFlatNode(!!node.children, node.filename, level, node.type, node.id);
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
    if (nodeAtDest.id === nodeToInsert.id) return;

    // ensure validity of drop - must be same level
    const nodeAtDestFlatNode = this.treeControl.dataNodes.find((n) => nodeAtDest.id === n.id);
    if (this.validateDrop && nodeAtDestFlatNode.level !== node.level) {
      alert('Items can only be moved within the same level.');
      return;
    }

    // insert node 
    newSiblings.splice(insertIndex, 0, nodeToInsert);
    
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