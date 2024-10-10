import { ClassworkRepository } from "../repository/index.js";
const getClassWorkByStudent = async (req, res) => {
    try {
        const decodedToken = req.decodedToken;
        const userId = decodedToken.role.id
        const type = req.params.type
        const classWork = await ClassworkRepository.getClassWorkByStudent({userId,type});        
        return res.status(201).json({ data: classWork });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getClassWorkByTeacher = async (req, res) => {
    try {
        const classId = req.params.classId
        console.log(classId);
        
        const type = req.params.type
        const classWork = await ClassworkRepository.getClassWorkByTeacher({classId,type});        
        return res.status(201).json({ data: classWork });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
export default {
    getClassWorkByStudent,
    getClassWorkByTeacher
};
