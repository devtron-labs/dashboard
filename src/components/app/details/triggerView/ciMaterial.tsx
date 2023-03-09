import React, { Component } from 'react'
import { CIMaterialProps, CIMaterialState, RegexValueType } from './types'
import { ReactComponent as Play } from '../../../../assets/icons/misc/arrow-solid-right.svg'
import { ReactComponent as Info } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as Storage } from '../../../../assets/icons/ic-storage.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { ReactComponent as RunIcon } from '../../../../assets/icons/ic-play-media.svg'
import { VisibleModal, ButtonWithLoader, Checkbox, showError, Progressing } from '../../../common'
import GitInfoMaterial from '../../../common/GitInfoMaterial'
import { savePipeline } from '../../../ciPipeline/ciPipeline.service'
import { DOCUMENTATION, ModuleNameMap, SourceTypeMap, SOURCE_NOT_CONFIGURED } from '../../../../config'
import { ServerErrors } from '../../../../modals/commonTypes'
import BranchRegexModal from './BranchRegexModal'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import { TriggerViewContext } from './config'
import { IGNORE_CACHE_INFO } from './Constants'

export class CIMaterial extends Component<CIMaterialProps, CIMaterialState> {
    static contextType: React.Context<any> = TriggerViewContext

    constructor(props) {
        super(props)
        const regexValue: Record<number, RegexValueType> = {}
        this.props.material.forEach((mat) => {
            regexValue[mat.gitMaterialId] = {
                value: mat.value,
                isInvalid: mat.regex && !new RegExp(mat.regex).test(mat.value),
            }
        })
        this.state = {
            regexValue: regexValue,
            selectedCIPipeline: props.filteredCIPipelines?.find((_ciPipeline) => _ciPipeline?.id == props.pipelineId),
            isBlobStorageConfigured: false,
        }
    }

    componentDidMount() {
        this.getSecurityModuleStatus()
    }

    async getSecurityModuleStatus(): Promise<void> {
        try {
            const { result } = await getModuleConfigured(ModuleNameMap.BLOB_STORAGE)
            if (result?.enabled) {
                this.setState({ isBlobStorageConfigured: true })
            }
        } catch (error) {}
    }

    onClickStopPropagation = (e): void => {
        e.stopPropagation()
    }

