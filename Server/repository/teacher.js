import Student from "../model/Student.js"
const getTeacherByClassId = async (classId) => {
  try {
    const classDoc = await Class.findById(classId);
    const classCode = classDoc.classCode;
    console.log("Class Code:", classCode);
    
    const teachers = await Teacher.find({
      'assignedClasses.classCode': classCode,
    }).populate({
      path: 'account',
      select: 'profilePicture'
    });

    const mentors = await Mentor.find({ 
      'assignedClasses.classCode': classCode,
    });

    const combinedResults = [
      ...teachers.map(teacher => ({
        name: teacher.name,
        profilePicture: teacher.account ? teacher.account.profilePicture : null,
        role: 'Teacher',
      })),
      ...mentors.map(mentor => ({
        name: mentor.name,
        profilePicture: mentor.profilePicture ? mentor.profilePicture : null,
        role: 'Mentor',
      })),
    ];
  return combinedResults;
} catch (error) {
  throw new Error(error.message);
}
}
export default {
  getTeacherByClassId
}