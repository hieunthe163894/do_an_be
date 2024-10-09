import express from "express";
import { TaskController } from "../controller/index.js";
import verifyToken from "../middleware/verifyToken.js";
import authorization from "../middleware/authorization.js";
const taskRouter = express.Router();

taskRouter.post('/create',verifyToken, TaskController.createTask);
taskRouter.get('/:taskId',verifyToken, TaskController.viewTaskDetail);
taskRouter.put('/:taskId',verifyToken, TaskController.updateTask);
taskRouter.get('/viewTaskByGroup/:groupId',verifyToken, TaskController.getTasksByGroup);

export default taskRouter;

