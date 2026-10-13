import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfView } from './pdf-view';

describe('PdfView', () => {
  let component: PdfView;
  let fixture: ComponentFixture<PdfView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfView],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
