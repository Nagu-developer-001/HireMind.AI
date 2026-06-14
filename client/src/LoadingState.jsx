import React from 'react';

/**
 * LoadingState Component
 * Displays a professional, themed loader while Gemini AI 
 * processes the Resume against the Job Description.
 */
const LoadingState = () => {
    const LoadingState = () => {
  return (
    <div style={styles.loadingContainer}>
      {/* Animated Spinner with Neon Glow */}
      <div className="spinner-container">
        <div style={styles.spinner}>
          <div style={styles.innerSpinner} />
        </div>
      </div>

      <h2 style={styles.loadingTitle}>Analyzing Your Career Alignment</h2>
      <p style={styles.loadingSub}>
        Gemini AI is auditing your skills and optimizing for the target role...
      </p>
      
      {/* Skeleton Mock-up for Dashboard Sells */}
      <div style={styles.skeletonWrapper}>
        <div className="skeleton-bar" style={styles.skeletonBar} />
        <div className="skeleton-bar" style={{ ...styles.skeletonBar, width: '80%' }} />
        <div className="skeleton-bar" style={{ ...styles.skeletonBar, width: '60%' }} />
      </div>

      {/* Adding local styles for the shimmer/spin animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          .spinner-container {
            animation: spin 1.2s linear infinite;
            margin-bottom: 24px;
          }

          .skeleton-bar {
            position: relative;
            overflow: hidden;
            background-color: #1a1a1a;
            height: 12px;
            border-radius: 6px;
          }

          .skeleton-bar::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg, 
              transparent, 
              rgba(59, 130, 246, 0.1), 
              transparent
            );
            animation: shimmer 1.5s infinite;
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 40px',
    backgroundColor: '#0d0d0d',
    borderRadius: '28px',
    border: '1px solid #1a1a1a',
    marginTop: '30px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
  },
  spinner: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '3px solid #1a1a1a',
    borderTop: '3px solid #3b82f6', // Your brand Blue
    boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
  },
  loadingTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '10px',
    letterSpacing: '-0.5px',
  },
  loadingSub: {
    fontSize: '0.95rem',
    color: '#666',
    maxWidth: '400px',
    lineHeight: '1.5',
    marginBottom: '40px',
  },
  skeletonWrapper: {
    width: '100%',
    maxWidth: '350px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center'
  },
  skeletonBar: {
    width: '100%',
  }
};

};

export default LoadingState;