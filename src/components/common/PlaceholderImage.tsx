import React from 'react';

interface PlaceholderImageProps {
  width?: number;
  height?: number;
  className?: string;
  text?: string;
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width = 300,
  height = 200,
  className = '',
  text = 'Image',
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-secondary-200 to-secondary-300 flex items-center justify-center text-secondary-500 font-medium ${className}`}
      style={{ width, height }}
    >
      <span>{text}</span>
    </div>
  );
};

export default PlaceholderImage;
