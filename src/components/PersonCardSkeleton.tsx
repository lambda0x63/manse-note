import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function PersonCardSkeleton() {
  return (
    <Card className="h-full transition-all duration-200 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-12" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-8 w-full mb-1" />
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}