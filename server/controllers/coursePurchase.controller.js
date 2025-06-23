import Razorpay from "razorpay";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const userId = req.id;
    const courseId = req.body.courseId || req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    if (!course.coursePrice || course.coursePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course price",
      });
    }

    // In production, prevent course creator from purchasing their own course
    if (
      process.env.NODE_ENV === "production" &&
      course.creator.toString() === userId
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot purchase your own course",
      });
    }

    // Check if user has already purchased the course
    const existingPurchase = await CoursePurchase.findOne({
      courseId,
      userId,
      status: "completed",
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: "You have already purchased this course",
      });
    }

    // Check for pending orders and clean them up
    await CoursePurchase.deleteMany({
      courseId,
      userId,
      status: "pending",
    });

    // Generate a unique short receipt ID
    const receiptId = `rcpt_${Math.random().toString(36).substring(2, 8)}`;

    // Create a new course purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
      receiptId,
      currency: "INR",
    });

    // Create a Razorpay order
    const options = {
      amount: course.coursePrice * 100, // Amount in paise
      currency: "INR",
      receipt: receiptId,
      notes: {
        courseId: courseId.toString(),
        userId: userId.toString(),
        courseName: course.courseTitle?.substring(0, 50) || "Course Purchase",
      },
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
      console.log("Razorpay order created:", order);
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      await newPurchase.markAsFailed(
        error.error?.description || "Failed to create payment order"
      );
      throw new Error(
        error.error?.description || "Failed to create payment order"
      );
    }

    if (!order?.id) {
      await newPurchase.markAsFailed("Invalid order response from Razorpay");
      throw new Error("Invalid order response from Razorpay");
    }

    // Save the purchase record with order ID
    newPurchase.paymentId = order.id;
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      order,
      courseName: course.courseTitle,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Find and validate purchase
    const purchase = await CoursePurchase.findOne({
      paymentId: razorpay_order_id,
    }).populate({ path: "courseId" });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase record not found",
      });
    }

    if (purchase.status === "completed") {
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        courseId: purchase.courseId._id,
      });
    }

    try {
      // Verify payment status with Razorpay
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      if (payment.status !== "captured") {
        await purchase.markAsFailed("Payment not captured by Razorpay");
        return res.status(400).json({
          success: false,
          message: "Payment not captured",
        });
      }

      // Mark purchase as completed
      await purchase.markAsCompleted(razorpay_payment_id, razorpay_signature);

      // Make all lectures accessible
      if (purchase.courseId?.lectures?.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      // Update user's enrolled courses
      await User.findByIdAndUpdate(
        purchase.userId,
        {
          $addToSet: { enrolledCourses: purchase.courseId._id },
          $inc: { totalCoursesEnrolled: 1 },
        },
        { new: true }
      );

      // Update course enrollment count
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        {
          $addToSet: { enrolledStudents: purchase.userId },
          $inc: { enrollmentCount: 1 },
        },
        { new: true }
      );

      // Create course progress entry
      await CourseProgress.create({
        userId: purchase.userId,
        courseId: purchase.courseId._id,
        completed: false,
        lectureProgress: [],
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        courseId: purchase.courseId._id,
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      await purchase.markAsFailed(
        error.message || "Payment verification failed"
      );
      throw error;
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get course details",
    });
  }
};

export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");
    if (!purchasedCourse) {
      return res.status(404).json({
        purchasedCourse: [],
      });
    }
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get purchased courses",
    });
  }
};
