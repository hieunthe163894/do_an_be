import mongoose, { Schema } from "mongoose";
import Student from "./Student.js";
import TimeBlock from "./TimeBlock.js";
const TaskSchema = new Schema(
  {
    taskType:{
      type: String,
      required: true,
      enum: ["class work", "group task"]
    },
    taskName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    attachment: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "in progress", "done"],
      default: "pending",
      required: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      // required: true,
    },
    group:{
      type: Schema.Types.ObjectId,
      ref: "Group",
      // required: true,
    },
    classwork: {
      type: Schema.Types.ObjectId,
      ref: "Classwork",
      // required: true,
    },
    timeblock: {
      type: Schema.Types.ObjectId,
      ref: "TimeBlock",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: "Task" 
    },
    childTasks: [{
      type: Schema.Types.ObjectId,
      ref: "Task" 
    }]
  },
  { timestamps: true, collection: "Tasks" }
);

const Task = mongoose.model("Task", TaskSchema);
export default Task;
