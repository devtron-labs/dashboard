import React, { useContext, useEffect, useState } from 'react'
import { CIMaterialProps, RegexValueType } from './types'
import { ReactComponent as Play } from '../../../../assets/icons/misc/arrow-solid-right.svg'
import { ReactComponent as Info } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as Storage } from '../../../../assets/icons/ic-storage.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { ReactComponent as RunIcon } from '../../../../assets/icons/ic-play-media.svg'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
import {
    VisibleModal,
    ButtonWithLoader,
    Checkbox,
    showError,
    Progressing,
    useAsync,
    stopPropagation,
} from '../../../common'
import GitInfoMaterial from '../../../common/GitInfoMaterial'
import { savePipeline } from '../../../ciPipeline/ciPipeline.service'
import { DOCUMENTATION, ModuleNameMap, SourceTypeMap, SOURCE_NOT_CONFIGURED } from '../../../../config'
import { ServerErrors } from '../../../../modals/commonTypes'
import BranchRegexModal from './BranchRegexModal'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import { TriggerViewContext } from './config'
import { IGNORE_CACHE_INFO } from './Constants'
import { getInitCIMaterialRegexValue } from './TriggerView.utils'

export default function CIMaterial(props: CIMaterialProps) {
    const context = useContext(TriggerViewContext)
    const [regexValue, setRegexValue] = useState<Record<number, RegexValueType>>(() =>
        getInitCIMaterialRegexValue(props.material),
    )
    const [savingRegexValue, setSavingRegexValue] = useState(false)
    const [selectedCIPipeline, setSelectedCIPipeline] = useState(null)
    const [, blobStorageStatus] = useAsync(() => getModuleConfigured(ModuleNameMap.BLOB_STORAGE), [])

    useEffect(() => {
        updateSelectedCIPipeline()
    }, [props.filteredCIPipelines, props.pipelineId])

    const updateSelectedCIPipeline = () => {
        if (props.filteredCIPipelines) {
            setSelectedCIPipeline(props.filteredCIPipelines.find((_ciPipeline) => _ciPipeline.id == props.pipelineId))
        }
    }

    const renderIgnoreCache = () => {
        if (props.isFirstTrigger) {
            return (
                <div className="flexbox">
                    <Info className="icon-dim-20 mr-8" />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.FirstTrigger.title}</div>
                        <div className="fw-4 fs-12">{IGNORE_CACHE_INFO.FirstTrigger.infoText}</div>
                    </div>
                </div>
            )
        } else if (!blobStorageStatus?.result?.enabled) {
            return (
                <div className="flexbox flex-align-center">
                    <Storage className="icon-dim-24 mr-8" />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.BlobStorageNotConfigured.title}</div>
                        <div className="fw-4 fs-12 flexbox">
                            <span>{IGNORE_CACHE_INFO.BlobStorageNotConfigured.infoText}</span>
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
        } else if (!props.isCacheAvailable) {
            return (
                <div className="flexbox">
                    <Info className="icon-dim-20 mr-8" />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.CacheNotAvailable.title}</div>
                        <div className="fw-4 fs-12">{IGNORE_CACHE_INFO.CacheNotAvailable.infoText}</div>
                    </div>
                </div>
            )
        } else {
            return (
                <Checkbox
                    isChecked={context.invalidateCache}
                    onClick={stopPropagation}
                    rootClassName="form__checkbox-label--ignore-cache mb-0"
                    value={'CHECKED'}
                    onChange={context.toggleInvalidateCache}
                >
                    <div className="mr-5">
                        <div className="fs-13 fw-6">{IGNORE_CACHE_INFO.IgnoreCache.title}</div>
                        <div className="fs-12 fw-4">{IGNORE_CACHE_INFO.IgnoreCache.infoText}</div>
                    </div>
                </Checkbox>
            )
        }
    }

    const handleStartBuildAction = (e) => {
        e.stopPropagation()
        context.onClickTriggerCINode()
    }

    const renderMaterialStartBuild = (canTrigger) => {
        return (
            <div className="trigger-modal__trigger">
                {!props.isJobView && renderIgnoreCache()}
                <ButtonWithLoader
                    rootClassName="cta-with-img cta-with-img--ci-trigger-btn"
                    loaderColor="#ffffff"
                    disabled={!canTrigger}
                    isLoading={props.isLoading}
                    onClick={handleStartBuildAction}
                >
                    {props.isJobView ? (
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

    const renderCIModal = () => {
        const selectedMaterial = props.material.find((mat) => mat.isSelected)
        const isMaterialActive = props.material.some((material) => material.active)

        const canTrigger = props.material.reduce((isValid, mat) => {
            isValid =
                (isValid && !mat.isMaterialLoading && !!mat.history.find((history) => history.isSelected)) ||
                (!mat.isDockerFileError && mat.branchErrorMsg === SOURCE_NOT_CONFIGURED && isMaterialActive)
            return isValid
        }, true)
        if (props.material.length > 0) {
            return (
                <>
                    <GitInfoMaterial
                        material={props.material}
                        title={props.title}
                        pipelineId={props.pipelineId}
                        pipelineName={props.pipelineName}
                        selectedMaterial={selectedMaterial}
                        showWebhookModal={props.showWebhookModal}
                        hideWebhookModal={props.hideWebhookModal}
                        toggleWebhookModal={props.toggleWebhookModal}
                        webhookPayloads={props.webhookPayloads}
                        isWebhookPayloadLoading={props.isWebhookPayloadLoading}
                        workflowId={props.workflowId}
                        onClickShowBranchRegexModal={props.onClickShowBranchRegexModal}
                        fromAppGrouping={props.fromAppGrouping}
                        appId={props.appId}
                        fromBulkCITrigger={false}
                        hideSearchHeader={false}
                        isJobView={props.isJobView}
                    />
                    {props.showWebhookModal ? null : renderMaterialStartBuild(canTrigger)}
                </>
            )
        }
    }

    const isRegexValueInvalid = (_cm): void => {
        const regExp = new RegExp(_cm.source.regex)
        const regVal = regexValue[_cm.gitMaterialId]
        if (!regExp.test(regVal.value)) {
            const _regexVal = {
                ...regexValue,
                [_cm.gitMaterialId]: { value: regVal.value, isInvalid: true },
            }
            setRegexValue(_regexVal)
        }
    }

    const onClickNextButton = () => {
        setSavingRegexValue(true)

        const payload: any = {
            appId: +props.match.params.appId,
            id: +props.workflowId,
            ciPipelineMaterial: [],
        }

        // Populate the ciPipelineMaterial with flatten object
        if (selectedCIPipeline?.ciMaterial?.length) {
            for (const _cm of selectedCIPipeline.ciMaterial) {
                const regVal = regexValue[_cm.gitMaterialId]
                let _updatedCM
                if (regVal?.value && _cm.source.regex) {
                    isRegexValueInvalid(_cm)

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
                    props.getWorkflows()
                    context.onClickCIMaterial(`${props.pipelineId}`, props.pipelineName)
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
            })
            .finally(() => {
                setSavingRegexValue(false)
            })
    }

    const handleRegexInputValue = (id, value, mat) => {
        setRegexValue((prevState) => ({
            ...prevState,
            [id]: { value, isInvalid: mat.regex && !new RegExp(mat.regex).test(value) },
        }))
    }

    const renderCIMaterialModal = () => {
        return (
            <div className="modal-body--ci-material h-100" onClick={stopPropagation}>
                {props.loader ? (
                    <>
                        <div className="trigger-modal__header flex right">
                            <button type="button" className="dc__transparent" onClick={context.closeCIModal}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={{ height: 'calc(100% - 55px)' }}>
                            <Progressing pageLoader />
                        </div>
                    </>
                ) : (
                    <>
                        {props.showMaterialRegexModal && (
                            <BranchRegexModal
                                material={props.material}
                                selectedCIPipeline={selectedCIPipeline}
                                showWebhookModal={props.showWebhookModal}
                                title={props.title}
                                isChangeBranchClicked={props.isChangeBranchClicked}
                                onClickNextButton={onClickNextButton}
                                onShowCIModal={props.onShowCIModal}
                                handleRegexInputValue={handleRegexInputValue}
                                regexValue={regexValue}
                                onCloseBranchRegexModal={props.onCloseBranchRegexModal}
                                savingRegexValue={savingRegexValue}
                            />
                        )}
                        {props.showCIModal && renderCIModal()}
                    </>
                )}
            </div>
        )
    }

    return (
        <VisibleModal className="" close={context.closeCIModal}>
            {renderCIMaterialModal()}
        </VisibleModal>
    )
}
