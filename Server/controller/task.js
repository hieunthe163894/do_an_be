
import { TaskRepository, StudentRepository } from "../repository/index.js";





const createTask = async (req, res) => {
  try {
    const decodedToken = req.decodedToken;
    const { taskType, taskName, description, attachment, status, assignee, classwork, timeblock, dueDate, parentTask, childTasks } = req.body;
    const student = await StudentRepository.findStudentByAccountId(decodedToken.account);
    if (!student) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (!taskName || !description || !assignee || !classwork || !timeblock) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const taskData = {
      taskType: taskType || 'class work',
      taskName,
      description,
      attachment : '',
      status: status || 'pending',
      assignee,
      createdBy: student._id,
      classwork,
      timeblock,
      dueDate,
      parentTask,
      childTasks,
    };
    const newTask = await TaskRepository.createTask(taskData);
    return res.status(201).json({
      data: newTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Create task failed',
      error: error.message,
    });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const { taskType, assignee, status, search } = req.query;

    const filters = {
      taskType,
      assignee,
      status,
      search
    };

    const tasks = await TaskRepository.getAllTasks(filters);
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const viewTaskDetail = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }
    const taskDetail = await TaskRepository.viewTaskDetail(taskId);
    return res.status(200).json({data:taskDetail});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const updateData = req.body; 

    const task = await TaskRepository.updatedTask(taskId, updateData);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ data: task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTasksByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }
    const tasks = await TaskRepository.viewListTaskInGroup(groupId);
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for the group" });
    }
    return res.status(200).json({data:tasks});
  } catch (error) {
    return res.status(500).json({ message: 'Error fetch', error: error.message });
  }
};
export default {
  createTask,
  getAllTasks,
  viewTaskDetail,
  updateTask,
  getTasksByGroup
}