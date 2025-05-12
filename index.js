const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json()); // ✅ Enables JSON request body parsing Ex. req.body
const { sequelize } = require("./models");

app.use(cors());

// Step 1: Setup Project Folder & Files: file structure .env
// Step 2: Project Configuration: init project
// Step 3: Details for Entities: Model creation
// Step 4: Folder Functionalities

//Step 4: Folder Functionalities
// 4.1 Create Folder
const {
  createFolder,
  getFolder,
  updateFolder,
  deleteFolder,
  uploadFile,
  updateFile,
  deleteFile,
  getAllFolders,
  getAllFiles,
  sortFiles,
  filterFiles,
  getFolderMetadata,
} = require("./controllers/fileController");
//4.1 Create Folder
app.post("/folder/create", createFolder);
/*
{
  "name": "Project Docs",
  "type": "pdf",
  "maxFileLimit": 10
}
*/
//4.2 Update Folder
app.put("/folders/:folderId", updateFolder);
//4.3 Delete Folder
app.delete("/folders/:folderId", deleteFolder);
//4.4 Get Folder
app.delete("/folders/:folderId", getFolder);

//Step 5: File Functionalities
//5.1 Upload File
app.post("/folders/:folderId/files", uploadFile);
/*
{
  "name": "file_to_upload.csv",
  "description": "Monthly budget report",
  "type": "csv",
  "size":1
}
*/
//5.2 Update File
app.put("/folders/:folderId/files/:fileId", updateFile);
/*
{
  "description": "Updated description for the file"
}
*/
//5.3 Delete File
app.delete("/folders/:folderId/files/:fileId", deleteFile);

//Step 6: Read Functionalities
//6.1 Get All Folders
app.get("/folders", getAllFolders);
//6.2 Get Files in a Folder
app.get("/folders/:folderId/files", getAllFiles);
//6.3 Sort Files by size
app.get("/folders/:folderId/filesBySort", sortFiles);
//6.4 Sort By Recency '/folders/:folderId/filesBySort?sort=uploadedAt'
//6.5 Get Files by Type Across Folders
app.get("/files", filterFiles);
//6.6 Get File Metadata
app.get("/folders/:folderId/files/metadata", getFolderMetadata);

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("Unable to connnect to database", error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
