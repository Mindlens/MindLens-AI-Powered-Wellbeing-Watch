const PageSkeleton = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent animate-spin" aria-label="Loading" />
  </div>
);

export default PageSkeleton;
