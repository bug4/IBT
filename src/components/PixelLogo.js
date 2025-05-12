import React from 'react';

const PixelLogo = () => {
  return (
    <div style={{ margin: '24px auto', maxWidth: '400px' }}>
      <pre style={{ 
        textAlign: 'center', 
        color: 'black', 
        fontWeight: 'bold', 
        fontSize: '16px',
        lineHeight: '1.1',
        fontFamily: 'monospace'
      }}>
{`
██ ██████  ████████ 
█  █    █     █    
█  ██████     █    
█  █    █     █    
██ ██████     █    
`}
      </pre>
    </div>
  );
};

export default PixelLogo;