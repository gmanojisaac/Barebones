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
import { TreeStructureComponent } from './tree-structure/tree-structure.component';
import { NestedTreeComponent,BottomSheetChangeOrder } from './nested-tree/nested-tree.component';
import { AddNodeComponent,NewNodeDialog } from './nested-tree/add-node/add-node.component';
import { DeleteNodeComponent, } from './nested-tree/delete-node/delete-node.component';
import { EditNodeComponent,EditNodeDialog } from './nested-tree/edit-node/edit-node.component';

@NgModule({
  declarations: [
    AppComponent,
    TreeStructureComponent,
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
  ],
  entryComponents: [
    NewNodeDialog,
    BottomSheetChangeOrder
  ],
  bootstrap: [AppComponent]
  
})
export class AppModule { }
