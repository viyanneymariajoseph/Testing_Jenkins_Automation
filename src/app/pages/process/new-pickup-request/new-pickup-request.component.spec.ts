import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPickupRequestComponent } from './new-pickup-request.component';

describe('NewPickupRequestComponent', () => {
  let component: NewPickupRequestComponent;
  let fixture: ComponentFixture<NewPickupRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPickupRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPickupRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
