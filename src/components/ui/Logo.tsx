import React from 'react';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export const FairwayKindLogo: React.FC<LogoProps> = ({ 
  className = "h-10 w-auto", 
  showWordmark = true 
}) => {
  return (
    <img
      src="/fairwaykind-logo.png"
      alt="FairwayKind — Play. Win. Give Back."
      className={`object-contain ${className}`}
      style={{ maxHeight: '100%' }}
    />
  );
};
