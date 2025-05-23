
import React from 'react';

interface DisclaimerBoxProps {
  text: string;
}

export const DisclaimerBox: React.FC<DisclaimerBoxProps> = ({ text }) => {
  return (
    <div className="p-4 my-4 bg-amber-600/20 border-l-4 border-amber-500 text-amber-200 rounded-r-md shadow">
      <p className="font-semibold">Important Disclaimer</p>
      <p className="text-sm">{text}</p>
    </div>
  );
};
