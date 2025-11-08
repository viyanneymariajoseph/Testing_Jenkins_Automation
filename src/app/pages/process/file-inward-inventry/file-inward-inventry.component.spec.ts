import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileInwardInventryComponent } from './file-inward-inventry.component';

describe('FileInwardInventryComponent', () => {
  let component: FileInwardInventryComponent;
  let fixture: ComponentFixture<FileInwardInventryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileInwardInventryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileInwardInventryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
