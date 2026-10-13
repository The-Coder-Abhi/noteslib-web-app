# NotesLib 📚

NotesLib is a comprehensive, full-stack document management web application designed for hierarchical organization of academic and professional notes. It allows users to create structured study materials, upload PDFs, securely share access with other users, and manage access requests via a real-time notification system.

## 🚀 Key Features

*   **Deep Hierarchical Organization:** Structure content seamlessly through a five-level hierarchy: Notes > Subjects > Units > Chapters > PDFs.
*   **Access Management & Sharing:** Built-in request system where users can search for locked notes, request access, and owners can approve them via a real-time notification panel.
*   **Dynamic Document Viewing:** Integrated PDF viewer and folder navigation with breadcrumb tracking.
*   **Smart Search:** Fast folder discovery using Appwrite Key/Fulltext indexing.
*   **Automated Structuring:** Multi-step modal for rapidly generating bulk units and chapters without repetitive manual entry.

## 🛠️ Tech Stack

**Frontend:**
*   Angular (Standalone Components)
*   TypeScript, HTML, CSS (Custom Olive Green Design System)
*   Angular Router & Route Guards

**Backend (Appwrite):**
*   **Authentication:** Session-based user identity management.
*   **Database:** Structured collections for Notes, Subjects, Units, Chapters, and Users.
*   **Storage:** Secure bucket storage for PDF document uploads.

## 📸 Screenshots

### Home Dashboard & Notifications
![Home Dashboard](src/app/assets/Screen-Shots/Home-Page.png)

### Search & Request Access
![Search Notes](src/app/assets/Screen-Shots/Search-Page.png)

### Add Notes Page
![Add Notes](src/app/assets/Screen-Shots/Add-Notes-Page.png)

### Multi-Step Folder Creation
![Create Note 1](src/app/assets/Screen-Shots/Create-Note-1-of-5.png)

![Create Note 2](src/app/assets/Screen-Shots/Create-Note-2-of-5.png)

![Create Note 3](src/app/assets/Screen-Shots/Create-Note-3-of-5.png)

![Create Note 4](src/app/assets/Screen-Shots/Create-Note-4-of-5.png)

![Create Note 5](src/app/assets/Screen-Shots/Create-Note-5-of-5.png)

### PDF Viewer & Upload
![PDF Viewer](src/app/assets/Screen-Shots/PDF-View.png)

### Login Screen
![Login Screen](src/app/assets/Screen-Shots/Login-Screen.png)

### SignUp Screen
![SignUp Screen](src/app/assets/Screen-Shots/SignUp-Screen.png)

### Verify Screen
![Verify Screen](src/app/assets/Screen-Shots/Verify-Screen.png)

### Verify Success
![Verify Success](src/app/assets/Screen-Shots/verification-success.png)

## ⚙️ Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/noteslib-web-app.git](https://github.com/yourusername/noteslib-web-app.git)
   cd noteslib-web-app

2. Install dependencies:
   ```bash
   npm install

3. Configure Appwrite Environment:
   Update your src/environments/environment.ts with your Appwrite endpoint, Project ID, Database ID, and Collection IDs.

4. Run the development server:
   ```bash
   ng serve

   Navigate to http://localhost:4200/. The application will automatically reload if you change any of the source files.

## 🚢 Deployment
This project is configured for deployment via GitHub Pages using the Angular CLI.
To build and deploy a live version:
 ```bash
   ng deploy --base-href=/noteslib-web-app/
```

## 👨‍💻 Author
Abhishek Shelar
B.Sc. IT Graduate & Full-Stack Software Developer