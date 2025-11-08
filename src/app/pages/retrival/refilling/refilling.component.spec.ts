import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefillingComponent } from './refilling.component';

describe('RefillingComponent', () => {
  let component: RefillingComponent;
  let fixture: ComponentFixture<RefillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefillingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
