export const ChartCardSkeleton = ({ isGridView }: { isGridView?: boolean }) => (
    <div
        className={`dc__gap-16 w-100 chart-grid-item dc__visible-hover dc__visible-hover--parent bg__primary border__primary cursor dc__position-rel br-8 `}
    >
        <div className={`${isGridView ? 'flexbox-col dc__gap-12' : 'flexbox dc__gap-16'} px-20 pt-20 pb-16`}>
            <div className="p-4 dc__no-shrink icon-dim-48 shimmer-loading h-48" />

            <div className="flexbox-col dc__gap-8 w-100">
                <div className="flexbox-col dc__gap-8 w-100">
                    <div className="h-20 w-150 shimmer-loading" />

                    <div className="flexbox-col dc__gap-4">
                        <div className="h-16 w-100 shimmer-loading" />
                    </div>
                </div>

                <div className="h-16 w-69 shimmer-loading" />
            </div>
        </div>

        <div className="dc__border-top-n1 px-20 py-18 flex dc__content-space">
            <div className="flex left dc__gap-8 w-100">
                <div className="icon-dim-16 shimmer-loading" />
                <div className="h-14 w-80px shimmer-loading" />
            </div>
            <div className="shimmer-loading w-32 h-14" />
        </div>
    </div>
)

const ChartCardSkeletonRow = ({ isGridView, count = 4 }: { count?: number; isGridView: boolean }) => (
    <div className={isGridView ? 'chart-grid' : 'chart-grid list-view'}>
        {Array(count)
            .fill(0)
            .map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <ChartCardSkeleton key={index} isGridView={isGridView} />
            ))}
    </div>
)

export default ChartCardSkeletonRow
