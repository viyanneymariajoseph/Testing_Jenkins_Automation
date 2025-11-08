import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileInwardFormComponent } from './file-inward-form.component';

describe('FileInwardFormComponent', () => {
  let component: FileInwardFormComponent;
  let fixture: ComponentFixture<FileInwardFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileInwardFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileInwardFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
