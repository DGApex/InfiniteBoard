import React from 'react';

// Simple diagnostic component to test if React is rendering
function AppTest() {
    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#18181b',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
        }}>
            <div>
                <h1>InfiniteBoard - Test Mode</h1>
                <p>If you see this, React is working!</p>
            </div>
        </div>
    );
}

export default AppTest;
