import React, { Component } from 'react'
import { CIMaterialProps, CIMaterialState } from './types'
import { ReactComponent as Play } from '../../../../assets/icons/misc/arrow-solid-right.svg'
import { ReactComponent as Question } from '../../../../assets/icons/appstatus/unknown.svg'
import { VisibleModal, ButtonWithLoader, Checkbox, showError } from '../../../common'
import { EmptyStateCIMaterial } from './EmptyStateCIMaterial'
import { TriggerViewContext } from './TriggerView'
import Tippy from '@tippyjs/react'
import { MaterialHistory, CIMaterialType } from '../../details/triggerView/MaterialHistory'
import { MaterialSource } from '../../details/triggerView/MaterialSource'
import GitInfoMaterial from '../../../common/GitInfoMaterial'
import { ReactComponent as GitLab } from '../../../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../../../assets/icons/git/bitbucket.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import RightArrow from '../../../../assets/icons/ic-arrow-forward.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-alert-triangle.svg'

import { getCIPipeline, saveCIPipeline, savePipeline } from '../../../ciPipeline/ciPipeline.service'
import { ViewType, TriggerType, SourceTypeMap } from '../../../../config'
import { getCIMaterialList } from '../../service'
import { toast } from 'react-toastify'
import { ServerErrors } from '../../../../modals/commonTypes'
import { PatchAction } from '../../../ciPipeline/types'

export class CIMaterial extends Component<CIMaterialProps, CIMaterialState> {
    constructor(props) {
        super(props)

        this.state = {
            regexValue: {},
            isInvalidRegex: false,
            errorMessage: '',
        }
    }
    renderMaterialSource(context) {
        let refreshMaterial = {
            refresh: context.refreshMaterial,
            title: this.props.title,
            pipelineId: this.props.pipelineId,
        }
        return (
            <div className="material-list">
                <div className="material-list__title material-list__title--border-bottom">Material Source</div>
                <MaterialSource
                    material={this.props.material}
                    selectMaterial={context.selectMaterial}
                    refreshMaterial={refreshMaterial}
                />
            </div>
        )
    }

    // getCIPipelineRes = () => {
    //   getCIPipeline(this.props.match.params.appId )
    // }

    renderMaterialHistory(context, material: CIMaterialType) {
        let anyCommit = material.history && material.history.length > 0
        if (material.isMaterialLoading || material.isRepoError || material.isBranchError || !anyCommit) {
            //Error or Empty State
            return (
                <div className="select-material select-material--trigger-view">
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
                            onRetry={(e) => {
                                e.stopPropagation()
                                context.onClickCIMaterial(this.props.pipelineId, this.props.pipelineName)
                            }}
                            anyCommit={anyCommit}
                        />
                    </div>
                </div>
            )
        } else
            return (
                <div className="select-material select-material--trigger-view">
                    <div className="material-list__title"> Select Material </div>
                    <MaterialHistory
                        material={material}
                        pipelineName={this.props.pipelineName}
                        selectCommit={context.selectCommit}
                        toggleChanges={context.toggleChanges}
                    />
                </div>
            )
    }

    renderMaterialStartBuild = (context, canTrigger) => {
        return (
            <div className="trigger-modal__trigger">
                <Checkbox
                    isChecked={context.invalidateCache}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    rootClassName="form__checkbox-label--ignore-cache mb-0"
                    value={'CHECKED'}
                    onChange={context.toggleInvalidateCache}
                >
                    <span className="mr-5">Ignore Cache</span>
                </Checkbox>
                <Tippy
                    className="default-tt"
                    arrow={false}
                    placement="top"
                    content={
                        <span style={{ display: 'block', width: '200px' }}>
                            This will ignore previous cache and create a new one. Ignoring cache will lead to longer
                            build time.
                        </span>
                    }
                >
                    <Question className="icon-dim-20" />
                </Tippy>
                <ButtonWithLoader
                    rootClassName="cta-with-img cta-with-img--trigger-btn"
                    loaderColor="#ffffff"
                    disabled={!canTrigger}
                    isLoading={this.props.isLoading}
                    onClick={(e) => {
                        e.stopPropagation()
                        context.onClickTriggerCINode()
                    }}
                >
                    <Play className="trigger-btn__icon" />
                    Start Build
                </ButtonWithLoader>
            </div>
        )
    }

    renderCIModal(context) {
        let selectedMaterial = this.props.material.find((mat) => mat.isSelected)
        let commitInfo = this.props.material.find((mat) => mat.history)
        let canTrigger = this.props.material.reduce((isValid, mat) => {
            isValid = isValid && !mat.isMaterialLoading && !!mat.history.find((history) => history.isSelected)
            return isValid
        }, true)
        if (this.props.material.length > 0) {
            return (
                <>
                    <div>
                        <GitInfoMaterial
                            context={context}
                            material={this.props.material}
                            commitInfo={commitInfo}
                            title={this.props.title}
                            pipelineId={this.props.pipelineId}
                            pipelineName={this.props.pipelineName}
                            selectedMaterial={selectedMaterial}
                            showWebhookModal={this.props.showWebhookModal}
                            hideWebhookModal={this.props.hideWebhookModal}
                            toggleWebhookModal={this.props.toggleWebhookModal}
                            webhookPayloads={this.props.webhookPayloads}
                            isWebhookPayloadLoading={this.props.isWebhookPayloadLoading}
                            workflowId={this.props.workflowId}
                            renderBranchRegexModal={this.renderBranchRegexModal}
                            onClickShowBranchRegexModal={this.props.onClickShowBranchRegexModal}
                        />
                    </div>
                    {this.props.showWebhookModal ? null : this.renderMaterialStartBuild(context, canTrigger)}
                </>
            )
        }
    }

