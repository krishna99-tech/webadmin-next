const GRADIENTS = [
  { base: 'bg-linear-to-br from-[#FFB457] to-[#FF705B]', icon: 'text-black/80' },
  { base: 'bg-linear-to-br from-[#5EEAD4] to-[#2DD4BF]', icon: 'text-black/80' },
  { base: 'bg-linear-to-br from-[#A78BFA] to-[#6366F1]', icon: 'text-foreground/90' },
  { base: 'bg-linear-to-br from-[#F472B6] to-[#FB7185]', icon: 'text-black/80' },
  { base: 'bg-linear-to-br from-[#60A5FA] to-[#22D3EE]', icon: 'text-black/80' },
  { base: 'bg-linear-to-br from-[#FDBA74] to-[#F97316]', icon: 'text-black/80' },
];

const ADMIN_GRADIENT = { base: 'bg-linear-to-br from-[#22D3EE] to-[#2563EB]', icon: 'text-foreground/90' };

const hashString = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getAvatarClassNames = (seed = '', isAdmin = false) => {
  if (isAdmin) return ADMIN_GRADIENT;
  const idx = GRADIENTS.length ? hashString(seed) % GRADIENTS.length : 0;
  return GRADIENTS[idx] || GRADIENTS[0];
};
