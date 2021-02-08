
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { of, merge, fromEvent, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';

export interface completeinfo{
  areaOfinterest:string;
  email:string;
  gender:string;
  location:string;
  membershipEnd:firebase. firestore. Timestamp;
  photoUrl:string,
  membershipType:string;
  profileName:string;
  projectLocation:string;
  skills:string;
  tasksNo:number;
  likesNo:number;
}
export interface projectDetail{
  creationDate:Date;                      
  description:string;
  photoUrl:string;
  profileName:string;
  projectName:string;
  projectUid:string;
}
export interface myusrinfo {
  MembershipEnd: Date;
  MembershipType: string;
  projectLocation: string;
  projectName: string;
  projectOwner: boolean;
}
export interface MainSectionGroup {
  disabled: boolean;
  name: string;
  section: SubSection[];
}

export interface userProfile {
  userAuthenObj: firebase.User,
  myusrinfoFromDb: myusrinfo
}
export interface usrinfo {
  MembershipEnd: Date;
  MembershipType: string;
  projectLocation: string;
  projectOwner: boolean;
  projectName: string;  
}
export interface projectControls {
  subsectionkeysControl?: FormControl;//1-Keys come from db and user sub-sec selection will load a doc from demo or public proj
  testcaseInfoControl?: FormControl; //Displays the selected Testcase details
  createTestcaseControl?: FormControl;//User enters a test case name
  publicprojectControl?: FormControl;//1-User selects a public project    
  ownPublicprojectControl?: FormControl;//1-User selects own public project
  firstMainSecControl?: FormControl
  editMainsectionGroup?: FormGroup;// user selects a Main section key
  visibilityMainsectionGroup?: FormGroup,
  editSubsectionGroup?: FormGroup;  // user selects a Sub section key

  addProfileDetails?: FormGroup
}

export interface usrinfoDetails {
  profilename: string;
  photourl: string;
  email_saved: string;
  gender:boolean;
  areasOfInterest: string;
  skills: string;
}

export interface projectFlags
{    
    newuserCheck?: boolean;//show add or New Testcase based on number of testcases in subsection
    showPaymentpage?:boolean;//for expired user-remove it
    firstTestcaseEdit?:boolean;
    showEditTcButton?:boolean;
    homeNewProject?:boolean;
    homeDeleteProject?:boolean;
    homeCurrentProject?:boolean;
    editModifyProject?:boolean;
    editAddMainsec?:boolean;
    editDeleteMainsec?:boolean;
    editVisibility?:boolean;//visibility button
    editAddSubSec?:boolean;
    editDeleteSubsec?:boolean;
    editAddProject?:boolean;
    editDeleteProject?:boolean;
    editUpdateProject?:boolean;
    
    newuserProfileDetails?:boolean;
}

export interface SubSection {
  viewvalue: string;
}

export interface MainSectionGroup {
  disabled: boolean;
  name: string;
  section: SubSection[];
}

@Injectable({
  providedIn: 'root'
})
export class UserdataService {
  isOnline$!: Observable<boolean>;

  constructor(public auth: AngularFireAuth, private db: AngularFirestore) {
    this.isOnline$ = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    ).pipe(map(() => navigator.onLine));
  }
  docExists(uid: string) {
    return this.db.doc(`projectList/DemoProjectKey`).valueChanges().pipe(first()).toPromise();
  }
  async findOrCreate(uid: string) {
    const doc = await this.docExists(uid);
    if (doc) {
      console.log('returned', doc);
      return 'doc exists';
    } else {
      return 'created new doc';
    }
  }
  login() {
    return this.auth.signInWithPopup(new (firebase.auth as any).GoogleAuthProvider()).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/network-request-failed') {

        //alert('Check Internet Connection');
        location.reload();
      }
    });
  }
  logout() {
    return this.auth.signOut();
  }  
  async createnewprofileDetails(uid:string, newprojectinfo: any) : Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.firestore.doc('Profile/' + uid).set(newprojectinfo,{merge: true}),
      ]);
      return promise;
    });
  }

  
  async createnewproject(uid:string, projectname: string, newprojectinfo: any, MainSection:any) : Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.firestore.doc('profile/' + uid).set(newprojectinfo,{merge: true}),
        this.db.firestore.doc('projectList/' + uid).set({ownerRecord: firebase.firestore.FieldValue.arrayUnion(projectname)},{merge: true}),
        this.db.firestore.doc('projectKey/' + projectname).set({MainSection},  {merge: false}) ,
        this.db.firestore.doc('projectList/' + 'publicProject/').set({public: firebase.firestore.FieldValue.arrayUnion(projectname)},{merge: true})
      ]);
      return promise;
    });
  }
  async createDefKeys(projectname: string,MainSection:any) : Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([      
        this.db.firestore.doc('projectKey/' + projectname).set({MainSection},  {merge: false}) ,
        this.db.firestore.doc(projectname+ '/MainSection/items/SubSection').delete()
      ]);
      return promise;
    });
  }
  async deleteproject(uid:string,oldprojectName:string, newprojectinfo: any) : Promise<void>{
    console.log('oldprojectName',oldprojectName);
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.firestore.doc('projectList/' + uid).update({ownerRecord: firebase.firestore.FieldValue.arrayRemove(oldprojectName)}),
        this.db.firestore.doc('projectList/' + 'publicProject').update({public: firebase.firestore.FieldValue.arrayRemove(oldprojectName)}),
        this.db.firestore.doc('profile/' + uid).set(newprojectinfo,{merge: true}),
        this.db.firestore.doc('projectKey/' + oldprojectName).delete()
      ]);
      return promise;
    });
  }  
  async deleteMainSection(ProjectName: string, MainSection: any) : Promise<void>{    
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.doc('projectKey/' + ProjectName).set({MainSection },  {merge: false} )
    ]);
    return promise;
  });
  }
  async addMainSection(ProjectName: string,  MainSection: any) : Promise<void>{    
    await this.db.firestore.runTransaction(() => {
      console.log('reached',ProjectName);
      const promise = Promise.all([
        this.db.doc('/projectKey/' + ProjectName ).set({MainSection },  {merge: false} )
    ]);
    return promise;
  });
  }  
  async updatevisibility(ProjectName: string,MainSection: any) : Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.doc('projectKey/' + ProjectName).set({MainSection},  {merge: false})
    ]);
    return promise;
  });}
  async addSubSection(ProjectName: string,MainSectionName:string, SubSectionName: string,MainSection: any) : Promise<void>{
    console.log('195',ProjectName);
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.doc('projectKey/' + ProjectName).set({MainSection},  {merge: false}),
        this.db.doc(ProjectName + '/' + MainSectionName + '/items/' + SubSectionName ).delete()  
    ]);
    return promise;
  });}
  async deleteSubSection(ProjectName: string, MainSectionName: string, SubSectionName: string, MainSection: any) : Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.doc( ProjectName + '/' + MainSectionName + '/items/' + SubSectionName + '/').delete(),
        this.db.doc('projectKey/' + ProjectName).set({MainSection},  {merge: false})        
      ]);
      return promise;
    });
  }
  async updateSubSection(ProjectName: string, MainSectionName: string, SubSectionName: string, MainSection: any) : Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.doc( ProjectName + '/' + MainSectionName + '/items/' + SubSectionName + '/').delete(),
        this.db.doc('projectKey/' + ProjectName).set({MainSection}),
      ]);
      return promise;
    });
  }
  async UpdateMainSection(ProjectName: string,  MainSection: any) : Promise<void>{    
    await this.db.firestore.runTransaction(() => {
      console.log('reached',ProjectName);
      const promise = Promise.all([
        this.db.doc('/projectKey/' + ProjectName ).set({MainSection },  {merge: false} )
    ]);
    return promise;
  });
  } 
}