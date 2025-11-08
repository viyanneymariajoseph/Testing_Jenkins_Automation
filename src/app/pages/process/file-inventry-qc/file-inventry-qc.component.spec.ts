import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileInventryQcComponent } from './file-inventry-qc.component';

describe('FileInventryQcComponent', () => {
  let component: FileInventryQcComponent;
  let fixture: ComponentFixture<FileInventryQcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileInventryQcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileInventryQcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
