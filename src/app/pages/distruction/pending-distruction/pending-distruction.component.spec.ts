import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingDistructionComponent } from './pending-distruction.component';

describe('PendingDistructionComponent', () => {
  let component: PendingDistructionComponent;
  let fixture: ComponentFixture<PendingDistructionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingDistructionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingDistructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
