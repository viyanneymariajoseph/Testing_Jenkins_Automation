import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefillingAckComponent } from './refilling-ack.component';

describe('RefillingAckComponent', () => {
  let component: RefillingAckComponent;
  let fixture: ComponentFixture<RefillingAckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefillingAckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefillingAckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
