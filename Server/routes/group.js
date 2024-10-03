import express from "express";
import { GroupController } from "../controller/index.js";
import verifyToken from "../middleware/verifyToken.js";
import authorization from "../middleware/authorization.js";
const groupRouter = express.Router();
groupRouter.post(
  "/createRow/:groupId",
  verifyToken,
  authorization.checkGroupAccess,
  GroupController.createJourneyRow
);
groupRouter.post(
  "/createColumn/:groupId",
  verifyToken,
  authorization.checkGroupAccess,
  GroupController.createJourneyCol
);
export default groupRouter;
