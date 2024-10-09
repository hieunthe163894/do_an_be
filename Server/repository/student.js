import mongoose from 'mongoose';
import Student from "../model/Student.js";

const findStudentByAccountId = async (accountId) => {
  try {
    const student = await Student.findOne({
      account: accountId,
    }).populate('account', '-password');
    return student;
  } catch (error) {
    throw new Error(error.message);
  }
};

const findStudentByGroupId = async (classId) => {
  try {
    const students = await Student.find({ classId: classId }).select('_id name studentId gen major group').populate('group', 'GroupName');
    console.log(students);

    const groupedStudents = students.reduce((acc, student) => {
      const groupName = student.group.GroupName;
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      const { group, ...studentWithoutGroup } = student._doc;
      acc[groupName].push(studentWithoutGroup);
      return acc;
    }, {});
    return groupedStudents;
  } catch (error) {
    throw new Error(error.message);
  }
}
export default {
  findStudentByAccountId,
  findStudentByGroupId,
};
