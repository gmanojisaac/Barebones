import { Component } from '@angular/core';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { UserdataService,projectControls, myusrinfo,projectVariables, userProfile,projectFlags, MainSectionGroup,TestcaseInfo,SubSection } from './service/userdata.service';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { map, switchMap, filter,startWith } from 'rxjs/operators';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/firestore';
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
      console.log(val);
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
  AfterOnlineCheckAuth=undefined;

  myProfileInfo = undefined;
  getProfileInfoBehaviourSub = new BehaviorSubject(undefined);
  getProfileInfoSubscription: Subscription;
  getProfileInfo = (ProfileInfoDoc: AngularFirestoreDocument<myusrinfo>) => {
    if (this.getProfileInfoSubscription !== undefined) {
      this.getProfileInfoSubscription.unsubscribe();
    }
    this.getProfileInfoSubscription = ProfileInfoDoc.valueChanges().subscribe(async (val: myusrinfo) => {
      if (val === undefined) {
        this.getProfileInfoBehaviourSub.next(undefined);
      }else{
        this.getProfileInfoBehaviourSub.next(val);
      }
    });
    return this.getProfileInfoBehaviourSub;
  };

  Sections: Observable<MainSectionGroup[]>;
  getSectionsSubscription: Subscription;
  getSectionsBehaviourSub = new BehaviorSubject(undefined);
  getSections = (MainAndSubSectionkeys: AngularFirestoreDocument<MainSectionGroup[]>) => {
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

  publicList;
  localpublicList: string[] = [];
  getPublicListSubscription: Subscription;
  getPublicListBehaviourSub = new BehaviorSubject(undefined);
  getPublicList = (publicProjects: AngularFirestoreDocument<any>) => {
    if (this.getPublicListSubscription !== undefined) {
      this.getPublicListSubscription.unsubscribe();
    }
    this.getPublicListSubscription = publicProjects.valueChanges().subscribe((val: any) => {
      if (val === undefined) {
        this.getPublicListBehaviourSub.next(undefined);
      } else {
        if (val.public === undefined || !Object.keys(val.public).length === true) {
          this.getPublicListBehaviourSub.next(undefined);
        } else {
          if (val.public !== undefined) {
            console.log('val.public',val.public);
            this.localpublicList = val.public;
            this.getPublicListBehaviourSub.next(val.public);
          }
        }
      }
    });
    return this.getPublicListBehaviourSub;
  };

  privateList;
  localprivateList: string[] = [];
  getPrivateListSubscription: Subscription;
  getPrivateListBehaviourSub = new BehaviorSubject(undefined);
  getPrivateList = (privateProjects: AngularFirestoreDocument<any>) => {
    if (this.getPrivateListSubscription !== undefined) {
      this.getPrivateListSubscription.unsubscribe();
    }
    this.getPrivateListSubscription = privateProjects.valueChanges().subscribe((val: any) => {
      if (val === undefined) {
        this.getPrivateListBehaviourSub.next(undefined);
      } else {
        if (val.ownerRecord === undefined || !Object.keys(val.ownerRecord).length === true) {
          //3 types of response
          //1. no doc uid in projectList Collection-> returns undefined
          //2. doc is there with testcase field and no ownerRecord field-> val.ownerRecord returns undefined
          //3.doc/ownerRecord field is there with empty array of private projects-> objectCheck Length will be false

          this.getPrivateListBehaviourSub.next(undefined);
        } else {
          if (val.ownerRecord !== undefined) {
            this.localprivateList = val.ownerRecord;
            this.getPrivateListBehaviourSub.next(val.ownerRecord);
          }
        }
      }
    });
    return this.getPrivateListBehaviourSub;
  };



  myusrinfo: myusrinfo= {
    MembershipEnd:undefined,
    MembershipType:undefined,
    projectLocation:undefined,
    projectName:undefined,
    projectOwner:undefined
  };

  myuserProfile: userProfile = {
    userAuthenObj: null,//Receive User obj after login success
    myusrinfoFromDb:null,
    keysReadFromDb:undefined,
    mainsubsectionKeys:undefined,
    subSectionKeys:undefined,
    savedMainSectionKey:undefined,
    savesubSectionKeys:undefined,
    savedisabledval:undefined
   };
   myprojectFlags: projectFlags= {    
    showPaymentpage:false
  };
  myprojectVariables: projectVariables = {
    initialMainSection:undefined,
    testcaseslength:0,
    viewSelectedTestcase: undefined
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

  constructor( 
    public afAuth: AngularFireAuth,    
    public developmentservice: UserdataService,
    private db: AngularFirestore,
    public fb: FormBuilder
    ){     


    this.myonline = this.getObservableonine(this.developmentservice.isOnline$);
    this.myauth = this.getObservableauthState(this.afAuth.authState);
    this.AfterOnlineCheckAuth = this.myonline.pipe(
      filter((offline) => offline !== false),
      switchMap((onlineval: any) => {
        return this.myauth.pipe(
          filter(authstat => authstat !== undefined),
          map((afterauth: any) => {
           if(afterauth !== null){
            this.myuserProfile.userAuthenObj=afterauth;
            this.myProfileInfo=this.getProfileInfo(this.db.doc('myProfile/' + afterauth.uid)).pipe(
              map((profileval: any)=>{                
                if(profileval === undefined){
                  const nextMonth: Date = new Date();
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  const newItem:myusrinfo = {
                    MembershipEnd: nextMonth,
                    MembershipType: 'Demo',
                    projectLocation: '/projectList/DemoProjectKey',
                    projectOwner: false,
                    projectName: 'Demo'
                  };
                  this.myuserProfile.myusrinfoFromDb= newItem;
                  return this.myuserProfile.myusrinfoFromDb;
                } else {
                  this.myuserProfile.myusrinfoFromDb=profileval;
                  if (new Date(this.myuserProfile.myusrinfoFromDb.MembershipEnd).valueOf() < new Date().valueOf()) {
                    if (this.myuserProfile.myusrinfoFromDb.MembershipType === 'Demo') {//expired
                      this.myuserProfile.myusrinfoFromDb.projectOwner = false;//cannot add tc
                      this.myuserProfile.myusrinfoFromDb.projectName = 'Demo';
                      this.myuserProfile.myusrinfoFromDb.projectLocation = '/projectList/DemoProjectKey';
                      this.myuserProfile.myusrinfoFromDb.MembershipType = 'Demo';
                      this.myuserProfile.myusrinfoFromDb.MembershipEnd = new Date(this.myuserProfile.myusrinfoFromDb.MembershipEnd);
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
                    this.myprojectFlags.showPaymentpage = false;
                  }//end normal
                  this.Sections= this.getSections(this.db.doc(this.myuserProfile.myusrinfoFromDb.projectLocation));
                  this.publicList= this.getPublicList(this.db.doc(('/projectList/publicProjects')));
                  this.privateList = this.getPrivateList(this.db.doc(('/projectList/' + this.myuserProfile.userAuthenObj.uid)));                              
         /*      this.SectionTc = this.myprojectControls.subsectionkeysControl.valueChanges
                  .pipe(startWith({ value: '', groupValue: '' }),
                    map((selection: any) => {
                      if (!selection || selection.groupValue === '') {
                        this.myprojectVariables.initialMainSection = 'SubSection';
                      } else {
                        this.myprojectVariables.initialMainSection = selection.groupValue;
                        if ( this.myuserProfile.myusrinfoFromDb.projectName === 'Demo') {
                          return this.getTestcases(this.db.doc( 'projectList/' + this.myuserProfile.userAuthenObj.uid));
                        } else {
                          return this.getTestcases(this.db.doc('/' + this.myuserProfile.myusrinfoFromDb.projectName + '/' + selection.groupValue + '/items/' + selection.value));
                        }            
                      }
                    })
                  );*/
                }
              }));
           return onlineval;
           }else{
            const nextMonth: Date = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const newItem:myusrinfo = {
              MembershipEnd: nextMonth,
              MembershipType: 'Demo',
              projectLocation: '/projectList/DemoProjectKey',
              projectOwner: false,
              projectName: 'Demo'
            };
            this.myuserProfile.myusrinfoFromDb=newItem;
            this.getProfileInfoSubscription?.unsubscribe();
            this.getSectionsSubscription?.unsubscribe();
            this.getPublicListSubscription?.unsubscribe();
            this.getPrivateListSubscription?.unsubscribe();
            return false;
           }            
          })
        )
      })
    );
  }
  changelist(){
    const some=[
      "some",
      "fwsd"
    ];
    this.getPublicListBehaviourSub.next(some);
  }
  componentLogOff(){
    this.developmentservice.logout();
  }
}
