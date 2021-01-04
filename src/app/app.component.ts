import { Component } from '@angular/core';
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import { UserdataService, projectFlags, TestcaseInfo, projectControls, userProfile, MainSectionGroup,myusrinfo,projectVariables } from './service/userdata.service';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { map, switchMap,startWith } from 'rxjs/operators';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'goldenNoStrict';
  myauth;
  subjectauth = new BehaviorSubject(undefined);
  getObservableauthStateSub: Subscription = new Subscription;
  getObservableauthState = (authdetails: Observable<firebase.User>) => {
    if (this.getObservableauthStateSub !== undefined) {
      this.getObservableauthStateSub.unsubscribe();
    }
    this.getObservableauthStateSub = authdetails.subscribe((val: any) => {
      //console.log(val);
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
        if (!Object.keys(val.MainSection).length === true) {
          this.getSectionsBehaviourSub.next(undefined);
        } else {
          if (val.MainSection !== undefined) {
            this.getSectionsBehaviourSub.next(val.MainSection);
          }
        }
      }
    });
    return this.getSectionsBehaviourSub;
  };

  SectionTc=of(undefined);
  getTestcasesSubscription: Subscription;
  getTestcasesBehaviourSub = new BehaviorSubject(undefined);
  getTestcases = (TestcaseList: AngularFirestoreDocument<TestcaseInfo>) => {
    if (this.getTestcasesSubscription !== undefined) {
      this.getTestcasesSubscription.unsubscribe();
    }
    this.getTestcasesSubscription = TestcaseList.valueChanges().subscribe((val: any) => {
      let arrayeverse = val;
      if (val === undefined) {
        arrayeverse = undefined;
      } else {
        if (!Object.keys(val.testcase).length === true) {
          arrayeverse = undefined;
          this.myprojectVariables.testcaseslength = 0;
        } else {
          if (val.testcase !== undefined) {
            arrayeverse = (val.testcase);
            console.log('tc len', arrayeverse.length, val.testcase);
            this.myprojectVariables.testcaseslength = arrayeverse.length;
          } else {
            arrayeverse = undefined;
          }
        }
      }
      this.getTestcasesBehaviourSub.next(arrayeverse);
    });

    return this.getTestcasesBehaviourSub;
  };

  myuserProfile: userProfile = {
    userAuthenObj: null,//Receive User obj after login success
    myusrinfoFromDb: null,
    keysReadFromDb: undefined,
    mainsubsectionKeys: [],
    subSectionKeys: undefined,
    savedMainSectionKey: undefined,
    savesubSectionKeys: undefined,
    savedisabledval: undefined
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
      editSubsectionControl: [{ value: '' }]

    })
  };
  myprojectVariables: projectVariables = {
    initialMainSection: undefined,
    testcaseslength: 0,
    viewSelectedTestcase: undefined,
  };
  myprojectFlags: projectFlags = {
    showPaymentpage: false,
    newuserCheck:false
  };
  constructor(
    public afAuth: AngularFireAuth,
    public developmentservice: UserdataService,
    private db: AngularFirestore,
    public fb: FormBuilder
  ) {


    this.myonline = this.getObservableonine(this.developmentservice.isOnline$);
    this.myauth = this.getObservableauthState(this.afAuth.authState);

    this.AfterOnlineCheckAuth = this.myonline.pipe(
      switchMap((onlineval: any) => {
        if (onlineval === true) {
          return this.myauth.pipe(
            switchMap((afterauth: firebase.User) => {
              console.log('95',afterauth);
              if (afterauth !== null && afterauth !== undefined) {
                this.myuserProfile.userAuthenObj= afterauth;
                return docData(this.db.firestore.doc('myProfile/' + afterauth.uid)).pipe(
                  switchMap((profilevalbef: any) => {
                    console.log('98',!Object.keys(profilevalbef).length);
                    if (!Object.keys(profilevalbef).length === true) {
                      this.developmentservice.findOrCreate(afterauth.uid).then(success => {                        
                        if (success !== 'doc exists') {
                          alert('check internet Connection');
                          this.myprojectFlags.newuserCheck=false;
                          this.Sections = of(undefined);
                          //return onlineval;
                        } else {
                          console.log(success, afterauth.uid);
                          this.myprojectFlags.newuserCheck=true;
                          this.Sections = of(null);
                          //return onlineval;
                        }
                      });
                      //return onlineval;
                    } else {
                      this.getSectionsSubscription?.unsubscribe();
                      this.myuserProfile.myusrinfoFromDb = profilevalbef;
                      this.Sections = this.getSections(this.db.doc(this.myuserProfile.myusrinfoFromDb.projectLocation));
                      //return onlineval;
                    }
                    return this.myprojectControls.subsectionkeysControl.valueChanges
                    .pipe(startWith({ value: '', groupValue: '' }),
                      map((selection: any) => {
                        if (!selection || selection.groupValue === '') {
                          this.myprojectVariables.initialMainSection = 'SubSection';
                          this.SectionTc = of(null);
                        } else {
                          this.myprojectVariables.initialMainSection = selection.groupValue;
                          if (this.myuserProfile.myusrinfoFromDb.projectName === 'Demo') {
                            this.getTestcasesSubscription?.unsubscribe();
                            this.SectionTc=this.getTestcases(this.db.doc('projectList/' + this.myuserProfile.userAuthenObj.uid));
                          } else {
                            this.getTestcasesSubscription?.unsubscribe();
                            this.SectionTc=this.getTestcases(this.db.doc('/' + this.myuserProfile.myusrinfoFromDb.projectName + '/' + selection.groupValue + '/items/' + selection.value));                            
                          }
                        }
                        return onlineval;
                      })
                    );

                  }));
              } else {
                this.getSectionsSubscription?.unsubscribe();
                this.getTestcasesSubscription?.unsubscribe();
                this.myprojectControls.subsectionkeysControl.reset();
                return of(false);
              }
            }));
        } else {
          this.getSectionsSubscription?.unsubscribe();
          this.getTestcasesSubscription?.unsubscribe();
          this.myprojectControls.subsectionkeysControl.reset();
          return of(false);
        }
      })
    );
  }
  CreateAccount() {
    const nextMonth: Date = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const newItem: myusrinfo = {
      MembershipEnd: nextMonth,
      MembershipType: 'Demo',
      projectLocation: '/projectList/DemoProjectKey',
      projectOwner: false,
      projectName: 'Demo'
    };
    this.myuserProfile.myusrinfoFromDb = newItem;
    let r = confirm("Start as a New User?");
    if (r == true) {
      this.db.doc<any>('myProfile/' + this.myuserProfile.userAuthenObj.uid).set(newItem);
    }
  }
  CreateDefaultKeys(){

  }
  componentLogOff() {
    this.getSectionsSubscription?.unsubscribe();
    this.getTestcasesSubscription?.unsubscribe();
    this.developmentservice.logout();
  }
}
