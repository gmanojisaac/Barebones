import { Component, ChangeDetectionStrategy, OnInit,Input,AfterViewInit, OnDestroy } from '@angular/core';
import { map, switchMap, startWith, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import { UserdataService, projectFlags, TestcaseInfo, projectControls, userProfile, MainSectionGroup, myusrinfo, projectVariables } from '../service/userdata.service';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';

@Component({
  selector: 'app-privateproj',
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './privateproj.component.html',
  styleUrls: ['./privateproj.component.scss']
})
export class PrivateprojComponent implements OnInit,AfterViewInit,OnDestroy {
  @Input() profileinfoUid: firebase.User;
  myhint='';
  privateList = of(undefined);
  localprivateList = [];
  getPrivateListSubscription: Subscription;
  getPrivateListBehaviourSub = new BehaviorSubject(undefined);
  getPrivateList = (privateProjects: AngularFirestoreDocument<any>) => {
    if (this.getPrivateListSubscription !== undefined) {
      this.getPrivateListSubscription.unsubscribe();
    }
    this.getPrivateListSubscription = privateProjects.valueChanges().subscribe((val: any) => {
      //console.log('val', val);
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
        this.myuserProfile.mainsubsectionKeys = of(undefined);
        this.myuserProfile.keysReadFromDb=[];
        this.myuserProfile.dupmainsubsectionKeys = [];
        this.getPrivateSectionsBehaviourSub.next(undefined);
      } else {
        if ((val.MainSection.length === 0) ) {
          this.myuserProfile.keysReadFromDb=[];
          this.myuserProfile.mainsubsectionKeys =of(undefined);
          this.myuserProfile.dupmainsubsectionKeys = [];

          this.getPrivateSectionsBehaviourSub.next(undefined);
        } else {
          if ((val.MainSection.length !== 0) ) {
            this.myuserProfile.keysReadFromDb = val.MainSection;
            this.myuserProfile.dupmainsubsectionKeys=[];
            this.myuserProfile.mainsubsectionKeys = of(undefined);
            this.myuserProfile.keysReadFromDb?.forEach(eachMainfield => {              
              this.myuserProfile.dupmainsubsectionKeys.push(eachMainfield.name);              
            });
            this.myuserProfile.mainsubsectionKeys=of(this.myuserProfile.dupmainsubsectionKeys);
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
    mainsubsectionKeys: undefined,
    dupmainsubsectionKeys: [],
    subSectionKeys: undefined,
    savedMainSectionKey: undefined,
    savesubSectionKeys: undefined,
    savedisabledval: undefined
  };

  myprojectVariables: projectVariables = {
    privateProjectHint: undefined,
    lastSavedVisibility: false,
    editProjectkeysSaved: undefined
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
 add= false;
 update=false;
 delete=false;

  constructor(    public developmentservice: UserdataService,
    public fb: FormBuilder,
    private db: AngularFirestore
    ) { 

    }

  ngOnInit(): void {
    //console.log('profileinfoUid',this.profileinfoUid);
  }

  ngAfterViewInit(){
    this.myuserProfile.userAuthenObj=this.profileinfoUid;
    //console.log('profileinfoUid',this.profileinfoUid);
    const EditSubSectionSelection= this.myprojectControls.editSubsectionGroup.valueChanges.pipe(
      startWith({ editSubsectionControl: '' }), 
      map((editSubSecSelected: any) => {
        //check not null
          //console.log('141',this.myuserProfile.savesubSectionKeys,editSubSecSelected, !editSubSecSelected, editSubSecSelected.editSubsectionControl !== null,editSubSecSelected.editSubsectionControl !== '');
        if (editSubSecSelected.editSubsectionControl !== null && editSubSecSelected.editSubsectionControl !== '') {
          if(this.myuserProfile.savesubSectionKeys !== undefined){
            const userselection = editSubSecSelected.editSubsectionControl;
            const filteredlist = this.myuserProfile.savesubSectionKeys.filter((option => option.toLowerCase().includes(userselection.toLowerCase())));
            const uniqueinlist = this.myuserProfile.savesubSectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare(userselection.toLowerCase()) === 0));
            //console.log('146', uniqueinlist,filteredlist);
            if (uniqueinlist.length > 0) {
              this.delete = true;
              this.add= false;
              this.myhint='Delete SubSectionkeys';
            } else {
              this.delete = false;
              this.add= true;
              this.myhint='Add SubSectionkeys';
            }
            if(filteredlist.length === 0){

            }else{
              this.myuserProfile.subSectionKeys= filteredlist;
            }
           
          }

        } else {

        }
      }));

    const EditVisibility=this.myprojectControls.visibilityMainsectionGroup.valueChanges.pipe(
      startWith({ editVisibilityControl: false }),
      map((selectedvisibility:any) => {
      //console.log('459',selectedvisibility);
      if (!selectedvisibility || selectedvisibility.editVisibilityControl !== null ) {
        if(this.myuserProfile.savedMainSectionKey !== undefined){

          const filteredlist = this.myuserProfile.dupmainsubsectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare((this.myuserProfile.savedMainSectionKey).toLowerCase()) === 0));
          if (filteredlist.length > 0) {
            if(selectedvisibility.editVisibilityControl === this.myuserProfile.savedisabledval){    
              this.update = false;
              this.delete=true;
              this.myprojectControls.editSubsectionGroup.reset();
              this.myprojectControls.editSubsectionGroup.enable();
            }else{
              this.update = true;
              this.myhint='';
              this.delete=false;
              this.add=false;
              this.myprojectControls.editSubsectionGroup.reset();
              this.myprojectControls.editSubsectionGroup.disable();
            }             
          }else{
           

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
          //this.myuserProfile.mainsubsectionKeys=[];
          this.myuserProfile.savedMainSectionKey=editMainSecSelected.editMainsectionControl;
          this.myuserProfile.keysReadFromDb.forEach(eachMainfield => {
            if (editMainSecSelected.editMainsectionControl !== null) {
              //this.myuserProfile.mainsubsectionKeys.push(eachMainfield.name);
              if (editMainSecSelected.editMainsectionControl === eachMainfield.name) {
                this.myuserProfile.savedisabledval = eachMainfield.disabled;
                this.myprojectControls.visibilityMainsectionGroup.setValue({ editVisibilityControl: this.myuserProfile.savedisabledval });
                eachMainfield.section.forEach(eachSubfield => {
                  this.myuserProfile.subSectionKeys.push(eachSubfield.viewvalue);
                });
                this.myuserProfile.savesubSectionKeys=this.myuserProfile.subSectionKeys;
                this.myprojectControls.editSubsectionGroup.enable();
                this.myprojectControls.visibilityMainsectionGroup.enable();
              }                   
            }
          });
          const userselection = editMainSecSelected.editMainsectionControl;
          const filteredlist = this.myuserProfile.dupmainsubsectionKeys.filter((option => option.toLowerCase().includes(userselection.toLowerCase())));
          const uniqueinlist = this.myuserProfile.dupmainsubsectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare(userselection.toLowerCase()) === 0));
          if(uniqueinlist.length > 0){
            this.myprojectControls.visibilityMainsectionGroup.enable();
            this.add = false;
            this.delete=true;
            this.update = false;            
            this.myprojectControls.editSubsectionGroup.enable();
            this.myprojectControls.editSubsectionGroup.reset();
          }else{            
            this.add = true;
            this.update = false;  
            this.delete=false;
            this.myprojectControls.visibilityMainsectionGroup.reset();
            this.myprojectControls.visibilityMainsectionGroup.setValue({ editVisibilityControl: true });
            this.myprojectControls.editSubsectionGroup.reset();
            this.myprojectControls.editSubsectionGroup.disable();

          }
          if(filteredlist.length !== 0){
            this.myuserProfile.mainsubsectionKeys= of(this.myuserProfile.dupmainsubsectionKeys);
          }else{
            this.myuserProfile.mainsubsectionKeys=of(filteredlist);
          }
          //this.myhint='';
        }else{
          this.add = false;
          this.myuserProfile.mainsubsectionKeys= of(this.myuserProfile.dupmainsubsectionKeys);
        }
        
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
          this.myprojectControls.editSubsectionGroup.disable();
          this.myprojectControls.visibilityMainsectionGroup.disable();
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
 
  EditAdd() {
    const ownproj=this.myprojectControls.ownPublicprojectControl.value;
    const mainval= this.myprojectControls.editMainsectionGroup.controls['editMainsectionControl'].value;
    const disabledval= this.myprojectControls.visibilityMainsectionGroup.controls['editVisibilityControl'].value;
    const subval= this.myprojectControls.editSubsectionGroup.controls['editSubsectionControl'].value;
    console.log('298', this.myhint);
    if(this.myhint !== ''){
      let SubSecArr= this.myuserProfile.keysReadFromDb;
      SubSecArr.forEach(eachMainfield=>
        {
          if(eachMainfield.name === mainval){
            const subsecObj={ viewvalue: subval };
            eachMainfield.section.push(subsecObj);
          }        
        });
      this.myprojectVariables.editProjectkeysSaved=SubSecArr;
      this.developmentservice.addSubSection(ownproj, mainval, subval, this.myprojectVariables.editProjectkeysSaved).then(success=>{
        this.PrivateSections= of(undefined);
      });
    }else{
      let SubSecArr= this.myuserProfile.keysReadFromDb;
      SubSecArr.push({name:mainval, disabled: disabledval, section:[] });
      this.myprojectVariables.editProjectkeysSaved=SubSecArr;
      this.developmentservice.addMainSection(ownproj, this.myprojectVariables.editProjectkeysSaved).then(success=>{
        this.PrivateSections= of(undefined);  
      });
    }
  }

  EditDelete() {
    const ownproj=this.myprojectControls.ownPublicprojectControl.value;
    const mainval= this.myprojectControls.editMainsectionGroup.controls['editMainsectionControl'].value;
    const disabledval= this.myprojectControls.visibilityMainsectionGroup.controls['editVisibilityControl'].value;
    const subval= this.myprojectControls.editSubsectionGroup.controls['editSubsectionControl'].value;
    
    if(this.myhint !== ''){
      //console.log('subsec-del',ownproj,mainval,disabledval,subval );
      let SubSecArr= this.myuserProfile.keysReadFromDb;;
      SubSecArr.forEach(eachMainfield=>
        {
          if(eachMainfield.name === mainval ){         
            eachMainfield.section= eachMainfield.section.filter(mysubsec=> mysubsec.viewvalue !== subval );
          }        
        });
        this.myprojectVariables.editProjectkeysSaved=SubSecArr;
        this.developmentservice.addSubSection(ownproj, mainval, subval, this.myprojectVariables.editProjectkeysSaved).then(success=>{
          this.PrivateSections= of(undefined);
        });
    }else{
      //console.log('mainsec-del',ownproj,mainval,disabledval,subval);
      let SubSecArr= this.myuserProfile.keysReadFromDb;
      SubSecArr= SubSecArr.filter(mymainkeys=> mymainkeys.name !== mainval);
      this.myprojectVariables.editProjectkeysSaved=SubSecArr;
      this.developmentservice.deleteMainSection(ownproj, this.myprojectVariables.editProjectkeysSaved).then(success=>{
        this.PrivateSections= of(undefined);
      });
    }
  }
  EditUpdate() {
    const ownproj=this.myprojectControls.ownPublicprojectControl.value;
    const mainval= this.myprojectControls.editMainsectionGroup.controls['editMainsectionControl'].value;
    const disabledval= this.myprojectControls.visibilityMainsectionGroup.controls['editVisibilityControl'].value;
    const subval= this.myprojectControls.editSubsectionGroup.controls['editSubsectionControl'].value;
    let SubSecArr= this.myuserProfile.keysReadFromDb;
    SubSecArr.forEach(eachMainfield=>
      {
        if(eachMainfield.name === mainval){
          eachMainfield.disabled= disabledval;
        }        
      });
    this.myprojectVariables.editProjectkeysSaved=SubSecArr;
    this.developmentservice.updatevisibility(ownproj, this.myprojectVariables.editProjectkeysSaved).then(success=>{
      this.PrivateSections= of(undefined);
    });
  }
  CreateDefault(){
    const ProjectName = this.myprojectControls.ownPublicprojectControl.value;
    const newKeys = [{
      name: 'MainSection',
      disabled: false,
      section: [{
        viewvalue: 'SubSection'
      }]
    }];
    this.developmentservice.createDefKeys(ProjectName,newKeys);
  }
  ngOnDestroy(){
    this.privateProjsel.unsubscribe();
    this.getPrivateListSubscription?.unsubscribe();
    this.getPrivateSectionsSubscription?.unsubscribe();
  }
}
