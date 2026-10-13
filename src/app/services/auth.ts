import { Injectable } from '@angular/core';
import { AppwriteService } from './appwrite';
import {ID} from "appwrite";
import { Permission, Role } from 'appwrite';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private appwrite: AppwriteService) {}

  async signUp(email: string, password: string, name:string):Promise<boolean>{
    try{
      //Creating the user in Appwrite Auth
      await this.appwrite.account.create(ID.unique(), email, password, name);

      //loging them in
      await this.signIn(email, password);

      //sending verification email
      await this.sendVerificationEmail();

      //Add user to database
      await this.saveUserToDatabase(name,email);

      return true;
    }catch(error){
      console.error('Error during sign up:', error);
      throw error;
    }
  }

  private async saveUserToDatabase(name: string, email: string): Promise<void> {
    const currentUser = await this.getCurrentUser();

    const data = {
      name: name,
      email: email
    };

   await this.appwrite.tablesDB.createRow({
      databaseId: this.appwrite.databaseId,
      tableId: 'users', 
      rowId: currentUser.$id, 
      data: data
    });

  }

  async sendVerificationEmail():Promise<boolean>{
    try{
      // const callbackUrl = 'https://the-coder-abhi.github.io/noteslib-verify/';
      const callbackUrl = `${window.location.origin}/verify`;

      await this.appwrite.account.createEmailVerification({
        url: callbackUrl
      });

      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  // async signIn(email: string, password: string):Promise<boolean>{
  //   try{
  //     await this.appwrite.account.createEmailPasswordSession({
  //       email:email, 
  //       password:password
  //     });
  //     return true;
  //   } catch (error) {
  //     console.error('Error during sign in:', error);
  //     throw error;
  //   }
  // }
async signIn(email: string, password: string): Promise<boolean> {
    try {
      // Pass the variables directly as strings, NOT as an object
      await this.appwrite.account.createEmailPasswordSession(email, password);
      return true;
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  }
  async getCurrentUser(){
    return await this.appwrite.account.get();
  }

  async isEmailVerified(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      
      return user.emailVerification;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false; // If we can't get the user, they aren't verified
    }
  }
  
  async confirmVerification(userId: string, secret: string): Promise<boolean> {
    try {
      await this.appwrite.account.updateVerification(userId, secret);
      return true;
    } catch (error) {
      console.error('Verification confirmation failed:', error);
      throw error;
    }
  }

  async getUserDetails(userId: string): Promise<any> {
    try {
      return await this.appwrite.tablesDB.getRow({
        databaseId: this.appwrite.databaseId,
        tableId: 'users',
        rowId: userId
      });
    } catch (error) {
      console.error(`Could not fetch details for user ${userId}:`, error);
      return null;
    }
  }

    async signOut(): Promise<boolean> {
    try {
      // Deletes the current session cookie
      await this.appwrite.account.deleteSession({sessionId: 'current'});
      return true;
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }

}
