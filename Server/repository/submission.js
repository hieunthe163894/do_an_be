import Submission from "../model/Submission.js";

const createSubmission = async ({ studentId, attachment, groupId, classworkId }) => {
    try {
        const newSubmission = await Submission.create({
            student: studentId,
            attachment: attachment,
            group: groupId,
            classworkId: classworkId,
        });
        return newSubmission;
    } catch (error) {
        return new Error(error.message);
    }
};

export default {
    createSubmission
};
