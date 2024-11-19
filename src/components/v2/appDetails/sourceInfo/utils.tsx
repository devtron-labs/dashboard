import { ReactComponent as RightArrow } from '@Icons/ic-arrow-right.svg'

export const getEnvironmentName = (
    clusterName: string,
    namespace: string,
    environmentName: string,
): string | JSX.Element => {
    if (environmentName) {
        return environmentName
    }
    if (clusterName && namespace) {
        return `${clusterName}__${namespace}`
    }
    return <span>&nbsp;</span>
}

export const getUsedChartContent = (isDeprecated: boolean, onClickUpgrade: () => void) => (
    <div className="flexbox-col dc__gap-8 py-6">
        <div>
            {isDeprecated ? (
                <div>
                    <span className="fw-6">Chart deprecated</span>
                    <div>This chart has been deprecated. Change chart or chart version.</div>
                </div>
            ) : (
                <div>
                    <span className="fw-6">Chart used</span>
                    <div>Chart used to deploy to this application</div>
                </div>
            )}
        </div>
        <button
            type="button"
            data-testid="chart-used-upgrade-button"
            className="flexbox dc__gap-6 dc__transparent cn-0 fs-12 fw-6 lh-20 p-0 dc__align-items-center"
            onClick={onClickUpgrade}
        >
            Go to Configure
            <RightArrow className="dc__no-shrink icon-dim-16 scn-0" />
        </button>
    </div>
)
