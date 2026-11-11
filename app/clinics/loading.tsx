import { Container } from "@/components/ui/container/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClinicsLoading() {
  return (
    <Container className="hub-shell font-body flex min-h-screen flex-col gap-6 px-4 py-8 md:py-12">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-9 w-64" />
      <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card flex flex-col gap-3 p-5">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>
        ))}
      </div>
    </Container>
  );
}
