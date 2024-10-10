import { StudentRepository } from "../repository/index.js"

const findStudentByGroupId = async (req, res) => {
    try {
        const account = req.decodedToken.account;

        const student = await StudentRepository.findStudentByAccountId(
            account
        );
        const classId = student.classId.toString();
        const students = await StudentRepository.findStudentByGroupId(
            classId
        );
        return res.status(200).json({ data: students });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getStudentsInSameGroup = async (req, res) => {
    try {
      const decodedToken = req.decodedToken;
      const student = await StudentRepository.findStudentByAccountId(decodedToken.account);
  
      if (!student) {
        return res.status(403).json({ message: "Unauthorized" });
      }
  
      const students = await StudentRepository.getStudentsByGroup(student.group._id);
      return res.status(200).json({data:students});
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

export default {
    getStudentsInSameGroup,
    getStudentsInSameGroup
}