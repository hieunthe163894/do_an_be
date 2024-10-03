import mongoose, { Schema } from "mongoose";
const ColSchema = new Schema({
  name: {
    type: String,
    default: "Default stage",
  },
  color: {
    type: String,
    default: "#86efac",
  },
});
const RowSchema = new Schema({
  name: {
    type: String,
    default: "Default Customer action",
  },
});
const CellSchema = new Schema({
  row: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  col: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
    default: "default content",
  },
});
const CustomerJourneyMapSchema = new Schema({
  cols: {
    type: [ColSchema],
    default: [
      {
        name: "Default name",
        color: "#86efac",
      },
    ],
  },
  rows: {
    type: [RowSchema],
    default: [{ name: "Default Customer action" }],
  },
  cells: {
    type: [CellSchema],
    default: [],
  },
});
const GroupSchema = new Schema(
  {
    GroupName: {
      type: String,
      required: true,
    },
    mentor: {
      type: Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    GroupDescription: {
      type: String,
      required: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    customerJourneyMap: {
      type: CustomerJourneyMapSchema,
      default: {},
    },
    BusinessModalCanvas: {
      show: {
        type: Boolean,
        default: true,
      },
      section: {
        name: { type: String, required: true },
        color: { type: String, required: true },
        content: { type: String, required: true },
        icon: { type: String, required: false },
      },
    },
    CustomerPersonas: [
      {
        avatar: { type: String, required: true },
        name: { type: String, required: true },
        bio: { type: String, required: true },
        needs: [{ type: String, required: true }],
      },
    ],
  },
  { timestamps: true, collection: "Groups" }
);

const Group = mongoose.model("Group", GroupSchema);
export default Group;
