
import { Component, ViewChild,AfterViewInit } from '@angular/core';
import { BehaviorSubject, Subscription, Observable,of } from 'rxjs';
import { UserdataService, userProfile,usrinfo, projectFlags, usrinfoDetails,projectControls } from './service/userdata.service';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { map, switchMap, startWith, withLatestFrom } from 'rxjs/operators';
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


@Injectable()
export class FileDatabase {
  dataChange = new BehaviorSubject<FileNode[]>([]);

  get data(): FileNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    // Parse the string to json object.
    const dataObject = JSON.parse(TREE_DATA);

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
  buildFileTree(
    obj: { [key: string]: any },
    level: number,
    parentId: string = "0"
  ): FileNode[] {
    return Object.keys(obj).reduce<FileNode[]>((accumulator, key, idx) => {
      const value = obj[key];
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
}

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

const TREE_DATA = JSON.stringify({
  Applications: {
    Calendar: "app",
    Chrome: "app",
    Webstorm: "app"
  },
  Documents: {
    angular: {
      src: {
        compiler: "ts",
        core: "ts"
      }
    },
    material2: {
      src: {
        button: "ts",
        checkbox: "ts",
        input: "ts"
      }
    }
  },
  Downloads: {
    October: "pdf",
    November: "pdf",
    Tutorial: "html"
  },
  Pictures: {
    "Photo Booth Library": {
      Contents: "dir",
      Pictures: "dir"
    },
    Sun: "png",
    Woods: "jpg"
  }
});


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [FileDatabase]
})
export class AppComponent implements AfterViewInit{
  title = 'goldenNoStrict';
  myauth;
  loggedinstate:Observable<string>=new BehaviorSubject(undefined);
  subjectauth = new BehaviorSubject(undefined);
  getObservableauthStateSub: Subscription = new Subscription;
  getObservableauthState = (authdetails: Observable<firebase.User>) => {
    if (this.getObservableauthStateSub !== undefined) {
      this.getObservableauthStateSub.unsubscribe();
    }
    this.getObservableauthStateSub = authdetails.subscribe((val: any) => {
      console.log('29',val);
      this.subjectauth.next(val);
    });
    return this.subjectauth;
  };

  myonline;
  subjectonline = new BehaviorSubject(undefined);
  getObservableonlineSub: Subscription = new Subscription;
  getObservableonine = (localonline: Observable<boolean>) => {
    this.getObservableonlineSub?.unsubscribe();
    this.getObservableonlineSub = localonline.subscribe((valOnline: any) => {
      console.log('41',valOnline);
      this.subjectonline.next(valOnline);
    });
    return this.subjectonline;
  };
  AfterOnlineCheckAuth = undefined;

  myuserProfile: userProfile = {
    userAuthenObj: null,//Receive User obj after login success
  };

  myprojectControls: projectControls = {
    subsectionkeysControl: new FormControl(null, Validators.required),
    testcaseInfoControl: new FormControl(),
    createTestcaseControl: new FormControl(),
    publicprojectControl: new FormControl(null, Validators.required),
    ownPublicprojectControl: new FormControl(null, Validators.required),
    firstMainSecControl: new FormControl(null, Validators.required),
    editMainsectionGroup: this.fb.group({
      editMainsectionControl: [{ value: '' }, Validators.required]
    }),
    visibilityMainsectionGroup: this.fb.group({
      editVisibilityControl: [{ value: false, disabled: false }, Validators.required]
    }),
    editSubsectionGroup: this.fb.group({
      editSubsectionControl:[{ value: '' }, Validators.required]
    }),
    addProfileDetails: this.fb.group({
      profilenameControl:[{ value: '' }, Validators.required],
      photourlControl:[{ value: '' }, Validators.required],
      email_savedControl:[{ value: '' }, Validators.required],
      genderControl:[{ value: true }, Validators.required],
      areasOfInterestControl:[{ value: '' }, Validators.required],
      skillsControl:[{ value: '' }, Validators.required]
    }),
  };

  myprojectFlags: projectFlags = {
    showPaymentpage: false,
    newuserCheck: false,
    firstTestcaseEdit: false,
    newuserProfileDetails: false

  };

myusrinfoDetails:usrinfoDetails={
  profilename: '',
  photourl: '',
  email_saved: '',
  gender:false,
  areasOfInterest: '',
  skills: ''
};
  myprofilevalbef: Observable<usrinfo>= new BehaviorSubject(undefined);
  myprofileDetails: Observable<usrinfoDetails>= new BehaviorSubject(undefined);
  @ViewChild('drawer') public sidenav: MatSidenav;

