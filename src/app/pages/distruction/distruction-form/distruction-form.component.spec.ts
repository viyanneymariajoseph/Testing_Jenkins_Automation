import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistructionFormComponent } from './distruction-form.component';

describe('DistructionFormComponent', () => {
  let component: DistructionFormComponent;
  let fixture: ComponentFixture<DistructionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DistructionFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DistructionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
