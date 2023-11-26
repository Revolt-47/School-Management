// import React, { useState, useEffect } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { CardElement, Elements } from '@stripe/react-stripe-js';
// import { useParams } from 'react-router-dom';
// import { Button, Paper, Typography, CircularProgress } from '@mui/material';
// import { makeStyles } from '@mui/material';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const stripePromise = loadStripe('pk_test_51N5kWcEdXzoBMsb81YwUtTSuUrlQcxIo0oSYbKbJ70WQW6l1u5HvrPO3kt0zEPnoLNiIqI5Mpiu4Xw7TSpGHDVwn00z7UbSu1c');

// const useStyles = makeStyles((theme) => ({
//   paymentFormContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     padding: theme.spacing(3),
//     marginTop: theme.spacing(3),
//   },
//   paymentForm: {
//     width: '100%',
//     maxWidth: 400,
//     padding: theme.spacing(3),
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//   },
//   cardElement: {
//     marginTop: theme.spacing(2),
//   },
//   payButton: {
//     marginTop: theme.spacing(2),
//   },
// }));

// const PaymentForm = () => {
//   const [clientSecret, setClientSecret] = useState('');
//   const [loading, setLoading] = useState(true);
//   const { schoolId } = useParams();
//   const classes = useStyles();

//   useEffect(() => {
//     const fetchClientSecret = async () => {
//       try {
//         const response = await fetch('http://localhost:3000/payments/initial-payment', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             schoolId: schoolId,
//           }),
//         });

//         const data = await response.json();
//         setClientSecret(data.clientSecret);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching client secret:', error);
//       }
//     };

//     fetchClientSecret();
//   }, [schoolId]);

//   const handleSuccessfulInitialPayment = async () => {
//     try {
//       // Make a request to your server to handle successful initial payment
//       const response = await fetch('http://localhost:3000/payments/handle-successful-initial-payment', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           schoolId: schoolId,
//           numGates: 2, // Example value, replace with your actual data
//           clientSecret: clientSecret,
//           paymentMethod: 'Card', // Example value, replace with your actual data
//         }),
//       });

//       const data = await response.json();

//       // Show success toast
//       toast.success('Payment successful!');

//       console.log('Payment success:', data);
//     } catch (error) {
//       console.error('Error handling successful initial payment:', error);

//       // Show error toast
//       toast.error('Payment failed. Please try again.');
//     }
//   };

//   return (
//     <Elements stripe={stripePromise}>
//       <Paper elevation={3} className={classes.paymentFormContainer}>
//         <ToastContainer position="top-center" autoClose={5000} />
//         <Typography variant="h4" gutterBottom>
//           VanGuardian
//         </Typography>
//         <Paper elevation={1} className={classes.paymentForm}>
//           {loading ? (
//             <CircularProgress />
//           ) : (
//             <>
//               <Typography variant="h6">Initial Payment</Typography>
//               <CardElement className={classes.cardElement} />
//               <Button
//                 variant="contained"
//                 color="primary"
//                 className={classes.payButton}
//                 onClick={handleSuccessfulInitialPayment}
//               >
//                 Confirm Payment
//               </Button>
//             </>
//           )}
//         </Paper>
//       </Paper>
//     </Elements>
//   );
// };

// export default PaymentForm;
