import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { NotesService } from '../../services/notes';

@Component({
  selector: 'app-my-notes',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './my-notes.html',
  styleUrl: './my-notes.css',
})
export class MyNotes implements OnInit {
  myNotes: any[] = [];
  sharedNotes: any[] = [];
  isLoading = true;

  constructor(
    private auth: AuthService,
    private notes: NotesService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const user = await this.auth.getCurrentUser();

      const [owned, shared] = await Promise.all([
        this.notes.getNotes(user.$id),
        this.notes.getSharedNotes(user.$id),
      ]);

      this.myNotes = owned;
      this.sharedNotes = shared;
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  openNote(note: any) {
    this.router.navigate(['/home/note', note.$id],{
      state: { path: [note.name] }
    });
  }

  async deleteNote(noteId: string,event: Event) {
    event.stopPropagation();
    try {
      await this.notes.deleteNote(noteId);
      this.myNotes = this.myNotes.filter((note) => note.$id !== noteId);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }
}
