import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndActivitiesFilterComponent } from './end-activities-filter.component';

describe('EndActivitiesFilterComponent', () => {
  let component: EndActivitiesFilterComponent;
  let fixture: ComponentFixture<EndActivitiesFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndActivitiesFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndActivitiesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
