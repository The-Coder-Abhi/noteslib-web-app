import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
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
export class Signup {
  name = '';
  email = '';
  password = '';
  isLoading = false;
  nameError = '';
  emailError = '';
  passwordError = '';
  globalError = '';

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) { }

  async onSignup() {
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.globalError = '';
    let isValid = true;

    if (!this.name || this.name.trim() === '') {
      this.nameError = 'Full Name is required';
      isValid = false;
    }

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
    } else if (this.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
      isValid = false;
    }

    if (!isValid) return;

    this.isLoading = true;

    try{
      const success = await this.authService.signUp(this.email, this.password, this.name);
      if (success) {
        this.router.navigate(['/verify']);
      } else {
        this.globalError = 'Signup failed. Please try again.';
      }
    }catch (error:any) {
        const errorMessage = error?.message?.toLowerCase() || '';

        if (errorMessage.includes('already exists')) {
          this.globalError = 'An account with this email already exists. Please log in.';
        } else if(errorMessage.includes('password')) {
          this.globalError = 'Password does not meet the required criteria. Please choose a stronger password.';
        }else if(errorMessage.includes('rate limit')) {
          this.globalError = 'Too many requests. Please try again later.';
        } else if(errorMessage.includes('network')) {
          this.globalError = 'Network error. Please check your connection and try again.';
        }else{
          this.globalError = 'Error occurred during signup. Please try again.';
        }

      }finally {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
  }
}
