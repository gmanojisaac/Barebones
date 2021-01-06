import { Component,OnInit,Inject,ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription, Observable, of} from 'rxjs';
import { UserdataService, projectFlags,projectSub, TestcaseInfo, projectControls, userProfile, MainSectionGroup, myusrinfo, projectVariables } from './service/userdata.service';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { map, switchMap, startWith, withLatestFrom } from 'rxjs/operators';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';

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
        this.myprojectVariables.testcaseslength = 0;
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

  myprojectSub: projectSub ={
    openeditSub:undefined
  };
  
  myuserProfile: userProfile = {
    userAuthenObj: null,//Receive User obj after login success
    myusrinfoFromDb: null,
    keysReadFromDb: undefined,
    mainsubsectionKeys: [],
    selectedPublicProject:'',
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
      editSubsectionControl: [{ value: '' }, Validators.required]

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
    newuserCheck:false,
    showPaymentpage: undefined,//for expired user-remove it
    firstTestcaseEdit: false,//showditutton
    showEditTcButton: false,
    homeNewProject: false,
    homeDeleteProject: false,
    homeCurrentProject: false,
    editModifyProject: undefined,
    editAddMainsec: undefined,
    editDeleteMainsec: undefined,
    editVisibility: undefined,
    editAddSubSec: undefined,
    editDeleteSubsec: undefined,
    editAddProject: undefined,
    editDeleteProject: undefined,
    editUpdateProject: undefined,
  };

  PrivateSections = undefined;
  getPrivateSectionsSubscription: Subscription;
  getPrivateSectionsBehaviourSub = new BehaviorSubject(undefined);
  getPrivateSections = (MainAndSubSectionPrivatekeys: AngularFirestoreDocument<MainSectionGroup>) => {
    //console.log('214',getPrivateSectionsSubscription);
    if (this.getPrivateSectionsSubscription !== undefined) {
      this.getPrivateSectionsSubscription.unsubscribe();
    }
    this.getPrivateSectionsSubscription = MainAndSubSectionPrivatekeys.valueChanges().subscribe((val: any) => {
      console.log('219',val);
      if (val === undefined) {
        this.myuserProfile.mainsubsectionKeys = [];
        this.myuserProfile.keysReadFromDb = [];
        this.getPrivateSectionsBehaviourSub.next(undefined);
      } else {
        if (!Object.keys(val.MainSection).length === true) {
          this.myuserProfile.keysReadFromDb = [];
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
  @ViewChild('drawer') public sidenav: MatSidenav;
  constructor(
    public afAuth: AngularFireAuth,
    public developmentservice: UserdataService,
    private db: AngularFirestore,
    public fb: FormBuilder,
    public dialog: MatDialog

  ) {
    this.myonline = this.getObservableonine(this.developmentservice.isOnline$);
    this.myauth = this.getObservableauthState(this.afAuth.authState);
    const publicProjsel = this.myprojectControls.publicprojectControl.valueChanges.pipe(
      startWith(''),
      map((publicProjectSelected: string) => {
        if (!publicProjectSelected || publicProjectSelected === '') {
          this.localpublicList = [];
          this.myprojectVariables.publicProjectHint = 'Select Task from List';
          this.getPublicListSubscription?.unsubscribe();
          this.publicList = this.getPublicList(this.db.doc(('/projectList/publicProjects')));          
        } else {
          const filteredlist = this.localpublicList.filter((option => option.toLowerCase().includes(publicProjectSelected.toLowerCase())));
          const uniqueinlist = this.localpublicList.filter(publicproj => (publicproj.toLowerCase().localeCompare(publicProjectSelected.toLowerCase()) === 0));
          const isOnwnerCheck = this.localprivateList.filter(privateproj => (privateproj.toLowerCase().localeCompare(publicProjectSelected.toLowerCase()) === 0));

          if (uniqueinlist.length > 0) {
            if (isOnwnerCheck.length > 0) {
              this.myprojectFlags.homeDeleteProject = true;
            } else {
              this.myprojectFlags.homeDeleteProject = false;
            }
            this.myprojectFlags.homeNewProject = false;

            if (this.myuserProfile.myusrinfoFromDb.projectName === publicProjectSelected) {
              this.myprojectVariables.publicProjectHint = 'Already Current Project';
              this.myprojectFlags.homeCurrentProject = false;
            } else {
              this.myprojectVariables.publicProjectHint = '';
              this.myprojectFlags.homeCurrentProject = true;
            }
          } else {
            if (this.myuserProfile.myusrinfoFromDb.MembershipType === 'Demo') {
              this.myprojectFlags.homeNewProject = false;
            } else {
              this.myprojectFlags.homeNewProject = true;
            }
            this.myprojectFlags.homeCurrentProject = false;
            this.myprojectFlags.homeDeleteProject = false;
            this.myprojectVariables.publicProjectHint = '';

          }                  
          this.myuserProfile.selectedPublicProject= publicProjectSelected;
          this.myuserProfile.myusrinfoFromDb.projectLocation = 'publicProjectKeys/' + publicProjectSelected;
          this.getPublicListBehaviourSub.next(filteredlist);
 
        }
      }));
    const EditSubSectionSelection = this.myprojectControls.editSubsectionGroup.valueChanges.pipe(
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

          this.myuserProfile.subSectionKeys = filteredlist;
        } else {

        }
      }));
    const EditVisibility = this.myprojectControls.visibilityMainsectionGroup.valueChanges.pipe(
      startWith({ editVisibilityControl: false }),
      map((selectedvisibility: any) => {
        //console.log('459',selectedvisibility);
        if (!selectedvisibility || selectedvisibility.editVisibilityControl !== null) {
          if (this.myuserProfile.savedMainSectionKey !== undefined) {
            const filteredlist = this.myuserProfile.mainsubsectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare((this.myuserProfile.savedMainSectionKey).toLowerCase()) === 0));
            if (filteredlist.length > 0) {
              if (selectedvisibility.editVisibilityControl === this.myuserProfile.savedisabledval) {
              } else {
              }
            } else {
              const filteredlist = this.myuserProfile.mainsubsectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare((this.myuserProfile.savedMainSectionKey).toLowerCase()) === 0));

            }
          } else {

          }

        } else {

        }
      }));
    const MainSecKeysSelection = this.myprojectControls.editMainsectionGroup.valueChanges.pipe(
      startWith({ editMainsectionControl: '' }),
      map((editMainSecSelected: any) => {
        console.log('344',editMainSecSelected);
        if (editMainSecSelected.editMainsectionControl !== null && editMainSecSelected.editMainsectionControl !== '') {
          this.myuserProfile.subSectionKeys = [];

          this.myuserProfile.savedMainSectionKey = editMainSecSelected.editMainsectionControl;
          this.myuserProfile.keysReadFromDb.forEach(eachMainfield => {
            if (editMainSecSelected.editMainsectionControl !== null) {

              if (editMainSecSelected.editMainsectionControl === eachMainfield.name) {
                this.myuserProfile.savedisabledval = eachMainfield.disabled;
                this.myprojectControls.visibilityMainsectionGroup.setValue({ editVisibilityControl: this.myuserProfile.savedisabledval });
                eachMainfield.section.forEach(eachSubfield => {
                  this.myuserProfile.subSectionKeys.push(eachSubfield.viewvalue);
                  this.myuserProfile.savesubSectionKeys = this.myuserProfile.subSectionKeys;
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
        if (!privateProjectSelected || privateProjectSelected === '') {
          this.localprivateList = [];
            this.myprojectVariables.privateProjectHint = 'Select Task from List';
            //this.PrivateSections = of(undefined);
            this.getPrivateListSubscription?.unsubscribe();
            this.privateList = this.getPrivateList(this.db.doc(('/projectList/' + this.myuserProfile.userAuthenObj.uid)));
         } else {

          const filteredlist = this.localprivateList.filter((option => option.toLowerCase().includes(privateProjectSelected.toLowerCase())));
          //this.getPrivateSectionsSubscription?.unsubscribe();
          this.myuserProfile.myusrinfoFromDb.projectName = privateProjectSelected;
          this.myuserProfile.myusrinfoFromDb.projectLocation = 'publicProjectKeys/' + privateProjectSelected;
          this.PrivateSections = this.getPrivateSections(this.db.doc(this.myuserProfile.myusrinfoFromDb.projectLocation));
        }
      }),
      withLatestFrom(MainSecKeysSelection, EditVisibility, EditSubSectionSelection));
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
                    if (!Object.keys(profilevalbef).length === true) {
                      this.developmentservice.findOrCreate(afterauth.uid).then(success => {
                        if (success !== 'doc exists') {
                          alert('check internet Connection');
                          this.myprojectFlags.newuserCheck = false;
                          this.Sections = of(undefined);
                        } else {
                          console.log(success, afterauth.uid);
                          this.myprojectFlags.newuserCheck = true;
                          this.Sections = of(null);
                        }
                      });
                    } else {
                      //console.log('386',profilevalbef);
                      this.loadFirstPageKeys(profilevalbef);
                      this.getSectionsSubscription?.unsubscribe();
                      this.myuserProfile.myusrinfoFromDb = profilevalbef;
                      this.Sections = this.getSections(this.db.doc(this.myuserProfile.myusrinfoFromDb.projectLocation));
                    }
                  }),
                  withLatestFrom(publicProjsel, keysselection, privateProjsel),
                  map((values: any) => {
                    const [publickey, keys] = values;
                    return onlineval;
                  })
                )
              } else {
                this.getPrivateListSubscription?.unsubscribe();
                this.myprojectSub.openeditSub?.unsubscribe();
                this.getPrivateSectionsBehaviourSub?.unsubscribe();
                this.getSectionsSubscription?.unsubscribe();
                this.getTestcasesSubscription?.unsubscribe();
                this.getPublicListSubscription?.unsubscribe();
                this.myprojectControls.subsectionkeysControl.reset();
                return of(false);
              }
            }));
        } else {
          this.myprojectSub.openeditSub?.unsubscribe();
          this.getPrivateListSubscription?.unsubscribe();
          this.getPrivateSectionsBehaviourSub?.unsubscribe();
          this.getSectionsSubscription?.unsubscribe();
          this.getTestcasesSubscription?.unsubscribe();
          this.getPublicListSubscription?.unsubscribe();
          this.myprojectControls.subsectionkeysControl.reset();
          return of(false);
        }
      })
    );
  }
  NewProject() {
    this.myuserProfile.selectedPublicProject=this.myprojectControls.publicprojectControl.value;
    const ProjectName = this.myprojectControls.publicprojectControl.value;
    const newKeys = [{
      name: 'MainSection',
      disabled: false,
      section: [{
        viewvalue: 'SubSection'
      }]
    }];
    const newItem = {
      projectLocation: 'publicProjectKeys/' + ProjectName,
      projectOwner: true,
      projectName: ProjectName
    };
    this.developmentservice.createnewproject(this.myuserProfile.userAuthenObj.uid, ProjectName, newItem, newKeys).then(success => {
      this.myprojectFlags.homeDeleteProject = false;
      this.myprojectFlags.homeNewProject = false;
      this.myprojectFlags.homeCurrentProject = false;
      this.myprojectControls.publicprojectControl.reset();
      this.saveCurrProject();
    });
  }
  DeleteProject() {
    this.myuserProfile.selectedPublicProject='Demo';    
    const ProjectName = this.myprojectControls.publicprojectControl.value;
    let r = confirm("Confirm Project Delete?");
    if (r == true) {
      const newItem = {
        projectLocation: 'projectList/DemoProjectKey',
        projectOwner: true,
        projectName: 'Demo'
      };
      this.developmentservice.deleteproject(this.myuserProfile.userAuthenObj.uid, ProjectName, newItem).then(success => {
        this.myprojectFlags.homeDeleteProject = false;
        this.myprojectFlags.homeNewProject = false;
        this.myprojectFlags.homeCurrentProject = false;        
        this.myprojectControls.publicprojectControl.reset();
        this.saveCurrProject();
      });
    }
  }
  saveCurrProject(){
    this.myuserProfile.myusrinfoFromDb.projectName = this.myuserProfile.selectedPublicProject;
    this.getSectionsSubscription?.unsubscribe();
    if(this.myuserProfile.myusrinfoFromDb.projectName === 'Demo'){
      this.Sections = this.getSections(this.db.doc('/projectList/DemoProjectKey'));
    }else{
      this.Sections = this.getSections(this.db.doc(this.myuserProfile.myusrinfoFromDb.projectLocation));          
    }
    this.myprojectControls.subsectionkeysControl.reset();
    this.sidenav.close();
  }
      

  NewMember(){
    const nextMonth: Date = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 12);
    const newItem = {
      MembershipEnd: nextMonth.toDateString(),
      MembershipType: 'Member',
      projectOwner: true
    }
    this.db.doc<any>('myProfile/' + this.myuserProfile.userAuthenObj.uid).set(newItem, {merge:true}).then(success=>{
      this.sidenav.close();
    });
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
  draweropen() {
  }
  drawerclose() {
    this.sidenav.close();
  }
  AddNew() {
    this.myprojectFlags.firstTestcaseEdit = true;
  }
  saveTC() {
    let locationForSave = '';
    if (this.myuserProfile.myusrinfoFromDb.projectName === 'Demo') {
      locationForSave = '/projectList/' + this.myuserProfile.userAuthenObj.uid;
    } else {
      const userselection = this.myprojectControls.subsectionkeysControl.value;
      //console.log('userselection', userselection);
      locationForSave = this.myuserProfile.myusrinfoFromDb.projectName + '/' + userselection.groupValue + '/items/' + userselection.value;
    }
    const updateObject: TestcaseInfo = {
      heading: this.myprojectControls.createTestcaseControl.value,//Heading in testcase list
      subHeading: 'Edit SubHeading',//Sub-Heading in testcase list
      description: 'Edit here!',//Description in testcase view
      linktoTest: 'https://www.google.com/'//stackblitzLink in testcase edit/doubleclick
    };
    this.developmentservice.createNewTestcase(locationForSave, updateObject).then(success => {
      this.myprojectFlags.firstTestcaseEdit = false;
      this.myprojectControls?.createTestcaseControl.reset();
      this.myprojectFlags.showEditTcButton = false;
    });

  }
  exitTC() {
    this.myprojectFlags.firstTestcaseEdit = false;
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
  openedit() {
    let locationForEdit = '';
    if (this.myuserProfile.myusrinfoFromDb.projectName === 'Demo') {
      locationForEdit = '/projectList/' + this.myuserProfile.userAuthenObj.uid;
    } else {
      const userselection = this.myprojectControls.subsectionkeysControl.value;
      locationForEdit = this.myuserProfile.myusrinfoFromDb.projectName + '/' + userselection.groupValue + '/items/' + userselection.value;
    }
    const dialogRef = this.dialog.open(DialogEditTestcase, {
      width: '80vw',
      data: this.myprojectVariables.viewSelectedTestcase,
      disableClose: true
    });
    this.myprojectSub.openeditSub = dialogRef.afterClosed().subscribe(result => {
      if (result !== null) {
        this.myprojectFlags.showEditTcButton = false;
        const updateObject: TestcaseInfo = { ...result };
        this.developmentservice.editTestcase(locationForEdit, this.myprojectVariables.viewSelectedTestcase, updateObject);
        this.myprojectVariables.viewSelectedTestcase = updateObject;
        this.myprojectControls.testcaseInfoControl.setValue(`${updateObject.description}`)
      }
    });
  }
  Delete() {
    let r = confirm("Confirm Tc Delete?");
    if (r == true) {
      let locationForDelete = '';
      if (this.myuserProfile.myusrinfoFromDb.projectName === 'Demo') {
        locationForDelete = '/projectList/' + this.myuserProfile.userAuthenObj.uid;
      } else {
        const userselection = this.myprojectControls.subsectionkeysControl.value;
        locationForDelete = this.myuserProfile.myusrinfoFromDb.projectName + '/' + userselection.groupValue + '/items/' + userselection.value;
      }
      this.developmentservice.deleteTestcase(locationForDelete, this.myprojectVariables.viewSelectedTestcase).then(success => {
        const updateObject: TestcaseInfo = {
          heading: this.myprojectControls.createTestcaseControl.value,//Heading in testcase list
          subHeading: 'Edit SubHeading',//Sub-Heading in testcase list
          description: 'Edit here!',//Description in testcase view
          linktoTest: 'https://www.google.com/'//stackblitzLink in testcase edit/doubleclick
        };

        this.myprojectVariables.viewSelectedTestcase = updateObject;
        this.myprojectControls.testcaseInfoControl.setValue(`${updateObject.description}`);
        this.myprojectFlags.showEditTcButton = false;
      });
    } else {
      this.myprojectFlags.showEditTcButton = true;
    }


  }
  componentLogOff() {
    this.getPrivateSectionsSubscription?.unsubscribe();
    this.getPrivateListSubscription?.unsubscribe();
    this.myprojectSub.openeditSub?.unsubscribe();
    this.getPrivateSectionsBehaviourSub?.unsubscribe();
    this.getPublicListSubscription?.unsubscribe();
    this.getSectionsSubscription?.unsubscribe();
    this.getTestcasesSubscription?.unsubscribe();
    this.developmentservice.logout();
  }
  refreshList(item: TestcaseInfo) {//When user Selects testitem by doubleclick
    this.myprojectFlags.showEditTcButton = true;
    this.myprojectVariables.viewSelectedTestcase = item;//`${item.subHeading}`;
    this.myprojectControls.testcaseInfoControl.setValue(`${item.description}`)
  }
}


