'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VendorLogoProps {
    src?: string | null;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    fill?: boolean;
}

export function VendorLogo({ src, alt, width, height, className, fill }: VendorLogoProps) {
    const [imgSrc, setImgSrc] = useState<string>(src || '');
    const [hasError, setHasError] = useState(false);

    // Fallback logic
    // If fill is true, we need a default size for the fallback standard API if we were calculating it from width.
    // ui-avatars.com handles size, default 64.
    const size = width || 200;
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'Vendor')}&background=0c8bff&color=fff&size=${size}`;

    // If we have an error or no source, use fallback
    const displaySrc = (hasError || !src) ? fallbackUrl : src;

    return (
        <Image
            src={displaySrc}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            className={className}
            onError={() => setHasError(true)}
        />
    );
}
