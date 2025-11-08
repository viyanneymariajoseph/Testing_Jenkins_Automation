import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFileQcComponent } from './edit-file-qc.component';

describe('EditFileQcComponent', () => {
  let component: EditFileQcComponent;
  let fixture: ComponentFixture<EditFileQcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFileQcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFileQcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
