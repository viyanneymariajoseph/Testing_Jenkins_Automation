import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnToStorageFormComponent } from './return-to-storage-form.component';

describe('ReturnToStorageFormComponent', () => {
  let component: ReturnToStorageFormComponent;
  let fixture: ComponentFixture<ReturnToStorageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReturnToStorageFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnToStorageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
