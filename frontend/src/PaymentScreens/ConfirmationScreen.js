import React, { useState, useEffect } from "react";
import { CircularProgress, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SuccessScreen = () => {
  const { schoolId, clientSecret } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleSuccessfulPayment = async () => {
      try {
        const response = await fetch("http://localhost:3000/payments/handle-successful-initial-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            schoolId: schoolId,
            clientSecret: clientSecret,
            paymentMethod: "Card",
          }),
        });

        // Handle the response as needed
        if (response.ok) {
          console.log("Payment handling successful");
          await verifyEmail(schoolId);
          setIsLoading(false);
        } else {
          console.error("Failed to handle payment");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error handling payment:", error);
        setIsLoading(false);
      }
    };

    handleSuccessfulPayment();
  }, [schoolId, clientSecret]);

  const verifyEmail = async (schoolId) => {
    try {
      const response = await fetch(`http://localhost:3000/schools/verify-email/${schoolId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle the response as needed
      if (response.ok) {
        console.log("Email verification successful");
        showSuccessToast("Email verification successful. You can leave this page and log in now.");
      } else {
        console.error("Failed to verify email");
        showErrorToast("Failed to verify email. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      showErrorToast("Error verifying email. Please try again.");
    }
  };

  const showSuccessToast = (message) => {
    toast.success(message, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 5000,
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 5000,
    });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px", backgroundColor: "#FFFFFF" }}>
      <CheckCircleIcon style={{ fontSize: 100, color: "#28a745" }} />
      <Typography variant="h5" style={{ color: "#28a745", marginTop: "20px" }}>
        Payment Successful and Account Verfied. You can leave this page now and login
      </Typography>
      {isLoading && <CircularProgress style={{ marginTop: "20px" }} />}
    </div>
  );
};

export default SuccessScreen;
