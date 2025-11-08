import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileInventryQcFormComponent } from './file-inventry-qc-form.component';

describe('FileInventryQcFormComponent', () => {
  let component: FileInventryQcFormComponent;
  let fixture: ComponentFixture<FileInventryQcFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileInventryQcFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileInventryQcFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
