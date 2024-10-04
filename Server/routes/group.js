import express from "express";
import { GroupController } from "../controller/index.js";
import verifyToken from "../middleware/verifyToken.js";
import authorization from "../middleware/authorization.js";
const groupRouter = express.Router();
groupRouter.post(
  "/createRow",
  verifyToken,
  authorization.checkGroupAccess,
  GroupController.createJourneyRow
);
groupRouter.post(
  "/createColumn",
  verifyToken,
  authorization.checkGroupAccess,
  GroupController.createJourneyCol
);
groupRouter.delete(
  "/deleteRow",
  verifyToken,
  authorization.checkGroupAccess,
  GroupController.deleteRow
);
groupRouter.delete(
  "/deleteCol",
  verifyToken,
  authorization.checkGroupAccess,
  GroupController.deleteCol
);
groupRouter.patch(
  "/updateCellContent",
  verifyToken,
  authorization.checkGroupAccess,
  GroupController.updateCellContent
);
groupRouter.patch(
  "/updateColumn",
  verifyToken,
  authorization.checkGroupAccess,
  GroupController.updateColumn
);
groupRouter.patch(
  "/updateRow",
  verifyToken,
  authorization.checkGroupAccess,
  GroupController.updateRow
);
groupRouter.patch(
  "/updateCanvas",
  verifyToken,
  authorization.checkGroupAccess,
  GroupController.updateCanvasCell
);

groupRouter.get(
  "/:groupId",
  verifyToken,
  // authorization.checkGroupAccess,
  GroupController.findGroupById
);
export default groupRouter;
