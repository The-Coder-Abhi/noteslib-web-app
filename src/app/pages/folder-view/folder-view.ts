import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { NotesService } from '../../services/notes';
import {LowerCasePipe} from '@angular/common';

@Component({
  selector: 'app-folder-view',
  standalone: true,
  imports: [MatIconModule, LowerCasePipe],
  templateUrl: './folder-view.html',
  styleUrl: './folder-view.css',
})
export class FolderView implements OnInit {
  items: any[] = [];
  isLoading: boolean = true;
  parentType: string = '';
  parentId: string = '';
  currentTitle: string = '';
  breadcrumb: string[] = [];

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private notesService: NotesService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.breadcrumb = history.state.path || [];

    this.route.url.subscribe(urlSegments => {
      this.parentType = urlSegments[0]?.path || '';
      this.parentId = urlSegments[1]?.path || '';
      this.loadData();
    });
  }

  async loadData() {
    this.isLoading = true;
    try{
      if (this.parentType === 'note') {
        this.currentTitle = 'Subjects';
        this.items = await this.notesService.getSubjects(this.parentId);
      }else if (this.parentType === 'subject') {
        this.currentTitle = 'Units';
        this.items = await this.notesService.getUnits(this.parentId);
      }else if (this.parentType === 'unit') {
        this.currentTitle = 'Chapters';
        this.items = await this.notesService.getChapters(this.parentId);
      }
    }catch(error){
      console.error(`Error fetching ${this.currentTitle}:`, error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  openFolder(item: any) {
    const newPath = [...this.breadcrumb, item.name];
    if (this.parentType === 'note') {
      this.router.navigate(['/home/subject', item.$id],{ state: { path: newPath } });
    }else if (this.parentType === 'subject') {
      this.router.navigate(['/home/unit', item.$id],{ state: { path: newPath } });
    }else if (this.parentType === 'unit') {
      this.router.navigate(['/home/chapter', item.$id],{ state: { path: newPath } });
    }
  }

  async deleteItem(item: any,event: Event) {
    event.stopPropagation(); // Prevent the click from propagating to the parent div
    try{
      if (this.parentType === 'note') await this.notesService.deleteSubject(item.$id);
      else if (this.parentType === 'subject') await this.notesService.deleteUnit(item.$id);
      else if (this.parentType === 'unit') await this.notesService.deleteChapter(item.$id);

      this.items = this.items.filter(i => i.$id !== item.$id);
      this.cdr.detectChanges();
    }catch(error){
      console.error(`Error deleting item:`, error);
    }
  }

  goBack() {
    window.history.back();
  }
}
