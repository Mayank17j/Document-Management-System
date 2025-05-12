# Document Management System 📁

A backend API built with **Node.js**, **Express**, **Sequelize**, and **PostgreSQL** to manage folders and files with advanced metadata support and constraints.

## 🔧 Technologies
- Node.js, Express.js
- PostgreSQL (via Supabase)
- Sequelize ORM
- Cloudinary (file storage)
- Multer (file upload middleware)
- REST API Architecture

## ✨ Features
- Create folders with custom constraints: allowed file types (`pdf`, `csv`, `img`, `ppt`) and maximum file limits.
- Upload files with validation (type, size ≤ 10MB, max count).
- Store and retrieve file metadata (description, size, timestamp).
- Sort files by size or upload date.
- Filter files by type across folders.
- Update file descriptions and folder constraints.
- Delete folders or individual files with cascading behavior.

## 📂 Example API Endpoints
- `POST /folder/create` – Create a folder
- `POST /folders/:folderId/files` – Upload a file
- `GET /folders/:folderId/filesBySort?sort=size` – Sort files
- `GET /files?type=pdf` – Filter files by type
- `PUT /folders/:folderId` – Update folder details
- `DELETE /folders/:folderId/files/:fileId` – Delete file

## 🧪 Future Improvements
- JWT-based authentication & role-based access
- Pagination support for large folder listings
- UI integration with React or Next.js

---
