import { Component, OnInit } from '@angular/core';
import {RouterLink, RouterLinkActive, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive,CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {

  userName: string = '';
  userEmail: string = '';

  constructor(private auth: AuthService, private router: Router,) {}

  async ngOnInit() {
    try{
      const user = await this.auth.getCurrentUser();
      this.userName = user.name;
      this.userEmail = user.email;
    }catch(error){
      console.error('Failed to load user in sidebar:', error);
    }
  }

  isHomeActive(): boolean {
  const url = this.router.url;
  return url === '/home' || 
         url.includes('/note/') || 
         url.includes('/subject/') || 
         url.includes('/unit/') || 
         url.includes('/chapter/');
}

  async logout() {
    try {
      await this.auth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}
