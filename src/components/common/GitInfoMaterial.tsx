import React, { useState, useEffect } from 'react';
import { SourceTypeMap } from '../../config';
import { MaterialHistory, CIMaterialType } from '../app/details/triggerView/MaterialHistory';
import { MaterialSource } from '../app/details/triggerView/MaterialSource';
import { EmptyStateCIMaterial } from '../app/details/triggerView//EmptyStateCIMaterial';
import CiWebhookModal from '../app/details/triggerView/CiWebhookDebuggingModal';
import { ReactComponent as Back } from '../../assets/icons/ic-back.svg';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as Right } from '../../assets/icons/ic-arrow-left.svg';
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { CiPipelineSourceConfig } from '../ciPipeline/CiPipelineSourceConfig';

export default function GitInfoMaterial({
    context,
    material,
    title,
    pipelineId,
    pipelineName,
    selectedMaterial,
    commitInfo,
    showWebhookModal,
    toggleWebhookModal,
    webhookPayloads,
    isWebhookPayloadLoading,
    hideWebhookModal,
    workflowId,
}) {
  const [noResults, setNoResults] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchApplied, setSearchApplied] = useState(false)
    function renderMaterialHeader(material: CIMaterialType) {
        return (
            <div className="trigger-modal__header">
                <h1 className="modal__title flex left fs-16">
                    {showWebhookModal ? (
                        <button type="button" className="transparent flex" onClick={() => hideWebhookModal()}>
                            <Back className="mr-16" />
                        </button>
                    ) : null}
                    {title}
                    {showWebhookModal ? (
                        <>
                            <Right
                                className="rotate icon-dim-24 ml-16 mr-16"
                                style={{ ['--rotateBy' as any]: '-180deg' }}
                            />
                            <span className="fs-16"> All incoming webhook payloads </span>{' '}
                        </>
                    ) : null}
                </h1>
                <button
                    type="button"
                    className="transparent"
                    onClick={() => {
                        context.closeCIModal();
                        hideWebhookModal();
                    }}
                >
                    <Close className="" />
                </button>
            </div>
        );
    }

    function renderMaterialSource(context) {
        let refreshMaterial = {
            refresh: context.refreshMaterial,
            title: title,
            pipelineId: pipelineId,
        };
        return (
            <div className="material-list">
                <div className="material-list__title material-list__title--border-bottom">Material Source</div>
                <MaterialSource
                    material={material}
                    selectMaterial={context.selectMaterial}
                    refreshMaterial={refreshMaterial}
                />
            </div>
        );
    }
    const handleFilterChanges = (_searchText: string): void => {
      //const _filteredData = clusterList.filter((cluster) => cluster.name.indexOf(_searchText) >= 0)
      //setFilteredClusterList(_filteredData)
      //setNoResults(_filteredData.length === 0)
      context.fetchMaterialByCommit(pipelineId, title, selectedMaterial.id, _searchText)
  }

  const clearSearch = (): void => {
      if (searchApplied) {
          handleFilterChanges('')
          setSearchApplied(false)
      }
      setSearchText('')
  }

  const handleFilterKeyPress = (event): void => {
      const theKeyCode = event.key
      if (theKeyCode === 'Enter') {
          handleFilterChanges(event.target.value)
          setSearchApplied(true)
      } else if (theKeyCode === 'Backspace' && searchText.length === 1) {
          clearSearch()
      }
  }

  const renderSearch = (): JSX.Element => {
      return (
          <div className="search position-rel mt-12 en-2 bw-1 br-4 h-32" style={{ marginRight: '20px' }}>
              <Search className="search__icon icon-dim-18" />
              <input
                  type="text"
                  placeholder="Search clusters"
                  value={searchText}
                  className="search__input"
                  onChange={(event) => {
                      setSearchText(event.target.value)
                  }}
                  onKeyDown={handleFilterKeyPress}
              />
              {searchApplied && (
                  <button className="search__clear-button" type="button" onClick={clearSearch}>
                      <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                  </button>
              )}
          </div>
      )
  }

    function renderMaterialHistory(context, material: CIMaterialType) {
        let anyCommit = material.history && material.history.length > 0;
        if (material.isMaterialLoading || material.isRepoError || material.isBranchError || !anyCommit) {
            //Error or Empty State
            return (
                <div className="select-material select-material--trigger-view">
                    <div className="select-material__empty-state-container flex">
                        <EmptyStateCIMaterial
                            isRepoError={material.isRepoError}
                            isBranchError={material.isBranchError}
                            isWebHook={material.type === SourceTypeMap.WEBHOOK}
                            gitMaterialName={material.gitMaterialName}
                            sourceValue={material.value}
                            repoErrorMsg={material.repoErrorMsg}
                            branchErrorMsg={material.branchErrorMsg}
                            repoUrl={material.gitURL}
                            isMaterialLoading={material.isMaterialLoading}
                            toggleWebHookModal={()=> toggleWebhookModal(material.id)}
                            onRetry={(e) => {
                                e.stopPropagation();
                                context.onClickCIMaterial(pipelineId, pipelineName);
                            }}
                            anyCommit={anyCommit}
                        />
                    </div>
                </div>
            );
        } else
            return (
                <div className="select-material select-material--trigger-view">
                    <div className="flexbox content-space">
                        <div className="material-list__title mt-4">Select Material</div>
                        {renderSearch()}
                    </div>
                    {material.type === SourceTypeMap.WEBHOOK && (
                        <div className="cn-7 fs-12 fw-0 pl-20 flex left">
                            Showing results matching &nbsp;
                            <CiPipelineSourceConfig
                                sourceType={material.type}
                                sourceValue={material.value}
                                showTooltip={true}
                                baseText="configured filters"
                                showIcons={false}
                            />
                            .
                            <span className="learn-more__href cursor" onClick={() => toggleWebhookModal(material.id)}>
                                View all incoming webhook payloads
                            </span>
                        </div>
                    )}
                    <MaterialHistory
                        material={material}
                        pipelineName={pipelineName}
                        selectCommit={context.selectCommit}
                        toggleChanges={context.toggleChanges}
                    />
                </div>
            );
    }

    const renderWebhookModal = (context) => {
        return (
            <div>
                <CiWebhookModal
                    context={context}
                    webhookPayloads={webhookPayloads}
                    ciPipelineMaterialId={material[0].id}
                    ciPipelineId={pipelineId}
                    isWebhookPayloadLoading={isWebhookPayloadLoading}
                    hideWebhookModal={hideWebhookModal}
                    workflowId={workflowId}
                />
            </div>
        );
    };

    return (
        <>
            {renderMaterialHeader(selectedMaterial)}
            <div className={`m-lr-0 ${showWebhookModal ? null : 'flexbox'}`}>
                {showWebhookModal == true ? (
                    renderWebhookModal(context)
                ) : (
                    <>
                        {renderMaterialSource(context)}
                        {renderMaterialHistory(context, selectedMaterial)}
                    </>
                )}
            </div>
        </>
    );
}
