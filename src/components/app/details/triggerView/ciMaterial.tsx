import React, { Component } from 'react'
import { CIMaterialProps, CIMaterialState } from './types'
import { ReactComponent as Play } from '../../../../assets/icons/misc/arrow-solid-right.svg'
import { ReactComponent as Question } from '../../../../assets/icons/appstatus/unknown.svg'
import { VisibleModal, ButtonWithLoader, Checkbox, showError, Progressing } from '../../../common'
import { TriggerViewContext } from './TriggerView'
import Tippy from '@tippyjs/react'
import GitInfoMaterial from '../../../common/GitInfoMaterial'
import { savePipeline } from '../../../ciPipeline/ciPipeline.service'
import { SourceTypeMap } from '../../../../config'
import { ServerErrors } from '../../../../modals/commonTypes'
import BranchRegexModal from './BranchRegexModal'

export class CIMaterial extends Component<CIMaterialProps, CIMaterialState> {
    constructor(props) {
        super(props)
        let regexValue: Record<
            number,
            {
                value: string
                isInvalid: boolean
            }
        > = {}
        this.props.material.forEach(
            (mat, index) =>
                (regexValue[mat.gitMaterialId] = {
                    value: mat.value,
                    isInvalid: mat.regex && !new RegExp(mat.regex).test(mat.value),
                }),
        )
        this.state = {
            regexValue: regexValue,
            selectedCIPipeline: props.filteredCIPipelines?.find((_ciPipeline) => _ciPipeline?.id == props.pipelineId),
        }
    }

    onClickStopPropagation = (e): void => {
        e.stopPropagation()
    }

    onClickTrigger = (): void => {}
    renderMaterialStartBuild = (context, canTrigger) => {
        return (
            <div className="trigger-modal__trigger">
                <Checkbox
                    isChecked={context.invalidateCache}
                    onClick={this.onClickStopPropagation}
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
                            onClickShowBranchRegexModal={this.props.onClickShowBranchRegexModal}
                        />
                    </div>
                    {this.props.showWebhookModal ? null : this.renderMaterialStartBuild(context, canTrigger)}
                </>
            )
        }
    }

    isRegexValueInvalid = (_cm): boolean => {
        const regExp = new RegExp(_cm.source.regex)
        const regVal = this.state.regexValue[_cm.gitMaterialId]
        if (!regExp.test(regVal.value)) {
            const _regexVal = {
                ...this.state.regexValue,
                [_cm.gitMaterialId]: { value: regVal.value, isInvalid: true },
            }
            this.setState({
                regexValue: _regexVal,
            })
            return
        }
    }

    onClickNextButton = (context) => {
        const payload: any = {
            appId: +this.props.match.params.appId,
            id: +this.props.workflowId,
            ciPipelineMaterial: [],
        }

        // Populate the ciPipelineMaterial with flatten object
        if (this.state.selectedCIPipeline?.ciMaterial?.length) {
            for (let _cm of this.state.selectedCIPipeline.ciMaterial) {
                const regVal = this.state.regexValue[_cm.gitMaterialId]
                let _updatedCM
                if (regVal?.value && _cm.source.regex) {
                    this.isRegexValueInvalid(_cm)

                    _updatedCM = {
                        ..._cm,
                        type: SourceTypeMap.BranchFixed,
                        value: regVal.value,
                        regex: _cm.source.regex,
                    }
                } else {
                    // To maintain the flatten object structure supported by API for unchanged values
                    // as during update/next click it uses the fetched ciMaterial structure i.e. containing source
                    _updatedCM = {
                        ..._cm,
                        ..._cm.source,
                    }
                }

                // Deleting as it's not required in the request payload
                delete _updatedCM['source']
                payload.ciPipelineMaterial.push(_updatedCM)
            }
        }

        savePipeline(payload, true)
            .then((response) => {
                if (response) {
                    this.props.getWorkflows()
                    // this.props.onCloseBranchRegexModal()
                    context.onClickCIMaterial(this.props.pipelineId, this.props.pipelineName)
                    // this.props.onShowCIModal()
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
            })
    }

    handleRegexInputValue = (id, value, mat) => {
        const isValid = new RegExp(mat.regex).test(value)
        this.setState((prevState) => {
            let rt = {
                regexValue: {
                    ...prevState.regexValue,
                    [id]: { value, isInvalid: mat.regex && !isValid },
                },
            }
            return rt
        })
    }

    renderCIMaterialModal = (context) => {
        return (
            <div className="modal-body--ci-material h-100" onClick={this.onClickStopPropagation}>
                {this.props.loader ? (
                    <div style={{ height: '100vh' }}>
                        <Progressing pageLoader />
                    </div>
                ) : (
                    <>
                        {this.props.showMaterialRegexModal && (
                            <BranchRegexModal
                                material={this.props.material}
                                selectedCIPipeline={this.state.selectedCIPipeline}
                                showWebhookModal={this.props.showWebhookModal}
                                title={this.props.title}
                                isChangeBranchClicked={this.props.isChangeBranchClicked}
                                context={context}
                                onClickNextButton={this.onClickNextButton}
                                onShowCIModal={this.props.onShowCIModal}
                                handleRegexInputValue={this.handleRegexInputValue}
                                regexValue={this.state.regexValue}
                                onCloseBranchRegexModal={this.props.onCloseBranchRegexModal}
                            />
                        )}
                        {this.props.showCIModal && this.renderCIModal(context)}
                    </>
                )}
            </div>
        )
    }

    render() {
        return (
            <TriggerViewContext.Consumer>
                {(context) => {
                    return (
                        <VisibleModal className="" close={context.closeCIModal}>
                            {this.renderCIMaterialModal(context)}
                        </VisibleModal>
                    )
                }}
            </TriggerViewContext.Consumer>
        )
    }
}
