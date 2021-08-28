import React from 'react'
import { MaterialHistory, CIMaterialType } from '../app/details/triggerView/MaterialHistory';
import { MaterialSource } from '../app/details/triggerView/MaterialSource';
import { EmptyStateCIMaterial } from '../app/details/triggerView//EmptyStateCIMaterial';


export default function GitInfoMaterial({ context, material, title, pipelineId, pipelineName, selectedMaterial, commitInfo,  showWebhookModal, toggleWebhookModal }) {

    function renderMaterialSource(context) {
        let refreshMaterial = {
            refresh: context.refreshMaterial,
            title: title,
            pipelineId: pipelineId,
        }
        return <div className="material-list">
            <div className="material-list__title material-list__title--border-bottom">Material Source</div>
            <MaterialSource
                material={material}
                selectMaterial={context.selectMaterial}
                refreshMaterial={refreshMaterial}
            />
        </div>
    }

    function renderMaterialHistory(context, material: CIMaterialType) {
        let anyCommit = (material.history && material.history.length > 0);
        if (material.isMaterialLoading || material.isRepoError || material.isBranchError || !anyCommit) { //Error or Empty State
            return <div className="select-material select-material--trigger-view">
                <div className="select-material__empty-state-container">
                    <EmptyStateCIMaterial
                        isRepoError={material.isRepoError}
                        isBranchError={material.isBranchError}
                        gitMaterialName={material.gitMaterialName}
                        sourceValue={material.value}
                        repoErrorMsg={material.repoErrorMsg}
                        branchErrorMsg={material.branchErrorMsg}
                        repoUrl={material.gitURL}
                        isMaterialLoading={material.isMaterialLoading}
                        onRetry={(e) => { e.stopPropagation(); context.onClickCIMaterial(pipelineId, pipelineName) }}
                        anyCommit={anyCommit} />
                </div>
            </div>
        }
        else return <div className="select-material select-material--trigger-view">
            <div className="material-list__title pb-0">
                Select Material
           
            </div>
            <div className="cn-7 fs-12 fw-0 pl-20">Showing results matching configured filters. &nbsp;
            <span className="learn-more__href cursor" onClick={()=>toggleWebhookModal(material.id)}>View all incoming webhook payloads</span>
                </div>
            <MaterialHistory
                material={material}
                pipelineName={pipelineName}
                selectCommit={context.selectCommit}
                toggleChanges={context.toggleChanges} />
        </div >
    }
    return (
        <div className="m-lr-0 flexbox">
            {renderMaterialSource(context)}
            {renderMaterialHistory(context, selectedMaterial)}
        </div>
    )
}