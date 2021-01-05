import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainkeysEditComponent } from './mainkeys-edit.component';

describe('MainkeysEditComponent', () => {
  let component: MainkeysEditComponent;
  let fixture: ComponentFixture<MainkeysEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainkeysEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainkeysEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
