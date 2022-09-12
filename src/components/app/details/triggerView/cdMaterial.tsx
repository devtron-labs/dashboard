import React, { Component } from 'react';
import { CDMaterialProps, CDMaterialState } from './types';
import { GitTriggers } from '../cIDetails/types';
import close from '../../../../assets/icons/ic-close.svg';
import arrow from '../../../../assets/icons/misc/arrow-chevron-down-black.svg';
import { ReactComponent as Check } from '../../../../assets/icons/ic-check-circle.svg';
import deploy from '../../../../assets/icons/misc/deploy.svg';
import play from '../../../../assets/icons/misc/arrow-solid-right.svg';
import docker from '../../../../assets/icons/misc/docker.svg';
import { VisibleModal, ButtonWithLoader, ScanVulnerabilitiesTable, Progressing } from '../../../common';
import { EmptyStateCdMaterial } from './EmptyStateCdMaterial';
import { getCDModalHeader, CDButtonLabelMap } from './config';
import { CDModalTab } from '../../service';
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric';
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service';
import { ModuleNameMap } from '../../../../config';
import { ModuleStatus } from '../../../v2/devtronStackManager/DevtronStackManager.type';

export class CDMaterial extends Component<CDMaterialProps, CDMaterialState> {
  constructor(props: CDMaterialProps) {
    super(props)
    this.state = {
      isSecurityModuleInstalled: false
    }
  }

  componentDidMount() {
    this.getSecurityModuleStatus()
  }

  async getSecurityModuleStatus(): Promise<void> {
    try {
        const { result } = await getModuleInfo(ModuleNameMap.SECURITY)
        if (result?.status === ModuleStatus.INSTALLED) {
          this.setState({ isSecurityModuleInstalled: true })
        }
    } catch (error) {}
  }

  renderGitMaterialInfo(matInfo) {
    return <>
      {matInfo.map(mat => {
        let _gitCommit: GitTriggers = {
          Commit: mat.revision,
          Author: mat.author,
          Date: mat.modifiedTime,
          Message: mat.message,
          WebhookData: JSON.parse(mat.webhookData),
          Changes: [],
          GitRepoUrl : "",
          GitRepoName: "",
          CiConfigureSourceType: "",
          CiConfigureSourceValue: ""
        }

        return <div className="bcn-0 pt-12 br-4 pb-12 en-2 bw-1 m-12">
          <GitCommitInfoGeneric
                materialUrl={mat.url}
                showMaterialInfo={false}
                commitInfo={_gitCommit}
                materialSourceType={""}
                selectedCommitInfo={""}
                materialSourceValue={""}
          />
        </div>
      })}
    </>
  }

  renderVulnerabilities(mat) {
    if (!mat.scanned) {
      return <div className="security-tab-empty">
        <p className="security-tab-empty__title">Image was not scanned</p>
      </div>
    }
    else if (!mat.scanEnabled) {
      return <div className="security-tab-empty">
        <p className="security-tab-empty__title">Scan is Disabled</p>
      </div>
    }
    else if (mat.vulnerabilitiesLoading) {
      return <div className="security-tab-empty">
        <Progressing />
      </div>
    }
    else if (!mat.vulnerabilitiesLoading && mat.vulnerabilities.length === 0) {
      return <div className="security-tab-empty">
        <p className="security-tab-empty__title">No vulnerabilities Found</p>
        <p className="security-tab-empty__subtitle">{mat.lastExecution}</p>
      </div>
    }
    else return <div className="security-tab">
      <p className="security-tab__last-scanned">Scanned on {mat.lastExecution} </p>
      <ScanVulnerabilitiesTable vulnerabilities={mat.vulnerabilities} />
    </div>
  }

  renderSequentialCDCardTitle = (mat) => {
    if (this.props.stageType !== 'CD') return;

    if (mat.latest && mat.runningOnParentCd) {
        return (
            <div className="bcv-1 pt-6 pb-6 pl-16 pr-16 br-4">
                <span className="cn-9 fw-6">Deployed on </span>{' '}
                <span className="cv-5 fw-6">
                    {this.props.parentEnvironmentName}
                    {this.props.parentEnvironmentName ? (
                        <>
                            <span className="cn-9 fw-4" style={{ fontStyle: 'italic' }}>
                                {' '}
                                and{' '}
                            </span>
                            {this.props.envName}
                        </>
                    ) : (
                        ''
                    )}
                </span>
            </div>
        );
    } else if (mat.latest) {
        return (
            <div className="bcv-1 pt-6 pb-6 pl-16 pr-16 br-4">
                <span className="cn-9 fw-6">Deployed on </span>
                <span className="cv-5 fw-6">{this.props.envName} </span>
            </div>
        );
    } else if (mat.runningOnParentCd) {
        return (
            <div className="bcv-1 pt-6 pb-6 pl-16 pr-16 br-4">
                <span className="cn-9 fw-6">Deployed on </span>
                <span className="cv-5 fw-6">{this.props.parentEnvironmentName}</span>
            </div>
        );
    }
  }

