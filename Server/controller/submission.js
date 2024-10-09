import { SubmissionRepository } from "../repository/index.js";

const createSubmission = async (req, res) => {
    try {
        const { attachment } = req.body;
        const classworkId = req.params.classworkId;
        const studentId = req.decodedToken.role.id;
        const createSubmiss = await SubmissionRepository.createSubmission({
            groupId: req.groupId,
            studentId,
            classworkId,
            attachment,
        });   
        return res.status(200).json({ data: createSubmiss });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export default {
    createSubmission
};
