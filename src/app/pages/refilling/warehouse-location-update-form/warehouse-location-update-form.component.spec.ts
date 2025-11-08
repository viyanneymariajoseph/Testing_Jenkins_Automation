import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseLocationUpdateFormComponent } from './warehouse-location-update-form.component';

describe('WarehouseLocationUpdateFormComponent', () => {
  let component: WarehouseLocationUpdateFormComponent;
  let fixture: ComponentFixture<WarehouseLocationUpdateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseLocationUpdateFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLocationUpdateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
