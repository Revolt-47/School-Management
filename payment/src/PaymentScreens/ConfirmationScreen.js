import React, { useState, useEffect } from "react";
import { CircularProgress, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useParams } from "react-router-dom";

const SuccessScreen = () => {
  const { schoolId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://localhost:3000/schools/verify-email/${schoolId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          console.log("Email verification successful");
          setIsEmailVerified(true);
        } else {
          console.error("Failed to verify email");
          setVerificationError("Failed to verify email. Trying Loggin In. Your account may already been activated");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setVerificationError("Error verifying email. Trying Loggin In. Your account may already been activated");
      }
    };
    const handleSuccessfulInitialPayment = async() =>{
      try {
        const response = await fetch("http://localhost:3000/payments/handle-successful-initial-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            schoolId: schoolId,
            PaymentMethod : 'Card'
          }),
        });
        console.log(response)
    }
  catch(error){
    console.log(error)
  }}
    handleSuccessfulInitialPayment()
    verifyEmail();
  }, [schoolId]);

  useEffect(() => {
    if (isEmailVerified) {
      const createSubscription = async () => {
        try {
          const response = await fetch("http://localhost:3000/payments/monthly-subscription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              schoolId: schoolId,
            }),
          });

          if (response.ok) {
            console.log("Subscription created");
          } else {
            console.error("Failed to create subscription");
          }
        } catch (error) {
          console.error("Error creating subscription:", error);
        } finally {
          setIsLoading(false);
        }
      };

      createSubscription();
    }
  }, [isEmailVerified, schoolId]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px", backgroundColor: "#FFFFFF" }}>
      {isEmailVerified ? (
        <>
          <CheckCircleIcon style={{ fontSize: 100, color: "#28a745" }} />
          <Typography variant="h5" style={{ color: "#28a745", marginTop: "20px" }}>
            Payment Successful and Account Verified. You can leave this page now and log in.
          </Typography>
        </>
      ) : (
        <>
          {verificationError && (
            <>
              <CancelIcon style={{ fontSize: 100, color: "#dc3545" }} />
              <Typography variant="h5" style={{ color: "#dc3545", marginTop: "20px" }}>
                {verificationError}
              </Typography>
            </>
          )}
          {!verificationError && isLoading && <CircularProgress style={{ marginTop: "20px" }} />}
        </>
      )}
    </div>
  );
};

export default SuccessScreen;
