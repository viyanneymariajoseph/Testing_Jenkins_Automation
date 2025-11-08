import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisInventoryReportComponent } from './dis-inventory-report.component';

describe('DisInventoryReportComponent', () => {
  let component: DisInventoryReportComponent;
  let fixture: ComponentFixture<DisInventoryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisInventoryReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisInventoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
