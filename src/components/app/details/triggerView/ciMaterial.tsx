import React, { Component } from 'react';
import { CIMaterialProps } from './types';
import { ReactComponent as Play } from '../../../../assets/icons/misc/arrow-solid-right.svg';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { ReactComponent as Question } from '../../../../assets/icons/appstatus/unknown.svg';
import { VisibleModal, ButtonWithLoader, Checkbox } from '../../../common';
import { SourceTypeMap } from '../../../../config'
import { EmptyStateCIMaterial } from './EmptyStateCIMaterial';
import { TriggerViewContext } from './TriggerView';
import Tippy from '@tippyjs/react';
import { MaterialHistory, CIMaterialType } from '../../details/triggerView/MaterialHistory';
import { MaterialSource } from '../../details/triggerView/MaterialSource';
import GitInfoMaterial from '../../../common/GitInfoMaterial';

export class CIMaterial extends Component<CIMaterialProps> {

  renderMaterialSource(context) {
    let refreshMaterial = {
      refresh: context.refreshMaterial,
      title: this.props.title,
      pipelineId: this.props.pipelineId,
    }
    return <div className="material-list">
      <div className="material-list__title material-list__title--border-bottom">Material Source</div>
      <MaterialSource
        material={this.props.material}
        selectMaterial={context.selectMaterial}
        refreshMaterial={refreshMaterial}
      />
    </div>
  }

  renderMaterialHistory(context, material: CIMaterialType) {

    if (material.isMaterialLoading || material.isRepoError || material.isBranchError) { //Error or Empty State
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
            onRetry={(e) => { e.stopPropagation(); context.onClickCIMaterial(this.props.pipelineId, this.props.pipelineName) }} />
        </div>
      </div>
    }
    else return <div className="select-material select-material--trigger-view">
      <div className="material-list__title"> Select Material </div>
      <MaterialHistory
        material={material}
        pipelineName={this.props.pipelineName}
        selectCommit={context.selectCommit}
        toggleChanges={context.toggleChanges} />
    </div >
  }

  renderMaterialStartBuild = (context, canTrigger) => {
    return <div className="trigger-modal__trigger">
      <Checkbox isChecked={context.invalidateCache}
        onClick={(e) => { e.stopPropagation() }}
        rootClassName="form__checkbox-label--ignore-cache"
        value={"CHECKED"}
        onChange={context.toggleInvalidateCache} >
        <span className="mr-5">Ignore Cache</span>
      </Checkbox>
      <Tippy className="default-tt" arrow={false} placement="top" content={
        <span style={{ display: "block", width: "200px" }}> This will ignore previous cache and create a new one. Ignoring cache will lead to longer build time.</span>}>
        <Question className="icon-dim-20" />
      </Tippy>
      <ButtonWithLoader
        rootClassName="cta-with-img cta-with-img--trigger-btn"
        loaderColor="#ffffff"
        disabled={!canTrigger}
        isLoading={this.props.isLoading}
        onClick={(e) => { e.stopPropagation(); context.onClickTriggerCINode() }}>
        <Play className="trigger-btn__icon" />Start Build
    </ButtonWithLoader>
    </div>
  }

  renderCIModal(context) {
    let selectedMaterial = this.props.material.find(mat => mat.isSelected);
    let commitInfo =  this.props.material.find((mat)=>mat.history);
    let canTrigger = this.props.material.reduce((isValid, mat) => {
      isValid = isValid && !mat.isMaterialLoading && !!mat.history.find(history => history.isSelected);
      return isValid
    }, true);
    if (this.props.material.length > 0) {
      return <>
        <div >
          <GitInfoMaterial
            context={context}
            material={this.props.material}
            commitInfo={commitInfo}
            title={this.props.title}
            pipelineId={this.props.pipelineId}
            pipelineName={this.props.pipelineName}
            selectedMaterial={selectedMaterial}
          />
        </div>
        {this.renderMaterialStartBuild(context, canTrigger)}
      </>
    }
  }

  render() {
    return <TriggerViewContext.Consumer>
      {(context) => {
        return <VisibleModal className="" close={context.closeCIModal}>
          <div className="modal-body--ci-material" onClick={(e) => { e.stopPropagation() }}>
            <div className="trigger-modal__header">
              <h1 className="modal__title">{this.props.title}</h1>
              <button type="button" className="transparent" onClick={() => { context.closeCIModal() }}>
                <Close className="" />
              </button>
            </div>
            {this.renderCIModal(context)}
          </div>
        </VisibleModal>
      }}
    </TriggerViewContext.Consumer>
  }
}