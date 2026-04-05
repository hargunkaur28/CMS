import React from 'react';

type UserAvatarProps = {
  name?: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
};

function getInitials(name?: string) {
  const safeName = String(name || '').trim();
  if (!safeName) return 'U';

  const parts = safeName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

export default function UserAvatar({ name, imageUrl, size = 40, className = '' }: UserAvatarProps) {
  const safeImage = typeof imageUrl === 'string' ? imageUrl.trim() : '';
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [safeImage]);

  const style = {
    width: `${size}px`,
    height: `${size}px`,
  };

  if (safeImage && !imageError) {
    return (
      <img
        src={safeImage}
        alt={name || 'User avatar'}
        style={style}
        className={`rounded-full object-cover bg-slate-200 ${className}`.trim()}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      style={style}
      className={`rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center select-none ${className}`.trim()}
      aria-label={name || 'User avatar'}
      title={name || 'User'}
    >
      {getInitials(name)}
    </div>
  );
}
