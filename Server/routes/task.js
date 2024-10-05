import express from "express";
import { TaskController } from "../controller/index.js";
import verifyToken from "../middleware/verifyToken.js";
const taskRouter = express.Router();

taskRouter.post('/create',verifyToken, TaskController.createTask);
taskRouter.get('/getAllTasks', TaskController.getAllTasks);
taskRouter.get('/:taskId', TaskController.viewTaskDetail);
taskRouter.put('/:taskId',verifyToken, TaskController.updateTask);
taskRouter.get('/viewTaskByGroup/:groupId', TaskController.getTasksByGroup);

export default taskRouter;

