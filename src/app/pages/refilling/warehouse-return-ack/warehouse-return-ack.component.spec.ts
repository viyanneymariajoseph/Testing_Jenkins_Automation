import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseReturnAckComponent } from './warehouse-return-ack.component';

describe('WarehouseReturnAckComponent', () => {
  let component: WarehouseReturnAckComponent;
  let fixture: ComponentFixture<WarehouseReturnAckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseReturnAckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseReturnAckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
