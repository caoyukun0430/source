import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnaComponent } from './sna.component';

describe('SnaComponent', () => {
  let component: SnaComponent;
  let fixture: ComponentFixture<SnaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
