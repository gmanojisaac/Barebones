import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateprojComponent } from './privateproj.component';

describe('PrivateprojComponent', () => {
  let component: PrivateprojComponent;
  let fixture: ComponentFixture<PrivateprojComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivateprojComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateprojComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
