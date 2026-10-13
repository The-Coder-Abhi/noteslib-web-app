import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NotesService } from '../../services/notes';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit{
  searchQuery: string = '';
  searchResults: any[] = [];
  isSearching: boolean = false;
  hasSearched: boolean = false;
  currentUserId = "";

  requestingStates: { [noteId: string]: boolean } = {};

  constructor(
    private notes: NotesService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(){
    try{
      const user = await this.auth.getCurrentUser();
      this.currentUserId = user.$id;
    }catch(error){
      console.error('Could not fetch user',error);
    }
  }

  async onSearch() {
    console.log("1. Search button clicked. Query:", this.searchQuery);
    
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.hasSearched = false;
      return;
    }

    this.isSearching = true;
    this.hasSearched = true;
    this.cdr.detectChanges(); 

    try {
      console.log("2. Asking Appwrite for subjects...");
      const results = await this.notes.searchNotesBySubject(this.searchQuery);
      
      console.log("3. Appwrite responded! Results:", results);
      this.searchResults = results || []; 
      
    } catch (error) {
      console.error('4. Error caught:', error);
      this.searchResults = [];
    } finally {
      console.log("5. Finally block executing - stopping spinner.");
      this.isSearching = false;
      this.cdr.detectChanges(); 
    }
  }

  openNote(note:any){
    this.router.navigate(['/home/note', note.$id],{
      state:{path:[note.name]}
    });
  }

  async sendRequest(note:any,event: Event){
    event.stopPropagation();

    // Prevent spam-clicking if it's already sending
    if (this.requestingStates[note.$id]) return;
    
    // Instantly set this specific button to a loading state
    this.requestingStates[note.$id] = true;
    this.cdr.detectChanges();
    try{
      await this.notes.requestAccess(note.$id);
      note.pendingRequests = [...(note.pendingRequests || []), this.currentUserId];
    }catch(error){
      console.error('Failed to request access', error);
    }finally{
      this.requestingStates[note.$id] = false;
      this.cdr.detectChanges();
    }
  }

  hasAccess(note:any):boolean{
    return note.owner == this.currentUserId || (note.allowedUsers && note.allowedUsers.includes(this.currentUserId));
  }

  hasRequested(note:any):boolean{
    return note.pendingRequests && note.pendingRequests.includes(this.currentUserId);
  }
}
