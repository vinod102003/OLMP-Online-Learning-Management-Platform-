import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    // Razorpay order ID
    paymentId: {
      type: String,
      required: true,
    },
    // Razorpay payment ID (after successful payment)
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
    // Razorpay signature (for verification)
    razorpaySignature: {
      type: String,
      sparse: true,
    },
    // Receipt ID generated for Razorpay
    receiptId: {
      type: String,
      required: true,
      maxLength: 40,
    },
    completedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    // Add indexes for better query performance
    indexes: [
      { userId: 1, status: 1 },
      { courseId: 1, status: 1 },
      { paymentId: 1 },
      { razorpayPaymentId: 1 },
    ],
  }
);

// Add methods for payment status updates
coursePurchaseSchema.methods.markAsCompleted = function (paymentId, signature) {
  this.status = "completed";
  this.razorpayPaymentId = paymentId;
  this.razorpaySignature = signature;
  this.completedAt = new Date();
  return this.save();
};

coursePurchaseSchema.methods.markAsFailed = function (reason) {
  this.status = "failed";
  this.failureReason = reason;
  return this.save();
};

export const CoursePurchase = mongoose.model(
  "CoursePurchase",
  coursePurchaseSchema
);
