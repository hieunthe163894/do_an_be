import Student from "../model/Student.js";
const findStudentByAccountId = async (accountId) => {
  try {
    const student = await Student.findOne({
      account: accountId,
    });
    return student;
  } catch (error) {
    throw new Error(error.message);
  }
};
export default {
  findStudentByAccountId,
};
