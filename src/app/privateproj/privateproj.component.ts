import { Component, OnInit,Input,AfterViewInit, OnDestroy } from '@angular/core';
import { map, switchMap, startWith, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import { UserdataService, projectFlags, TestcaseInfo, projectControls, userProfile, MainSectionGroup, myusrinfo, projectVariables } from '../service/userdata.service';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';

@Component({
  selector: 'app-privateproj',
  templateUrl: './privateproj.component.html',
  styleUrls: ['./privateproj.component.scss']
})
export class PrivateprojComponent implements OnInit,AfterViewInit,OnDestroy {
  @Input() profileinfoUid: firebase.User;

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
        if ((val.MainSection.length === 0) ) {
          this.myuserProfile.keysReadFromDb=[];
          this.myuserProfile.mainsubsectionKeys = [];
          this.getPrivateSectionsBehaviourSub.next(undefined);
        } else {
          if ((val.MainSection.length !== 0) ) {
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

  myuserProfile: userProfile = {
    userAuthenObj: null,//Receive User obj after login success
    myusrinfoFromDb: {
      MembershipEnd: new Date(),
      MembershipType: '',
      projectLocation: '',
      projectName: '',
      projectOwner: false
    },
    keysReadFromDb: undefined,
    mainsubsectionKeys: [],
    subSectionKeys: undefined,
    savedMainSectionKey: undefined,
    savesubSectionKeys: undefined,
    savedisabledval: undefined
  };

  myprojectVariables: projectVariables = {
    privateProjectHint: undefined
  };

  myprojectControls: projectControls = {
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
  privateProjsel:Subscription;

  constructor(    public developmentservice: UserdataService,
    public fb: FormBuilder,
    private db: AngularFirestore
    ) { 

    }

  ngOnInit(): void {
    console.log('profileinfoUid',this.profileinfoUid);
  }

  ngAfterViewInit(){
    this.myuserProfile.userAuthenObj=this.profileinfoUid;
    console.log('profileinfoUid',this.profileinfoUid);
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
  this.privateProjsel = this.myprojectControls.ownPublicprojectControl.valueChanges.pipe(
    startWith(''),
    map((privateProjectSelected: string) => {
      if (privateProjectSelected !== '') {
        const filteredlist = this.localprivateList.filter((option => option.toLowerCase().includes(privateProjectSelected.toLowerCase())));
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

    })).subscribe(_=>{

    });
  }

  ngOnDestroy(){
    this.privateProjsel.unsubscribe();
    this.getPrivateListSubscription?.unsubscribe();
    this.getPrivateSectionsSubscription?.unsubscribe();
  }
}
