import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingCircleComponentComponent } from './waiting-circle-component.component';

describe('WaitingCircleComponentComponent', () => {
  let component: WaitingCircleComponentComponent;
  let fixture: ComponentFixture<WaitingCircleComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaitingCircleComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitingCircleComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
