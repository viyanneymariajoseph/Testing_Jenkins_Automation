import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkDistructionComponent } from './bulk-distruction.component';

describe('BulkDistructionComponent', () => {
  let component: BulkDistructionComponent;
  let fixture: ComponentFixture<BulkDistructionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkDistructionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkDistructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
