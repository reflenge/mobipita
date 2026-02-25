import { Skeleton } from "@/components/ui/skeleton"

const CreateSlotSkeleton = () => {
    return (
        <div className="mx-auto container px-6 py-10 space-y-6">

            <div className="space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-72" />
            </div>


            <div className="space-y-5">

                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full max-w-md" />
                </div>


                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full max-w-md" />
                    <Skeleton className="h-4 w-64" />
                </div>


                <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-32 w-full max-w-2xl" />
                    <Skeleton className="h-4 w-40" />
                </div>


                <div className="flex items-center justify-between max-w-md">
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                </div>
            </div>


            <div className="flex gap-3 justify-end pt-4">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
            </div>
        </div>
    )
}

export default CreateSlotSkeleton