@Component({
  selector: 'dialog-edit-testcase',
  template: `
  <h1 mat-dialog-title>Edit TestCase</h1>
  <div mat-dialog-content>
  <form [formGroup]="userProfile" fxLayout="row wrap" fxLayoutAlign="center center">
    <mat-form-field appearance="fill" floatLabel="Edit Sub-Heading" fxFlex="75vw">
      <mat-label>Change Sub-Heading</mat-label>
      <input matInput placeholder="Sub-Heading" formControlName = "subHeading">
    </mat-form-field>
    <mat-form-field appearance="fill" floatLabel="Edit Link" fxFlex="75vw">
    <mat-label>Update in Stackblitz</mat-label>
    <input matInput placeholder="Stackblitz github link" formControlName = "linktoTest">
    </mat-form-field>
    <mat-form-field appearance="fill" floatLabel="Edit Description" fxFlex="75vw">
      <mat-label>Give More Information</mat-label>
      <textarea 
        matInput 
        placeholder="Explain More here" 
        formControlName = "description"
        cdkTextareaAutosize
        cdkAutosizeMinRows="13"
        cdkAutosizeMaxRows="70" 
        ></textarea>
    </mat-form-field>
  </form>  
</div>
<div mat-dialog-actions>
<button mat-button mat-raised-button color="primary" [mat-dialog-close]="userProfile.value"  [disabled]="userProfile.pristine">Update</button>
  <button mat-button mat-raised-button color="warn" (click)="onNoClick()" cdkFocusInitial >Cancel</button>  
</div> `
})
export class DialogEditTestcase implements OnInit {
  userProfile: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<DialogEditTestcase>,
    @Inject(MAT_DIALOG_DATA) public data: TestcaseInfo,
    private fb: FormBuilder) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  ngOnInit() {
    this.userProfile = this.fb.group({
      heading: [this.data.heading],
      subHeading: [this.data.subHeading],
      description: [this.data.description],
      linktoTest: [this.data.linktoTest]
    });
  }
}