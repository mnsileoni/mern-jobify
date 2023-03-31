/** @format */

import express from "express";
// import authenticateUser from "./middleware/auth.js";

const router = express.Router();
import {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  showStats,
} from "../controllers/jobsControllers.js";

// tipical REST config:

router.route("/").post(createJob).get(getAllJobs);
// stats must be placed before :id
router.route("/stats").get(showStats);
// router.route("/stats").get(authenticateUser, showStats);
router.route("/:id").delete(deleteJob).patch(updateJob);

export default router;
