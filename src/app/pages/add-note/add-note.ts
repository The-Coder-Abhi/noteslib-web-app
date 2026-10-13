import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NotesService } from '../../services/notes';
import { AuthService } from '../../services/auth';


@Component({
  selector: 'app-add-note',
  standalone:true,
  imports: [CommonModule,FormsModule, MatIconModule],
  templateUrl: './add-note.html',
  styleUrl: './add-note.css',
})
export class AddNote implements OnInit{
  recentNotes: any[] = [];
  isLoading = true;
  currentUserId = '';

  // Dialog State
  showDialog = false;
  currentStep = 1;
  isSaving = false;
  saveError = '';

  // Form Data Structure
  noteName = '';
  numSubjects: number | null = null;
  subjects: any[] = [];

  constructor(
    private notes: NotesService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try{
      const user = await this.auth.getCurrentUser();
      this.currentUserId = user.$id;
      await this.loadRecentNotes();
    }catch(error){
      console.error('Error fetching user', error)
    }
  }

  async loadRecentNotes(){
    this.isLoading = true;
    try{
      const allNotes = await this.notes.getNotes(this.currentUserId);
      // Sort by createdAt descending and take top 5
      this.recentNotes = allNotes
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0,5);
    }catch(error){
      console.error('Error loading notes', error)
    }finally{
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  openNote(note:any){
    this.router.navigate(['/home/note',note.$id],{state:{path:[note.name]}});
  }

  viewAllNotes() {
    this.router.navigate(['/home']);
  }

  // --- Dialog Management ---

  openDialog() {
    this.resetForm();
    this.showDialog = true;
  }

  closeDialog() {
    if (!this.isSaving) {
      this.showDialog = false;
    }
  }

  resetForm() {
    this.currentStep = 1;
    this.noteName = '';
    this.numSubjects = null;
    this.subjects = [];
    this.saveError = '';
  }

  // Format numbers with leading zeros (e.g., 1 -> '01')
  formatNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  // --- Step Navigation & Dynamic Generation ---

  nextStep() {
    if (this.currentStep === 1) {
      if (!this.noteName.trim() || !this.numSubjects || this.numSubjects < 1) return;
      
      // Initialize subjects array based on count, preserving existing data if navigating back
      const newSubjects = [];
      for (let i = 0; i < this.numSubjects; i++) {
        newSubjects.push(this.subjects[i] || { name: '', numUnits: null, units: [] });
      }
      this.subjects = newSubjects;
      this.currentStep = 2;
    } 
    else if (this.currentStep === 2) {
      if (this.subjects.some(s => !s.name.trim() || !s.numUnits || s.numUnits < 1)) return;
      
      // Generate Units automatically
      this.subjects.forEach(subject => {
        const newUnits = [];
        for (let i = 0; i < subject.numUnits; i++) {
          const unitName = `Unit ${this.formatNumber(i + 1)}`;
          const existingUnit = subject.units.find((u: any) => u.name === unitName);
          newUnits.push(existingUnit || { name: unitName, numChapters: null, chapters: [] });
        }
        subject.units = newUnits;
      });
      this.currentStep = 3;
    }
    else if (this.currentStep === 3) {
      let hasError = false;
      this.subjects.forEach(subject => {
        if (subject.units.some((u: any) => !u.numChapters || u.numChapters < 1)) hasError = true;
      });
      if (hasError) return;

      // Generate Chapter input objects
      this.subjects.forEach(subject => {
        subject.units.forEach((unit: any) => {
          const newChapters = [];
          for (let i = 0; i < unit.numChapters; i++) {
            newChapters.push(unit.chapters[i] || { name: '' });
          }
          unit.chapters = newChapters;
        });
      });
      this.currentStep = 4;
    }
    else if (this.currentStep === 4) {
      let hasError = false;
      this.subjects.forEach(subject => {
        subject.units.forEach((unit: any) => {
          if (unit.chapters.some((c: any) => !c.name.trim())) hasError = true;
        });
      });
      if (hasError) return;
      this.currentStep = 5;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // --- Submission ---

  async submitNote() {
    this.isSaving = true;
    this.saveError = '';
    this.cdr.detectChanges();

    try {
      // 1. Create Parent Note
      const noteId = await this.notes.createNote(this.noteName);

      // 2. Loop through and create Subjects
      for (const subject of this.subjects) {
        const subjectId = await this.notes.addSubject(noteId, subject.name);

        // 3. Loop through and create Units
        for (const unit of subject.units) {
          const unitId = await this.notes.addUnit(noteId, subjectId, unit.name);

          // 4. Loop through and create Chapters
          for (const chapter of unit.chapters) {
            await this.notes.addChapter(noteId, subjectId, unitId, chapter.name);
          }
        }
      }

      this.showDialog = false;
      await this.loadRecentNotes(); // Refresh list to show new note
    } catch (error) {
      console.error('Failed to save complete hierarchy', error);
      this.saveError = 'Failed to save note hierarchy. Please try again.';
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

}
