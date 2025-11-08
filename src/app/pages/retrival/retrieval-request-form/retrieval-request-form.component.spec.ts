import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrievalRequestFormComponent } from './retrieval-request-form.component';

describe('RetrievalRequestFormComponent', () => {
  let component: RetrievalRequestFormComponent;
  let fixture: ComponentFixture<RetrievalRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetrievalRequestFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrievalRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
