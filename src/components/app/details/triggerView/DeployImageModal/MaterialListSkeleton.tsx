const MaterialListSkeleton = () => (
    <div className="flexbox-col dc__overflow-auto dc__gap-12 dc__align-items-center h-100 w-100 pl-20 pr-20">
        <div className="flexbox dc__align-items-center dc__content-space pt-20 pb-16 w-100">
            <div className="shimmer-loading" style={{ width: '100px', height: '20px' }} />
        </div>

        <div className="shimmer-loading w-100" style={{ height: '150px' }} />
        <div className="shimmer-loading w-100" style={{ height: '150px' }} />
    </div>
)

export default MaterialListSkeleton
