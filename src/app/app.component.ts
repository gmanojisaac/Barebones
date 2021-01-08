
import { Component, ViewChild} from '@angular/core';
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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
  constructor(
    public afAuth: AngularFireAuth,
    public developmentservice: UserdataService,
    private db: AngularFirestore,
    public fb: FormBuilder,
    public dialog: MatDialog
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
}

