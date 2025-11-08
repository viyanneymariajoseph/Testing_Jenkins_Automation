import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseLocationUpdateComponent } from './warehouse-location-update.component';

describe('WarehouseLocationUpdateComponent', () => {
  let component: WarehouseLocationUpdateComponent;
  let fixture: ComponentFixture<WarehouseLocationUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseLocationUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLocationUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
