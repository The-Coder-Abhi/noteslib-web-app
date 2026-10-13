const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const targetPath = './src/environments/environment.ts';

// Create the environment.ts file content dynamically
const envConfigFile = `export const environment = {
  production: false,
  appwrite: {
    endpoint: '${process.env.APPWRITE_ENDPOINT}',
    projectId: '${process.env.APPWRITE_PROJECT_ID}',
    databaseId: '${process.env.APPWRITE_DATABASE_ID}',
    bucketId: '${process.env.APPWRITE_BUCKET_ID}',
    notesCollection: '${process.env.APPWRITE_NOTES_COLLECTION}',
    subjectsCollection: '${process.env.APPWRITE_SUBJECTS_COLLECTION}',
    unitsCollection: '${process.env.APPWRITE_UNITS_COLLECTION}',
    chaptersCollection: '${process.env.APPWRITE_CHAPTERS_COLLECTION}',
    pdfsCollection: '${process.env.APPWRITE_PDFS_COLLECTION}'
  }
};
`;

// Ensure the environments folder exists
fs.mkdirSync('./src/environments', { recursive: true });

// Write the file
fs.writeFileSync(targetPath, envConfigFile);
console.log('environment.ts generated successfully from .env');