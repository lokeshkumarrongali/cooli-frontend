import React from 'react';

const Logo = ({ size = 'md', className = '', showCoo = true }) => {
  const sizes = {
    sm: { height: 24, fontSize: '18px' },
    md: { height: 40, fontSize: '32px' },
    lg: { height: 60, fontSize: '48px' }
  };

  const { height, fontSize } = sizes[size] || sizes.md;
  
  // Calculate relative dimensions
  const squareSize = height; // Perfect square
  const borderRadius = height * 0.15;
  const marginSide = height * 0.1;

  return (
    <div 
      className={`flex items-center select-none ${className}`} 
      style={{ height, fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', alignItems: 'center' }}
    >
      {showCoo && (
        <span 
          style={{ 
            fontSize, 
            fontWeight: '800', 
            color: '#eb5e00',
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginRight: marginSide
          }}
        >
          Coo
        </span>
      )}
      <div 
        style={{ 
          backgroundColor: '#eb5e00',
          color: 'white',
          height: squareSize,
          width: squareSize, // Square
          borderRadius: borderRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `calc(${fontSize} * 0.8)`,
          fontWeight: '900',
          lineHeight: 1
        }}
      >
        li
      </div>
    </div>
  );
};

export default Logo;
