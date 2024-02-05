import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useParams } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";
import Modal from "react-modal";
import ErrorIcon from "@mui/icons-material/Error";
import "./Payment.css";
import Paper from '@mui/material/Paper';
import { CircularProgress, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

Modal.setAppElement("#root"); // Set the root element for accessibility

const stripePromise = loadStripe("pk_test_51N5kWcEdXzoBMsb81YwUtTSuUrlQcxIo0oSYbKbJ70WQW6l1u5HvrPO3kt0zEPnoLNiIqI5Mpiu4Xw7TSpGHDVwn00z7UbSu1c");

export default function PaymentForm() {
  const [clientSecret, setClientSecret] = useState("");
  const [initialPaymentStatus, setInitialPaymentStatus] = useState("loading");
  const { schoolId } = useParams();
  const [amount, setAmount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/payments/initial-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId: schoolId,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        console.log(data.clientSecret)
        setInitialPaymentStatus(data.initialPaymentStatus);
        setAmount(data.amount);
      })
      .catch((error) => {
        console.error("Error fetching initial payment:", error);
        setInitialPaymentStatus("error");
      });
  }, [schoolId]);

  const appearance = {
    theme: "stripe",
    
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const redirectToLogin = () => {
    // Replace with your router's logic for redirection to the login screen
    window.location.href = "http://localhost:3000";
  };

  if (clientSecret === null) {
    return (
      <div className="App">
        <Modal
          isOpen={isDialogOpen}
          onRequestClose={handleCloseDialog}
          contentLabel="Initial Payment Dialog"
          className="custom-modal"
          overlayClassName="custom-overlay"
        >
          <h2>Initial Payment Already Done</h2>
          <p>You have already completed the initial payment.</p>
          <button onClick={redirectToLogin}>Go to Login</button>
        </Modal>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance,
    elements: {
      card: {
        hidePostalCode: true,
      },
    },
    features: {
      card: { checkout: false },
    },
  };

  return (
    <div className="App">
      {clientSecret === null && (
        <Paper elevation={5} style={{ padding: '20px', margin: '20px', backgroundColor: '#FFEB3B' , width: '100vw'}}>
          <Typography variant="h5">Initial Payment Already Done</Typography>
          <Typography variant="body1">You have already completed the initial payment.</Typography>
        </Paper>
      )}
      {clientSecret !== null && initialPaymentStatus === 'loading' && (
        <div>
          <CircularProgress />
          <Typography variant="body1">Loading...</Typography>
        </div>
      )}
      {initialPaymentStatus === 'success' && (
        <>
          <CheckCircleIcon color="primary" fontSize="large" />
          <Typography variant="h5">Initial Payment Done!</Typography>
          <Typography variant="body1">You have already completed the initial payment.</Typography>
        </>
      )}
      {initialPaymentStatus === 'error' && (
        <>
          <ErrorIcon color="error" fontSize="large" />
          <Typography variant="h4">Error</Typography>
          <Typography variant="h5">There was an error processing the initial payment.</Typography>
        </>
      )}
      {clientSecret !== null && initialPaymentStatus !== 'loading' && initialPaymentStatus !== 'success' && initialPaymentStatus !== 'error' && (
        <>
          <Modal
            isOpen={isDialogOpen}
            onRequestClose={handleCloseDialog}
            contentLabel="Initial Payment Dialog"
            className="custom-modal"
            overlayClassName="custom-overlay"
          >
            <h2>Initial Payment</h2>
            <p>It's an initial payment calculated based on the number of gates of your school.</p>
            <p>To continue further, please proceed with the initial payment.</p>
            <p>The following Amount will be chraged</p>
            <Typography >${amount/100}</Typography>
            <button onClick={handleCloseDialog}>Close</button>
          </Modal>
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm clientSecret={clientSecret} schoolId={schoolId} />
          </Elements>
        </>
      )}
    </div>
  );
}

