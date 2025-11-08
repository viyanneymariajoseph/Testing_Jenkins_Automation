import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseScheduleComponent } from './warehouse-schedule.component';

describe('WarehouseScheduleComponent', () => {
  let component: WarehouseScheduleComponent;
  let fixture: ComponentFixture<WarehouseScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
