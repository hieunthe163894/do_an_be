
import { TaskRepository, StudentRepository } from "../repository/index.js";





const createTask = async (req, res) => {
  try {
    const decodedToken = req.decodedToken;
    const { taskType, taskName,group, description, attachment, status, assignee, classwork, timeblock, dueDate, parentTask, childTasks } = req.body;
    const student = await StudentRepository.findStudentByAccountId(decodedToken.account);
    if (!student) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (!taskName || !assignee ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const taskData = {
      taskType: taskType || 'class work',
      taskName,
      description,
      attachment : '',
      status: status || 'Pending',
      assignee,
      group:student.group._id,
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
    const groupId = req.params.groupId; 
    const filters = req.query; 

    const tasks = await TaskRepository.viewListTaskInGroup(groupId, filters);
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error in getTasksByGroup:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
export default {
  createTask,
  viewTaskDetail,
  updateTask,
  getTasksByGroup
}