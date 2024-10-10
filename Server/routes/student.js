import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { StudentController } from "../controller/index.js";
const studentRouter = express.Router();
studentRouter.get("/getTeacherByStudentId",verifyToken, StudentController.getTeacherByStudentId)
export default studentRouter;
