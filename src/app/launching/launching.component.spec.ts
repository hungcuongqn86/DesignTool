import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchingComponent } from './launching.component';

describe('LaunchingComponent', () => {
  let component: LaunchingComponent;
  let fixture: ComponentFixture<LaunchingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LaunchingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
