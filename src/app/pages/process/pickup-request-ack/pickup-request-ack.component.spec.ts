import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupRequestAckComponent } from './pickup-request-ack.component';

describe('PickupRequestAckComponent', () => {
  let component: PickupRequestAckComponent;
  let fixture: ComponentFixture<PickupRequestAckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickupRequestAckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickupRequestAckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
