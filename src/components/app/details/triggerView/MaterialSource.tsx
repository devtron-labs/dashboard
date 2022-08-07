import React, { Component } from 'react'
import { CIMaterialType } from '../triggerView/MaterialHistory'
import { ReactComponent as Refresh } from '../../../../assets/icons/ic-restore.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { SourceTypeMap } from '../../../../config'
import { CiPipelineSourceConfig } from '../../../ciPipeline/CiPipelineSourceConfig'

interface MaterialSourceProps {
    material: CIMaterialType[]
    selectMaterial: (materialId: string) => void
    refreshMaterial?: {
        pipelineId: number
        title: string
        refresh: (pipelineId: number, title: string, gitMaterialId: number) => void
    }
}
export class MaterialSource extends Component<MaterialSourceProps> {
    renderMaterialUpdateInfo(material) {
        if (material.isMaterialLoading) {
            return (
                <div className="material-last-update">
                    <div className="material-last-update__fetching">Fetching Repo...</div>
                </div>
            )
        } else if (material.isBranchError || material.isRepoError) {
            return (
                <div className="material-last-update">
                    <Error className="form__icon--error icon-dim-14 mr-5" />
                    <div className="material__error ellipsis-right">
                        {material.isRepoError
                            ? material.repoErrorMsg
                            : material.isBranchError
                            ? material.branchErrorMsg
                            : ''}
                    </div>
                </div>
            )
        } else {
            return (
                <div className="material-last-update">
                    {material.lastFetchTime ? 'Last Updated' : ''}
                    <span className="fw-6 ml-5"> {material.lastFetchTime}</span>
                </div>
            )
        }
    }

    renderRefreshButton(material) {
        return (
            <button
                type="button"
                className="material-refresh"
                disabled={material.isMaterialLoading}
                onClick={(event) => {
                    event.stopPropagation()
                    this.props.refreshMaterial.refresh(
                        this.props.refreshMaterial.pipelineId,
                        this.props.refreshMaterial.title,
                        material.gitMaterialId,
                    )
                }}
            >
                <Refresh className={material.isMaterialLoading ? 'icon-dim-16 rotate' : 'icon-dim-16'} />
            </button>
        )
    }

    render() {
        return (
            <>
                {this.props.material.map((material, index) => {
                    let selectedClass = material.isSelected ? 'material-selected' : ''
                    return (
                        <div
                            key={index}
                            className={`material-list__item ${selectedClass}`}
                            onClick={(e) => {
                                e.stopPropagation()
                                this.props.selectMaterial(material.id.toString())
                            }}
                        >
                            <div className="material-info">
                                <div className="material-info__name flex-1">/{material.gitMaterialName}</div>
                                <div className="icon-dim-22 git"></div>
                            </div>
                            <div className="branch-name ">
                                <CiPipelineSourceConfig
                                    sourceType={material.type}
                                    sourceValue={material.value}
                                    showTooltip={true}
                                    regex={material.regex}
                                    primaryBranchAfterRegex={material.value}
                                />
                            </div>
                            {this.props.refreshMaterial ? (
                                <div className="material-info">
                                    {this.renderMaterialUpdateInfo(material)}
                                    {material.type != SourceTypeMap.WEBHOOK && this.renderRefreshButton(material)}
                                </div>
                            ) : null}
                        </div>
                    )
                })}
            </>
        )
    }
}
