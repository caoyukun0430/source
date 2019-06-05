import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantsFilterComponent } from './variants-filter.component';

describe('VariantsFilterComponent', () => {
  let component: VariantsFilterComponent;
  let fixture: ComponentFixture<VariantsFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariantsFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
