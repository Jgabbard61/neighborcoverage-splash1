import type { Metadata } from 'next';
import { HvacContent } from './hvac-content';

export const metadata: Metadata = {
  title: 'HVAC Service Near You | NeighborCoverage',
  description:
    'Get connected with a local HVAC technician today. NeighborCoverage makes it easy — one call gets you vetted HVAC help in your area.',
};

export default function HvacPage() {
  return <HvacContent />;
}
