import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createOrder,
  getAllPurchasedCourse,
  getCourseDetailWithPurchaseStatus,
  verifyPayment,
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

router
  .route("/checkout/create-order")
  .post(isAuthenticated, createOrder);

router
  .route("/verify-payment")
  .post(isAuthenticated, verifyPayment);

router
  .route("/course/:courseId/detail-with-status")
  .get(isAuthenticated, getCourseDetailWithPurchaseStatus);

router.route("/").get(isAuthenticated, getAllPurchasedCourse);

export default router;
