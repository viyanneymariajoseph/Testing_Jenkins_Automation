import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnToStorageComponent } from './return-to-storage.component';

describe('ReturnToStorageComponent', () => {
  let component: ReturnToStorageComponent;
  let fixture: ComponentFixture<ReturnToStorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReturnToStorageComponent ]
    })
    .compileComponents();
  });


  
  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnToStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
