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
  AfterOnlineCheckAuth=undefined;



  constructor( 
    public afAuth: AngularFireAuth,    
    public developmentservice: UserdataService,
    private db: AngularFirestore,
    ){     


    this.myonline = this.getObservableonine(this.developmentservice.isOnline$);
    this.myauth = this.getObservableauthState(this.afAuth.authState);

    this.AfterOnlineCheckAuth = this.myonline.pipe(
      filter((offline) => offline !== false),//don't worry abt offline-> handled inside
      switchMap((onlineval: any) => {
        return this.myauth.pipe(
          filter(authstat => authstat !== undefined),//logincase track offline,logoutcase take else branch
          filter(authstat => authstat !== null),//only logged in case
          map((afterauth:firebase.User) => {
            console.log('53',afterauth);

            return afterauth;

          }))

      })
      
    )
  }


  componentLogOff(){

    this.developmentservice.logout();
  }
}
