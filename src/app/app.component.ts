import { Component } from '@angular/core';
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import { UserdataService, projectFlags, TestcaseInfo, projectControls, userProfile, MainSectionGroup, myusrinfo, projectVariables } from './service/userdata.service';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { map, switchMap, startWith, withLatestFrom } from 'rxjs/operators';
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

  SectionTc = of(undefined);
  getTestcasesSubscription: Subscription;
  getTestcasesBehaviourSub = new BehaviorSubject(undefined);
  getTestcases = (TestcaseList: AngularFirestoreDocument<TestcaseInfo>) => {
    if (this.getTestcasesSubscription !== undefined) {
      this.getTestcasesSubscription.unsubscribe();
    }
    this.getTestcasesSubscription = TestcaseList.valueChanges().subscribe((val: any) => {

      if (val === undefined) {
        this.getTestcasesBehaviourSub.next(undefined);
      } else {
        if (val.testcase.length === 0) {

          this.myprojectVariables.testcaseslength = 0;
          this.getTestcasesBehaviourSub.next(null);
        } else {
          if (val.testcase.length !== 0) {
            this.myprojectVariables.testcaseslength = val.testcase.length;
            this.getTestcasesBehaviourSub.next(val.testcase);
          } else {
            //deal witH demo case
          }
        }
      }

    });

    return this.getTestcasesBehaviourSub;
  };

  publicList = of(undefined);
  localpublicList = [];
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
        if (val.public.length === 0) {
          this.getPublicListBehaviourSub.next(null);
        } else {
          this.localpublicList = val.public;
          this.getPublicListBehaviourSub.next(val.public);
        }
      }
    });
    return this.getPublicListBehaviourSub;
  };

  privateList = of(undefined);
  localprivateList = [];
  getPrivateListSubscription: Subscription;
  getPrivateListBehaviourSub = new BehaviorSubject(undefined);
  getPrivateList = (privateProjects: AngularFirestoreDocument<any>) => {
    if (this.getPrivateListSubscription !== undefined) {
      this.getPrivateListSubscription.unsubscribe();
    }
    this.getPrivateListSubscription = privateProjects.valueChanges().subscribe((val: any) => {
      console.log('val', val);
      if (val === undefined) {
        this.getPrivateListBehaviourSub.next(undefined);
      } else {
        if (val.ownerRecord.length === 0) {
          this.getPrivateListBehaviourSub.next(null);
        } else {
          this.localprivateList = val.ownerRecord;
          this.getPrivateListBehaviourSub.next(val.ownerRecord);
        }
      }
    });
    return this.getPrivateListBehaviourSub;
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
      editSubsectionControl:[{ value: '' }, Validators.required]

    })
  };
  myprojectVariables: projectVariables = {
    initialMainSection: undefined,
    testcaseslength: 0,
    viewSelectedTestcase: undefined,
    publicProjectHint: undefined,
    privateProjectHint: undefined
  };
  myprojectFlags: projectFlags = {
    showPaymentpage: false,
    newuserCheck: false
  };

  PrivateSections = undefined;
  getPrivateSectionsSubscription: Subscription;
  getPrivateSectionsBehaviourSub = new BehaviorSubject(undefined);
  getPrivateSections = (MainAndSubSectionPrivatekeys: AngularFirestoreDocument<MainSectionGroup>) => {
    if (this.getPrivateSectionsSubscription !== undefined) {
      this.getPrivateSectionsSubscription.unsubscribe();
    }
    this.getPrivateSectionsSubscription = MainAndSubSectionPrivatekeys.valueChanges().subscribe((val: any) => {
      if (val === undefined) {
        this.myuserProfile.mainsubsectionKeys = [];
        this.myuserProfile.keysReadFromDb=[];
        this.getPrivateSectionsBehaviourSub.next(undefined);
      } else {
        if (!Object.keys(val.MainSection).length === true) {
          this.myuserProfile.keysReadFromDb=[];
          this.myuserProfile.mainsubsectionKeys = [];
          this.getPrivateSectionsBehaviourSub.next(undefined);
        } else {
          if (val.MainSection !== undefined) {
            this.myuserProfile.keysReadFromDb = val.MainSection;
            this.myuserProfile.mainsubsectionKeys = [];
            this.myuserProfile.keysReadFromDb?.forEach(eachMainfield => {
              this.myuserProfile.mainsubsectionKeys.push(eachMainfield.name);
            });
            this.myprojectControls.editMainsectionGroup.setValue({ editMainsectionControl: '' });
            this.myprojectControls.editSubsectionGroup.setValue({ editSubsectionControl: '' });
            
          }
          this.getPrivateSectionsBehaviourSub.next(val.MainSection);
        }
      }
    });
    
    return this.getPrivateSectionsBehaviourSub;
  };

  constructor(
    public afAuth: AngularFireAuth,
    public developmentservice: UserdataService,
    private db: AngularFirestore,
    public fb: FormBuilder
  ) {
    this.myonline = this.getObservableonine(this.developmentservice.isOnline$);
    this.myauth = this.getObservableauthState(this.afAuth.authState);
    const publicProjsel = this.myprojectControls.publicprojectControl.valueChanges.pipe(
      startWith(''),
      map((publicProjectSelected: string) => {
        if (publicProjectSelected !== '') {
          const filteredlist = this.localpublicList.filter((option => option.toLowerCase().includes(publicProjectSelected.toLowerCase())));
          this.getSectionsSubscription?.unsubscribe();
          this.myuserProfile.myusrinfoFromDb.projectName = publicProjectSelected;
          this.myuserProfile.myusrinfoFromDb.projectLocation = 'publicProjectKeys/' + publicProjectSelected;
          this.Sections = this.getSections(this.db.doc(this.myuserProfile.myusrinfoFromDb.projectLocation));
          this.getPublicListBehaviourSub.next(filteredlist);
        } else {
          if (publicProjectSelected === null) {
            this.localpublicList = [];
          } else {
            this.localpublicList = [];
            this.myprojectVariables.publicProjectHint = 'Select Task from List';
            this.getPublicListSubscription?.unsubscribe();
            this.publicList = this.getPublicList(this.db.doc(('/projectList/publicProjects')));
          }
        }
      }));

      const EditSubSectionSelection= this.myprojectControls.editSubsectionGroup.valueChanges.pipe(
        startWith({ editSubsectionControl: '' }), 
        map((editSubSecSelected: any) => {
          //check not null
          if (editSubSecSelected.editSubsectionControl !== null && editSubSecSelected.editSubsectionControl !== '') {
            const userselection = editSubSecSelected.editSubsectionControl;
            const filteredlist = this.myuserProfile.savesubSectionKeys.filter((option => option.toLowerCase().includes(userselection.toLowerCase())));
            const uniqueinlist = this.myuserProfile.savesubSectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare(userselection.toLowerCase()) === 0));
            if (uniqueinlist.length > 0) {
            } else {
            }
            
            this.myuserProfile.subSectionKeys= filteredlist;
          } else {

          }
        }));

      const EditVisibility=this.myprojectControls.visibilityMainsectionGroup.valueChanges.pipe(
        startWith({ editVisibilityControl: false }),
        map((selectedvisibility:any) => {
        //console.log('459',selectedvisibility);
        if (!selectedvisibility || selectedvisibility.editVisibilityControl !== null ) {
          if(this.myuserProfile.savedMainSectionKey !== undefined){
            const filteredlist = this.myuserProfile.mainsubsectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare((this.myuserProfile.savedMainSectionKey).toLowerCase()) === 0));
            if (filteredlist.length > 0) {
              if(selectedvisibility.editVisibilityControl === this.myuserProfile.savedisabledval){    
              }else{
              }             
            }else{
              const filteredlist = this.myuserProfile.mainsubsectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare((this.myuserProfile.savedMainSectionKey).toLowerCase()) === 0));

            }
          }else{
            
          }

        }else{

        }
      }));
      const MainSecKeysSelection=this.myprojectControls.editMainsectionGroup.valueChanges.pipe(
        startWith({ editMainsectionControl: '' }),
        map((editMainSecSelected: any) => {
          if (editMainSecSelected.editMainsectionControl !== null && editMainSecSelected.editMainsectionControl !== '') {
            this.myuserProfile.subSectionKeys = [];

            this.myuserProfile.savedMainSectionKey=editMainSecSelected.editMainsectionControl;
            this.myuserProfile.keysReadFromDb.forEach(eachMainfield => {
              if (editMainSecSelected.editMainsectionControl !== null) {

                if (editMainSecSelected.editMainsectionControl === eachMainfield.name) {
                  this.myuserProfile.savedisabledval = eachMainfield.disabled;
                  this.myprojectControls.visibilityMainsectionGroup.setValue({ editVisibilityControl: this.myuserProfile.savedisabledval });
                  eachMainfield.section.forEach(eachSubfield => {
                    this.myuserProfile.subSectionKeys.push(eachSubfield.viewvalue);
                    this.myuserProfile.savesubSectionKeys=this.myuserProfile.subSectionKeys;
                  });
                } else {

                }

              }
            });
          }
          //return editMainSecSelected.editMainsectionControl;
        }));
    const privateProjsel = this.myprojectControls.ownPublicprojectControl.valueChanges.pipe(
      startWith(''),
      map((privateProjectSelected: string) => {
        if (privateProjectSelected !== '') {
          const filteredlist = this.localprivateList.filter((option => option.toLowerCase().includes(privateProjectSelected.toLowerCase())));
          this.getSectionsSubscription?.unsubscribe();
          this.myuserProfile.myusrinfoFromDb.projectName = privateProjectSelected;
          this.myuserProfile.myusrinfoFromDb.projectLocation = 'publicProjectKeys/' + privateProjectSelected;
          this.PrivateSections = this.getPrivateSections(this.db.doc(this.myuserProfile.myusrinfoFromDb.projectLocation));
          this.getPrivateListBehaviourSub.next(filteredlist);
        } else {
          if (privateProjectSelected === null) {
            this.localprivateList = [];
          } else {
            this.localprivateList = [];
            this.myprojectVariables.privateProjectHint = 'Select Task from List';         
            this.PrivateSections= of(undefined);
            this.getPrivateListSubscription?.unsubscribe();  
            this.privateList = this.getPrivateList(this.db.doc(('/projectList/' + this.myuserProfile.userAuthenObj.uid)));
          }
        }
      }),
      withLatestFrom(MainSecKeysSelection, EditVisibility,EditSubSectionSelection),
      map((values: any) => {
        const [publickey, keys] = values;

      }));
    const keysselection = this.myprojectControls.subsectionkeysControl.valueChanges
      .pipe(startWith({ value: '', groupValue: '' }),
        map((selection: any) => {
          if (!selection || selection.groupValue === '') {
            this.myprojectVariables.initialMainSection = 'SubSection';
            this.SectionTc = of(undefined);
          } else {
            this.myprojectVariables.initialMainSection = selection.groupValue;
            if (this.myuserProfile.myusrinfoFromDb.projectName === 'Demo') {
              this.getTestcasesSubscription?.unsubscribe();
              this.SectionTc = this.getTestcases(this.db.doc('projectList/' + this.myuserProfile.userAuthenObj.uid));
            } else {
              this.getTestcasesSubscription?.unsubscribe();
              this.SectionTc = this.getTestcases(this.db.doc('/' + this.myuserProfile.myusrinfoFromDb.projectName + '/' + selection.groupValue + '/items/' + selection.value));
            }
          }
        })
      );
    this.AfterOnlineCheckAuth = this.myonline.pipe(
      switchMap((onlineval: any) => {
        if (onlineval === true) {
          return this.myauth.pipe(
            switchMap((afterauth: firebase.User) => {
              if (afterauth !== null && afterauth !== undefined) {
                this.myuserProfile.userAuthenObj = afterauth;
                return docData(this.db.firestore.doc('myProfile/' + afterauth.uid)).pipe(
                  map((profilevalbef: any) => {
                    console.log('98-false- means profile exists', !Object.keys(profilevalbef).length);
                    if (!Object.keys(profilevalbef).length === true) {
                      this.developmentservice.findOrCreate(afterauth.uid).then(success => {
                        if (success !== 'doc exists') {
                          alert('check internet Connection');
                          this.myprojectFlags.newuserCheck = false;
                          this.Sections = of(undefined);
                          //return onlineval;
                        } else {
                          console.log(success, afterauth.uid);
                          this.myprojectFlags.newuserCheck = true;
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


                  }),
                  withLatestFrom(publicProjsel, keysselection,privateProjsel),
                  map((values: any) => {
                    const [publickey, keys] = values;
                    return onlineval;
                  })
                )
              } else {
                this.getSectionsSubscription?.unsubscribe();
                this.getTestcasesSubscription?.unsubscribe();
                this.getPublicListSubscription?.unsubscribe();
                this.myprojectControls.subsectionkeysControl.reset();
                return of(false);
              }
            }));
        } else {
          this.getSectionsSubscription?.unsubscribe();
          this.getTestcasesSubscription?.unsubscribe();
          this.getPublicListSubscription?.unsubscribe();
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
  CreateDefaultKeys() {
    const MainSection = [{
      name: 'MainSection',
      disabled: false,
      section: [{
        viewvalue: 'SubSection'
      }]
    }];
    //delete the default testCase if any
    this.db.doc<any>('publicProjectKeys/' + this.myuserProfile.myusrinfoFromDb.projectName).set({ MainSection }, { merge: false }).then(success => {
      this.myprojectControls.subsectionkeysControl.reset();
    })
  }
  componentLogOff() {
    this.getPublicListSubscription?.unsubscribe();
    this.getSectionsSubscription?.unsubscribe();
    this.getTestcasesSubscription?.unsubscribe();
    this.developmentservice.logout();
  }
}
