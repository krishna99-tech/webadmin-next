'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const main = document.querySelector('.app-main');
    if (!main) return;

    const onScroll = () => {
      setVisible(main.scrollTop > 400);
    };

    main.addEventListener('scroll', onScroll);
    return () => main.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    document.querySelector('.app-main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="back-to-top focus-ring"
      aria-label="Back to top"
    >
      <ChevronUp size={20} />
    </button>
  );
}
