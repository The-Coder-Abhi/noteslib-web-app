import { Injectable } from '@angular/core';
import { Client, Account, Storage, TablesDB } from 'appwrite';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppwriteService {
  public client: Client;
  public account: Account;
  public tablesDB: TablesDB;
  public storage: Storage;

  // Expose your IDs just like you did with 'const val' in Kotlin
  public readonly databaseId = environment.appwrite.databaseId;
  public readonly bucketId = environment.appwrite.bucketId;

  // Grouping collections together for easy access later
  public readonly collections = {
    notes: environment.appwrite.notesCollection,
    subjects: environment.appwrite.subjectsCollection,
    units: environment.appwrite.unitsCollection,
    chapters: environment.appwrite.chaptersCollection,
    pdfs: environment.appwrite.pdfsCollection
  };

  constructor() {
    // 1. Initialize the Appwrite Client
    this.client = new Client()
      .setEndpoint(environment.appwrite.endpoint)
      .setProject(environment.appwrite.projectId);

    // 2. Initialize the specific services
    this.account = new Account(this.client);
    this.tablesDB = new TablesDB(this.client);
    this.storage = new Storage(this.client);
  }
}