import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNote } from './add-note';

describe('AddNote', () => {
  let component: AddNote;
  let fixture: ComponentFixture<AddNote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNote],
    }).compileComponents();

    fixture = TestBed.createComponent(AddNote);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
