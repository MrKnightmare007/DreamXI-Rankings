import IPLLoader from '@/components/IPLLoader';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <IPLLoader size="large" text="Loading IPL Dream11 Rankings..." />
    </div>
  );
}