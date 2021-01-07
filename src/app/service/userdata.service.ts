
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { of, merge, fromEvent, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

export interface userProfile {
  userAuthenObj: firebase.User
}

@Injectable({
  providedIn: 'root'
})
export class UserdataService {
  isOnline$!: Observable<boolean>;

  constructor(public auth: AngularFireAuth, private db: AngularFirestore) {
    this.isOnline$ = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    ).pipe(map(() => navigator.onLine));
  }
  docExists(uid: string) {
    return this.db.doc(`projectList/DemoProjectKey`).valueChanges().pipe(first()).toPromise();
  }
  async findOrCreate(uid: string) {
    const doc = await this.docExists(uid);
    if (doc) {
      console.log('returned', doc);
      return 'doc exists';
    } else {
      return 'created new doc';
    }
  }
  login() {
    return this.auth.signInWithPopup(new (firebase.auth as any).GoogleAuthProvider()).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/network-request-failed') {

        //alert('Check Internet Connection');
        location.reload();
      }
    });
  }
  logout() {
    return this.auth.signOut();
  }  
}
