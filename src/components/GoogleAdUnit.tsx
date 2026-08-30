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

    const el = adRef.current;
    if (!el) return;

    // Use IntersectionObserver to push ONLY when the ad unit is actually visible in viewport & has width > 100px
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isPushed.current) {
            const rect = entry.boundingClientRect;
            if (rect.width > 100) {
              try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                isPushed.current = true;
                observer.disconnect();
              } catch (err) {
                // Silently swallow any transient AdSense queue errors
              }
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`w-full overflow-hidden min-h-[90px] min-w-[250px] flex justify-center items-center text-center my-2 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '90px' }}
        data-ad-client="ca-pub-4042640078267186"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
