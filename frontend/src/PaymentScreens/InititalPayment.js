import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useParams } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";
import Modal from "react-modal";
import "./Payment.css";

Modal.setAppElement("#root"); // Set the root element for accessibility

const stripePromise = loadStripe("pk_test_51N5kWcEdXzoBMsb81YwUtTSuUrlQcxIo0oSYbKbJ70WQW6l1u5HvrPO3kt0zEPnoLNiIqI5Mpiu4Xw7TSpGHDVwn00z7UbSu1c");

export default function PaymentForm() {
  const [clientSecret, setClientSecret] = useState("");
  const { schoolId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/payments/initial-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId: schoolId,
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [schoolId]);

  const appearance = {
    theme: "stripe",
  };
  const options = {
    clientSecret,
    appearance,
    elements: {
      card: {
        hidePostalCode: true, // Hide the postal code field
      },
    },
    features: {
      card: { checkout: false }, // Disable the 1-click checkout feature
    },
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="App">
      {clientSecret && (
        <>
          <Modal
            isOpen={isDialogOpen}
            onRequestClose={handleCloseDialog}
            contentLabel="Initial Payment Dialog"
            className="custom-modal" // Apply custom styles
            overlayClassName="custom-overlay" // Apply custom styles to overlay
          >
            <h2>Initial Payment</h2>
            <p>It's an initial payment calculated based on the number of gates of your school.</p>
            <p>To continue further, please proceed with the initial payment.</p>
            <button onClick={handleCloseDialog}>Close</button>
          </Modal>
          <Elements options={options} stripe={stripePromise}>
            {/* Pass clientSecret as a prop to CheckoutForm */}
            <CheckoutForm clientSecret={clientSecret} schoolId={schoolId} />
          </Elements>
        </>
      )}
    </div>
  );
}
