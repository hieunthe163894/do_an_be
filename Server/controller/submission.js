import { SubmissionRepository } from "../repository/index.js";

const createSubmission = async (req, res) => {
    try {
        const { attachment } = req.body;
        const createSubmiss = await SubmissionRepository.createSubmission({
            groupId: req.groupId,
            studentId: req.studentId,
            classworkId: req.classId,
            attachment,
        });  
        console.log(req.groupId)      
        return res.status(200).json({ data: createSubmiss });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export default {
    createSubmission
};
