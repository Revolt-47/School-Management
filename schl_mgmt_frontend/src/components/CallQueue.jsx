import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function CallQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const school = JSON.parse(Cookies.get('school'));
  const schoolId = school._id;

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch('http://localhost:3000/attendance/getcalls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ schoolId })
        });
        console.log(response);
        if(response.status === 200) {
          const data = await response.json();
          setQueue(data);
          setLoading(false);
        }
        else if(response.status === 404) {
          throw new Error('No calls in queue');
        }
        else {
          throw new Error('Something went wrong');
        }
      }
      catch (error) {
        setError(error.message);
        setLoading(false);
        console.log(error.message); 
      }
    };

    fetchQueue();
  }, []);
  return (
    <div>
      <h2>Call Queue</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
        <div style={styles.callQueue}>
          {queue.map((item) => (
            <div key={item._id} style={styles.queueItem}>
              <div style={styles.fatRow}>
                <div style={{ ...styles.colorBlock, backgroundColor: getRandomColor() }}></div>
                <div className="queue-item-content">
                  <p>Role: {item.role}</p>
                  <p>ID: {item.id}</p>
                  <p>Student: {item.student}</p>
                  <p>School ID: {item.schoolId}</p>
                  <p>Relation: {item.relation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );  
}

// Function to generate a random color
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

// Inline styles
const styles = {
  fatRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#f0f0f0'
  },
  colorBlock: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    marginRight: '10px'
  },
    callQueue: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    queueItem: {
       marginBottom: '10px',
    }
};

export default CallQueue;
