import React from 'react'
import { CIMaterialType } from '../triggerView/MaterialHistory'
import { ReactComponent as Refresh } from '../../../../assets/icons/ic-restore.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { SourceTypeMap } from '../../../../config'
import { CiPipelineSourceConfig } from '../../../ciPipeline/CiPipelineSourceConfig'
import { MaterialSourceProps } from './types'

export default function MaterialSource({
    material,
    refreshMaterial,
    selectMaterial,
    ciPipelineId,
    fromTriggerInfo,
}: MaterialSourceProps) {
    const renderErrorMessage = (mat: CIMaterialType): string => {
        if (mat.isRepoError) {
            return mat.repoErrorMsg
        } else if (mat.isDockerFileError) {
            return mat.dockerFileErrorMsg
        } else if (mat.isBranchError) {
            return mat.branchErrorMsg
        } else {
            return ''
        }
    }
    const renderMaterialUpdateInfo = (mat: CIMaterialType) => {
        if (mat.isMaterialLoading) {
            return (
                <div className="flex fs-10">
                    <div className="material-last-update__fetching dc__loading-dots">Fetching</div>
                </div>
            )
        } else if (mat.isBranchError || mat.isRepoError || mat.isDockerFileError) {
            return (
                <div className="flex fs-10">
                    <Error className="form__icon--error icon-dim-14 mr-5" />
                    <div className="material__error dc__ellipsis-right">{renderErrorMessage(mat)}</div>
                </div>
            )
        } else {
            return (
                <div className="flex fs-10">
                    {mat.lastFetchTime ? 'Updated' : ''}
                    <span className="fw-6 ml-5"> {mat.lastFetchTime}</span>
                </div>
            )
        }
    }

    const handleRefreshAction = (e) => {
        e.stopPropagation()
        refreshMaterial.refresh(
            refreshMaterial.pipelineId,
            refreshMaterial.title,
            Number(e.currentTarget.dataset.id),
        )
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
                        className={`material-list__item ${mat.isSelected ? 'material-selected' : ''}`}
                        onClick={handleSelectMaterialAction}
                    >
                        <div className="material-info">
                            <div className="material-info__name flex-1 dc__ellipsis-right">/{mat.gitMaterialName}</div>
                            <div className="icon-dim-22 git"></div>
                        </div>
                        <div className="branch-name">
                            <CiPipelineSourceConfig
                                sourceType={mat.type}
                                sourceValue={mat.value}
                                showTooltip={true}
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
