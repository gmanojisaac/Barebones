import { Component, OnInit, ViewChild, AfterViewInit, Input, Inject, ɵArgumentType } from '@angular/core';
import { FlatTreeControl } from "@angular/cdk/tree";
import { Injectable } from "@angular/core";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from "@angular/material/tree";
import { of as observableOf } from "rxjs";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SelectionModel } from "@angular/cdk/collections";
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from "@angular/animations";
import { map, filter } from 'rxjs/operators';

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
  ) { }
}
interface MainSection {
  name: string;
  disabled?: boolean;
  section?: MainSection[];
}

export class MainSectionClass {
  constructor(
    public name: string,
    public hasSubLevels: boolean,
    public SubSection: MainSectionClass[]
  ) { }
}

export interface MainSectionMap {
  [key: number]: MainSection;
}

@Component({
  selector: 'app-tree-structure',
  templateUrl: './tree-structure.component.html',
  styleUrls: ['./tree-structure.component.scss'],
  animations: [
    trigger("slideVertical", [
      state(
        "*",
        style({
          height: 0
        })
      ),
      state(
        "show",
        style({
          height: "*"
        })
      ),
      transition("* => *", [animate("2000ms cubic-bezier(0.25, 0.8, 0.25, 1)")])
    ])
  ]
})
export class TreeStructureComponent implements AfterViewInit, OnInit {
  @Input() Sections: Observable<any>;
  treeControl: FlatTreeControl<FileFlatNode>;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;
  // expansion model tracks expansion state
  expansionModel = new SelectionModel<string>(true);
  dragging = false;
  expandTimeout: any;
  expandDelay = 1000;
  validateDrop = true;
  @ViewChild('tree') tree;

  dataChange = new BehaviorSubject<FileNode[]>([]);

  get data(): FileNode[] {
    return this.dataChange.value;
  }
  dataObject: any;
  mydata: any;
  loan: JSON;
  DataMap = new Map();

  constructor(
  ) {

    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this._getLevel,
      this._isExpandable,
      this._getChildren
    );
    this.treeControl = new FlatTreeControl<FileFlatNode>(
      this._getLevel,
      this._isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.dataChange.subscribe(data => {

      this.rebuildTreeForData(data);
      this.ShowData();
    }
    );


  }

  initialize() {
    // Parse the string to json object.
    this.Sections.pipe(filter(myobj => myobj !== null), map((data: any) => {

      let AllSections = {};
      let SubSection = {};
      data.forEach(element => {
        AllSections[element.name] = {};
        let Subindex = 1;
        element.section.forEach(subelement => {
          SubSection[Subindex] = subelement.viewvalue;
          Subindex++;
        });
        //console.log('SubSection', SubSection);
        AllSections[element.name] = SubSection;
        SubSection = {};
      });

      //console.log('204', AllSections);
      this.dataObject = JSON.parse(JSON.stringify(AllSections));

      //this.dataObject = JSON.parse(TREE_DATA1);
      // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
      //     file node as children.
      this.mydata = this.buildFileTree(this.dataObject, 0);
      console.log('154',this.mydata);
      // Notify the change.
      this.dataChange.next(this.mydata);

    })).subscribe(_ => {




    });



  }

  buildFileTree(
    obj: { [key: string]: any },
    level: number,
    parentId: string = "0"
  ): FileNode[] {
    return Object.keys(obj).reduce<FileNode[]>((accumulator, key, idx) => {
      const value = obj[key];
      console.log('252',idx,key);
      const node = new FileNode();
      node.filename = key;
      /**
       * Make sure your node has an id so we can properly rearrange the tree during drag'n'drop.
       * By passing parentId to buildFileTree, it constructs a path of indexes which make
       * it possible find the exact sub-array that the node was grabbed from when dropped.
       */
      node.id = `${parentId}/${idx}`;

      if (value != null) {
        if (typeof value === "object") {
          node.children = this.buildFileTree(value, level + 1, node.id);
        } else {
          node.type = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }
  transformer = (node: FileNode, level: number) => {
    return new FileFlatNode(
      !!node.children,
      node.filename,
      level,
      node.type,
      node.id
    );
  };
  private _getLevel = (node: FileFlatNode) => node.level;
  private _isExpandable = (node: FileFlatNode) => node.expandable;
  private _getChildren = (node: FileNode): Observable<FileNode[]> =>
    observableOf(node.children);
  hasChild = (_: number, _nodeData: FileFlatNode) => _nodeData.expandable;

  // DRAG AND DROP METHODS

  /*shouldValidate(event: MatCheckboxChange): void {
    this.validateDrop = event.checked;
  }*/

  /**
   * This constructs an array of nodes that matches the DOM
   */
  visibleNodes(): FileNode[] {
    const result = [];

    function addExpandedChildren(node: FileNode, expanded: string[]) {
      result.push(node);
      if (expanded.includes(node.id)) {
        node.children.map(child => addExpandedChildren(child, expanded));
      }
    }
    this.dataSource.data.forEach(node => {
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
    const nodeAtDestFlatNode = this.treeControl.dataNodes.find(
      n => nodeAtDest.id === n.id
    );
    if (this.validateDrop && nodeAtDestFlatNode.level !== node.level) {
      alert("Items can only be moved within the same level.");
      return;
    }

    // insert node
    newSiblings.splice(insertIndex, 0, nodeToInsert);

    // rebuild tree with mutated data
    this.rebuildTreeForData(changedData);
    console.log('changedData', changedData);
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
    this.expansionModel.selected.forEach(id => {
      const node = this.treeControl.dataNodes.find(n => n.id === id);
      this.treeControl.expand(node);
    });
  }

  /**
   * Not used but you might need this to programmatically expand nodes
   * to reveal a particular node
   */
  private expandNodesById(flatNodes: FileFlatNode[], ids: string[]) {
    if (!flatNodes || flatNodes.length === 0) return;
    const idSet = new Set(ids);
    return flatNodes.forEach(node => {
      if (idSet.has(node.id)) {
        this.treeControl.expand(node);
        let parent = this.getParentNode(node);
        while (parent) {
          this.treeControl.expand(parent);
          parent = this.getParentNode(parent);
        }
      }
    });
  }

  private getParentNode(node: FileFlatNode): FileFlatNode | null {
    const currentLevel = node.level;
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  ngOnInit(): void {
  }



  ngAfterViewInit() {
    //this.tree.treeControl.expandAll();
    this.initialize();

  }

  ShowData() {

  }
}
