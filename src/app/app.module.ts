import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent,DialogEditTestcase} from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppSharedModule } from './app-shared/app-shared.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { environment } from '../environments/environment'

import { GooglePayButtonModule} from '@google-pay/button-angular';
import { TaskShowComponent } from './task-show/task-show.component';
import { PrivateprojComponent } from './privateproj/privateproj.component';
import { PublicprojComponent } from './publicproj/publicproj.component';

@NgModule({
  declarations: [
    AppComponent,
    TaskShowComponent,
    PrivateprojComponent,
    PublicprojComponent,
    DialogEditTestcase
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
  ],
  entryComponents:[DialogEditTestcase],
  bootstrap: [AppComponent]
})
export class AppModule { }
