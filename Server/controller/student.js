
import { StudentRepository } from "../repository/index.js"
const getTeacherByStudentId = async (req, res) => {
    try {
        const decodedToken = req.decodedToken;
        console.log(decodedToken);
        
        const userId = decodedToken.role.id
        const student = await StudentRepository.getTeacherByStudentId(userId);
        return res.status(201).json({ data: student });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export default {
    getTeacherByStudentId
}