import React, { useEffect, useState, useCallback } from "react";
import { Button } from "./ui/button";
import {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
} from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BuyCourseButton = ({ courseId }) => {
  const [
    createOrder,
    { data: orderData, isLoading: isCreatingOrder, error: createOrderError },
  ] = useCreateOrderMutation();
  const [
    verifyPayment,
    { isLoading: isVerifyingPayment, error: verifyPaymentError },
  ] = useVerifyPaymentMutation();
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadScript = useCallback(async (src) => {
    try {
      setIsScriptLoading(true);
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        setIsScriptLoaded(true);
        setIsScriptLoading(false);
        return true;
      }

      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;

        script.onload = () => {
          setIsScriptLoaded(true);
          setIsScriptLoading(false);
          resolve(true);
        };

        script.onerror = () => {
          script.remove();
          setIsScriptLoading(false);
          resolve(false);
        };

        document.body.appendChild(script);
      });
    } catch (error) {
      console.error("Script loading error:", error);
      setIsScriptLoading(false);
      return false;
    }
  }, []);

  const displayRazorpay = async () => {
    try {
      if (!isScriptLoaded) {
        const res = await loadScript(
          "https://checkout.razorpay.com/v1/checkout.js"
        );
        if (!res) {
          toast.error(
            "Failed to load payment gateway. Please check your internet connection and try again."
          );
          return;
        }
      }

      if (!orderData?.order) {
        toast.error("Order creation failed. Please try again.");
        return;
      }

      // Get user info from localStorage or context if available
      const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Online Learning Platform",
        description: orderData.courseName || "Course Purchase",
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();

            if (result.success) {
              toast.success("Payment successful! Redirecting to course...");
              setTimeout(() => {
                window.location.href = `/course-progress/${courseId}`;
              }, 1500);
            } else {
              throw new Error(result.message || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error(
              error.message ||
                "Payment verification failed. Please contact support if amount was deducted."
            );
          }
        },
        prefill: {
          name: userInfo.name || "",
          email: userInfo.email || "",
        },
        theme: {
          color: "#2563eb", // Blue-600
        },
        modal: {
          confirm_close: true,
          ondismiss: function () {
            toast.info("Payment cancelled");
          },
          escape: false,
          backdropclose: false,
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        toast.error(
          response.error.description || "Payment failed. Please try again."
        );
      });

      paymentObject.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  const purchaseCourseHandler = async () => {
    try {
      if (isScriptLoading || isProcessing) {
        toast.info("Please wait while we process your request...");
        return;
      }

      setIsProcessing(true);
      const result = await createOrder(courseId).unwrap();
      if (!result.success) {
        throw new Error(result.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Create order error:", error);
      toast.error(
        error?.data?.message || error.message || "Failed to create order. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Load Razorpay script on component mount
    loadScript("https://checkout.razorpay.com/v1/checkout.js");

    return () => {
      // Cleanup script on unmount if it wasn't loaded successfully
      if (!isScriptLoaded) {
        const script = document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );
        if (script) script.remove();
      }
    };
  }, [loadScript]);

  useEffect(() => {
    if (createOrderError) {
      setIsProcessing(false);
      toast.error(
        typeof createOrderError === 'string' ? createOrderError :
        createOrderError?.data?.message || "Failed to create order. Please try again."
      );
    }
    if (verifyPaymentError) {
      setIsProcessing(false);
      toast.error(
        typeof verifyPaymentError === 'string' ? verifyPaymentError :
        verifyPaymentError?.data?.message || "Payment verification failed. Please contact support if amount was deducted."
      );
    }
  }, [createOrderError, verifyPaymentError]);

  useEffect(() => {
    if (orderData?.success) {
      displayRazorpay();
    }
  }, [orderData]);

  return (
    <Button
      disabled={isCreatingOrder || isVerifyingPayment || isScriptLoading || isProcessing}
      onClick={purchaseCourseHandler}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
    >
      {isCreatingOrder || isVerifyingPayment || isScriptLoading || isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isScriptLoading ? "Initializing payment..." : "Please wait..."}
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;
