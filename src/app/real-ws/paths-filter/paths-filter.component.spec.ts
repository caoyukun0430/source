import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PathsFilterComponent } from './paths-filter.component';

describe('PathsFilterComponent', () => {
  let component: PathsFilterComponent;
  let fixture: ComponentFixture<PathsFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PathsFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PathsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
