import Task from '../model/Task.js';
import Account from '../model/Account.js';
import Classwork from '../model/ClassWork.js';
import TimeBlock from '../model/TimeBlock.js';
import Student from '../model/Student.js';


const createTask = async ({ taskType, taskName, createdBy, description, attachment, status, assignee, classwork, timeblock, dueDate, parentTask, childTasks }) => {
  try {
    const result = await Task.create({
      taskType, taskName, description, attachment, status, createdBy, assignee, classwork, timeblock, dueDate, parentTask, childTasks
    });
    return result._doc;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getAllTasks = async (filters) => {
  try {
    const query = {};
    if (filters.taskType) {
      query.taskType = filters.taskType;
    }

    if (filters.assignee) {
      query.assignee = filters.assignee;
    }

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.search) {
      query.taskName = { $regex: filters.search, $options: "i" };
    }
    const tasks = await Task.find(query)
      .populate({
        path: 'assignee',
        select: 'name',
        populate: {
          path: 'account',
          select: 'profilePicture -_id',
        }
      })
      .populate({
        path: 'timeblock',
        select: 'name',
      })
      .populate({
        path: 'parentTask',
        select: '_id taskName'
      })
      .populate({
        path: 'childTasks',
        select: '_id taskName'
      })
      .lean();
    tasks.forEach(task => {
      if (task.assignee && task.assignee.account) {
        task.assignee.profilePicture = task.assignee.account.profilePicture;
        delete task.assignee.account;
      }
    });

    return tasks;
  } catch (error) {
    throw new Error('Error fetching tasks: ' + error.message);
  }
};

export const viewTaskDetail = async (taskId) => {
  try {
    const task = await Task.findById(taskId)
      .populate({
        path: 'assignee',
        select: 'name',
        populate: {
          path: 'account',
          select: 'profilePicture -_id',
        }
      })
      .populate({
        path: 'parentTask',
        select: '_id taskName dueDate assignee',
      })
      .populate({
        path: 'childTasks',
        select: '_id taskName dueDate assignee'
      })
      .populate({
        path: 'createdBy',
        select: '_id name',
        populate: {
          path: 'account',
          select: 'profilePicture -_id',
        }
      })
      .populate({
        path: 'group',   // Populate group details
        select: '_id GroupName'
      })
      .lean();

    if (!task) {
      throw new Error("Task not found");
    }
    if (task.assignee && task.assignee.account && task.createdBy && task.createdBy.account) {
      task.assignee.profilePicture = task.assignee.account.profilePicture;
      task.createdBy.profilePicture = task.createdBy.account.profilePicture;
      delete task.createdBy.account;
      delete task.assignee.account;
    }

    return task;
  } catch (error) {
    throw new Error('Error fetching task details: ' + error.message);
  }
};

export const updatedTask = async (taskId, updateData) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true }
    )
      .populate({
        path: 'assignee',
        select: 'name',
        populate: {
          path: 'account',
          select: 'profilePicture -_id',
        }
      })
      .populate({
        path: 'parentTask',
        select: 'taskName dueDate assignee'
      })
      .populate({
        path: 'childTasks',
        select: 'taskName'
      })
      
    if (updatedTask.assignee && updatedTask.assignee.account) {
      updatedTask.assignee.profilePicture = updatedTask.assignee.account.profilePicture;
      delete updatedTask.assignee.account;
    }

    return updatedTask;
  } catch (error) {
    throw new Error("Failed to update task: " + error.message);
  }
};


export const viewListTaskInGroup = async (groupId) => {
  try {
    const studentsInGroup = await Student.find({ group: groupId }).select('_id').lean();
    console.log(studentsInGroup);
    
    if (studentsInGroup.length === 0) {
      throw new Error('No students found in this group');
    }
    const studentIds = studentsInGroup.map(student => student._id);
    console.log(studentIds);
    
    const tasks = await Task.find({ createdBy: { $in: studentIds } })
      .populate({
        path: 'assignee',
        select: 'name',
        populate: {
          path: 'account',
          select: 'profilePicture -_id',
        }
      })
      .populate({
        path: 'childTasks',
        select: '_id taskName dueDate assignee'
      })
      .populate({
        path: 'childTasks',
        select: '_id taskName'
      })
      .lean();
    tasks.forEach(task => {
      if (task.assignee && task.assignee.account) {
        task.assignee.profilePicture = task.assignee.account.profilePicture;
        delete task.assignee.account;
      }
    });

    return tasks;
  } catch (error) {
    throw new Error('Error fetching tasks: ' + error.message);
  }
};
export default {
  createTask,
  getAllTasks,
  viewTaskDetail,
  updatedTask,
  viewListTaskInGroup
};
