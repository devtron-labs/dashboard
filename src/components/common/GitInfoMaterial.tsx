import React from 'react'
import { SourceTypeMap } from '../../config';
import { MaterialHistory, CIMaterialType } from '../app/details/triggerView/MaterialHistory';
import { MaterialSource } from '../app/details/triggerView/MaterialSource';
import { EmptyStateCIMaterial } from '../app/details/triggerView//EmptyStateCIMaterial';
import CiWebhookModal from '../app/details/triggerView/CiWebhookModal';
import { ReactComponent as Back } from '../../assets/icons/ic-back.svg';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';

export default function GitInfoMaterial({ context, material, title, pipelineId, pipelineName, selectedMaterial, commitInfo, showWebhookModal, toggleWebhookModal, webhookPayloads, isWebhookPayloadLoading, hideWebhookModal }) {

    function renderMaterialHeader(material: CIMaterialType) {
        return <div className="trigger-modal__header">
            <h1 className="modal__title flex left">
                {showWebhookModal ? <button type="button" className="transparent flex" onClick={() => toggleWebhookModal(material.id)}>
                    <Back className="mr-16" />
                </button> : null}
                {title} {showWebhookModal ? '/ All incoming webhook payloads' : null}
            </h1>
            <button type="button" className="transparent" onClick={() => { context.closeCIModal(); hideWebhookModal()  }}>
                <Close className="" />
            </button>
        </div>
    }

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
            {material.type === SourceTypeMap.WEBHOOK ?
                <div className="cn-7 fs-12 fw-0 pl-20">Showing results matching configured filters. &nbsp;
            <span className="learn-more__href cursor" onClick={() => toggleWebhookModal(material.id)}>View all incoming webhook payloads</span>
                </div> : null}
            <MaterialHistory
                material={material}
                pipelineName={pipelineName}
                selectCommit={context.selectCommit}
                toggleChanges={context.toggleChanges} />
        </div >
    }

    const renderWebhookModal = (context) => {
        return <div>
            <CiWebhookModal
                context={context}
                webhookPayloads={webhookPayloads}
                id={material[0].id}
                isWebhookPayloadLoading={isWebhookPayloadLoading}
                hideWebhookModal={hideWebhookModal}
            />
        </div>
    }
    return (
        <>
            {renderMaterialHeader(selectedMaterial)}
            <div className={`m-lr-0 ${showWebhookModal ? null : 'flexbox'}`}>
                {showWebhookModal == true ? 
                renderWebhookModal(context) :
                    <>
                        {renderMaterialSource(context)}
                        {renderMaterialHistory(context, selectedMaterial)}
                    </>}
            </div>
        </>
    )
}