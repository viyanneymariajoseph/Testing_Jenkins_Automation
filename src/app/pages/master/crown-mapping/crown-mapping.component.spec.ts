import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrownMappingComponent } from './crown-mapping.component';

describe('CrownMappingComponent', () => {
  let component: CrownMappingComponent;
  let fixture: ComponentFixture<CrownMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrownMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrownMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
