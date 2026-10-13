import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderLayout } from './folder-layout';

describe('FolderLayout', () => {
  let component: FolderLayout;
  let fixture: ComponentFixture<FolderLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolderLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(FolderLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
