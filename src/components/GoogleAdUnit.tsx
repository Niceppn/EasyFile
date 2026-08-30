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
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndPushAd = () => {
      if (isPushed.current) return;

      const el = adRef.current;
      // Only push to adsbygoogle queue if the container is visible and has width > 0
      if (el && el.offsetWidth > 0 && el.offsetParent !== null) {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isPushed.current = true;
        } catch (err) {
          console.error('Google AdSense Unit push error:', err);
        }
      }
    };

    // Delay slightly to ensure layout & DOM dimensions are calculated
    const timer = setTimeout(checkAndPushAd, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full overflow-hidden min-h-[90px] flex justify-center items-center text-center my-2 ${className}`}>
      <ins
        ref={adRef}
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
