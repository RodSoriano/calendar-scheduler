'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { setTokens } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';

function CallbackHandler() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      router.replace('/calendar');
    } else {
      router.replace('/');
    }
  }, [params, router]);

  return <LoadingSpinner />;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CallbackHandler />
    </Suspense>
  );
}
