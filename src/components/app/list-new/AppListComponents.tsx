import { GenericFilterEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as InfoFill } from '@Icons/ic-info-filled.svg'
import { APP_LIST_EMPTY_STATE_MESSAGING } from './Constants'
import { AskToClearFiltersProps } from './AppListType'

const AskToClearFilters = ({ clearAllFilters, showTipToSelectCluster = false }: AskToClearFiltersProps) => (
    <GenericFilterEmptyState
        title={APP_LIST_EMPTY_STATE_MESSAGING.noAppsFound}
        subTitle={APP_LIST_EMPTY_STATE_MESSAGING.noAppsFoundInfoText}
        handleClearFilters={clearAllFilters}
    >
        {showTipToSelectCluster && (
            <div className="mt-18">
                <p
                    className="bcb-1 cn-9 fs-13 pt-10 pb-10 pl-16 pr-16 eb-2 bw-1 br-4 cluster-tip flex left top"
                    style={{ width: '300px' }}
                >
                    <span>
                        <InfoFill className="icon-dim-20" />
                    </span>
                    <div className="ml-12 cn-9" style={{ textAlign: 'start' }}>
                        <span className="fw-6">Tip </span>
                        <span>{APP_LIST_EMPTY_STATE_MESSAGING.selectCluster}</span>
                    </div>
                </p>
            </div>
        )}
    </GenericFilterEmptyState>
)

export default AskToClearFilters
