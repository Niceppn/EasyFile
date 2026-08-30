'use client';

import { useEffect, useRef } from 'react';

interface GoogleAdUnitProps {
  slot?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}

export function GoogleAdUnit({
  slot = '7020030411',
  format = 'auto',
  responsive = true,
  className = '',
}: GoogleAdUnitProps) {
  const isPushed = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !isPushed.current) {
        // Push ad unit to Google AdSense queue
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      }
    } catch (err) {
      console.error('Google AdSense Unit push error:', err);
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden min-h-[90px] flex justify-center items-center text-center my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-4042640078267186"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
