import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartActivitiesFilterComponent } from './start-activities-filter.component';

describe('StartActivitiesFilterComponent', () => {
  let component: StartActivitiesFilterComponent;
  let fixture: ComponentFixture<StartActivitiesFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartActivitiesFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartActivitiesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
