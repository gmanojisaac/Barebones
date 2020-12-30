import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class UserdataService {


  constructor(public auth: AngularFireAuth) {

   }

   login() {
    return this.auth.signInWithRedirect( new (firebase.auth as any).GoogleAuthProvider()).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/network-request-failed'){
        
        //alert('Check Internet Connection');
        location.reload();
      }
    });
  }
  async logout() {
    console.log('72-reached');
    return await this.auth.signOut();
  }
}
