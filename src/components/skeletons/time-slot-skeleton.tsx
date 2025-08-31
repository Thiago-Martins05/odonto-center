import { Skeleton } from "@/components/ui/skeleton";

export function TimeSlotSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((day) => (
          <div key={day} className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((slot) => (
                <Skeleton key={slot} className="h-10 w-20" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
