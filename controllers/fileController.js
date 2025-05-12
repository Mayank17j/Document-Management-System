const { File: fileModel, Folder: folderModel } = require("../models");

//?NOTE: Utility function for error handling
const handleError = (res, error, message, statusCode = 500) => {
  console.error(message, error);
  return res.status(statusCode).json({ message, error: error.message });
};

const createFolder = async (req, res) => {
  const { name, type, maxFileLimit } = req.body;
  console.error("LOG.fileController.createFolder.name, type, maxFileLimit", name, type, maxFileLimit);
  if (!name || !type || !Number.isInteger(maxFileLimit) || maxFileLimit < 1)
    return res.status(400).json({ message: "Invalid new folder details!" });

  //? validation for array items
  const validTypes = ["csv", "img", "pdf", "ppt"];
  if (!validTypes.includes(type)) return res.status(400).json({ message: "Required type, must be one of ['csv', 'img', 'pdf', 'ppt']!" });
  if (maxFileLimit < 1) return res.status(400).json({ message: "Required maxFileLimit be positive integer!" });

  try {
    const findName = await folderModel.findOne({ where: { name: name } });
    if (findName) return res.status(400).json({ message: "Required name be a unique string" });

    const newFolder = await folderModel.create(req.body);
    console.error("LOG.fileController.createFolder.newFolder", newFolder.dataValues);
    if (!newFolder) return res.status(400).json({ message: "Unable to create Folder!" });

    res.status(201).json({ message: "Folder created successfully", folder: newFolder });
  } catch (error) {
    handleError(res, error, "Create Folder Crashed!");
  }
};

const updateFolder = async (req, res) => {
  const { folderId } = req.params;
  const { name, maxFileLimit } = req.body;
  console.error("LOG.fileController.updateFolder.name, maxFileLimit", name, maxFileLimit);
  if (maxFileLimit && (!Number.isInteger(maxFileLimit) || maxFileLimit < 1))
    return res.status(400).json({ message: "Invalid maxFileLimit!" });
  if (!folderId) return res.send(400).json({ message: "Invalid folderId!" });

  try {
    if (name) {
      const findName = await folderModel.findOne({ where: { name: name } });
      if (findName) return res.status(400).json({ message: "Required name be a unique string" });
    }

    const folder = await folderModel.findByPk(folderId);
    console.error("LOG.fileController.updateFolder.folder", folder.dataValues);
    if (!folder) return res.status(400).json({ message: "Unable to get Folder by folderId!" });

    await folder.update(req.body); //?NOTE: Update
    console.error("LOG.fileController.updateFolder.folder.dataValues", folder.dataValues);

    res.status(200).json({ message: "Folder updated successfully", updatedFolder: folder });
  } catch (error) {
    console.error("LOG.fileController.updateFolder.500", error);
    res.status(500).json({ message: "updateFolder Crashed!", error: error.message });
  }
};

const deleteFolder = async (req, res) => {
  const { folderId } = req.params;
  console.error("LOG.fileController.deleteFolder.folderId", folderId);
  if (!folderId) return res.send(400).json({ message: "folderId does not exist!" });

  try {
    const folderExist = await folderModel.findByPk(folderId);
    if (folderExist) {
      await folderExist.destroy(); //?NOTE: Destroy
    }
    if (!folderExist) return res.status(404).json({ message: "Folder not found!" });
    console.error("LOG.fileController.deleteFolder.deletedFolder", folderExist.dataValues);

    res.status(200).json({ message: "Folder Deleted Successfuly" });
  } catch (error) {
    console.error("LOG.fileController.deleteFolder.500", error);
    res.status(500).json({ message: "deleteFolder Crashed!", error: error.message });
  }
};

const getFolder = async (req, res) => {
  const { folderId } = req.params;
  console.error("LOG.fileController.getFolder.folderId", folderId);
  if (!folderId) return res.send(400).json({ message: "Invalid folderId!" });

  try {
    const folder = await folderModel.findByPk(folderId);
    console.error("LOG.fileController.getFolder.folder", folder.dataValues);
    if (!folder) return res.status(404).json({ message: "folderId does not exist.!" });

    res.status(200).json({ folder: folder });
  } catch (error) {
    console.error("LOG.fileController.getFolder.500", error);
    res.status(500).json({ message: "Get Folder Crashed!", error: error.message });
  }
};

const uploadFile = async (req, res) => {
  const { folderId } = req.params;

  const { name, description = "No desciption", type, size } = req.body;
  console.error("LOG.fileController.createFile.name, type, maxFileLimit", name, description, type, size);
  if (!name || !type || !size) return res.status(400).json({ error: "Invalid new file details!" });

  const validTypes = ["csv", "img", "pdf", "ppt"];
  if (!validTypes.includes(type)) return res.status(400).json({ message: "Required type, must be one of ['csv', 'img', 'pdf', 'ppt']!" });

  try {
    //check if folderId present in filderModel
    let parentFolder = await folderModel.findByPk(folderId);
    if (!parentFolder) return res.status(404).json({ error: "Folder does not exist.!" });
    console.error("LOG.fileController.createFile.parentFolder", parentFolder.dataValues);

    //check file type
    if (parentFolder.type !== type) return res.status(400).json({ error: "File type mismatch!" });
    //check folder maxFileLimit
    const fileCount = await fileModel.count({ where: { folderId: folderId } });
    console.error("LOG.fileController.createFile.fileCount .length", parentFolder.maxFileLimit, fileCount + 1);
    if (parentFolder && parentFolder.maxFileLimit <= fileCount) return res.status(400).json({ error: "Exceeds folder limit!" });
    //check file size < 10MB
    if (size / 1024 > 10) return res.status(400).json({ error: "Exceeds file size 10MB!" });

    //req.body.folderId = folderId;
    const file = await fileModel.create({ ...req.body, folderId }); //fileModel.create(req.body);

    res.status(201).json({ message: "File uploaded successfully", file: file });
  } catch (error) {
    console.error("LOG.fileController.createFile.500", error);
    res.status(500).json({ message: "Create File Crashed!", error: error.message });
  }
};

