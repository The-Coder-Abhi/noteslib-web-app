import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute,RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-verify',
  imports: [RouterLink],
  templateUrl: './verify.html',
  styleUrl: './verify.css',
})
export class Verify implements OnInit {
  isVerifyingLink = false;
  isCheckingStatus = false;
  isSuccess = false;
  message = 'Verify your email to continue.';
  isError = false;

  countdown = 10;
  private timer: any; // Stores the countdown interval

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(){
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const secret = this.route.snapshot.queryParamMap.get('secret');

    if(userId && secret){
      await this.verifyEmailToken(userId,secret);
    }
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async verifyEmailToken(userId:string,secret:string){
    this.isVerifyingLink = true;
    this.message = 'Verifying your email...';
    try{
      await this.authService.confirmVerification(userId,secret);
      this.triggerSuccess();
    }catch(error:any){
      this.isError = true;
      this.message = 'Verification link is invalid or expired. Please request a new one.';
    }finally{
      this.isVerifyingLink = false;
      this.cdr.detectChanges();
    }
  }

  // Fallback for users who verify on a different device (like their phone)
  // and come back to this browser tab waiting for them.
  async checkStatus() {
    this.isCheckingStatus = true;
    this.isError = false; // Reset the error text color on a fresh check
    this.cdr.detectChanges();
    try{
      const isVerified = await this.authService.isEmailVerified();

      if (isVerified) {
        this.triggerSuccess();
      } else {
        this.isError = true;
        this.message = 'Email is not verified yet. Please check your inbox and spam folder.';
    }
    }catch(error){
      this.isError = true;
      this.message = 'Failed to check status. Please try again.';
    }finally{
      // This guarantees the button instantly pops back to "Verify"
      this.isCheckingStatus = false;
      this.cdr.detectChanges();
    }
  }

  triggerSuccess(){
    this.isSuccess = true;
    this.startCountdown();
  }

  startCountdown(){
    this.timer = setInterval(()=>{
      this.countdown--;
      this.cdr.detectChanges();
      if(this.countdown <= 0){
        this.goToHome();
      }
    },1000);
  }

  goToHome(){
    if(this.timer){
      clearInterval(this.timer);
    }
    this.router.navigate(['/home'])
  }
}

