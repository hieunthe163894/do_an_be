import mongoose, { Schema } from "mongoose";

const SubmissionSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student', 
      required: true,
    },
    attachment: {
      type: String,
      required: true,
    },
    grade:
      {
        gradingCriteria: [{
          type: String,
          required: false,
        }],
        grade: {
          type: Number,
          required: true, 
        },
      },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group', 
      required: true,
    },
    classworkId: {
      type: Schema.Types.ObjectId,
      ref: 'Classwork',
      required: true,
    },
  },
  { timestamps: true, collection: 'Submissions' }
);

const Submission = mongoose.model('Submission', SubmissionSchema);
export default Submission;
