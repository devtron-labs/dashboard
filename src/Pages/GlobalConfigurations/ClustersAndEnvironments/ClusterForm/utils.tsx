export const renderKubeConfigClusterCountInfo = (clusterCount: number) => (
    <div>
        <div className="flex left dc__gap-4">
            <span className="fw-6">{clusterCount} valid cluster(s). </span>
            <span>Select the cluster you want to add/update</span>
        </div>
    </div>
)
