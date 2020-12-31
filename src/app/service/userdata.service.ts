
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { of, merge, fromEvent ,Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import { FormControl,FormGroup} from '@angular/forms';

export interface userProfile { 
  userAuthenObj: firebase.User,//Receive User obj after login success
  myusrinfoFromDb:myusrinfo,
  keysReadFromDb?:MainSectionGroup[];
  mainsubsectionKeys?: string[];
  subSectionKeys?:string[];
  savedMainSectionKey:string;
  savesubSectionKeys?:string[];
  savedisabledval?:boolean;
 }
 export interface projectFlags
 {    
   showPaymentpage:boolean;
 }
export interface myusrinfo{
  MembershipEnd:Date;
  MembershipType:string;
  projectLocation:string;
  projectName:string;
  projectOwner:boolean;
}
export interface projectVariables
{
  initialMainSection?:string;
  testcaseslength?:number;
  viewSelectedTestcase?:TestcaseInfo;
}
export interface projectControls{
  subsectionkeysControl: FormControl;//1-Keys come from db and user sub-sec selection will load a doc from demo or public proj
  testcaseInfoControl: FormControl; //Displays the selected Testcase details
  createTestcaseControl: FormControl;//User enters a test case name
  publicprojectControl: FormControl;//1-User selects a public project    
  ownPublicprojectControl: FormControl;//1-User selects own public project
  firstMainSecControl: FormControl
  editMainsectionGroup: FormGroup;// user selects a Main section key
  visibilityMainsectionGroup:FormGroup,
  editSubsectionGroup: FormGroup;  // user selects a Sub section key

}
export interface SubSection {
  viewvalue: string;
}

export interface TestcaseInfo{
  heading: string;//Heading in testcase list
  subHeading:string;//Sub-Heading in testcase list
  description: string;//Description in testcase view
  linktoTest: string;//stackblitzLink in testcase edit/doubleclick
}

export interface MainSectionGroup {
  disabled: boolean;
  name: string;
  section: SubSection[];
}
export interface userProfile { 
  userAuthenObj: firebase.User,//Receive User obj after login success
  myusrinfoFromDb:myusrinfo,
  keysReadFromDb?:MainSectionGroup[];
  mainsubsectionKeys?: string[];
  subSectionKeys?:string[];
  savedMainSectionKey:string;
  savesubSectionKeys?:string[];
  savedisabledval?:boolean;
 }
@Injectable({
  providedIn: 'root'
})
export class UserdataService {
  isOnline$!: Observable<boolean>;

  constructor(public auth: AngularFireAuth) {
    this.isOnline$ = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    ).pipe(map(() => navigator.onLine));

   }

   login() {
    return this.auth.signInWithPopup( new (firebase.auth as any).GoogleAuthProvider()).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/network-request-failed'){
        
        //alert('Check Internet Connection');
        location.reload();
      }
    });
  }
  logout() {
    return this.auth.signOut();
  }
}