    renderIgnoreCache = () => {
        if (this.props.isFirstTrigger) {
            return (
                <div className="flexbox">
                    <Info className="icon-dim-20 mr-8" />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.FirstTrigger.title}</div>
                        <div className="fw-4 fs-12">
                            {this.props.isJobView
                                ? IGNORE_CACHE_INFO.FirstTrigger.jobInfoText
                                : IGNORE_CACHE_INFO.FirstTrigger.infoText}
                        </div>
                    </div>
                </div>
            )
        } else if (!this.state.isBlobStorageConfigured) {
            return (
                <div className="flexbox flex-align-center">
                    <Storage className="icon-dim-24 mr-8" />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.BlobStorageNotConfigured.title}</div>
                        <div className="fw-4 fs-12 flexbox">
                            <span>
                                {this.props.isJobView
                                    ? IGNORE_CACHE_INFO.BlobStorageNotConfigured.jobInfoText
                                    : IGNORE_CACHE_INFO.BlobStorageNotConfigured.infoText}
                            </span>
                            <a
                                className="fs-12 fw-6 cb-5 dc__no-decor ml-4"
                                href={DOCUMENTATION.BLOB_STORAGE}
                                target="_blank"
                            >
                                {IGNORE_CACHE_INFO.BlobStorageNotConfigured.configure}
                            </a>
                            <OpenInNew className="icon-dim-16 mt-3 ml-8" />
                        </div>
                    </div>
                </div>
            )
        } else if (!this.props.isCacheAvailable) {
            return (
                <div className="flexbox">
                    <Info className="icon-dim-20 mr-8" />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.CacheNotAvailable.title}</div>
                        <div className="fw-4 fs-12">
                            {this.props.isJobView
                                ? IGNORE_CACHE_INFO.CacheNotAvailable.jobInfoText
                                : IGNORE_CACHE_INFO.CacheNotAvailable.infoText}
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <Checkbox
                    isChecked={this.context.invalidateCache}
                    onClick={this.onClickStopPropagation}
                    rootClassName="form__checkbox-label--ignore-cache mb-0"
                    value={'CHECKED'}
                    onChange={this.context.toggleInvalidateCache}
                >
                    <div className="mr-5">
                        <div className="fs-13 fw-6">{IGNORE_CACHE_INFO.IgnoreCache.title}</div>
                        <div className="fs-12 fw-4">
                            {this.props.isJobView
                                ? IGNORE_CACHE_INFO.IgnoreCache.jobInfoText
                                : IGNORE_CACHE_INFO.IgnoreCache.infoText}
                        </div>
                    </div>
                </Checkbox>
            )
        }
    }

    handleStartBuildAction = (e) => {
        e.stopPropagation()
        this.context.onClickTriggerCINode()
    }

    renderMaterialStartBuild = (canTrigger) => {
        return (
            <div className="trigger-modal__trigger">
                {this.renderIgnoreCache()}
                <ButtonWithLoader
                    rootClassName="cta-with-img cta-with-img--ci-trigger-btn"
                    loaderColor="#ffffff"
                    disabled={!canTrigger}
                    isLoading={this.props.isLoading}
                    onClick={this.handleStartBuildAction}
                >
                    {this.props.isJobView ? (
                        <>
                            <RunIcon className="trigger-job-btn__icon" />
                            Run Job
                        </>
                    ) : (
                        <>
                            <Play className="trigger-btn__icon" />
                            Start Build
                        </>
                    )}
                </ButtonWithLoader>
            </div>
        )
    }

    renderCIModal() {
        const selectedMaterial = this.props.material.find((mat) => mat.isSelected)
        const isMaterialActive = this.props.material.some((material) => material.active)

        const canTrigger = this.props.material.reduce((isValid, mat) => {
            isValid =
                (isValid && !mat.isMaterialLoading && !!mat.history.find((history) => history.isSelected)) ||
                (!mat.isDockerFileError && mat.branchErrorMsg === SOURCE_NOT_CONFIGURED && isMaterialActive)
            return isValid
        }, true)
        if (this.props.material.length > 0) {
            return (
                <>
                    <GitInfoMaterial
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
                        fromAppGrouping={this.props.fromAppGrouping}
                        appId={this.props.appId}
                        fromBulkCITrigger={false}
                        hideSearchHeader={false}
                        isJobView={this.props.isJobView}
                    />
                    {this.props.showWebhookModal ? null : this.renderMaterialStartBuild(canTrigger)}
                </>
            )
        }
    }

    isRegexValueInvalid = (_cm): void => {
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
        }
    }

    onClickNextButton = () => {
        const payload: any = {
            appId: +this.props.match.params.appId,
            id: +this.props.workflowId,
            ciPipelineMaterial: [],
        }

        // Populate the ciPipelineMaterial with flatten object
        if (this.state.selectedCIPipeline?.ciMaterial?.length) {
            for (const _cm of this.state.selectedCIPipeline.ciMaterial) {
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
                    this.context.onClickCIMaterial(this.props.pipelineId, this.props.pipelineName)
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
            })
    }

    handleRegexInputValue = (id, value, mat) => {
        this.setState((prevState) => {
            return {
                regexValue: {
                    ...prevState.regexValue,
                    [id]: { value, isInvalid: mat.regex && !new RegExp(mat.regex).test(value) },
                },
            }
        })
    }

    renderCIMaterialModal = () => {
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
                                onClickNextButton={this.onClickNextButton}
                                onShowCIModal={this.props.onShowCIModal}
                                handleRegexInputValue={this.handleRegexInputValue}
                                regexValue={this.state.regexValue}
                                onCloseBranchRegexModal={this.props.onCloseBranchRegexModal}
                            />
                        )}
                        {this.props.showCIModal && this.renderCIModal()}
                    </>
                )}
            </div>
        )
    }

    render() {
        return (
            <VisibleModal className="" close={this.context.closeCIModal}>
                {this.renderCIMaterialModal()}
            </VisibleModal>
        )
    }
}
