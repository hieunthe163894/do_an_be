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
export const getStudentsByGroup = async (groupId) => {
  try {
    const students = await Student.find({ group: groupId }).select('_id name');
    return students;
  } catch (error) {
    throw new Error(error.message);
  }
};
export default {
  findStudentByAccountId,
  getStudentsByGroup
};
