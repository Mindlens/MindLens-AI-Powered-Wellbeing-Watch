import { Skeleton } from "@/components/ui/skeleton";

const PageSkeleton = () => (
  <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <div className="grid gap-4 sm:grid-cols-2">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);

export default PageSkeleton;
