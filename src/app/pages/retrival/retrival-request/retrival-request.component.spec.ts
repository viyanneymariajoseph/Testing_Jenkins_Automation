import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrivalRequestComponent } from './retrival-request.component';

describe('RetrivalRequestComponent', () => {
  let component: RetrivalRequestComponent;
  let fixture: ComponentFixture<RetrivalRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetrivalRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrivalRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
