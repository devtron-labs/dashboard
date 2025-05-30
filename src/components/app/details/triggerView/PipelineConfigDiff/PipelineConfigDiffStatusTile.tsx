/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    DeploymentConfigDiffRadioSelect,
    DeploymentWithConfigType,
    Progressing,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'

import { PipelineConfigDiffStatusTileProps } from './types'

import './PipelineConfigDiff.scss'

export const PipelineConfigDiffStatusTile = ({
    isLoading,
    hasDiff,
    noLastDeploymentConfig,
    onClick,
    canReviewConfig,
    urlFilters,
    renderConfigNotAvailableTooltip,
    radioSelectConfig,
}: PipelineConfigDiffStatusTileProps) => {
    const { deploy } = urlFilters
    const lastDeployedOptionSelected = deploy === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG
    const lastSavedConfigOptionSelected = deploy === DeploymentWithConfigType.LAST_SAVED_CONFIG
    const _canReviewConfig = canReviewConfig && !noLastDeploymentConfig

    // RENDERERS
    const renderDiffState = () => (
        <span
            className={`dc__border-radius-24 flex dc__gap-4 py-3 px-12 fs-12 fw-6 lh-20 cn-0 ${hasDiff ? 'bcr-5' : 'bcg-5'}`}
        >
            {hasDiff ? (
                <>
                    <ICWarning className="icon-dim-16 config-diff-found-icon" />
                    <span>Config diff</span>
                </>
            ) : (
                <span>No config diff</span>
            )}
        </span>
    )

    const renderConfigNotAvailableState = () => (
        <span className="dc__border-radius-24 flex dc__gap-4 py-3 px-12 fs-12 fw-6 lh-20 cn-9 bcn-1">
            <ICWarning className="icon-dim-16" />
            Config not available
        </span>
    )

    const renderConfigViewState = () => (_canReviewConfig ? renderDiffState() : renderConfigNotAvailableState())

    const renderReviewState = () =>
        _canReviewConfig || lastDeployedOptionSelected || noLastDeploymentConfig ? (
            <span className="cb-5 mt-3 mb-3">REVIEW</span>
        ) : null

    const renderLoadingState = () => (
        <span className="dc__border-radius-24 flex dc__gap-4 py-3 px-12 fs-12 fw-6 lh-20 cn-0 bcb-5">
            <span>Checking diff</span>
            <Progressing
                size={16}
                fillColor="white"
                styles={{
                    width: 'auto',
                }}
            />
        </span>
    )

    return (
        <div className="pipeline-config-diff-tile flex dc__border br-4">
            <div className="px-16 flex dc__gap-4">
                <span className="cn-9 fs-13 lh-20">Deploy:</span>
                <DeploymentConfigDiffRadioSelect radioSelectConfig={radioSelectConfig} position="top" />
            </div>
            <Tooltip
                alwaysShowTippyOnHover={!isLoading && !lastDeployedOptionSelected && !noLastDeploymentConfig}
                content={
                    noLastDeploymentConfig
                        ? renderConfigNotAvailableTooltip()
                        : `${hasDiff ? 'Config' : 'No config'} diff from last deployed`
                }
                className="dc__mxw-250"
            >
                <div>
                    <button
                        type="button"
                        className={`dc__transparent dc__border-left flex dc__gap-12 px-16 py-7 ${!canReviewConfig || isLoading ? 'cursor-not-allowed' : 'dc__hover-n100'}`}
                        disabled={isLoading || !canReviewConfig}
                        onClick={onClick}
                    >
                        {!lastDeployedOptionSelected &&
                            !noLastDeploymentConfig &&
                            (isLoading && !lastSavedConfigOptionSelected
                                ? renderLoadingState()
                                : renderConfigViewState())}
                        {renderReviewState()}
                    </button>
                </div>
            </Tooltip>
        </div>
    )
}
