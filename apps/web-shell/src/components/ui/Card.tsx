import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  showAccentBorder?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = "", showAccentBorder = true, ...props }) => {
  return (
    <div
      {...props}
      className={`bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden ${
        showAccentBorder ? "border-t-[3px] border-primary-indigo" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