  renderMaterial() {
    let tabClasses = "transparent tab-list__tab-link tab-list__tab-link--vulnerability";
    return this.props.material.map((mat, index) => {
      let classes = `material-history material-history--cd ${mat.isSelected ? 'material-history-selected' : ''}`;
      return <div key={index} className={classes} >

        {this.renderSequentialCDCardTitle(mat)}

        <div className={`material-history__top ${!this.state.isSecurityModuleInstalled && mat.showSourceInfo?  'dc__border-bottom-n2': ''}`} style={{ 'cursor': `${mat.vulnerable ? 'not-allowed' : mat.isSelected ? 'default' : 'pointer'}` }}
          onClick={(event) => { event.stopPropagation(); if (!mat.vulnerable) this.props.selectImage(index, this.props.materialType) }}>
          <div>
           <div className="commit-hash commit-hash--docker"><img src={docker} alt="" className="commit-hash__icon" />{mat.image}</div>
           {this.props.stageType !== 'CD' && mat.latest  ? <span className="last-deployed-status">Last Run</span> : null}
         </div>
          {this.props.materialType === "none" ? null : <div className="material-history__info">
            <span className="trigger-modal__small-text">Deployed at:</span> <span>{mat.deployedTime}</span>
          </div>}
          <div className="material-history__select-text">
            {mat.vulnerable ? <span className="material-history__scan-error">Security Issues Found</span>
              : mat.isSelected ? <Check className="align-right icon-dim-24" /> : "Select"}
          </div>
        </div>
        {!this.props.isFromDeploymentGroup && <>
        {mat.showSourceInfo && <>
            {this.state.isSecurityModuleInstalled && <ul className="tab-list tab-list--vulnerability">
              <li className="tab-list__tab">
                <button type="button" onClick={(e) => { e.stopPropagation(); this.props.changeTab(index, Number(mat.id), CDModalTab.Changes) }}
                  className={mat.tab === CDModalTab.Changes ? `${tabClasses} active` : `${tabClasses}`}>
                  Changes
                </button>
              </li>
              <li className="tab-list__tab">
                <button type="button" onClick={(e) => { e.stopPropagation(); this.props.changeTab(index, Number(mat.id), CDModalTab.Security); }}
                  className={mat.tab === CDModalTab.Security ? `${tabClasses} active` : `${tabClasses}`}>
                  Security  {mat.vulnerabilitiesLoading ? `` : `(${mat.vulnerabilities.length})`}
                </button>
              </li>
            </ul>}
            {mat.tab === CDModalTab.Changes ? this.renderGitMaterialInfo(mat.materialInfo) : this.renderVulnerabilities(mat)}
          </>}
          <button type="button" className="material-history__changes-btn" onClick={(event) => { event.stopPropagation(); this.props.toggleSourceInfo(index) }}>
            {mat.showSourceInfo ? "Hide Source Info" : "Show Source Info"}
            <img src={arrow} alt="" style={{ 'transform': `${mat.showSourceInfo ? 'rotate(-180deg)' : ''}` }} />
          </button>
        </>}
      </div >
    })
  }

  deployTrigger(e) {
    e.stopPropagation()
    this.props.triggerDeploy(this.props.stageType)
  }

  renderCDModal() {
    let header = getCDModalHeader(this.props.stageType, this.props.envName);
    let buttonLabel = CDButtonLabelMap[this.props.stageType];
    let selectedImage = this.props.material.find(artifact => artifact.isSelected)
    return <>
      <div className="trigger-modal__header">
        <h1 className="modal__title">{header}</h1>
        <button type="button" className="transparent" onClick={(e) => this.props.closeCDModal()}><img alt="close" src={close} /></button>
      </div>
      <div className="trigger-modal__body">
        <div className="material-list__title">Select Image</div>
        {this.renderMaterial()}
      </div>
      <div className="trigger-modal__trigger">
        <ButtonWithLoader rootClassName="cta-with-img cta-with-img--trigger-btn"
          isLoading={this.props.isLoading}
          disabled={!selectedImage}
          loaderColor="#ffffff"
          onClick={(e) => this.deployTrigger(e)}>
          {this.props.stageType === 'CD' ? <img src={deploy} alt="deploy" className="trigger-btn__icon" />
            : <img src={play} alt="trigger" className="trigger-btn__icon" />}
          {buttonLabel}
        </ButtonWithLoader>
      </div>
    </>
  }

  render() {
    let header = getCDModalHeader(this.props.stageType, this.props.envName);
    return <VisibleModal className="" close={this.props.closeCDModal}>
      <div className="modal-body--cd-material" onClick={(e) => e.stopPropagation()}>
        {this.props.material.length > 0 ? this.renderCDModal()
          : <><div className="trigger-modal__header">
            <h1 className="modal__title">{header}</h1>
            <button type="button" className="transparent" onClick={(e) => this.props.closeCDModal()}><img alt="close" src={close} /></button>
          </div>
            <EmptyStateCdMaterial materialType={this.props.materialType} />
          </>}
      </div>
    </VisibleModal>
  }
}