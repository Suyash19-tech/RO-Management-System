import { WaterDropLoader } from "@/components/ui/WaterDropLoader";

export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center min-h-[60vh]">
      <WaterDropLoader />
    </div>
  );
}
