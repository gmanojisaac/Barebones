import { Component } from '@angular/core';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { UserdataService } from './service/userdata.service';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

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
      console.log('val-53', val);
      if(val === null){//logoff case
        this.subjectauth.next(false);
        console.log(val);

      }else{//login case
        console.log(val);
        this.subjectauth.next(true);
      }
      
    });
    return this.subjectauth;
  };
  

  constructor( public afAuth: AngularFireAuth,    public developmentservice: UserdataService
    ){
    this.myauth = this.getObservableauthState(this.afAuth.authState);
  }
}
