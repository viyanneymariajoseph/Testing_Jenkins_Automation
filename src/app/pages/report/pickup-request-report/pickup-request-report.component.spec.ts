import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupRequestReportComponent } from './pickup-request-report.component';

describe('PickupRequestReportComponent', () => {
  let component: PickupRequestReportComponent;
  let fixture: ComponentFixture<PickupRequestReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickupRequestReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickupRequestReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
