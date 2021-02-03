
import { Component, ViewChild,AfterViewInit } from '@angular/core';
import { BehaviorSubject, Subscription, Observable,of } from 'rxjs';
import { UserdataService,MainSectionGroup, userProfile,usrinfo, projectFlags, projectDetail, usrinfoDetails,projectControls } from './service/userdata.service';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { map, switchMap, startWith, withLatestFrom } from 'rxjs/operators';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from "@angular/animations";
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import {FirebaseUISignInFailure, FirebaseUISignInSuccessWithAuthResult, FirebaseuiAngularLibraryService} from 'firebaseui-angular';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('slideAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })
      )]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 })
      )])
    ])]

})
export class AppComponent {
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
      this.subjectonline.next(valOnline);
    });
    return this.subjectonline;
  };
  AfterOnlineCheckAuth = undefined;

  Sections = of(undefined);
  getSectionsSubscription: Subscription;
  getSectionsBehaviourSub = new BehaviorSubject(undefined);
  getSections = (MainAndSubSectionkeys: AngularFirestoreDocument<MainSectionGroup>) => {
    if (this.getSectionsSubscription !== undefined) {
      this.getSectionsSubscription.unsubscribe();
    }
    this.getSectionsSubscription = MainAndSubSectionkeys.valueChanges().subscribe((val: any) => {
      if (val === undefined) {
        this.getSectionsBehaviourSub.next(undefined);
      } else {
        if (val.MainSection.length === 0) {
          this.getSectionsBehaviourSub.next(null);
        } else {
          if (val.MainSection.length !== 0) {
            this.getSectionsBehaviourSub.next(val.MainSection);
          }
        }
      }
    });
    return this.getSectionsBehaviourSub;
  };

  myuserProfile: userProfile = {
    userAuthenObj: null,//Receive User obj after login success
    myusrinfoFromDb: null
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
  DisplayprojectDetails:projectDetail[];

  constructor(
    public afAuth: AngularFireAuth,
    public developmentservice: UserdataService,
    private db: AngularFirestore,
    public fb: FormBuilder,
    public dialog: MatDialog, public firebaseuiAngularLibraryService: FirebaseuiAngularLibraryService
  ) {
    this.firebaseuiAngularLibraryService.firebaseUiInstance.disableAutoSignIn();

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
        if (onlineval === true) {
          return this.myauth.pipe(
            switchMap((afterauth: firebase.User) => {
              if (afterauth !== null && afterauth !== undefined) {
                this.myuserProfile.userAuthenObj = afterauth;
                return docData(this.db.firestore.doc('myProfile/' + afterauth.uid)).pipe(
                  switchMap((profilevalbef: any) => {
                    if (!Object.keys(profilevalbef).length === true) {
                      this.developmentservice.findOrCreate(afterauth.uid).then(success => {
                        if (success !== 'doc exists') {
                          alert('check internet Connection');
                          this.Sections = of(undefined);
                        } else {
                          this.myprofilevalbef=of(undefined);
                          this.Sections = of(null);
                        }
                      });
                    } else {
                      this.myprofilevalbef=of(profilevalbef);
                      this.loadFirstPageKeys(profilevalbef);
                      this.getSectionsSubscription?.unsubscribe();
                      this.myuserProfile.myusrinfoFromDb = profilevalbef;
                      this.Sections = this.getSections(this.db.doc(this.myuserProfile.myusrinfoFromDb.projectLocation));
                      return docData(this.db.firestore.doc('profile/' + afterauth.uid)).pipe(
                        switchMap((profileDetails:usrinfoDetails)=>{
                          
                          if (!Object.keys(profileDetails).length === true) {
                            this.myprofileDetails=of(undefined);
                          }else{
                              this.myprofileDetails=of(profileDetails);
                              return docData(this.db.firestore.doc('projectList/publicProjects')).pipe(
                                map((projectDetails:any)=>{
                                  this.DisplayprojectDetails= projectDetails.public;                                  
                                  return of(onlineval);
                                }));
                          }                              
                          //return of(onlineval);
                        }) ,withLatestFrom(addProfileDetailsSub),
                        map((values: any) => {
                          const [publickey, keys] = values;
                          return of(onlineval);
                        }));                     
                    }
                    this.getSectionsSubscription?.unsubscribe();
                    this.myprojectControls.addProfileDetails.reset();
                    this.myprojectControls.addProfileDetails.enable();
                    return of(onlineval);
                  })
                )
              } else {
                this.Sections = this.getSections(this.db.doc('publicProjectKeys/Angular interview'));
                return docData(this.db.firestore.doc('projectList/publicProjects')).pipe(
                  map((projectDetails:any)=>{
                     this.DisplayprojectDetails= projectDetails.public;                                  
                    return of(onlineval);
                  }));
                this.getSectionsSubscription?.unsubscribe();
                this.myprojectControls.addProfileDetails.reset();
                this.myprojectControls.addProfileDetails.enable();
                return of(false);
              }
            }));
        } else {
          this.getSectionsSubscription?.unsubscribe();
          this.myprojectControls.addProfileDetails.reset();
          this.myprojectControls.addProfileDetails.enable();
          return of(false);
        }
      })
    );

  }
  loadFirstPageKeys(profileData: any) {
    if (profileData !== undefined) {//norecords
      if (new Date(profileData.MembershipEnd).valueOf() < new Date().valueOf()) {
        if (profileData.MembershipType === 'Demo') {//expired
          this.myuserProfile.myusrinfoFromDb.projectOwner = false;//cannot add tc
          this.myuserProfile.myusrinfoFromDb.projectName = 'Demo';
          this.myuserProfile.myusrinfoFromDb.projectLocation = '/projectList/DemoProjectKey';
          this.myuserProfile.myusrinfoFromDb.MembershipType = 'Demo';
          this.myuserProfile.myusrinfoFromDb.MembershipEnd = new Date(profileData.MembershipEnd);
          this.myprojectFlags.showPaymentpage = true;// show only payments Page
        } else {//expired member
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
          this.myuserProfile.myusrinfoFromDb.projectOwner = true;
          this.myuserProfile.myusrinfoFromDb.projectName = 'Demo';
          this.myuserProfile.myusrinfoFromDb.projectLocation = '/projectList/DemoProjectKey';
          this.myuserProfile.myusrinfoFromDb.MembershipType = 'Demo';
          this.myuserProfile.myusrinfoFromDb.MembershipEnd = new Date(nextMonth.toDateString());
          this.myprojectFlags.showPaymentpage = false;
        }
      } else {//start normal
        this.myuserProfile.myusrinfoFromDb= profileData;
        //console.log('446',this.myuserProfile.myusrinfoFromDb);
        this.myprojectFlags.showPaymentpage = false;
      }//end normal      
    }//end demo/Member        
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
    this.getSectionsSubscription?.unsubscribe();
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
  successCallback(data: FirebaseUISignInSuccessWithAuthResult) {
    console.log('successCallback', data);

  }

  errorCallback(data: FirebaseUISignInFailure) {
    console.warn('errorCallback', data);
  }

  uiShownCallback() {
    console.log('UI shown');
  }
}
