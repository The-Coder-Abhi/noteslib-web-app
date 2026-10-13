import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { NotesService } from '../../services/notes';

@Component({
  selector: 'app-pdf-view',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './pdf-view.html',
  styleUrl: '../folder-view/folder-view.css',
})
export class PdfView implements OnInit {
  pdfs: any[] = [];
  isLoading: boolean = true;
  isUploading = false;
  chapterId: string = '';
  breadcrumb: string[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private notes: NotesService,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit() {
    this.breadcrumb = history.state.path || [];

    this.route.paramMap.subscribe(params => {
    this.chapterId = params.get('id') || '';
    if (this.chapterId) {
      this.loadPdfs();
    }else{
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
  }

  async loadPdfs() {
    this.isLoading = true;
    try{
      this.pdfs = await this.notes.getPdfs(this.chapterId);
    }catch(error){
      console.error('Error fetching PDFs:', error);
    }finally{
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // Opens the hidden file picker
  triggerFileInput() {
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Handles the file once the user selects it
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF document.');
      return;
    }

    this.isUploading = true;
    this.cdr.detectChanges();

    try {
      // Uses your existing NotesService to upload to Appwrite Storage and Database
      await this.notes.uploadPdfToChapter(this.chapterId, file);
      
      // Reload the list so the new PDF instantly appears on screen
      await this.loadPdfs();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Failed to upload PDF. Please try again.');
    } finally {
      this.isUploading = false;
      event.target.value = ''; // Reset the input so they can upload again if needed
      this.cdr.detectChanges();
    }
  }


  openPdf(fileUrl: string) {
    window.open(fileUrl, '_blank');
  }

  async deletePdf(pdf: any, event: Event) {
    event.stopPropagation();
    try{
      await this.notes.deletePdf(pdf.$id, pdf.fileId);
      this.pdfs = this.pdfs.filter(p => p.$id !== pdf.$id);
      this.cdr.detectChanges();
    }catch(error){
      console.error('Error deleting PDF:', error);
    }
  }

  goBack() {
    window.history.back();
  }
}
