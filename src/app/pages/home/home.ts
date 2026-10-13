import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth';
import { NotesService } from '../../services/notes';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  userName = 'Loading...';
  userId = '';
  showNotifications = false;
  
  // Variables for real-time tracking and toast
  newRequestToast: string | null = null;
  private pollingTimer: any;

  pendingRequests: { noteId: string, noteName: string, requesterId: string, requesterName: string }[] = [];
  
  constructor(
    private auth: AuthService, 
    private notes: NotesService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      const user = await this.auth.getCurrentUser();
      this.userName = user.name;
      this.userId = user.$id;
      
      await this.loadNotificationRequests();

      // Check for new notifications silently every 15 seconds
      this.pollingTimer = setInterval(() => {
        this.loadNotificationRequests(true);
      }, 15000);

    } catch(error) {
      console.error('Error fetching user data:', error);
      this.router.navigate(['/login']);
    } finally {
      setTimeout(() => {
        this.cdr.detectChanges(); 
      });
    }
  }

  // Stop the timer if they navigate away
  ngOnDestroy() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }
  }

  // Now accepts an 'isBackgroundRefresh' flag
  async loadNotificationRequests(isBackgroundRefresh = false) {
    try {
      const myNotes = await this.notes.getNotes(this.userId);
      const fetchedRequests = [];

      for(const note of myNotes) {
        if(note.pendingRequests && note.pendingRequests.length > 0) {
          for(const requesterId of note.pendingRequests) {
            let fetchedName = 'Unknown User';
            const userDetails = await this.auth.getUserDetails(requesterId);
            if (userDetails && userDetails['name']) {
              fetchedName = userDetails['name'];
            }

            fetchedRequests.push({
              noteId: note.$id,
              noteName: note.name,
              requesterId: requesterId,
              requesterName: fetchedName
            });
          }
        }
      }

      //  If this is a background check and the array grew, show the 5-second toast
      if (isBackgroundRefresh && fetchedRequests.length > this.pendingRequests.length) {
        // Find the specific request that is new
        const newReq = fetchedRequests.find(fr => 
          !this.pendingRequests.some(pr => pr.noteId === fr.noteId && pr.requesterId === fr.requesterId)
        );
        
        if (newReq) {
          this.showToast(newReq.requesterName, newReq.noteName);
        }
      }

      this.pendingRequests = fetchedRequests;
      this.cdr.detectChanges();

    } catch(error) {
      console.error('Error loading notification:', error);
    }
  }

  // Triggers the popup and clears it after 5 seconds
  showToast(name: string, noteName: string) {
    this.newRequestToast = `${name} requested access to ${noteName}`;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.newRequestToast = null;
      this.cdr.detectChanges();
    }, 5000);
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  async acceptRequest(noteId: string, requesterId: string) {
    try {
      await this.notes.approveAccess(noteId, requesterId);
      this.pendingRequests = this.pendingRequests.filter(
        req => !(req.noteId === noteId && req.requesterId === requesterId)
      );
      this.cdr.detectChanges();
    } catch(error) {
      console.error('Failed to approve request:', error);
    }
  }
}