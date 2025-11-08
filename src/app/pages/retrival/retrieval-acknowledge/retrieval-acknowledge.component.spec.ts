import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrievalAcknowledgeComponent } from './retrieval-acknowledge.component';

describe('RetrievalAcknowledgeComponent', () => {
  let component: RetrievalAcknowledgeComponent;
  let fixture: ComponentFixture<RetrievalAcknowledgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetrievalAcknowledgeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrievalAcknowledgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
