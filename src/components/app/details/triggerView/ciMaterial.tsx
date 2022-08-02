import React, { Component } from 'react'
import { CIMaterialProps, CIMaterialState } from './types'
import { ReactComponent as Play } from '../../../../assets/icons/misc/arrow-solid-right.svg'
import { ReactComponent as Question } from '../../../../assets/icons/appstatus/unknown.svg'
import { VisibleModal, ButtonWithLoader, Checkbox, showError, Progressing } from '../../../common'
import { EmptyStateCIMaterial } from './EmptyStateCIMaterial'
import { TriggerViewContext } from './TriggerView'
import Tippy from '@tippyjs/react'
import { MaterialHistory, CIMaterialType } from '../../details/triggerView/MaterialHistory'
import { MaterialSource } from '../../details/triggerView/MaterialSource'
import GitInfoMaterial from '../../../common/GitInfoMaterial'
import { getCIPipeline, saveCIPipeline, savePipeline } from '../../../ciPipeline/ciPipeline.service'
import { SourceTypeMap } from '../../../../config'
import { getCIMaterialList } from '../../service'
import { toast } from 'react-toastify'
import { ServerErrors } from '../../../../modals/commonTypes'
import { PatchAction } from '../../../ciPipeline/types'
import BranchRegexModal from './BranchRegexModal'

export class CIMaterial extends Component<CIMaterialProps, CIMaterialState> {
    constructor(props) {
        super(props)

        this.state = {
            regexValue: {},
            selectedCIPipeline: props.filteredCIPipelines?.find((_ciPipeline) => _ciPipeline?.id == props.pipelineId),
            isChangeBranchClicked: 0,
            loader: false,
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

    setShowBranchChanged = () => {
        this.setState({
            isChangeBranchClicked: 1,
        })
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
                            onClickShowBranchRegexModal={this.props.onClickShowBranchRegexModal}
                            ciPipeline={this.state.selectedCIPipeline}
                            setShowBranchChanged={this.setShowBranchChanged}
                        />
                    </div>
                    {this.props.showWebhookModal ? null : this.renderMaterialStartBuild(context, canTrigger)}
                </>
            )
        }
    }

    onClickNextButton = (context) => {
        this.setState({
            loader: true,
        })
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
                    const regExp = new RegExp(_cm.source.regex)
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
                    toast.success('Updated Pipeline')
                    this.props.onCloseBranchRegexModal()
                    context.onClickCIMaterial(this.props.pipelineId, this.props.pipelineName)
                    this.props.onShowCIModal()
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
            })
            .finally(() => {
                this.setState({ loader: false })
            })
    }

    handleRegexInputValue = (id, value) => {
        this.setState((prevState) => {
            return {
                regexValue: {
                    ...prevState.regexValue,
                    [id]: { value, isInvalid: false },
                },
            }
        })
    }

    render() {
        return (
            <TriggerViewContext.Consumer>
                {(context) => {
                    let regexValue: Record<
                        number,
                        {
                            value: string
                            isInvalid: boolean
                        }
                    > = undefined
                    if (
                        Object.entries(this.state.regexValue).length === 0 &&
                        this.state.regexValue.constructor === Object
                    ) {
                        regexValue = {}
                        this.props.material.forEach(
                            (mat, index) =>
                                (regexValue[mat.gitMaterialId] = {
                                    value: mat.value,
                                    isInvalid: mat.regex && !new RegExp(mat.regex).test(mat.value),
                                }),
                        )
                    }
                    return (
                        <VisibleModal className="" close={context.closeCIModal}>
                            <div
                                className="modal-body--ci-material"
                                onClick={(e) => {
                                    e.stopPropagation()
                                }}
                            >
                                {this.props.showMaterialRegexModal && (
                                    <BranchRegexModal
                                        material={this.props.material}
                                        selectedCIPipeline={this.state.selectedCIPipeline}
                                        showWebhookModal={this.props.showWebhookModal}
                                        title={this.props.title}
                                        isChangeBranchClicked={this.state.isChangeBranchClicked}
                                        context={context}
                                        onClickNextButton={this.onClickNextButton}
                                        onShowCIModal={this.props.onShowCIModal}
                                        handleRegexInputValue={this.handleRegexInputValue}
                                        regexValue={regexValue || this.state.regexValue}
                                    />
                                )}
                                {this.props.showCIModal && this.renderCIModal(context)}
                            </div>
                        </VisibleModal>
                    )
                }}
            </TriggerViewContext.Consumer>
        )
    }
}
