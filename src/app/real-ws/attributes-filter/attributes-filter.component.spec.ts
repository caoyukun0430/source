import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributesFilterComponent } from './attributes-filter.component';

describe('AttributesFilterComponent', () => {
  let component: AttributesFilterComponent;
  let fixture: ComponentFixture<AttributesFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributesFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
