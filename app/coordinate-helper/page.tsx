'use client';

import { Suspense } from 'react';
import CoordinateHelper from '../_components/CoordinateHelper';

export default function CoordinateHelperPage() {
  return (
    <div className="h-screen w-screen bg-slate-900">
      <Suspense fallback={
        <div className="h-full w-full flex items-center justify-center text-white">
          Loading Coordinate Helper...
        </div>
      }>
        <CoordinateHelper />
      </Suspense>
    </div>
  );
}
