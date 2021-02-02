import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent} from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppSharedModule } from './app-shared/app-shared.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { GooglePayButtonModule} from '@google-pay/button-angular';
import { NestedTreeComponent,BottomSheetChangeOrder } from './nested-tree/nested-tree.component';
import { AddNodeComponent,NewNodeDialog } from './nested-tree/add-node/add-node.component';
import { DeleteNodeComponent, } from './nested-tree/delete-node/delete-node.component';
import { EditNodeComponent,EditNodeDialog } from './nested-tree/edit-node/edit-node.component';
import {firebase, firebaseui, FirebaseUIModule} from 'firebaseui-angular';

const firebaseUiAuthConfig: firebaseui.auth.Config = {
  signInOptions: [
      {
        // Google provider must be enabled in Firebase Console to support one-tap
        // sign-up.
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // Required to enable ID token credentials for this provider.
        // This can be obtained from the Credentials page of the Google APIs
        // console. Use the same OAuth client ID used for the Google provider
        // configured with GCIP or Firebase Auth.
        clientId: '155833140934-om6lcebvnosmo8sgkkogpojvs74g0la5.apps.googleusercontent.com'
      }],
  
    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
  
  };

@NgModule({
  declarations: [
    AppComponent,
    NestedTreeComponent,
    BottomSheetChangeOrder,
    AddNodeComponent,
    NewNodeDialog,
    DeleteNodeComponent,
    EditNodeComponent,
    EditNodeDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppSharedModule,
    GooglePayButtonModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // firestore
    AngularFireAuthModule, // auth
    AngularFireStorageModule // storage  
    ,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig)
  ],
  entryComponents: [
    NewNodeDialog,
    BottomSheetChangeOrder
  ],
  bootstrap: [AppComponent]
  
})
export class AppModule { }
