import React, { useState, useEffect } from 'react'
import { SourceTypeMap } from '../../config';
import { MaterialHistory, CIMaterialType } from '../app/details/triggerView/MaterialHistory';
import { MaterialSource } from '../app/details/triggerView/MaterialSource';
import { EmptyStateCIMaterial } from '../app/details/triggerView//EmptyStateCIMaterial';
import CiWebhookModal from '../app/details/triggerView/CiWebhookModal';
import { ReactComponent as Back } from '../../assets/icons/ic-back.svg';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as Right } from '../../assets/icons/ic-arrow-left.svg';
import Tippy from '@tippyjs/react';
import { getWebhookEventsForEventId } from '../../services/service';
import { showError, } from './helpers/Helpers';
import { sortCallback } from '../common';

export default function GitInfoMaterial({ context, material, title, pipelineId, pipelineName, selectedMaterial, commitInfo, showWebhookModal, toggleWebhookModal, webhookPayloads, isWebhookPayloadLoading, hideWebhookModal, workflowId, onClickWebhookTimeStamp, webhhookTimeStampOrder }) {

    const [sourceValueAdv, setSourceValueAdv] = useState(material.type);

    function init() {
        material.map((ciMaterial) => {
            let sourceValueObj = JSON.parse(ciMaterial.value)
            let eventId = sourceValueObj.eventId;
            let webhookCondition = sourceValueObj.condition;

            getWebhookEventsForEventId(eventId).then((res) => {
                let webhookEvent = res.result;
                setSourceValueAdv(buildHoverHtmlForWebhook(webhookEvent.name, webhookCondition, webhookEvent.selectors));
            });
        }
        )
    }

    useEffect(() => {
        try {
            init()
        }
        catch (err) {
            showError(err)
        }
    }, [])

    function buildHoverHtmlForWebhook(eventName, condition, selectors) {
        // let webhookCondition = condition.sort((a, b) => sortCallback("selectorName", a, b))

        let _conditions = [];
        Object.keys(condition).forEach((_selectorId) => {
            let _selector = selectors.find(i => i.id == _selectorId);
            _conditions.push({ "name": _selector ? _selector.name : "", "value": condition[_selectorId] });
        })
        return <>
            <span> {eventName} Filters </span>
            <br />
            <ul className="m-0">
                {_conditions.map((_condition, index) => (
                    <li key={index}>{_condition.name} : {_condition.value}</li>
                ))}
            </ul>
        </>
    }


    function renderMaterialHeader(material: CIMaterialType) {
        return <div className="trigger-modal__header">
            <h1 className="modal__title flex left fs-16">
                {showWebhookModal ? <button type="button" className="transparent flex" onClick={() => hideWebhookModal()}>
                    <Back className="mr-16" />
                </button> : null}
                {title}
                <Right className="rotate icon-dim-24 ml-16 mr-16" style={{ ['--rotateBy' as any]: '-180deg' }} />
                {showWebhookModal ? <span className="fs-16"> All incoming webhook payloads </span> : null}
            </h1>
            <button type="button" className="transparent" onClick={() => { context.closeCIModal(); hideWebhookModal() }}>
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
                <div className="select-material__empty-state-container" style={{ height: "auto", marginTop: "calc(100vh - 700px)" }}>
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
                    {material.type === SourceTypeMap.WEBHOOK ?
                        <span className="learn-more__href cursor" onClick={() => toggleWebhookModal(material.id)}>View all incoming webhook payloads</span>
                        : null}

                </div>
            </div>
        }
        else return <div className="select-material select-material--trigger-view">
            <div className="material-list__title pb-0">
                Select Material
            </div>
            {material.type === SourceTypeMap.WEBHOOK ?
                <div className="cn-7 fs-12 fw-0 pl-20">Showing results matching &nbsp;
                   <Tippy className="default-tt" arrow={false} placement="bottom" content={<div>
                        {sourceValueAdv}
                    </div>}>
                        <span className="cursor" style={{ borderBottom: '1px solid #3b444c' }}>configured filters.</span>
                    </Tippy> &nbsp;
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
                ciMaterialId={material[0].id}
                isWebhookPayloadLoading={isWebhookPayloadLoading}
                hideWebhookModal={hideWebhookModal}
                workflowId={workflowId}
                onClickWebhookTimeStamp={onClickWebhookTimeStamp}
                webhhookTimeStampOrder={webhhookTimeStampOrder}
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
