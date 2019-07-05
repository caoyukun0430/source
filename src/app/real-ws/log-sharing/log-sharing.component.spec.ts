import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogSharingComponent } from './log-sharing.component';

describe('LogSharingComponent', () => {
  let component: LogSharingComponent;
  let fixture: ComponentFixture<LogSharingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogSharingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
