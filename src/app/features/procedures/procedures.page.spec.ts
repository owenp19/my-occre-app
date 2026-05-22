import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProceduresPage } from './procedures.page';

describe('ProceduresPage', () => {
  let component: ProceduresPage;
  let fixture: ComponentFixture<ProceduresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProceduresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