    renderBranchRegexMaterialHeader(close) {
        return (
            <div className="trigger-modal__header">
                <h1 className="modal__title flex left fs-16">{this.props.title}</h1>
                <button
                    type="button"
                    className="transparent"
                    onClick={() => {
                        close()
                    }}
                >
                    <Close className="" />
                </button>
            </div>
        )
    }

    onClickNextButton = (context) => {
        const _ciPipeline = this.props.filteredCIPipelines.find(
            (_ciPipeline) => _ciPipeline?.id == this.props.workflowId,
        )

        const payload: any = {
            ciPipeline: _ciPipeline,
        }
        payload.action = PatchAction.UPDATE_SOURCE
        payload.appId = +this.props.match.params.appId
        payload.appWorkflowId = +this.props.workflowId
        payload.ciPipeline.postBuildStage = {}
        payload.ciPipeline.preBuildStage = {}
        for (let _cm of payload.ciPipeline.ciMaterial) {
            const regVal = this.state.regexValue[_cm.gitMaterialId]
            if (regVal) {
                const regEx = _cm.source.find((_rc) => _rc.type === SourceTypeMap.BranchRegex)?.value
                if (regEx || regEx.includes('.*')) {
                    if (!regVal.match(regEx)) {
                        this.setState({ isInvalidRegex: true })
                        this.setState({ errorMessage: 'No matching value' })
                        return
                    }

                    _cm.source.push({
                        type: SourceTypeMap.BranchFixed,
                        value: regVal,
                    })
                }
            }
        }

        savePipeline(payload, true)
            .then((response) => {
                if (response) {
                    toast.success('Updated Pipeline')
                    this.setState({ isInvalidRegex: false })
                    this.props.onCloseBranchRegexModal()
                    context.onClickTriggerCINode()
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                this.setState({ isInvalidRegex: true })
            })
    }

    renderMaterialRegexFooterNextButton = (material, context) => {
        return (
            <div className="trigger-modal__trigger flex right">
                <button
                    className="cta"
                    onClick={(e) => {
                        this.onClickNextButton(context)
                        // this.props.onCloseBranchRegexModal()
                    }}
                >
                    Next
                    <img className="icon-dim-16 ml-8 scn-0" src={RightArrow} />
                </button>
            </div>
        )
    }

    handleRegexInputValue = (id, value) => {
        this.setState((prevState) => {
            return {
                regexValue: {
                    ...prevState.regexValue,
                    [id]: value,
                },
            }
        })
    }

    renderValidationErrorLabel = (message?: string): JSX.Element => {
        return (
            <div className="error-label flex left align-start fs-11 fw-4 mt-6 ml-36">
                <Error className="icon-dim-16" />
                <div className="ml-4 cr-5">{message}</div>
            </div>
        )
    }

    renderBranchRegexModal = (material, context) => {
        return (
            this.props.showMaterialRegexModal && (
                <>
                    <div>{this.renderBranchRegexMaterialHeader(context.closeCIModal)}</div>

                    <div className="select-material--regex-body m-20 fs-13">
                        <h4 className="mb-0 fw-6">Set a primary branch</h4>
                        <p className="mt-4">
                            Primary branch will be used to trigger automatic builds on every commit. This can be changed
                            later.
                        </p>
                        {material &&
                            material.map((mat, index) => {
                                return (
                                    <div className="border-bottom pb-20 pt-20" key={`regex_${index}`}>
                                        <div className="flex left">
                                            <span className="mr-14">
                                                {mat.gitMaterialUrl.includes('gitlab') ? <GitLab /> : null}
                                                {mat.gitMaterialUrl.includes('github') ? <GitHub /> : null}
                                                {mat.gitMaterialUrl.includes('bitbucket') ? <BitBucket /> : null}
                                                {mat.gitMaterialUrl.includes('gitlab') ||
                                                mat.gitMaterialUrl.includes('github') ||
                                                mat.gitMaterialUrl.includes('bitbucket') ? null : (
                                                    <Git />
                                                )}
                                            </span>
                                            <span>
                                                <div className="fw-6 fs-14">{mat.gitMaterialName}</div>
                                                <div className="pb-12">
                                                    Use branch name matching <span className="fw-6">{mat.value}</span>{' '}
                                                </div>
                                            </span>
                                        </div>
                                        <input
                                            tabIndex={1}
                                            placeholder="Enter branch name matching regex"
                                            className="form__input ml-36"
                                            name="name"
                                            value={this.state.regexValue[mat.gitMaterialId]}
                                            onChange={(e) =>
                                                this.handleRegexInputValue(mat.gitMaterialId, e.target.value)
                                            }
                                            autoFocus
                                            autoComplete="off"
                                        />
                                        {this.state.isInvalidRegex &&
                                            this.renderValidationErrorLabel(this.state.errorMessage)}
                                    </div>
                                )
                            })}
                    </div>
                    {this.props.showWebhookModal ? null : this.renderMaterialRegexFooterNextButton(material, context)}
                </>
            )
        )
    }

    render() {
        return (
            <TriggerViewContext.Consumer>
                {(context) => {
                    return (
                        <VisibleModal className="" close={context.closeCIModal}>
                            <div
                                className="modal-body--ci-material"
                                onClick={(e) => {
                                    e.stopPropagation()
                                }}
                            >
                                {this.props.renderShowCIModal &&
                                this.props.showMaterialRegexModal &&
                                this.props.material[0]?.type === SourceTypeMap.BranchRegex
                                    ? this.renderBranchRegexModal(this.props.material, context)
                                    : this.renderCIModal(context)}
                            </div>
                        </VisibleModal>
                    )
                }}
            </TriggerViewContext.Consumer>
        )
    }
}
