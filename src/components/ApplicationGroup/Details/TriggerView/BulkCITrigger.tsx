/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext, useEffect, useRef, useState } from 'react'
import {
    ServerErrors,
    Drawer,
    showError,
    stopPropagation,
    ConsequenceType,
    ConsequenceAction,
    useAsync,
    GenericEmptyState,
    CIMaterialSidebarType,
    ApiQueuingWithBatch,
    ModuleNameMap,
    SourceTypeMap,
    ToastManager,
    ToastVariantType,
    CIMaterialType,
    BlockedStateData,
    PromiseAllStatusType,
    CommonNodeAttr,
    Button,
    ButtonVariantType,
    ComponentSizeType,
    ButtonStyleType,
    RuntimePluginVariables,
    uploadCIPipelineFile,
    UploadFileProps,
    savePipeline,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { getCIPipelineURL, getParsedBranchValuesForPlugin, importComponentFromFELibrary } from '../../../common'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as PlayIcon } from '@Icons/ic-play-outline.svg'
import { ReactComponent as Warning } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as ICError } from '../../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as Storage } from '../../../../assets/icons/ic-storage.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import externalCiImg from '../../../../assets/img/external-ci.webp'
import linkedCDBuildCIImg from '../../../../assets/img/linked-cd-bulk-ci.webp'
import linkedCiImg from '../../../../assets/img/linked-ci.webp'
import { getModuleConfigured } from '../../../app/details/appDetails/appDetails.service'
import { DOCUMENTATION, SOURCE_NOT_CONFIGURED, URLS, ViewType } from '../../../../config'
import MaterialSource from '../../../app/details/triggerView/MaterialSource'
import { TriggerViewContext } from '../../../app/details/triggerView/config'
import { getCIMaterialList } from '../../../app/service'
import {
    HandleRuntimeParamChange,
    HandleRuntimeParamErrorState,
    RegexValueType,
} from '../../../app/details/triggerView/types'
import { EmptyView } from '../../../app/details/cicdHistory/History.components'
import BranchRegexModal from '../../../app/details/triggerView/BranchRegexModal'
import { BulkCIDetailType, BulkCITriggerType } from '../../AppGroup.types'
import { IGNORE_CACHE_INFO } from '../../../app/details/triggerView/Constants'
import TriggerResponseModalBody, { TriggerResponseModalFooter } from './TriggerResponseModal'
import { BULK_CI_BUILD_STATUS, BULK_CI_MATERIAL_STATUS, BULK_CI_MESSAGING } from '../../Constants'
import { processConsequenceData } from '../../AppGroup.utils'
import { getIsAppUnorthodox } from './utils'
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg'
import { BULK_ERROR_MESSAGES } from './constants'
import { GitInfoMaterial } from '@Components/common/helpers/GitInfoMaterialCard/GitInfoMaterial'
import { ReactComponent as LeftIcon } from '@Icons/ic-arrow-backward.svg'

const PolicyEnforcementMessage = importComponentFromFELibrary('PolicyEnforcementMessage')
const getCIBlockState: (...props) => Promise<BlockedStateData> = importComponentFromFELibrary(
    'getCIBlockState',
    null,
    'function',
)
const getRuntimeParams = importComponentFromFELibrary('getRuntimeParams', null, 'function')
const RuntimeParamTabs = importComponentFromFELibrary('RuntimeParamTabs', null, 'function')
const validateRuntimeParameters = importComponentFromFELibrary(
    'validateRuntimeParameters',
    () => ({ isValid: true, cellError: {} }),
    'function',
)

