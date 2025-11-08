import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessRefillingComponent } from './access-refilling.component';

describe('AccessRefillingComponent', () => {
  let component: AccessRefillingComponent;
  let fixture: ComponentFixture<AccessRefillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessRefillingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessRefillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
