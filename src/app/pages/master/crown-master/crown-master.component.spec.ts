import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrownMasterComponent } from './crown-master.component';

describe('CrownMasterComponent', () => {
  let component: CrownMasterComponent;
  let fixture: ComponentFixture<CrownMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrownMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrownMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
