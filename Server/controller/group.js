import Group from "../model/Group.js";
import { GroupRepository, StudentRepository } from "../repository/index.js";
const createJourneyRow = async (req, res) => {
  try {
    const { rowName } = req.body;
    const existingGroup = await GroupRepository.findGroupById({
      groupId: req.groupId,
    });
    if (!existingGroup) {
      return res.status(401).json({ error: "Group not found" });
    }

    const newRow = await GroupRepository.createJourneyRow({
      groupId: existingGroup._id,
      name: rowName,
    });
    const newCells = existingGroup.customerJourneyMap.cols.map((column) => ({
      row: newRow._id, // Ensure you are returning an object
      col: column._id,
    }));
    const updatedGroup = await GroupRepository.createCellsOnUpdate({
      newCells,
      groupId: existingGroup._id,
    });
    if (updatedGroup) {
      return res.status(201).json({ data: updatedGroup });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const createJourneyCol = async (req, res) => {
  try {
    const { colName } = req.body;
    const existingGroup = await GroupRepository.findGroupById({
      groupId: req.groupId,
    });
    if (!existingGroup) {
      return res.status(401).json({ error: "Group not found" });
    }

    const newCol = await GroupRepository.createJourneyCol({
      groupId: existingGroup._id,
      name: colName,
    });
    const newCells = existingGroup.customerJourneyMap.rows.map((row) => ({
      row: row._id,
      col: newCol._id,
    }));
    const updatedGroup = await GroupRepository.createCellsOnUpdate({
      newCells,
      groupId: existingGroup._id,
    });
    if (updatedGroup) {
      return res.status(201).json({ data: updatedGroup });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const findGroupById = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const existingGroup = await Group.findById(groupId);
    if (!existingGroup) {
      return res.status(400).json({ error: "Group not found!" });
    }
    return res.status(200).json({ data: findGroupById });
  } catch (error) {}
};
// const updateCellContent = async (req, res) =>{
//   try {
//     const 
//   } catch (error) {
    
//   }
// }
export default {
  createJourneyRow,
  createJourneyCol
};
