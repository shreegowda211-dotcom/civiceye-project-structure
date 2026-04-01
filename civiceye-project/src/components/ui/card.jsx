import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-lg bg-white shadow-sm ${className}`}>{children}</div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b px-4 py-2 ${className}`}>{children}</div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

export function GradientCard({
  title,
  description,
  buttonText,
  onButtonClick,
  children,
  className = '',
}) {
  return (
    <div
      className={`rounded-xl shadow-lg p-6 text-white bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 transform transition-transform hover:scale-105 ${className}`}
    >
      {title && <h3 className="text-2xl font-bold">{title}</h3>}
      {description && <p className="mt-2 text-sm text-white/90">{description}</p>}

      <div className="mt-4">{children}</div>

      {buttonText && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onButtonClick}
            className="rounded-md bg-white/10 hover:bg-white/20 text-white px-4 py-2 font-semibold shadow-sm"
          >
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
}
