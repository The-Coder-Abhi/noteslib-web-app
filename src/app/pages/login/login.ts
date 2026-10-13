import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  animations: [
    trigger('flyInRight', [
      transition(':enter', [
        // Starting state (off-screen to the right and invisible)
        style({ transform: 'translateX(50px)', opacity: 0 }),
        // Animate to final state (in position and fully visible)
        animate('600ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
          style({ transform: 'translateX(0)', opacity: 1 })
        )
      ])
    ])
  ]
})
export class Login {
  email = '';
  password = '';
  isLoading = false;
  emailError = '';
  passwordError = '';
  globalError = '';

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) { }

  async onLogin() {
    this.emailError = '';
    this.passwordError = '';
    this.globalError = '';
    let isValid = true;


    if (!this.email) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    }

    if (!this.password) {
      this.passwordError = 'Password is required';
      isValid = false;
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters long';
      isValid = false;
    }

  
    if (!isValid) return;

    this.isLoading = true;

    //Authentication
    try {
      await this.authService.signIn(this.email, this.password);

      const isVerified = await this.authService.isEmailVerified();
      if (isVerified) {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/verify']);
      }
    } catch (error: any) {
      //Handle Specific Appwrite Authentication Errors
      const errorMessage = error?.message?.toLowerCase() || '';

      if (errorMessage.includes('invalid credentials')) {
        this.globalError = 'Incorrect email or password. Please try again.';
      } else if (errorMessage.includes('rate limit')) {
        this.globalError = 'Too many login attempts. Please try again later.';
      } else if (errorMessage.includes('network')) {
        this.globalError = 'Network error. Please check your connection.';
      } else {
        // Fallback for unexpected Appwrite errors
        this.globalError = error?.message || 'Login failed. Please try again.';
      }
    } finally {
      this.isLoading = false;

      this.cdr.detectChanges();
    }
  }
}
