import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicprojComponent } from './publicproj.component';

describe('PublicprojComponent', () => {
  let component: PublicprojComponent;
  let fixture: ComponentFixture<PublicprojComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicprojComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicprojComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
