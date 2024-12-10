import { ReactComponent as Error } from '@Icons/ic-error-cross.svg'
import { ReactComponent as Success } from '@Icons/appstatus/healthy.svg'
import { Tooltip } from '@devtron-labs/devtron-fe-common-lib'

export interface ClusterMapLoadingType {
    errorInNodeListing: string
}

export const ClusterMapLoading = ({ errorInNodeListing }: ClusterMapLoadingType) => (
    <Tooltip alwaysShowTippyOnHover={!!errorInNodeListing} content={errorInNodeListing} interactive>
        <div className="flexbox dc__align-items-center dc__gap-8">
            {errorInNodeListing ? (
                <>
                    <Error className="icon-dim-16 dc__no-shrink" />
                    <span>Connection failed</span>
                </>
            ) : (
                <>
                    <Success className="icon-dim-16 dc__no-shrink" />
                    <span>Healthy</span>
                </>
            )}
        </div>
    </Tooltip>
)
