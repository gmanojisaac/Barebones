
import { Component, ViewChild} from '@angular/core';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { UserdataService, userProfile } from './service/userdata.service';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { map, switchMap,of} from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';

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
                  map((profilevalbef: any) => {
                    if (!Object.keys(profilevalbef).length === true) {
                      this.developmentservice.findOrCreate(afterauth.uid).then(success => {
                        if (success !== 'doc exists') {
                          alert('check internet Connection');
                        } else {
                        }
                      });
                    } else {
                    }
                    return onlineval;
                  })
                )
              } else {
                return of(false);
              }
            }));
        } else {
          return of(false);
        }
      })
    );
  }
  startfirstpage(){
    this.loggedinstate=of('firstpage');
  }
  componentLogOff() {
    this.loggedinstate=of('undefined');
    this.developmentservice.logout();
  }
  draweropen() {
  }
  drawerclose() {
    this.sidenav.close();
  }
}

