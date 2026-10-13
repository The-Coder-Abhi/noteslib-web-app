import { Injectable } from '@angular/core';
import { AppwriteService } from './appwrite';
import { Databases, ID, Query } from 'appwrite';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  constructor(private appwrite: AppwriteService) {}

  // ==========================================
  // 1. FOLDER CREATION
  // ==========================================
  async createNote(name:string): Promise<string> {
    const user = await this.appwrite.account.get();
    const data = {
      name: name,
      owner: user.$id,
      createdAt: Date.now(),
      allowedUsers: [],
      pendingRequests: []
    };

    const doc = await this.appwrite.tablesDB.createRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.notes,
      rowId: ID.unique(),
      data: data
    });
    return doc.$id;
  }

  async addSubject(noteId: string, subjectName: string): Promise<string> {
    const data = { name: subjectName, noteId: noteId };
    const doc = await this.appwrite.tablesDB.createRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.subjects,
      rowId: ID.unique(),
      data: data
    });
    return doc.$id;
  }

  async addUnit(noteId: string, subjectId:string, unitName:string): Promise<string> {
    const data = { name: unitName, noteId: noteId, subId: subjectId };
    const doc = await this.appwrite.tablesDB.createRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.units,
      rowId: ID.unique(),
      data: data
    });
    return doc.$id;
  }

  async addChapter(noteId: string, subjectId: string, unitId: string, chapterName: string): Promise<string> {
    const data = { name: chapterName, noteId: noteId, subId: subjectId, unitId: unitId };
    const doc = await this.appwrite.tablesDB.createRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.chapters,
      rowId: ID.unique(),
      data: data
    });
    return doc.$id;
  }

  // ==========================================
  // 2. DATA FETCHING (The Hierarchy)
  // ==========================================
  async getNotes(userId: string): Promise<any[]> {
    const response = await this.appwrite.tablesDB.listRows({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.notes,
      queries: [Query.equal('owner', userId)]
    });
    return response.rows;
  }

  async getSubjects(noteId: string): Promise<any[]> {
    const response = await this.appwrite.tablesDB.listRows({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.subjects,
      queries: [Query.equal('noteId', noteId)]
    });
    return response.rows;
  }

  async getUnits(subjectId: string): Promise<any[]> {
    const response = await this.appwrite.tablesDB.listRows({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.units,
      queries: [Query.equal('subId', subjectId)]
    });
    return response.rows;
  }

  async getChapters(unitId: string): Promise<any[]> {
    const response = await this.appwrite.tablesDB.listRows({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.chapters,
      queries: [Query.equal('unitId', unitId)]
    });
    return response.rows;
  }

  // ==========================================
  // 3. PDF UPLOAD, FETCH & DELETE
  // ==========================================
  async uploadPdfToChapter(chapterId: string, file: File): Promise<string> {
    const uploaded = await this.appwrite.storage.createFile({
      bucketId: this.appwrite.bucketId,
      fileId: ID.unique(),
      file: file
    });
    
    const endpoint = this.appwrite.client.config.endpoint;
    const project = this.appwrite.client.config.project;
    const fileUrl = `${endpoint}/storage/buckets/${this.appwrite.bucketId}/files/${uploaded.$id}/view?project=${project}`;

    const data = {
      name: file.name,
      fileId: uploaded.$id,
      fileUrl: fileUrl,
      chapterId: chapterId
    }

    const doc = await this.appwrite.tablesDB.createRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.pdfs,
      rowId: ID.unique(),
      data: data
    });

    return doc.$id;
  }

  async getPdfs(chapterId: string): Promise<any[]> {
    const response = await this.appwrite.tablesDB.listRows({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.pdfs,
      queries: [Query.equal('chapterId', chapterId)]
    });
    return response.rows;
  }

  async deletePdf(pdfId: string,fileId: string): Promise<boolean> {
    //Delete Physical File from Storage
    await this.appwrite.storage.deleteFile({
      bucketId: this.appwrite.bucketId,
      fileId: fileId
    });

    //Delete record from Database
    await this.appwrite.tablesDB.deleteRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.pdfs,
      rowId: pdfId
    });
    
    return true;
  }

  // ==========================================
  // 4. SEARCH & ACCESS REQUESTS
  // ==========================================

  async searchNotesBySubject(query: string): Promise<any[]> {
    try{
      const subResponse = await this.appwrite.tablesDB.listRows({
        databaseId: this.appwrite.databaseId,
        tableId: this.appwrite.collections.subjects,
        queries: [Query.startsWith('name', query)]
      });
  
      // Safety check in case the response is empty
        if (!subResponse || !subResponse.rows) return [];
  
      const noteIds = [...new Set(subResponse.rows.map(doc => doc['noteId']))];
      const notes = [];
  
      for (const id of noteIds) {
        try{
          const doc = await this.appwrite.tablesDB.getRow({
            databaseId: this.appwrite.databaseId,
            tableId: this.appwrite.collections.notes,
            rowId: id as string
          });
          notes.push(doc);
        }catch(err){
          console.warn(`Could not fetch parent Note ${id}. It may have been deleted.`);
        }
      }
      return notes;
    }catch(error){
      console.error("Database search query failed:", error);
      throw error; // Pass the error to the component so it can stop the loading spinner
    }
  }

  async requestAccess(noteId: string): Promise<boolean> {
    const user = await this.appwrite.account.get();
    const userId = user.$id;

    const doc = await this.appwrite.tablesDB.getRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.notes,
      rowId: noteId
    });

    const currentRequests: string[] = doc['pendingRequests'] || [];

    currentRequests.push(userId);

    await this.appwrite.tablesDB.updateRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.notes,
      rowId: noteId,
      data: { pendingRequests: currentRequests }
    });

    return true;
  }
  
  async approveAccess(noteId: string, requesterId: string): Promise<boolean> {
    const doc = await this.appwrite.tablesDB.getRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.notes,
      rowId: noteId
    });

    let pending: string[] = doc['pendingRequests'] || [];
    let allowed: string[] = doc['allowedUsers'] || [];

    pending = pending.filter(id => id !== requesterId);
    
    if (!allowed.includes(requesterId)) {
      allowed.push(requesterId);
    }

    await this.appwrite.tablesDB.updateRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.notes,
      rowId: noteId,
      data: { pendingRequests: pending, allowedUsers: allowed }
    });
    return true;

  }

  async getSharedNotes(userId: string): Promise<any[]> {
    const response = await this.appwrite.tablesDB.listRows({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.notes,
      queries: [Query.contains('allowedUsers', userId)]
    });
    return response.rows;
  }

  // ==========================================
  // 5. CASCADING DELETES
  // ==========================================

  async deleteChapter(chapterId: string): Promise<boolean> {
    const pdfs = await this.getPdfs(chapterId);
    for (const pdf of pdfs) {
      try{
        await this.deletePdf(pdf.$id, pdf.fileId);
      }catch(e){
        console.error(`Failed to delete PDF ${pdf.$id}:`, e);
      }
    }

    await this.appwrite.tablesDB.deleteRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.chapters,
      rowId: chapterId
    });
    return true;
  }

  async deleteUnit(unitId: string): Promise<boolean> {
    const chapters = await this.getChapters(unitId);
    for (const chapter of chapters) {
      await this.deleteChapter(chapter.$id);
    }
    await this.appwrite.tablesDB.deleteRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.units,
      rowId: unitId
    });
    return true;
  }

  async deleteSubject(subjectId: string): Promise<boolean> {
    const units = await this.getUnits(subjectId);
    for (const unit of units) {
      await this.deleteUnit(unit.$id);
    }
    await this.appwrite.tablesDB.deleteRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.subjects,
      rowId: subjectId
    });
    return true;
  }

  async deleteNote(noteId: string): Promise<boolean> {
    const subjects = await this.getSubjects(noteId);
    for (const subject of subjects) {
      await this.deleteSubject(subject.$id);
    }
    await this.appwrite.tablesDB.deleteRow({
      databaseId: this.appwrite.databaseId,
      tableId: this.appwrite.collections.notes,
      rowId: noteId
    });
    return true;
  }


}
