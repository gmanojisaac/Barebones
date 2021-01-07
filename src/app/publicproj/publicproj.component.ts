import { Component,Output, EventEmitter,ChangeDetectionStrategy, OnInit,Input,AfterViewInit, OnDestroy } from '@angular/core';
import { map, switchMap, startWith, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, Subscription, Observable, of } from 'rxjs';
import { UserdataService, projectFlags, TestcaseInfo, projectControls, userProfile, MainSectionGroup, myusrinfo, projectVariables } from '../service/userdata.service';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';

@Component({
  selector: 'app-publicproj',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publicproj.component.html',
  styleUrls: ['./publicproj.component.scss']
})
export class PublicprojComponent implements OnInit,AfterViewInit,OnDestroy {
  @Input() profileinfoUid: firebase.User;
  @Input() profileinfoProjName: string;
  @Output() toChangeCurrentProj = new EventEmitter<string>();
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
        console.log('138',val);
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

  myprojectControls: projectControls = {
    publicprojectControl: new FormControl(null, Validators.required)
  };

  myprojectVariables: projectVariables = {
    publicProjectHint: undefined
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
    selectedPublicProject:'',
    subSectionKeys: undefined,
    savedMainSectionKey: undefined,
    savesubSectionKeys: undefined,
    savedisabledval: undefined
  };

  
  myprojectFlags: projectFlags = {
    homeNewProject: false,
    homeDeleteProject: false,
    homeCurrentProject: false
  };

  publicProjsel:Subscription;

  constructor(    public developmentservice: UserdataService,
    public fb: FormBuilder,
    private db: AngularFirestore) { }

  ngOnInit(): void {
    this.myuserProfile.userAuthenObj=this.profileinfoUid;
  }
  ngAfterViewInit(){
    this.publicProjsel = this.myprojectControls.publicprojectControl.valueChanges.pipe(
      startWith(''),
      map((publicProjectSelected: string) => {
        if (!publicProjectSelected || publicProjectSelected === '') {
          this.localpublicList = [];
          this.myprojectVariables.publicProjectHint = 'Select Task from List';
          this.getPublicListSubscription?.unsubscribe();
          this.publicList = this.getPublicList(this.db.doc(('/projectList/publicProjects')));          
          this.privateList = this.getPrivateList(this.db.doc(('/projectList/' + this.myuserProfile.userAuthenObj.uid)));
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
          if(this.profileinfoProjName === publicProjectSelected) {
            this.myprojectFlags.homeCurrentProject = false;
          }
        }
      })).subscribe(_=>{

      });
  }

  ngOnDestroy(){
    this.publicProjsel.unsubscribe();
    this.getPublicListSubscription?.unsubscribe();
    this.getPrivateListSubscription?.unsubscribe();
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
  
  saveCurrProject()
  {
    this.toChangeCurrentProj.emit(this.myuserProfile.selectedPublicProject);
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
    });
  }
  
}
