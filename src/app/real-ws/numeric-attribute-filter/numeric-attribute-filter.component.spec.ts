import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumericAttributeFilterComponent } from './numeric-attribute-filter.component';

describe('NumericAttributeFilterComponent', () => {
  let component: NumericAttributeFilterComponent;
  let fixture: ComponentFixture<NumericAttributeFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumericAttributeFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumericAttributeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
