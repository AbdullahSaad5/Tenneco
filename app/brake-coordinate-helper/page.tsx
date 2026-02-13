'use client';

import { Suspense } from 'react';
import BrakeCoordinateHelper from '../_components/BrakeCoordinateHelper';

export default function BrakeCoordinateHelperPage() {
  return (
    <div className="h-screen w-screen bg-slate-900">
      <Suspense fallback={
        <div className="h-full w-full flex items-center justify-center text-white">
          Loading Brake Coordinate Helper...
        </div>
      }>
        <BrakeCoordinateHelper />
      </Suspense>
    </div>
  );
}