  treeControl: FlatTreeControl<FileFlatNode>;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;
  // expansion model tracks expansion state
  expansionModel = new SelectionModel<string>(true);
  dragging = false;
  expandTimeout: any;
  expandDelay = 1000;
  validateDrop = false;
  @ViewChild('tree') tree;

  constructor(
    public afAuth: AngularFireAuth,
    public developmentservice: UserdataService,
    private db: AngularFirestore,
    public fb: FormBuilder,
    public dialog: MatDialog,
    database: FileDatabase
  ) {

    const addProfileDetailsSub=  this.myprojectControls.addProfileDetails.valueChanges.pipe(
      startWith({   
        profilename: '',
        photourl: '',
        email_saved: '',
        gender:false,
        areasOfInterest: '',
        skills: ''}),
      map((result:any)=>{
        //console.log(result);
      })
    );

    this.myonline = this.getObservableonine(this.developmentservice.isOnline$);
    this.myauth = this.getObservableauthState(this.afAuth.authState);
    this.AfterOnlineCheckAuth = this.myonline.pipe(
      switchMap((onlineval: any) => {
        console.log('64',onlineval);
        if (onlineval === true) {
          return this.myauth.pipe(
            switchMap((afterauth: firebase.User) => {
              console.log('66',afterauth);
              if (afterauth !== null && afterauth !== undefined) {
                this.myuserProfile.userAuthenObj = afterauth;
                return docData(this.db.firestore.doc('myProfile/' + afterauth.uid)).pipe(
                  switchMap((profilevalbef: any) => {
                    if (!Object.keys(profilevalbef).length === true) {
                      this.developmentservice.findOrCreate(afterauth.uid).then(success => {
                        if (success !== 'doc exists') {
                          alert('check internet Connection');
                        } else {
                          this.myprofilevalbef=of(undefined);
                        }
                        return of(onlineval);
                      });
                    } else {
                      this.myprofilevalbef=of(profilevalbef);
                      return docData(this.db.firestore.doc('Profile/' + afterauth.uid)).pipe(
                        map((profileDetails:usrinfoDetails)=>{
                          
                          if (!Object.keys(profileDetails).length === true) {
                            this.myprofileDetails=of(undefined);
                          }else{
                              this.myprofileDetails=of(profileDetails);
                              console.log('profileDetails', this.myprofileDetails);
                          }                              
                          //return of(onlineval);
                        }) ,withLatestFrom(addProfileDetailsSub),
                        map((values: any) => {
                          const [publickey, keys] = values;
                          return onlineval;
                        }));                     
                    }
                    this.myprojectControls.addProfileDetails.reset();
                    this.myprojectControls.addProfileDetails.enable();
                    return of(onlineval);
                  })
                )
              } else {
                this.myprojectControls.addProfileDetails.reset();
                this.myprojectControls.addProfileDetails.enable();
                return of(false);
              }
            }));
        } else {
          this.myprojectControls.addProfileDetails.reset();
          this.myprojectControls.addProfileDetails.enable();
          return of(false);
        }
      })
    );

    
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

    database.dataChange.subscribe(data => this.rebuildTreeForData(data));
  

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

  shouldValidate(event: MatCheckboxChange): void {
    this.validateDrop = event.checked;
  }

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

  CreateNewUser(){
    const nextMonth: Date = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const newItem = {
      MembershipEnd: nextMonth.toDateString(),
      MembershipType: 'Demo',
      projectLocation: '/projectList/DemoProjectKey',
      projectOwner: true,
      projectName: 'Demo'
    };
    this.db.doc<any>('myProfile/' + this.myuserProfile.userAuthenObj.uid).set(newItem);
    
  }
  UpdateUserProfileFlag(){
    this.myprofileDetails=of(undefined);
    this.myprojectFlags.newuserProfileDetails = true;
    this.myprojectControls.addProfileDetails.reset();
    this.myprojectControls.addProfileDetails.enable();    
  }
  CreateUserProfile(){
    this.myprojectFlags.newuserProfileDetails = true;
  }
  UpdateUserProfile(){
    this.developmentservice.createnewprofileDetails(this.myuserProfile.userAuthenObj.uid,this.myprojectControls.addProfileDetails.value ).then(success=>{
      this.myprojectFlags.newuserProfileDetails = false;
    });
  }
  startfirstpage(){
    this.loggedinstate=of('firstpage');
  }
  componentLogOff() {
    this.myprojectFlags.newuserProfileDetails = false;
    this.myprofileDetails=of(undefined);
    this.loggedinstate=of('undefined');
    this.developmentservice.logout();
  }
  draweropen() {
  }
  drawerclose() {
    this.sidenav.close();
  }



  ngAfterViewInit() {
    this.tree.treeControl.expandAll();
  }
}
