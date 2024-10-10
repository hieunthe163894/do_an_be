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

export default {
    findStudentByGroupId
}