const updateFile = async (req, res) => {
  const { folderId, fileId } = req.params;
  if (!folderId || !fileId) return res.status(400).json({ error: "Invalid folderId or fileId!" });
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: "Invalid description!" });
  console.error("LOG.fileController.createFile.body", description, folderId, fileId);

  try {
    //check if folder exist
    const parentFolder = await folderModel.findByPk(folderId);
    if (!parentFolder) return res.status(404).json({ error: "Folder does not exist.!" });
    console.error("LOG.fileController.updateFile.parentFolder", parentFolder.dataValues);

    //check if file exist
    let updatedFile;
    const fileExist = await fileModel.findByPk(fileId);
    if (fileExist) {
      updatedFile = await fileModel.update(req.body, { where: { fileId } });
    } else return res.status(404).json({ error: "File does not exist.!" });
    console.error("LOG.fileController.updateFile.fileExist", fileExist.dataValues);

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("LOG.fileController.updateFile.500", error);
    res.status(500).json({ message: "Update File Crashed!", error: error.message });
  }
};

const deleteFile = async (req, res) => {
  const { folderId, fileId } = req.params;
  if (!folderId || !fileId) return res.status(400).json({ error: "Invalid folderId or fileId!" });
  console.error("LOG.fileController.deleteFile.params", folderId, fileId);

  try {
    //check if file exist
    const fileExist = await fileModel.findOne({ where: { folderId: folderId, fileId: fileId } });
    if (!fileExist) return res.status(404).json({ message: "File not found in the folder!" });
    console.error("LOG.fileController.deleteFile.fileExist", fileExist);

    await fileExist.destroy();

    res.status(200).json({ message: "File Deleted Successfuly" });
  } catch (error) {
    console.error("LOG.fileController.deleteFile.500", error);
    res.status(500).json({ message: "deleteFile Crashed!", error: error.message });
  }
};

const getAllFolders = async (req, res) => {
  try {
    const folders = await folderModel.findAll();
    if (folders.length < 1) return res.status(404).json({ message: "Folder not exist.!" });
    console.error("LOG.fileController.getAllFolders.folders", folders);

    res.status(200).json({ folders: folders });
  } catch (error) {
    console.error("LOG.fileController.getAllFolders.500", error);
    res.status(500).json({ message: "Get Folders Crashed!", error: error.message });
  }
};

const getAllFiles = async (req, res) => {
  const { folderId } = req.params;
  if (!folderId) return res.status(400).json({ error: "Invalid folderId!" });
  console.error("LOG.fileController.getAllFiles.body", folderId);

  try {
    const files = await fileModel.findAll({ where: { folderId: folderId } });
    if (files.length < 1) return res.status(404).json({ error: "File/Folder does not exist.!" });
    console.error("LOG.fileController.getAllFiles.files", files);

    res.status(200).json({ files: files });
  } catch (error) {
    console.error("LOG.fileController.getAllFiles.500", error);
    res.status(500).json({ message: "getAllFiles File Crashed!", error: error.message });
  }
};

// /folders/:folderId/filesBySort?sort=size
const sortFiles = async (req, res) => {
  const { folderId } = req.params;
  if (!folderId) return res.status(400).json({ error: "Invalid folderId!" });
  const { sort } = req.query;
  if (!sort) return res.status(400).json({ error: "Invalid query!" });
  console.error("LOG.fileController.sortFiles: ", folderId, sort);

  try {
    const files = await fileModel.findAll({ where: { folderId: folderId }, order: [[sort]] });
    if (!files.length) return res.status(404).json({ error: "File/Folder does not exist.!" });
    console.error("LOG.fileController.sortFiles.files", files);

    res.status(200).json({ sortedFiles: files });
  } catch (error) {
    console.error("LOG.fileController.sortFiles.500", error);
    res.status(500).json({ message: "sortFiles File Crashed!", error: error.message });
  }
};

// /files?type=ppt
const filterFiles = async (req, res) => {
  const { type } = req.query;
  if (!type) return res.status(400).json({ error: "Invalid query!" });
  console.error("LOG.fileController.filterFiles: ", type);

  try {
    const files = await fileModel.findAll({ where: { type: type } });
    if (files.length < 1) return res.status(404).json({ error: "File/Folder does not exist.!" });
    console.error("LOG.fileController.filterFiles.files", files);

    res.status(200).json({ files: files });
  } catch (error) {
    console.error("LOG.fileController.filterFiles.500", error);
    res.status(500).json({ message: "filterFiles Crashed!", error: error.message });
  }
};

const getFolderMetadata = async (req, res) => {
  const { folderId } = req.params;
  if (!folderId) return res.status(400).json({ error: "Invalid folderId!" });
  console.error("LOG.fileController.getAllFiles.body", folderId);

  try {
    const files = await fileModel.findAll({ where: { folderId: folderId }, attributes: ["fileId", "name", "size", "description"] });
    if (files.length < 1) return res.status(404).json({ error: "File/Folder does not exist.!" });
    console.error("LOG.fileController.getAllFiles.files", files);

    res.status(200).json({ files: files });
  } catch (error) {
    console.error("LOG.fileController.getAllFiles.500", error);
    res.status(500).json({ message: "getAllFiles File Crashed!", error: error.message });
  }
};

module.exports = {
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
};
