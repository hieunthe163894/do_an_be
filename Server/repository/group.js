import mongoose from "mongoose";
import Group from "../model/Group.js";

const createJourneyRow = async ({ groupId, name }) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $push: {
          "customerJourneyMap.rows": {
            name: name,
          },
        },
      },
      {
        new: true,
      }
    );
    const newRow =
      updatedGroup.customerJourneyMap.rows[
        updatedGroup.customerJourneyMap.rows.length - 1
      ];
    return newRow;
  } catch (error) {
    return new Error(error.message);
  }
};
const createJourneyCol = async ({ groupId, name }) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $push: {
          "customerJourneyMap.cols": {
            name: name,
          },
        },
      },
      {
        new: true,
      }
    );
    const newCol =
      updatedGroup.customerJourneyMap.cols[
        updatedGroup.customerJourneyMap.cols.length - 1
      ];
    return newCol;
  } catch (error) {
    return new Error(error.message);
  }
};
const createCellsOnUpdate = async ({ newCells, groupId }) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $push: {
          "customerJourneyMap.cells": {
            $each: newCells,
          },
        },
      },
      {
        new: true,
      }
    );
    return updatedGroup;
  } catch (error) {
    return new Error(error);
  }
};

const findGroupById = async ({ groupId }) => {
  try {
    const existingGroup = await Group.findById(groupId);
    return existingGroup;
  } catch (error) {
    return new Error(error.message);
  }
};
const deleteRow = async ({ rowId, groupId }) => {
  try {
    // const convertedRowId = new mongoose.Types.ObjectId(rowId);

    const updatedGroup = await Group.findOneAndUpdate(
      {
        _id: groupId,
        "customerJourneyMap.rows._id": rowId,
      },
      {
        $pull: {
          "customerJourneyMap.rows": { _id: rowId },
          "customerJourneyMap.cells": { row: rowId },
        },
      },
      {
        new: true,
      }
    );
    return updatedGroup;
  } catch (error) {
    return new Error(error);
  }
};
const deleteCol = async ({ colId, groupId }) => {
  try {
    // const convertedRowId = new mongoose.Types.ObjectId(rowId);

    const updatedGroup = await Group.findOneAndUpdate(
      {
        _id: groupId,
      },
      {
        $pull: {
          "customerJourneyMap.cols": { _id: colId },
          "customerJourneyMap.cells": { col: colId },
        },
      },
      {
        new: true,
      }
    );
    return updatedGroup;
  } catch (error) {
    return new Error(error);
  }
};
const updateCellContent = async ({ cellId, content, groupId }) => {
  try {
    const updatedGroup = await Group.findOneAndUpdate(
      {
        _id: groupId,
        "customerJourneyMap.cells._id": cellId,
      },
      {
        $set: {
          "customerJourneyMap.cells.$.content": content, // Update the content of the matched cell
        },
      },
      {
        new: true,
      }
    );
    return updatedGroup;
  } catch (error) {
    return new Error(error);
  }
};
const updateColumn = async ({ colId, name, color, groupId }) => {
  try {
    const updates = {};
    if (name) {
      updates["customerJourneyMap.cols.$.name"] = name;
    }
    if (color) {
      updates["customerJourneyMap.cols.$.color"] = color;
    }
    const updatedGroup = await Group.findOneAndUpdate(
      {
        _id: groupId,
        "customerJourneyMap.cols._id": colId,
      },
      {
        $set: updates,
      },
      {
        new: true,
      }
    );
    return updatedGroup;
  } catch (error) {
    return new Error(error);
  }
};
const updateRow = async ({ rowId, name, groupId }) => {
  try {
    const updates = {};
    if (name) {
      updates["customerJourneyMap.cols.$.name"] = name;
    }
    if (color) {
      updates["customerJourneyMap.cols.$.color"] = color;
    }
    const updatedGroup = await Group.findOneAndUpdate(
      {
        _id: groupId,
        "customerJourneyMap.rows._id": rowId,
      },
      {
        $set: {
          "customerJourneyMap.rows.$.name": name,
        },
      },
      {
        new: true,
      }
    );
    return updatedGroup;
  } catch (error) {
    return new Error(error);
  }
};
const updateCanvasCell = async ({ name, color, content, groupId }) => {
  try {
    const updates = {};
    if (content) {
      updates["businessModelCanvas.sections.$.content"] = content;
    }
    if (color) {
      updates["businessModelCanvas.sections.$.color"] = color;
    }
    const updatedGroup = await Group.findOneAndUpdate(
      {
        _id: groupId,
        "businessModelCanvas.sections.name": name,
      },
      {
        $set: updates,
      },
      {
        new: true,
      }
    );
    return updatedGroup;
  } catch (error) {
    return new Error(error);
  }
};
export default {
  createCellsOnUpdate,
  createJourneyRow,
  findGroupById,
  createJourneyCol,
  deleteRow,
  deleteCol,
  updateCellContent,
  updateColumn,
  updateRow,
  updateCanvasCell
};
