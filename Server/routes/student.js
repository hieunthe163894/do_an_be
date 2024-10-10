import express from "express";
import { StudentController } from "../controller/index.js";
import verifyToken from "../middleware/verifyToken.js";
import authorization from "../middleware/authorization.js";
const studentRouter = express.Router();
studentRouter.get('/', verifyToken, authorization.checkGroupAccess, StudentController.findStudentByGroupId)
export default studentRouter;
