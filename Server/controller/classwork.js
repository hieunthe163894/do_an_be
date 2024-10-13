import {
  ClassworkRepository,
  StudentRepository,
  SubmissionRepository,
} from "../repository/index.js";
const getClassWorkByStudent = async (req, res) => {
  try {
    const decodedToken = req.decodedToken;
    const userId = decodedToken.role.id;
    const type = req.params.type;
    const classWork = await ClassworkRepository.getClassWorkByStudent({
      userId,
      type,
    });
    return res.status(201).json({ data: classWork });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getClassWorkByTeacher = async (req, res) => {
  try {
    const classId = req.params.classId;
    const type = req.params.type;
    const classWork = await ClassworkRepository.getClassWorkByTeacher({
      classId,
      type,
    });
    return res.status(201).json({ data: classWork });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const viewOutcomes = async (req, res) => {
  try {
    const decodedToken = req.decodedToken;
    const student = await StudentRepository.findStudentByAccountId(
      decodedToken.account
    );
    if (!student) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const outcomesList = await ClassworkRepository.getOutcomes(student.classId);
    const outcomeIds = outcomesList.map((outcome) => outcome._id);
    const submissions = await SubmissionRepository.getSubmissionsOfGroup(
      outcomeIds,
      student.group
    );
    const modifiedOutcome = outcomesList.map((oc) => {
      const submission = submissions.find(
        (s) => s.classworkId.toString() === oc._id.toString()
      );
      return {
        ...oc._doc, // Spread the properties of oc
        groupSubmission: submission, // Add groupSubmission attribute
      };
    });
    return res.status(200).json({ outcomesList: modifiedOutcome });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export default {
  getClassWorkByStudent,
  getClassWorkByTeacher,
  viewOutcomes,
};
