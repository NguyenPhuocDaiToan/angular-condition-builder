import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionBuilder } from './condition-builder';

describe('ConditionBuilder', () => {
  let component: ConditionBuilder;
  let fixture: ComponentFixture<ConditionBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConditionBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