const BulkCITrigger = ({
    appList,
    closePopup,
    updateBulkInputMaterial,
    onClickTriggerBulkCI,
    getWebhookPayload,
    isShowRegexModal,
    responseList,
    isLoading,
    setLoading,
    runtimeParams,
    setRuntimeParams,
    runtimeParamsErrorState,
    setRuntimeParamsErrorState,
    setPageViewType,
    webhookPayloads,
    setWebhookPayloads,
    isWebhookPayloadLoading,
}: BulkCITriggerType) => {
    const [showRegexModal, setShowRegexModal] = useState(false)
    const [isChangeBranchClicked, setChangeBranchClicked] = useState(false)
    const [selectedApp, setSelectedApp] = useState<BulkCIDetailType>(appList[0])

    const [regexValue, setRegexValue] = useState<Record<number, RegexValueType>>({})
    const [appIgnoreCache, setAppIgnoreCache] = useState<Record<number, boolean>>({})
    const [appPolicy, setAppPolicy] = useState<Record<number, ConsequenceType>>({})
    const [currentSidebarTab, setCurrentSidebarTab] = useState<string>(CIMaterialSidebarType.CODE_SOURCE)
    const [isWebhookBulkCI, setIsWebhookBulkCI] = useState(false)

    const selectedMaterialList = appList.find((app) => app.appId === selectedApp.appId)?.material || []

    useEffect(() => {
        const selectedMaterialId = selectedMaterialList[0]?.id
        if (isWebhookBulkCI && selectedMaterialId) {
            getWebhookPayload(selectedMaterialId)
        }
    }, [JSON.stringify(selectedMaterialList), isWebhookBulkCI])

    const [blobStorageConfigurationLoading, blobStorageConfiguration] = useAsync(
        () => getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
        [],
    )
    const {
        selectMaterial,
        refreshMaterial,
    }: {
        selectMaterial: (materialId, pipelineId?: number) => void
        refreshMaterial: (ciNodeId: number, materialId: number, abortController?: AbortController) => void
    } = useContext(TriggerViewContext)
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const isBulkBuildTriggered = useRef(false)

    const closeBulkCIModal = (evt) => {
        abortControllerRef.current.abort()
        closePopup(evt)
    }

    useEffect(() => {
        for (const _app of appList) {
            appIgnoreCache[_app.ciPipelineId] = false
        }
        getMaterialData()
    }, [])

    const getInitSelectedRegexValue = (): Record<number, RegexValueType> => {
        if (selectedApp.appId) {
            const selectedMaterial = appList.find((app) => app.appId === selectedApp.appId).material

            if (selectedMaterial) {
                return selectedMaterial.reduce(
                    (acc, mat) => {
                        acc[mat.gitMaterialId] = {
                            value: mat.value,
                            isInvalid: mat.regex ? !new RegExp(mat.regex).test(mat.value) : false,
                        }
                        return acc
                    },
                    {} as Record<number, RegexValueType>,
                )
            }
        }
        return {}
    }

    const getRuntimeParamsData = async (_materialListMap: Record<string, any[]>): Promise<void> => {
        const runtimeParamsServiceList = appList.map((appDetails) => {
            if (getIsAppUnorthodox(appDetails) || !_materialListMap[appDetails.appId]) {
                return () => []
            }
            return () => getRuntimeParams(appDetails.ciPipelineId)
        })

        if (runtimeParamsServiceList.length) {
            try {
                // Appending any for legacy code, since we did not had generics in APIQueuingWithBatch
                const responses: any[] = await ApiQueuingWithBatch(runtimeParamsServiceList, true)
                const _runtimeParams: Record<string, RuntimePluginVariables[]> = {}
                responses.forEach((res, index) => {
                    _runtimeParams[appList[index]?.ciPipelineId] = res.value || []
                })
                setRuntimeParams(_runtimeParams)
            } catch (error) {
                setPageViewType(ViewType.ERROR)
                showError(error)
            }
        }
    }

    const getMaterialData = (): void => {
        abortControllerRef.current = new AbortController()
        const _CIMaterialPromiseFunctionList = appList.map((appDetails) =>
            getIsAppUnorthodox(appDetails)
                ? () => null
                : () =>
                      getCIMaterialList(
                          {
                              pipelineId: appDetails.ciPipelineId,
                          },
                          abortControllerRef.current.signal,
                      ),
        )
        if (_CIMaterialPromiseFunctionList?.length) {
            const _materialListMap: Record<string, any[]> = {}
            // TODO: Remove then and use async await
            ApiQueuingWithBatch(_CIMaterialPromiseFunctionList)
                .then(async (responses: any[]) => {
                    responses.forEach((res, index) => {
                        _materialListMap[appList[index]?.appId] = res.value?.['result']
                    })
                    await getPolicyEnforcementData(_materialListMap)
                    if (getRuntimeParams) {
                        await getRuntimeParamsData(_materialListMap)
                    }
                    updateBulkInputMaterial(_materialListMap)
                    if (!getIsAppUnorthodox(selectedApp)) {
                        setShowRegexModal(
                            isShowRegexModal(
                                selectedApp.appId,
                                +selectedApp.ciPipelineId,
                                _materialListMap[selectedApp.appId],
                            ),
                        )
                    }
                    setLoading(false)
                })
                .catch((error) => {
                    if (!abortControllerRef.current.signal.aborted) {
                        showError(error)
                        setLoading(false)
                    }
                })
        } else {
            setLoading(false)
        }
    }

    const handleRuntimeParamError: HandleRuntimeParamErrorState = (errorState) => {
        setRuntimeParamsErrorState((prevErrorState) => ({
            ...prevErrorState,
            [selectedApp.ciPipelineId]: errorState,
        }))
    }

    const handleRuntimeParamChange: HandleRuntimeParamChange = (currentAppRuntimeParams) => {
        const updatedRuntimeParams = structuredClone(runtimeParams)
        updatedRuntimeParams[selectedApp.ciPipelineId] = currentAppRuntimeParams
        setRuntimeParams(updatedRuntimeParams)
    }

    const uploadFile = ({ file, allowedExtensions, maxUploadSize }: UploadFileProps) =>
        uploadCIPipelineFile({
            file,
            allowedExtensions,
            maxUploadSize,
            appId: selectedApp.appId,
            ciPipelineId: +selectedApp.ciPipelineId,
        })

    const handleSidebarTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentSidebarTab(e.target.value as CIMaterialSidebarType)
    }

    const getPolicyEnforcementData = async (_materialListMap: Record<string, any[]>): Promise<void> => {
        if (!getCIBlockState) {
            return null
        }

        const policyPromiseFunctionList = appList.map((appDetails) => {
            if (getIsAppUnorthodox(appDetails) || !_materialListMap[appDetails.appId]) {
                return () => null
            }
            let branchNames = ''
            for (const material of _materialListMap[appDetails.appId]) {
                if (
                    (!material.isBranchError && !material.isRepoError && !material.isRegex) ||
                    material.value !== '--'
                ) {
                    branchNames += `${branchNames ? ',' : ''}${getParsedBranchValuesForPlugin(material.value)}`
                }
            }

            return !branchNames
                ? () => null
                : () => getCIBlockState(appDetails.ciPipelineId, appDetails.appId, branchNames, appDetails.name)
        })

        if (policyPromiseFunctionList?.length) {
            const policyListMap: Record<string, ConsequenceType> = {}
            try {
                const responses = await ApiQueuingWithBatch<BlockedStateData>(policyPromiseFunctionList, true)
                responses.forEach((res, index) => {
                    if (res.status === PromiseAllStatusType.FULFILLED) {
                        policyListMap[appList[index]?.appId] = res.value ? processConsequenceData(res.value) : null
                    }
                })
                setAppPolicy(policyListMap)
            } catch (error) {
                showError(error)
            }
        }
    }

    const onCloseWebhookModal = () => {
        setIsWebhookBulkCI(false)
        setWebhookPayloads(null)
    }

    const renderHeaderSection = (): JSX.Element | null => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bg__primary pt-16 pr-20 pb-16 pl-20">
                <div className="flex left dc__gap-12">
                    {isWebhookBulkCI && (
                        <Button
                            icon={<LeftIcon />}
                            onClick={onCloseWebhookModal}
                            ariaLabel="bulk-webhook-back"
                            dataTestId="build-deploy-pipeline-name-heading"
                            variant={ButtonVariantType.borderLess}
                            size={ComponentSizeType.xs}
                            showAriaLabelInTippy={false}
                            style={ButtonStyleType.neutral}
                        />
                    )}
                    <h2 className="fs-16 fw-6 lh-1-43 m-0">
                        {isWebhookBulkCI ? `${selectedApp.ciPipelineName} / All received webhooks` : 'Build image'}
                    </h2>
                </div>
                <Button
                    ariaLabel="bulk-ci-close-button"
                    dataTestId="Bulk close modal"
                    onClick={closeBulkCIModal}
                    variant={ButtonVariantType.borderLess}
                    size={ComponentSizeType.small}
                    icon={<Close />}
                    showAriaLabelInTippy={false}
                    style={ButtonStyleType.negativeGrey}
                    disabled={isLoading}
                />
            </div>
        )
    }

    const showBranchEditModal = (): void => {
        setShowRegexModal(true)
        setChangeBranchClicked(false)
        setRegexValue(getInitSelectedRegexValue())
    }

    const hideBranchEditModal = (e?): void => {
        if (e) {
            stopPropagation(e)
        }
        setShowRegexModal(false)
        setChangeBranchClicked(false)
    }

    const changeApp = (e): void => {
        const updatedErrorState = validateRuntimeParameters(runtimeParams[selectedApp.ciPipelineId])
        handleRuntimeParamError(updatedErrorState)
        if (!updatedErrorState.isValid) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: BULK_ERROR_MESSAGES.CHANGE_APPLICATION,
            })
            return
        }

        stopPropagation(e)
        const _selectedApp = appList[e.currentTarget.dataset.index]
        if (_selectedApp.appId !== selectedApp.appId) {
            setSelectedApp(_selectedApp)
            if (getIsAppUnorthodox(_selectedApp)) {
                setShowRegexModal(false)
            } else {
                setShowRegexModal(
                    isShowRegexModal(_selectedApp.appId, +_selectedApp.ciPipelineId, _selectedApp.material),
                )
            }
        }
    }

    const saveBranchName = () => {
        setLoading(true)
        const payload: any = {
            appId: selectedApp.appId,
            id: +selectedApp.workFlowId,
            ciPipelineMaterial: [],
        }

        const selectedCIPipeline = selectedApp.filteredCIPipelines?.find(
            (_ciPipeline) => _ciPipeline?.id == selectedApp.ciPipelineId,
        )
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

        savePipeline(payload, {
            isRegexMaterial: true,
            isTemplateView: false,
        })
            .then((response) => {
                if (response) {
                    getMaterialData()
                } else {
                    setLoading(true)
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                setLoading(false)
            })
    }

    const isRegexValueInvalid = (_cm): void => {
        const regExp = new RegExp(_cm.source.regex)
        const regVal = regexValue[_cm.gitMaterialId]
        if (!regExp.test(regVal.value)) {
            const _regexValue = { ...regexValue }
            _regexValue[_cm.gitMaterialId] = { value: regVal.value, isInvalid: true }
            setRegexValue(_regexValue)
        }
    }

    const handleRegexInputValueChange = (id: number, value: string, mat: CIMaterialType) => {
        const _regexValue = { ...regexValue }
        _regexValue[id] = { value, isInvalid: mat.regex && !new RegExp(mat.regex).test(value) }
        setRegexValue(_regexValue)
    }

    const renderMainContent = (): JSX.Element => {
        if (showRegexModal) {
            const selectedCIPipeline = selectedApp.filteredCIPipelines?.find(
                (_ciPipeline) => _ciPipeline?.id == selectedApp.ciPipelineId,
            )
            return (
                <BranchRegexModal
                    material={selectedMaterialList}
                    selectedCIPipeline={selectedCIPipeline}
                    title={selectedApp.ciPipelineName}
                    isChangeBranchClicked={isChangeBranchClicked}
                    onClickNextButton={saveBranchName}
                    handleRegexInputValue={handleRegexInputValueChange}
                    regexValue={regexValue}
                    onCloseBranchRegexModal={hideBranchEditModal}
                    savingRegexValue={isLoading}
                />
            )
        }
        if (selectedApp.isLinkedCD) {
            return (
                <GenericEmptyState
                    title={`${BULK_CI_MESSAGING.linkedCD.title(selectedApp.title)}`}
                    subTitle={BULK_CI_MESSAGING.linkedCD.subTitle(selectedApp.title)}
                    image={linkedCDBuildCIImg}
                />
            )
        }
        if (selectedApp.isLinkedCI) {
            return (
                <EmptyView
                    imgSrc={linkedCiImg}
                    title={`${selectedApp.name} ${BULK_CI_MESSAGING.emptyLinkedCI.title}`}
                    subTitle={BULK_CI_MESSAGING.emptyLinkedCI.subTitle}
                    link={`${URLS.APP}/${selectedApp.parentAppId}/${URLS.APP_CI_DETAILS}/${selectedApp.parentCIPipelineId}`}
                    linkText={BULK_CI_MESSAGING.emptyLinkedCI.linkText}
                />
            )
        }
        if (selectedApp.isWebhookCI) {
            return (
                <EmptyView
                    imgSrc={externalCiImg}
                    title={`${selectedApp.name}  ${BULK_CI_MESSAGING.webhookCI.title}`}
                    subTitle={BULK_CI_MESSAGING.webhookCI.subTitle}
                />
            )
        }

        const selectedMaterial = selectedMaterialList?.find((mat) => mat.isSelected)

        return (
            <GitInfoMaterial
                material={selectedMaterialList}
                title={selectedApp.ciPipelineName}
                pipelineId={selectedApp.ciPipelineId}
                pipelineName={selectedApp.ciPipelineName}
                selectedMaterial={selectedMaterial}
                workflowId={+selectedApp.workFlowId}
                onClickShowBranchRegexModal={showBranchEditModal}
                fromAppGrouping
                fromBulkCITrigger
                hideSearchHeader={selectedApp.hideSearchHeader}
                isCITriggerBlocked={appPolicy[selectedApp.appId]?.action === ConsequenceAction.BLOCK}
                isJobCI={selectedApp.isJobCI}
                currentSidebarTab={currentSidebarTab}
                handleSidebarTabChange={handleSidebarTabChange}
                runtimeParams={runtimeParams[selectedApp.ciPipelineId] || []}
                handleRuntimeParamChange={handleRuntimeParamChange}
                runtimeParamsErrorState={
                    runtimeParamsErrorState[selectedApp.ciPipelineId] || { cellError: {}, isValid: true }
                }
                handleRuntimeParamError={handleRuntimeParamError}
                uploadFile={uploadFile}
                appName={selectedApp?.name}
                isBulkCIWebhook={isWebhookBulkCI}
                setIsWebhookBulkCI={setIsWebhookBulkCI}
                webhookPayloads={webhookPayloads}
                isWebhookPayloadLoading={isWebhookPayloadLoading}
                isBulk
                appId={selectedApp.appId.toString()}
            />
        )
    }

    const handleChange = (e): void => {
        const _appIgnoreCache = { ...appIgnoreCache }
        _appIgnoreCache[selectedApp.ciPipelineId] = !_appIgnoreCache[selectedApp.ciPipelineId]
        setAppIgnoreCache(_appIgnoreCache)
    }

    const tippyContent = (tippyTile: string, tippyDescription: string): JSX.Element => {
        return (
            <div>
                <div className="fs-12 fw-6">{tippyTile}</div>
                <div className="fs-12 fw-4">{tippyDescription}</div>
            </div>
        )
    }

    const renderTippy = (infoText: string, tippyTile: string, tippyDescription: string): JSX.Element | null => {
        return (
            <Tippy
                className="default-tt w-200 fs-12"
                arrow={false}
                placement="right"
                content={tippyContent(tippyTile, tippyDescription)}
            >
                <div className="flex left cursor dc_width-max-content">
                    <InfoIcon className="icon-dim-20 info-icon-n6 mr-4" />
                    <span className="fw-4 fs-13 cn-9">{infoText}</span>
                </div>
            </Tippy>
        )
    }

    const renderCacheSection = (): JSX.Element | null => {
        if (!getIsAppUnorthodox(selectedApp) && !showRegexModal) {
            if (selectedApp.isFirstTrigger) {
                return renderTippy(
                    BULK_CI_MESSAGING.isFirstTrigger.infoText,
                    BULK_CI_MESSAGING.isFirstTrigger.title,
                    BULK_CI_MESSAGING.isFirstTrigger.subTitle,
                )
            }
            if (!selectedApp.isCacheAvailable) {
                return renderTippy(
                    BULK_CI_MESSAGING.cacheNotAvailable.infoText,
                    BULK_CI_MESSAGING.cacheNotAvailable.title,
                    BULK_CI_MESSAGING.cacheNotAvailable.subTitle,
                )
            }
            if (blobStorageConfiguration?.result.enabled) {
                return (
                    <div className="flex left mt-12 dc__border-top pt-12">
                        <input
                            type="checkbox"
                            className="mt-0-imp cursor"
                            data-app-id={selectedApp.appId}
                            checked={appIgnoreCache?.[selectedApp.ciPipelineId]}
                            id={`chkValidate-${selectedApp.appId}`}
                            onChange={handleChange}
                        />
                        <label className="fs-13 fw-4 cn-9 ml-10 mb-0">Ignore cache</label>
                    </div>
                )
            }
            return null
        }
    }

    const _refreshMaterial = (pipelineId: number, gitMaterialId: number) => {
        abortControllerRef.current = new AbortController()
        refreshMaterial(pipelineId, gitMaterialId, abortControllerRef.current)
    }

    const renderSelectedAppMaterial = (appId: number, selectedMaterialList: any[]): JSX.Element | null => {
        if (appId === selectedApp.appId && !!selectedMaterialList.length && !showRegexModal) {
            return (
                <>
                    <MaterialSource
                        material={selectedMaterialList}
                        selectMaterial={selectMaterial}
                        refreshMaterial={{
                            refresh: _refreshMaterial,
                            pipelineId: +selectedApp.ciPipelineId,
                        }}
                        ciPipelineId={+selectedApp.ciPipelineId}
                    />
                    {renderCacheSection()}
                </>
            )
        }
        return null
    }

    const renderAppName = (app: BulkCIDetailType, index: number): JSX.Element | null => {
        const nodeType: CommonNodeAttr['type'] = 'CI'

        return (
            <div
                className={`fw-6 fs-13 cn-9 pt-12 ${app.appId === selectedApp.appId ? 'pb-12' : ''}`}
                onClick={changeApp}
                data-index={index}
            >
                {app.name}
                {app.warningMessage && (
                    <span className="flex left cy-7 fw-4 fs-12">
                        <Warning className="icon-dim-12 warning-icon-y7 mr-4" />
                        {app.warningMessage}
                    </span>
                )}
                {app.appId !== selectedApp.appId && app.errorMessage && (
                    <span className="flex left cr-5 fw-4 fs-12">
                        <ICError className="icon-dim-12 mr-4 mw-14" />
                        <span className="dc__block dc__ellipsis-right">{app.errorMessage}</span>
                    </span>
                )}
                {appPolicy[app.appId] && PolicyEnforcementMessage && (
                    <PolicyEnforcementMessage
                        consequence={appPolicy[app.appId]}
                        configurePluginURL={getCIPipelineURL(
                            String(app.appId),
                            app.workFlowId,
                            true,
                            app.ciPipelineId,
                            false,
                            app.isJobCI,
                            false,
                        )}
                        nodeType={nodeType}
                        shouldRenderAdditionalInfo={app.appId === selectedApp.appId}
                    />
                )}
            </div>
        )
    }

    const renderBodySection = (): JSX.Element => {
        if (isLoading) {
            const message = isBulkBuildTriggered.current
                ? BULK_CI_BUILD_STATUS(appList.length)
                : BULK_CI_MATERIAL_STATUS(appList.length)
            return (
                <GenericEmptyState
                    SvgImage={MechanicalOperation}
                    title={message.title}
                    subTitle={message.subTitle}
                    contentClassName="text-center"
                />
            )
        }

        const sidebarTabs = Object.values(CIMaterialSidebarType).map((tabValue) => ({
            value: tabValue,
            label: tabValue,
        }))

        return isWebhookBulkCI ? (
            renderMainContent()
        ) : (
            <div className="bulk-ci-trigger">
                <div className="sidebar bg__primary dc__overflow-auto">
                    <div className="dc__position-sticky dc__top-0 bg__primary dc__border-bottom fw-6 fs-13 cn-9 p-12 ">
                        {RuntimeParamTabs ? (
                            <RuntimeParamTabs
                                tabs={sidebarTabs}
                                initialTab={currentSidebarTab}
                                onChange={handleSidebarTabChange}
                                hasError={{
                                    [CIMaterialSidebarType.PARAMETERS]:
                                        runtimeParamsErrorState[selectedApp.ciPipelineId] &&
                                        !runtimeParamsErrorState[selectedApp.ciPipelineId].isValid,
                                }}
                            />
                        ) : (
                            'Applications'
                        )}
                    </div>

                    {appList.map((app, index) => (
                        <div
                            className={`material-list pr-12 pl-12 pb-12 ${
                                app.appId === selectedApp.appId ? 'bg__tertiary' : 'dc__border-bottom-n1 cursor'
                            }`}
                            key={`app-${app.appId}`}
                        >
                            {renderAppName(app, index)}
                            {renderSelectedAppMaterial(app.appId, selectedMaterialList)}
                        </div>
                    ))}
                </div>
                <div className="main-content bg__tertiary dc__overflow-auto">{renderMainContent()}</div>
            </div>
        )
    }

    const onClickStartBuild = (e: React.MouseEvent): void => {
        isBulkBuildTriggered.current = true
        e.stopPropagation()
        onClickTriggerBulkCI(appIgnoreCache)
    }

    const onClickRetryBuild = (appsToRetry: Record<string, boolean>): void => {
        onClickTriggerBulkCI(appIgnoreCache, appsToRetry)
    }

    const isStartBuildDisabled = (): boolean => {
        return appList.some(
            (app) =>
                appPolicy[app.appId]?.action === ConsequenceAction.BLOCK ||
                (app.errorMessage &&
                    (app.errorMessage !== SOURCE_NOT_CONFIGURED ||
                        !app.material.some(
                            (_mat) => !_mat.isBranchError && !_mat.isRepoError && !_mat.isMaterialSelectionError,
                        ))),
        )
    }

    const renderFooterSection = (): JSX.Element => {
        const blobStorageNotConfigured = !blobStorageConfigurationLoading && !blobStorageConfiguration?.result?.enabled
        return (
            <div
                className={`dc__border-top flex right bg__primary px-20 py-16 ${
                    blobStorageNotConfigured ? 'dc__content-space' : ''
                }`}
            >
                {blobStorageNotConfigured && (
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
                                    rel="noreferrer"
                                >
                                    {IGNORE_CACHE_INFO.BlobStorageNotConfigured.configure}
                                </a>
                                <OpenInNew className="icon-dim-16 mt-3 ml-8" />
                            </div>
                        </div>
                    </div>
                )}
                <Button
                    dataTestId="start-build"
                    onClick={onClickStartBuild}
                    disabled={isStartBuildDisabled()}
                    isLoading={isLoading}
                    text="Start build"
                    startIcon={<PlayIcon />}
                />
            </div>
        )
    }

    const responseListLength = responseList.length

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="bg__primary bulk-ci-trigger-container">
                <div className="flexbox-col flex-grow-1 dc__overflow-hidden">
                    {renderHeaderSection()}
                    {responseListLength ? (
                        <TriggerResponseModalBody responseList={responseList} isLoading={isLoading} />
                    ) : (
                        renderBodySection()
                    )}
                </div>
                {!isWebhookBulkCI &&
                    (responseListLength ? (
                        <TriggerResponseModalFooter
                            closePopup={closePopup}
                            responseList={responseList}
                            isLoading={isLoading}
                            onClickRetryBuild={onClickRetryBuild}
                        />
                    ) : (
                        renderFooterSection()
                    ))}
            </div>
        </Drawer>
    )
}

export default BulkCITrigger
