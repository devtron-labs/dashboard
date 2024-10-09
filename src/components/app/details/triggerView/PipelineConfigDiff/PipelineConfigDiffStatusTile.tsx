import { DeploymentWithConfigType, Progressing, SelectPicker, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'
import { PipelineConfigDiffStatusTileProps } from './types'

import './PipelineConfigDiff.scss'

export const PipelineConfigDiffStatusTile = ({
    isLoading,
    hasDiff,
    noLastDeploymentConfig,
    deploymentConfigSelectorProps,
    onClick,
    canReviewConfig,
    urlFilters,
}: PipelineConfigDiffStatusTileProps) => {
    const { deploy } = urlFilters
    const lastDeployedOptionSelected = deploy === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG
    const _canReviewConfig = canReviewConfig && !noLastDeploymentConfig

    return (
        <div className="pipeline-config-diff-tile flex dc__border br-4">
            <div className="px-16 flex dc__gap-4">
                <span className="cn-9 fs-13 lh-20">Deploy:</span>
                <SelectPicker<string | number, false> {...deploymentConfigSelectorProps} />
            </div>
            <Tooltip
                alwaysShowTippyOnHover={!isLoading && !lastDeployedOptionSelected && !noLastDeploymentConfig}
                content={`${hasDiff ? 'Config' : 'No config'} diff from last deployed`}
                className="dc__mxw-250"
            >
                <button
                    type="button"
                    className={`dc__transparent dc__border-left flex dc__gap-12 px-16 py-7 ${isLoading ? 'cursor-not-allowed' : 'dc__hover-n100'}`}
                    disabled={isLoading || !canReviewConfig}
                    onClick={onClick}
                >
                    {isLoading ? (
                        <span className="dc__border-radius-24 flex dc__gap-4 py-3 px-12 fs-12 fw-6 lh-20 cn-0 bcb-5">
                            Checking diff&nbsp;
                            <Progressing
                                size={16}
                                fillColor="white"
                                styles={{
                                    width: 'auto',
                                }}
                            />
                        </span>
                    ) : (
                        <>
                            {!lastDeployedOptionSelected && !noLastDeploymentConfig && (
                                <span
                                    className={`dc__border-radius-24 flex dc__gap-4 py-3 px-12 fs-12 fw-6 lh-20 cn-0 ${hasDiff ? 'bcr-5' : 'bcg-5'}`}
                                >
                                    {(!_canReviewConfig || hasDiff) && (
                                        <ICWarning className="icon-dim-16 config-diff-found-icon" />
                                    )}

                                    {!_canReviewConfig && 'Config not available'}
                                    {_canReviewConfig && (hasDiff ? 'Config diff' : 'No config diff')}
                                </span>
                            )}
                            {(_canReviewConfig || lastDeployedOptionSelected || noLastDeploymentConfig) && (
                                <span className="cb-5 mt-3 mb-3">REVIEW</span>
                            )}
                        </>
                    )}
                </button>
            </Tooltip>
        </div>
    )
}
