import express from 'express';
import multer from 'multer';
import {uploadController} from '../controllers/uploadController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router=express.Router();

//Multer Configuration
const storage=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,'uploads/');
  },
  filename:function(req,file,cb){
    cb(null,Date.now()+' '+file.originalname);
  }
});

const upload=multer({storage,
  fileFilter:function(req,file,cb){
     const allowedTypes = [
      "text/plain", // .txt
      "application/pdf", // .pdf
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .txt, .pdf, .doc, .docx files are allowed"));
    }
  }
});

//upload route

router.post('/upload',authMiddleware,upload.single('file'),uploadController);

export default router;