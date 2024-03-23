import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function CallQueue() {
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState(null);
  const school = JSON.parse(Cookies.get('school'));
  const schoolId = school._id;

  const fetchQueue = async () => {
    try {
      const response = await fetch('http://localhost:3000/attendance/getcalls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ schoolId })
      });
      console.log("Queue Fetched");
      if (response.status === 200) {
        const data = await response.json();
        setQueue(data);
        console.log('Queue Fetched', data);
      } else if (response.status === 404) {
        setQueue([]); // Clear the queue if 404 is received
      } else {
        throw new Error('Something went wrong');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchQueue, 60000); // Fetch every 1 minute

    // Fetch immediately on mount
    fetchQueue();

    // Clean up setInterval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 style={{ display:"flex", justifyContent:"center"}}>Call Queue</h2>
      {error && <p>{error}</p>}
      <div style={styles.callQueue}>
        {queue.length > 0 ? (
          queue.map((item) => (
            <div key={item.student._id} style={styles.queueItem}>
              <div style={styles.fatRow}>
                <div className="queue-item-content">
                  <p><strong>Name:</strong> {item.student.name}</p>
                  <p><strong>Roll Number:</strong> {item.student.rollNumber}</p>
                  <p><strong>Class:</strong> {item.student.studentClass}</p>
                  <p><strong>Section:</strong> {item.student.section}</p>
                  <p><strong>Relation:</strong> {item.relation}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          !error && <p style={{ display: "flex", margin: "auto" }}>No calls in queue</p>
        )}
      </div>
    </div>
  );
}

// Inline styles
const styles = {
  fatRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px', // Reduced padding
    borderRadius: '8px',
    backgroundColor: '#f0f0f0',
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
    margin: '5px 0', // Reduced margin
  },
  callQueue: {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    backgroundColor: '#F8F9FA',
    borderRadius: '18px',
    overflow: 'auto',
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '10px',
  }
};

export default CallQueue;
