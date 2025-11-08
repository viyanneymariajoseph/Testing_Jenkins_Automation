import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryApprovalComponent } from './inventory-approval.component';

describe('InventoryApprovalComponent', () => {
  let component: InventoryApprovalComponent;
  let fixture: ComponentFixture<InventoryApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryApprovalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
