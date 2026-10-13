import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Verify } from './pages/verify/verify';
import { Home } from './pages/home/home';
import { Subject } from './pages/subject/subject';
import { Unit } from './pages/unit/unit';
import { Chapter } from './pages/chapter/chapter';
import { Pdf } from './pages/pdf/pdf';
import { MyNotes } from './pages/my-notes/my-notes';
import { Search } from './pages/search/search';
import { AddNote } from './pages/add-note/add-note';
import { FolderView } from './pages/folder-view/folder-view';
import { PdfView } from './pages/pdf-view/pdf-view';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signUp', component: Signup },
  { 
    path: 'verify', 
    component: Verify, 
    canActivate: [authGuard]  // Locks the verify page
  },
  {
    path: 'home',
    component: Home,
    canActivate: [authGuard], // Locks the entire dashboard and all its children
    children: [
      {
        path: '',
        component: MyNotes,
      },

      { path: 'note/:id', component: FolderView },
      { path: 'subject/:id', component: FolderView },
      { path: 'unit/:id', component: FolderView },
      { path: 'chapter/:id', component: PdfView }, // The final layer

      {
        path: 'search',
        component: Search,
      },
      {
        path: 'add',
        component: AddNote,
      },
    ],
  },
  { path: 'subject/:noteId', component: Subject },
  { path: 'unit/:noteId/:subjectId', component: Unit },
  { path: 'chapter/:noteId/:subjectId/:unitId', component: Chapter },
  { path: 'pdf/:noteId/:subjectId/:unitId/:chapterId', component: Pdf },
];
