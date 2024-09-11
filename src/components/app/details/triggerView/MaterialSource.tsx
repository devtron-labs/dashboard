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

import React from 'react'
import { ReactComponent as Refresh } from '../../../../assets/icons/ic-restore.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { SourceTypeMap } from '../../../../config'
import { MaterialSourceProps } from './types'
import { CIMaterialType, CiPipelineSourceConfig } from '@devtron-labs/devtron-fe-common-lib'

export default function MaterialSource({
    material,
    refreshMaterial,
    selectMaterial,
    ciPipelineId,
    fromTriggerInfo,
    clearSearch,
}: MaterialSourceProps) {
    const renderErrorMessage = (mat: CIMaterialType): string => {
        if (mat.isRepoError) {
            return mat.repoErrorMsg
        }
        if (mat.isDockerFileError) {
            return mat.dockerFileErrorMsg
        }
        if (mat.isBranchError) {
            return mat.branchErrorMsg
        }
        if (mat.isMaterialSelectionError) {
            return mat.materialSelectionErrorMsg
        }
        return ''
    }
    const renderMaterialUpdateInfo = (mat: CIMaterialType) => {
        if (mat.isMaterialLoading) {
            return (
                <div data-testid="fetching-material-loading" className="flex fs-10">
                    <div className="material-last-update__fetching dc__loading-dots">Fetching</div>
                </div>
            )
        }
        if (mat.isBranchError || mat.isRepoError || mat.isDockerFileError || mat.isMaterialSelectionError) {
            return (
                <div data-testid="material-error" className="flex fs-10">
                    <Error className="form__icon--error icon-dim-14 mr-5" />
                    <div className="material__error dc__ellipsis-right">{renderErrorMessage(mat)}</div>
                </div>
            )
        }
        return (
            <div data-testid="material-last-fetch-time" className="flex fs-10">
                {mat.lastFetchTime ? 'Updated' : ''}
                <span className="fw-6 ml-5"> {mat.lastFetchTime}</span>
            </div>
        )
    }

    const handleRefreshAction = (e) => {
        e.stopPropagation()
        refreshMaterial.refresh(refreshMaterial.pipelineId, Number(e.currentTarget.dataset.id))

        if (clearSearch) {
            clearSearch(e)
        }
    }

    const renderRefreshButton = (mat: CIMaterialType) => {
        return (
            <button
                type="button"
                className="material-refresh"
                disabled={mat.isMaterialLoading}
                data-id={mat.gitMaterialId}
                onClick={handleRefreshAction}
            >
                <Refresh className={mat.isMaterialLoading ? 'icon-dim-16 rotate' : 'icon-dim-16'} />
            </button>
        )
    }

    const handleSelectMaterialAction = (e) => {
        e.stopPropagation()
        selectMaterial(e.currentTarget.dataset.id, ciPipelineId)
    }

    return (
        <div
            className="select-material--trigger-view__sidebar dc__overflow-scroll"
            style={{ height: fromTriggerInfo ? '100%' : 'calc(100% - 44px)' }}
        >
            {material.map((mat, index) => {
                return (
                    <div
                        key={index}
                        data-id={mat.id}
                        data-testid={`material-list-item-${index}`}
                        className={`material-list__item ${mat.isSelected ? 'material-selected' : ''}`}
                        onClick={handleSelectMaterialAction}
                    >
                        <div className="material-info">
                            <div className="material-info__name flex-1 dc__ellipsis-right">/{mat.gitMaterialName}</div>
                            <div className="icon-dim-22 git" />
                        </div>
                        <div className="branch-name">
                            <CiPipelineSourceConfig
                                sourceType={mat.type}
                                sourceValue={mat.value}
                                showTooltip
                                regex={mat.regex}
                                primaryBranchAfterRegex={mat.value}
                            />
                        </div>
                        {refreshMaterial ? (
                            <div className="material-info mt-10">
                                {renderMaterialUpdateInfo(mat)}
                                {mat.type != SourceTypeMap.WEBHOOK && renderRefreshButton(mat)}
                            </div>
                        ) : null}
                    </div>
                )
            })}
        </div>
    )
}
