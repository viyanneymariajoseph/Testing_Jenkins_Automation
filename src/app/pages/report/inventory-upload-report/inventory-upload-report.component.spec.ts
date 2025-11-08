import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryUploadReportComponent } from './inventory-upload-report.component';

describe('InventoryUploadReportComponent', () => {
  let component: InventoryUploadReportComponent;
  let fixture: ComponentFixture<InventoryUploadReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryUploadReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryUploadReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
