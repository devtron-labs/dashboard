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

import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import {
    ACTION_STATE,
    AnimatedDeployButton,
    ApiQueuingWithBatch,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CD_MATERIAL_SIDEBAR_TABS,
    CDMaterialResponseType,
    CDMaterialServiceEnum,
    CDMaterialSidebarType,
    CDMaterialType,
    CommonNodeAttr,
    ComponentSizeType,
    DEPLOYMENT_WINDOW_TYPE,
    DeploymentNodeType,
    DeploymentWindowProfileMetaData,
    Drawer,
    FilterStates,
    genericCDMaterialsService,
    GenericEmptyState,
    Icon,
    ImageComment,
    MODAL_TYPE,
    PipelineIdsVsDeploymentStrategyMap,
    ReleaseTag,
    RuntimePluginVariables,
    SelectPicker,
    showError,
    stopPropagation,
    ToastManager,
    ToastVariantType,
    TriggerBlockType,
    uploadCDPipelineFile,
    UploadFileProps,
    useGetUserRoles,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as UnAuthorized } from '@Icons/ic-locked.svg'
import { ReactComponent as Tag } from '@Icons/ic-tag.svg'
import { ReactComponent as Error } from '@Icons/ic-warning.svg'
import { getIsMaterialApproved } from '@Components/app/details/triggerView/cdMaterials.utils'

import emptyPreDeploy from '../../../../assets/img/empty-pre-deploy.webp'
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg'
import notAuthorized from '../../../../assets/img/ic-not-authorized.svg'
import CDMaterial from '../../../app/details/triggerView/cdMaterial'
import { BulkSelectionEvents, MATERIAL_TYPE, RuntimeParamsErrorState } from '../../../app/details/triggerView/types'
import { importComponentFromFELibrary } from '../../../common'
import { BulkCDDetailType, BulkCDTriggerType } from '../../AppGroup.types'
import { BULK_CD_DEPLOYMENT_STATUS, BULK_CD_MATERIAL_STATUS, BULK_CD_MESSAGING, BUTTON_TITLE } from '../../Constants'
import { BULK_ERROR_MESSAGES } from './constants'
import TriggerResponseModalBody, { TriggerResponseModalFooter } from './TriggerResponseModal'
import {
    getIsImageApprovedByDeployerSelected,
    getIsNonApprovedImageSelected,
    getSelectedAppListForBulkStrategy,
} from './utils'

const DeploymentWindowInfoBar = importComponentFromFELibrary('DeploymentWindowInfoBar')
const BulkDeployResistanceTippy = importComponentFromFELibrary('BulkDeployResistanceTippy')
const processDeploymentWindowMetadata = importComponentFromFELibrary(
    'processDeploymentWindowMetadata',
    null,
    'function',
)
const getDeploymentWindowStateAppGroup = importComponentFromFELibrary(
    'getDeploymentWindowStateAppGroup',
    null,
    'function',
)
const RuntimeParamTabs = importComponentFromFELibrary('RuntimeParamTabs', null, 'function')
const MissingPluginBlockState = importComponentFromFELibrary('MissingPluginBlockState', null, 'function')
const PolicyEnforcementMessage = importComponentFromFELibrary('PolicyEnforcementMessage')
const TriggerBlockedError = importComponentFromFELibrary('TriggerBlockedError', null, 'function')
const TriggerBlockEmptyState = importComponentFromFELibrary('TriggerBlockEmptyState', null, 'function')
const validateRuntimeParameters = importComponentFromFELibrary(
    'validateRuntimeParameters',
    () => ({ isValid: true, cellError: {} }),
    'function',
)
const SkipHibernatedCheckbox = importComponentFromFELibrary('SkipHibernatedCheckbox', null, 'function')
const SelectDeploymentStrategy = importComponentFromFELibrary('SelectDeploymentStrategy', null, 'function')
const BulkCDStrategy = importComponentFromFELibrary('BulkCDStrategy', null, 'function')

// TODO: Fix release tags selection
const BulkCDTrigger = ({
    stage,
    appList,
    closePopup,
    // NOTE: Using this to update the appList in the parent component, should remove this later
    updateBulkInputMaterial,
    // NOTE: Should trigger the bulk cd here only but since its also calling another parent function not refactoring right now
    onClickTriggerBulkCD,
    feasiblePipelineIds,
    responseList,
    isLoading,
    setLoading,
    isVirtualEnv,
    uniqueReleaseTags,
    runtimeParams,
    setRuntimeParams,
    bulkDeploymentStrategy,
    setBulkDeploymentStrategy,
    runtimeParamsErrorState,
    setRuntimeParamsErrorState,
}: BulkCDTriggerType) => {
    const { canFetchHelmAppStatus } = useMainContext()
    const [selectedApp, setSelectedApp] = useState<BulkCDDetailType>(
        appList.find((app) => !app.warningMessage) || appList[0],
    )
    const [tagNotFoundWarningsMap, setTagNotFoundWarningsMap] = useState<Map<number, string>>(new Map())
    const [unauthorizedAppList, setUnauthorizedAppList] = useState<Record<number, boolean>>({})
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const [appSearchTextMap, setAppSearchTextMap] = useState<Record<number, string>>({})
    const [selectedImages, setSelectedImages] = useState<Record<number, string>>({})
    // This signifies any action that needs to be propagated to the child
    const [selectedImageFromBulk, setSelectedImageFromBulk] = useState<string>(null)
    const [appDeploymentWindowMap, setAppDeploymentWindowMap] = useState<
        Record<number, DeploymentWindowProfileMetaData>
    >({})
    const [isPartialActionAllowed, setIsPartialActionAllowed] = useState(false)
    const [showResistanceBox, setShowResistanceBox] = useState(false)
    const [currentSidebarTab, setCurrentSidebarTab] = useState<CDMaterialSidebarType>(CDMaterialSidebarType.IMAGE)
    const [skipHibernatedApps, setSkipHibernatedApps] = useState<boolean>(false)
    const [showStrategyFeasibilityPage, setShowStrategyFeasibilityPage] = useState<boolean>(false)
    const [pipelineIdVsStrategyMap, setPipelineIdVsStrategyMap] = useState<PipelineIdsVsDeploymentStrategyMap>({})

    const location = useLocation()
    const history = useHistory()
    const { isSuperAdmin } = useGetUserRoles()
    const isBulkDeploymentTriggered = useRef(false)

    const showRuntimeParams =
        RuntimeParamTabs && (stage === DeploymentNodeType.PRECD || stage === DeploymentNodeType.POSTCD)

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const search = searchParams.get('search')
        const _appSearchTextMap = { ...appSearchTextMap }

        if (search) {
            _appSearchTextMap[selectedApp.appId] = search
        } else {
            delete _appSearchTextMap[selectedApp.appId]
        }

        setAppSearchTextMap(_appSearchTextMap)
    }, [location])

    const closeBulkCDModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        abortControllerRef.current.abort()
        closePopup(e)
    }

    const [selectedTagName, setSelectedTagName] = useState<{ label: string; value: string }>({
        label: 'latest',
        value: 'latest',
    })

    const handleSidebarTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentSidebarTab(e.target.value as CDMaterialSidebarType)
    }

    const handleRuntimeParamError = (errorState: RuntimeParamsErrorState) => {
        setRuntimeParamsErrorState((prevErrorState) => ({
            ...prevErrorState,
            [selectedApp.appId]: errorState,
        }))
    }

    const handleRuntimeParamChange = (currentAppRuntimeParams: RuntimePluginVariables[]) => {
        const clonedRuntimeParams = structuredClone(runtimeParams)
        clonedRuntimeParams[selectedApp.appId] = currentAppRuntimeParams
        setRuntimeParams(clonedRuntimeParams)
    }

    const bulkUploadFile = ({ file, allowedExtensions, maxUploadSize }: UploadFileProps) =>
        uploadCDPipelineFile({
            file,
            allowedExtensions,
            maxUploadSize,
            appId: selectedApp.appId,
            envId: selectedApp.envId,
        })

    const getDeploymentWindowData = async (_cdMaterialResponse) => {
        const currentEnv = appList[0].envId
        const appEnvMap = []
        let _isPartialActionAllowed = false
        for (const appDetails of appList) {
            if (_cdMaterialResponse[appDetails.appId]) {
                appEnvMap.push({ appId: appDetails.appId, envId: appDetails.envId })
            }
        }
        const { result } = await getDeploymentWindowStateAppGroup(appEnvMap)
        const _appDeploymentWindowMap = {}
        result?.appData?.forEach((data) => {
            _appDeploymentWindowMap[data.appId] = processDeploymentWindowMetadata(
                data.deploymentProfileList,
                currentEnv,
            )
            if (!_isPartialActionAllowed) {
                _isPartialActionAllowed =
                    _appDeploymentWindowMap[data.appId].type === DEPLOYMENT_WINDOW_TYPE.BLACKOUT ||
                    !_appDeploymentWindowMap[data.appId].isActive
                        ? _appDeploymentWindowMap[data.appId].userActionState === ACTION_STATE.PARTIAL
                        : false
            }
        })
        setIsPartialActionAllowed(_isPartialActionAllowed)
        setAppDeploymentWindowMap(_appDeploymentWindowMap)
    }

    const resolveMaterialData = (_cdMaterialResponse, _unauthorizedAppList) => (response) => {
        if (response.status === 'fulfilled') {
            setRuntimeParams((prevState) => {
                const updatedRuntimeParams = { ...prevState }
                updatedRuntimeParams[response.value.appId] = response.value.runtimeParams || []
                return updatedRuntimeParams
            })

            _cdMaterialResponse[response.value.appId] = response.value
            // if first image does not have filerState.ALLOWED then unselect all images and set SELECT_NONE for selectedImage and for first app send the trigger of SELECT_NONE from selectedImageFromBulk
            if (
                response.value.materials?.length > 0 &&
                (response.value.materials[0].filterState !== FilterStates.ALLOWED ||
                    response.value.materials[0].vulnerable)
            ) {
                const updatedMaterials = response.value.materials.map((mat) => ({
                    ...mat,
                    isSelected: false,
                }))
                _cdMaterialResponse[response.value.appId] = {
                    ...response.value,
                    materials: updatedMaterials,
                }
                setSelectedImages((prevSelectedImages) => ({
                    ...prevSelectedImages,
                    [response.value.appId]: BulkSelectionEvents.SELECT_NONE,
                }))

                const _warningMessage = response.value.materials[0].vulnerable
                    ? 'has security vulnerabilities'
                    : 'is not eligible'

                setTagNotFoundWarningsMap((prevTagNotFoundWarningsMap) => {
                    const _tagNotFoundWarningsMap = new Map(prevTagNotFoundWarningsMap)
                    _tagNotFoundWarningsMap.set(
                        response.value.appId,
                        `Tag '${
                            selectedTagName.value?.length > 15
                                ? `${selectedTagName.value.substring(0, 10)}...`
                                : selectedTagName.value
                        }' ${_warningMessage}`,
                    )
                    return _tagNotFoundWarningsMap
                })
                if (response.value.appId === selectedApp.appId) {
                    setSelectedImageFromBulk(BulkSelectionEvents.SELECT_NONE)
                }
            } else if (response.value.materials?.length === 0) {
                setTagNotFoundWarningsMap((prevTagNotFoundWarningsMap) => {
                    const _tagNotFoundWarningsMap = new Map(prevTagNotFoundWarningsMap)
                    _tagNotFoundWarningsMap.set(
                        response.value.appId,
                        `Tag '${
                            selectedTagName.value?.length > 15
                                ? `${selectedTagName.value.substring(0, 10)}...`
                                : selectedTagName.value
                        }' not found`,
                    )
                    return _tagNotFoundWarningsMap
                })
            }

            delete _unauthorizedAppList[response.value.appId]
        } else {
            const errorReason = response?.reason
            if (errorReason?.code === 403) {
                _unauthorizedAppList[errorReason.appId] = true
            }
        }
    }

    const getCDMaterialFunction = (appDetails) => () =>
        // Not sending any query params since its not necessary on mount and filters and handled by other service)
        genericCDMaterialsService(
            CDMaterialServiceEnum.CD_MATERIALS,
            Number(appDetails.cdPipelineId),
            appDetails.stageType,
            abortControllerRef.current.signal,
            {
                offset: 0,
                size: 20,
            },
        )
            .then((data) => ({ appId: appDetails.appId, ...data }))
            .catch((e) => {
                if (!abortControllerRef.current.signal.aborted) {
                    throw { response: e?.response, appId: appDetails.appId }
                }
            })

    /**
     * Gets triggered during the mount state of the component through useEffect
     * Fetches the material data pushes them into promise list
     * Promise list is resolved using Promise.allSettled
     * If the promise is fulfilled, the data is pushed into cdMaterialResponse
     */
    const getMaterialData = (): void => {
        abortControllerRef.current = new AbortController()
        const _unauthorizedAppList: Record<number, boolean> = {}
        const _cdMaterialResponse: Record<string, CDMaterialResponseType> = {}
        abortControllerRef.current = new AbortController()
        const _cdMaterialFunctionsList = []
        for (const appDetails of appList) {
            if (!appDetails.warningMessage) {
                _unauthorizedAppList[appDetails.appId] = false
                _cdMaterialFunctionsList.push(getCDMaterialFunction(appDetails))
            }
        }

        if (!_cdMaterialFunctionsList.length) {
            setLoading(false)
            return
        }

        ApiQueuingWithBatch(_cdMaterialFunctionsList)
            .then(async (responses: any[]) => {
                responses.forEach(resolveMaterialData(_cdMaterialResponse, _unauthorizedAppList))
                if (getDeploymentWindowStateAppGroup) {
                    await getDeploymentWindowData(_cdMaterialResponse)
                }
                updateBulkInputMaterial(_cdMaterialResponse)
                setUnauthorizedAppList(_unauthorizedAppList)
                setLoading(false)
            })
            .catch((error) => {
                setLoading(false)
                showError(error)
            })
    }

    useEffect(() => {
        getMaterialData()
    }, [])

    const handleBackFromStrategySelection = () => {
        setShowStrategyFeasibilityPage(false)
        setPipelineIdVsStrategyMap({})
    }

    const renderHeaderSection = (): JSX.Element => (
        <div className="flex dc__content-space dc__border-bottom bg__primary px-20 py-12">
            <div className="flex dc__gap-16">
                {showStrategyFeasibilityPage && (
                    <Button
                        dataTestId="feasibility-back"
                        onClick={handleBackFromStrategySelection}
                        icon={<Icon name="ic-caret-left" color={null} />}
                        ariaLabel="back to select images"
                        showAriaLabelInTippy={false}
                        size={ComponentSizeType.xs}
                        variant={ButtonVariantType.secondary}
                        style={ButtonStyleType.neutral}
                    />
                )}
                <div className="flex fs-16 fw-4 lh-1-5 cn-9">
                    <span>{showStrategyFeasibilityPage ? 'Deployment feasibility for' : 'Deploy to'}</span>&nbsp;
                    <span className="dc__truncate fw-6">{appList[0].envName}</span>
                </div>
            </div>
            <Button
                dataTestId="bulk-cd-modal-close"
                onClick={closeBulkCDModal}
                size={ComponentSizeType.xs}
                icon={<Icon name="ic-close-large" size={null} color={null} />}
                ariaLabel="close bulk cd trigger modal"
                showAriaLabelInTippy={false}
                style={ButtonStyleType.negativeGrey}
                variant={ButtonVariantType.borderLess}
            />
        </div>
    )

    const changeApp = (e): void => {
        const updatedErrorState = validateRuntimeParameters(runtimeParams[selectedApp.appId])
        handleRuntimeParamError(updatedErrorState)
        if (!updatedErrorState.isValid) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: BULK_ERROR_MESSAGES.CHANGE_APPLICATION,
            })
            return
        }

        const _selectedApp = appList[e.currentTarget.dataset.index]
        setSelectedApp(_selectedApp)
        setSelectedImageFromBulk(selectedImages[_selectedApp.appId])

        if (appSearchTextMap[_selectedApp.appId]) {
            const newSearchParams = new URLSearchParams(location.search)
            newSearchParams.set('search', appSearchTextMap[_selectedApp.appId])

            history.push({
                search: newSearchParams.toString(),
            })
        } else {
            history.push({
                search: '',
            })
        }
    }

    const renderEmptyView = (): JSX.Element => {
        if (selectedApp.triggerBlockedInfo?.blockedBy === TriggerBlockType.MANDATORY_TAG) {
            return <TriggerBlockEmptyState stageType={selectedApp.stageType} appId={selectedApp.appId} />
        }

        if (selectedApp.isTriggerBlockedDueToPlugin) {
            const commonNodeAttrType: CommonNodeAttr['type'] =
                selectedApp.stageType === DeploymentNodeType.PRECD ? 'PRECD' : 'POSTCD'

            return (
                <MissingPluginBlockState
                    configurePluginURL={selectedApp.configurePluginURL}
                    nodeType={commonNodeAttrType}
                />
            )
        }

        if (unauthorizedAppList[selectedApp.appId]) {
            return (
                <GenericEmptyState
                    image={notAuthorized}
                    title={BULK_CD_MESSAGING.unauthorized.title}
                    subTitle={BULK_CD_MESSAGING.unauthorized.subTitle}
                />
            )
        }
        return (
            <GenericEmptyState
                image={emptyPreDeploy}
                title={`${selectedApp.name}  ${BULK_CD_MESSAGING[stage].title}`}
                subTitle={BULK_CD_MESSAGING[stage].subTitle}
            />
        )
    }

    const renderDeploymentWithoutApprovalWarning = (app: BulkCDDetailType) => {
        if (!app.isExceptionUser) {
            return null
        }

        const selectedMaterial: CDMaterialType = app.material?.find((mat: CDMaterialType) => mat.isSelected)

        if (!selectedMaterial || getIsMaterialApproved(selectedMaterial?.userApprovalMetadata)) {
            return null
        }

        return (
            <div className="flex left dc__gap-4 mb-4">
                <Icon name="ic-warning" color={null} size={14} />
                <p className="m-0 fs-12 lh-16 fw-4 cy-7">Non-approved image selected</p>
            </div>
        )
    }

    const renderAppWarningAndErrors = (app: BulkCDDetailType) => {
        const commonNodeAttrType: CommonNodeAttr['type'] =
            app.stageType === DeploymentNodeType.PRECD ? 'PRECD' : 'POSTCD'

        const warningMessage = app.warningMessage || appDeploymentWindowMap[app.appId]?.warningMessage

        const isAppSelected = selectedApp.appId === app.appId

        if (unauthorizedAppList[app.appId]) {
            return (
                <div className="flex left dc__gap-4">
                    <UnAuthorized className="icon-dim-12 warning-icon-y7 mr-4 dc__no-shrink" />
                    <span className="cy-7 fw-4 fs-12 dc__truncate">{BULK_CD_MESSAGING.unauthorized.title}</span>
                </div>
            )
        }

        if (tagNotFoundWarningsMap.has(app.appId)) {
            return (
                <div className="flex left top dc__gap-4">
                    <Error className="icon-dim-12 dc__no-shrink mt-5 alert-icon-r5-imp" />

                    <span className="fw-4 fs-12 cr-5 dc__truncate">{tagNotFoundWarningsMap.get(app.appId)}</span>
                </div>
            )
        }

        if (app.isTriggerBlockedDueToPlugin) {
            return (
                <PolicyEnforcementMessage
                    consequence={app.consequence}
                    configurePluginURL={app.configurePluginURL}
                    nodeType={commonNodeAttrType}
                    shouldRenderAdditionalInfo={isAppSelected}
                />
            )
        }

        if (app.triggerBlockedInfo?.blockedBy === TriggerBlockType.MANDATORY_TAG) {
            return <TriggerBlockedError stageType={app.stageType} />
        }

        if (!!warningMessage && !app.showPluginWarning) {
            return (
                <div className="flex left top dc__gap-4">
                    <Icon name="ic-warning" color={null} size={14} />
                    <span className="fw-4 fs-12 cy-7 dc__truncate">{warningMessage}</span>
                </div>
            )
        }

        if (app.showPluginWarning) {
            return (
                <PolicyEnforcementMessage
                    consequence={app.consequence}
                    configurePluginURL={app.configurePluginURL}
                    nodeType={commonNodeAttrType}
                    shouldRenderAdditionalInfo={isAppSelected}
                />
            )
        }

        return null
    }

    const responseListLength = responseList.length

    const renderBodySection = (): JSX.Element => {
        if (responseListLength) {
            return (
                <TriggerResponseModalBody
                    responseList={responseList}
                    isLoading={isLoading}
                    isVirtualEnv={isVirtualEnv}
                />
            )
        }

        if (isLoading) {
            const message = isBulkDeploymentTriggered.current
                ? BULK_CD_DEPLOYMENT_STATUS(appList.length, appList[0].envName)
                : BULK_CD_MATERIAL_STATUS(appList.length)
            return (
                <GenericEmptyState
                    SvgImage={MechanicalOperation}
                    title={message.title}
                    subTitle={message.subTitle}
                    contentClassName="text-center"
                />
            )
        }

        const updateCurrentAppMaterial = (matId: number, releaseTags?: ReleaseTag[], imageComment?: ImageComment) => {
            const updatedCurrentApp = selectedApp
            updatedCurrentApp?.material.forEach((mat) => {
                if (mat.id === matId) {
                    if (releaseTags) {
                        mat.imageReleaseTags = releaseTags
                    }
                    if (imageComment) {
                        mat.imageComment = imageComment
                    }
                }
            })
            updatedCurrentApp && setSelectedApp(updatedCurrentApp)
        }

        const _currentApp = appList.find((app) => app.appId === selectedApp.appId) ?? ({} as BulkCDDetailType)
        uniqueReleaseTags.sort((a, b) => a.localeCompare(b))

        const tagsList = ['latest', 'active']

        tagsList.push(...uniqueReleaseTags)
        const options = tagsList.map((tag) => ({ label: tag, value: tag }))

        const appWiseTagsToArtifactIdMapMappings = {}
        appList.forEach((app) => {
            if (!app.material?.length) {
                appWiseTagsToArtifactIdMapMappings[app.appId] = {}
            } else {
                const tagsToArtifactIdMap = { latest: 0 }
                for (let i = 0; i < app.material?.length; i++) {
                    const mat = app.material?.[i]
                    mat.imageReleaseTags?.forEach((imageTag) => {
                        tagsToArtifactIdMap[imageTag.tagName] = i
                    })

                    if (mat.deployed && mat.latest) {
                        tagsToArtifactIdMap['active'] = i
                    }
                }
                appWiseTagsToArtifactIdMapMappings[app.appId] = tagsToArtifactIdMap
            }
        })

        // Don't use it as single, use it through update function
        const selectImageLocal = (index: number, appId: number, selectedImageTag: string) => {
            setSelectedImages({ ...selectedImages, [appId]: selectedImageTag })

            if (appWiseTagsToArtifactIdMapMappings[appId][selectedTagName.value] !== index) {
                const _tagNotFoundWarningsMap = tagNotFoundWarningsMap
                _tagNotFoundWarningsMap.delete(appId)
                setTagNotFoundWarningsMap(_tagNotFoundWarningsMap)
                setSelectedTagName({ value: 'Multiple tags', label: 'Multiple tags' })
            } else {
                // remove warning if any
                const _tagNotFoundWarningsMap = new Map(tagNotFoundWarningsMap)
                _tagNotFoundWarningsMap.delete(appId)
                setTagNotFoundWarningsMap(_tagNotFoundWarningsMap)
            }
        }

        const parseApplistIntoCDMaterialResponse = (
            appListData: BulkCDDetailType,
            updatedMaterials?: CDMaterialType,
        ) => ({
            materials: updatedMaterials ?? appListData.material,
            requestedUserId: appListData.requestedUserId,
            approvalConfigData: appListData.approvalConfigData,
            appReleaseTagNames: appListData.appReleaseTags,
            tagsEditable: appListData.tagsEditable,
        })

        const handleTagChange = (selectedTag) => {
            setSelectedTagName(selectedTag)
            const _tagNotFoundWarningsMap = new Map()
            const _cdMaterialResponse: Record<string, any> = {}

            for (let i = 0; i < (appList?.length ?? 0); i++) {
                const app = appList[i]
                const tagsToArtifactIdMap = appWiseTagsToArtifactIdMapMappings[app.appId]
                let artifactIndex = -1
                if (typeof tagsToArtifactIdMap[selectedTag.value] !== 'undefined') {
                    artifactIndex = tagsToArtifactIdMap[selectedTag.value]
                }

                // Handling the behavior for excluded filter state
                if (artifactIndex !== -1) {
                    const selectedImageFilterState = app.material?.[artifactIndex]?.filterState

                    if (selectedImageFilterState !== FilterStates.ALLOWED) {
                        artifactIndex = -1
                        _tagNotFoundWarningsMap.set(
                            app.appId,
                            `Tag '${
                                selectedTag.value?.length > 15
                                    ? `${selectedTag.value.substring(0, 10)}...`
                                    : selectedTag.value
                            }' is not eligible`,
                        )
                    } else if (app.material?.[artifactIndex]?.vulnerable) {
                        artifactIndex = -1
                        _tagNotFoundWarningsMap.set(
                            app.appId,
                            `Tag '${
                                selectedTag.value?.length > 15
                                    ? `${selectedTag.value.substring(0, 10)}...`
                                    : selectedTag.value
                            }' has security vulnerabilities`,
                        )
                    }
                } else {
                    _tagNotFoundWarningsMap.set(
                        app.appId,
                        `Tag '${
                            selectedTag.value?.length > 15
                                ? `${selectedTag.value.substring(0, 10)}...`
                                : selectedTag.value
                        }' not found`,
                    )
                }

                if (artifactIndex !== -1 && selectedTag.value !== 'latest' && selectedTag.value !== 'active') {
                    const releaseTag = app.material[artifactIndex]?.imageReleaseTags.find(
                        (releaseTag) => releaseTag.tagName === selectedTag.value,
                    )
                    if (releaseTag?.deleted) {
                        artifactIndex = -1
                        _tagNotFoundWarningsMap.set(
                            app.appId,
                            `Tag '${
                                selectedTag.value?.length > 15
                                    ? `${selectedTag.value.substring(0, 10)}...`
                                    : selectedTag.value
                            }' is soft-deleted`,
                        )
                    }
                }

                if (artifactIndex !== -1) {
                    const selectedImageName = app.material?.[artifactIndex]?.image
                    const updatedMaterials: any = app.material?.map((mat, index) => ({
                        ...mat,
                        isSelected: index === artifactIndex,
                    }))

                    _cdMaterialResponse[app.appId] = parseApplistIntoCDMaterialResponse(app, updatedMaterials)

                    setSelectedImages((prevSelectedImages) => ({
                        ...prevSelectedImages,
                        [app.appId]: selectedImageName,
                    }))
                } else {
                    const updatedMaterials: any = app.material?.map((mat) => ({
                        ...mat,
                        isSelected: false,
                    }))

                    _cdMaterialResponse[app.appId] = parseApplistIntoCDMaterialResponse(app, updatedMaterials)

                    setSelectedImages((prevSelectedImages) => ({
                        ...prevSelectedImages,
                        [app.appId]: BulkSelectionEvents.SELECT_NONE,
                    }))
                }
            }

            updateBulkInputMaterial(_cdMaterialResponse)

            // Handling to behviour of current app to send a trigger to child
            const selectedImageName = _cdMaterialResponse[selectedApp.appId]?.materials?.find(
                (mat: CDMaterialType) => mat.isSelected === true,
            )?.image

            if (selectedImageName) {
                setSelectedImageFromBulk(selectedImageName)
            } else {
                setSelectedImageFromBulk(BulkSelectionEvents.SELECT_NONE)
            }

            setTagNotFoundWarningsMap(_tagNotFoundWarningsMap)
        }

        const updateBulkCDMaterialsItem = (singleCDMaterialResponse) => {
            const _cdMaterialResponse: Record<string, CDMaterialResponseType> = {}
            _cdMaterialResponse[selectedApp.appId] = singleCDMaterialResponse

            updateBulkInputMaterial(_cdMaterialResponse)

            const selectedArtifact = singleCDMaterialResponse?.materials?.find(
                (mat: CDMaterialType) => mat.isSelected === true,
            )

            if (selectedArtifact) {
                selectImageLocal(selectedArtifact.index, selectedApp.appId, selectedArtifact.image)
            }

            // Setting it to null since since only wants to trigger change inside if user changes app or tag
            setSelectedImageFromBulk(null)
        }

        return (
            <div className="bulk-ci-trigger">
                <div className="sidebar bg__primary dc__overflow-auto">
                    <div className="dc__position-sticky dc__top-0 pt-12 bg__primary">
                        {showRuntimeParams && (
                            <div className="px-16 pb-8">
                                <RuntimeParamTabs
                                    tabs={CD_MATERIAL_SIDEBAR_TABS}
                                    initialTab={currentSidebarTab}
                                    onChange={handleSidebarTabChange}
                                    hasError={{
                                        [CDMaterialSidebarType.PARAMETERS]:
                                            runtimeParamsErrorState[selectedApp.appId] &&
                                            !runtimeParamsErrorState[selectedApp.appId].isValid,
                                    }}
                                />
                            </div>
                        )}
                        {currentSidebarTab === CDMaterialSidebarType.IMAGE && (
                            <>
                                <span className="px-16">Select image by release tag</span>
                                <div className="tag-selection-dropdown px-16 pt-6 pb-12 dc__zi-1">
                                    <SelectPicker
                                        name="build-config__select-repository-containing-code"
                                        inputId="build-config__select-repository-containing-code"
                                        isSearchable
                                        options={options}
                                        value={selectedTagName}
                                        icon={<Tag className="ml-8 mt-8 mb-8 flex icon-dim-16" />}
                                        onChange={handleTagChange}
                                        isDisabled={false}
                                        classNamePrefix="build-config__select-repository-containing-code"
                                        autoFocus
                                    />
                                </div>
                            </>
                        )}
                        <div
                            className="dc__position-sticky dc__top-0 bg__primary dc__border-bottom fw-6 fs-13 cn-7 py-8 px-16"
                            style={{ zIndex: 0 }}
                        >
                            APPLICATIONS
                        </div>
                    </div>
                    {appList.map((app, index) => (
                        <div
                            key={`app-${app.appId}`}
                            className={`p-16 cn-9 fw-6 fs-13 dc__border-bottom-n1 cursor w-100 ${
                                app.appId === selectedApp.appId ? 'bg__tertiary' : ''
                            }`}
                            data-index={index}
                            onClick={changeApp}
                        >
                            {app.name}
                            {renderDeploymentWithoutApprovalWarning(app)}
                            {renderAppWarningAndErrors(app)}
                        </div>
                    ))}
                </div>
                <div className="main-content bg__tertiary w-100 dc__overflow-auto">
                    {selectedApp.warningMessage || unauthorizedAppList[selectedApp.appId] ? (
                        renderEmptyView()
                    ) : (
                        // TODO: Handle isSuperAdmin prop

                        <>
                            {DeploymentWindowInfoBar &&
                                appDeploymentWindowMap[selectedApp.appId] &&
                                appDeploymentWindowMap[selectedApp.appId].warningMessage && (
                                    <DeploymentWindowInfoBar
                                        excludedUserEmails={
                                            appDeploymentWindowMap[selectedApp.appId].excludedUserEmails
                                        }
                                        userActionState={appDeploymentWindowMap[selectedApp.appId].userActionState}
                                        warningMessage={appDeploymentWindowMap[selectedApp.appId].warningMessage}
                                    />
                                )}
                            <CDMaterial
                                key={selectedApp.appId}
                                materialType={MATERIAL_TYPE.inputMaterialList}
                                appId={selectedApp.appId}
                                envId={selectedApp.envId}
                                pipelineId={+selectedApp.cdPipelineId}
                                stageType={selectedApp.stageType}
                                isFromBulkCD
                                envName={selectedApp.envName}
                                closeCDModal={closeBulkCDModal}
                                triggerType={selectedApp.triggerType}
                                isLoading={isLoading}
                                parentPipelineId={selectedApp.parentPipelineId}
                                parentPipelineType={selectedApp.parentPipelineType}
                                parentEnvironmentName={selectedApp.parentEnvironmentName}
                                ciPipelineId={_currentApp.ciPipelineId}
                                updateCurrentAppMaterial={updateCurrentAppMaterial}
                                updateBulkCDMaterialsItem={updateBulkCDMaterialsItem}
                                selectedImageFromBulk={selectedImageFromBulk}
                                isSuperAdmin={isSuperAdmin}
                                bulkRuntimeParams={runtimeParams[selectedApp.appId] || []}
                                handleBulkRuntimeParamChange={handleRuntimeParamChange}
                                bulkRuntimeParamErrorState={
                                    runtimeParamsErrorState[selectedApp.appId] || { cellError: {}, isValid: true }
                                }
                                handleBulkRuntimeParamError={handleRuntimeParamError}
                                bulkUploadFile={bulkUploadFile}
                                bulkSidebarTab={currentSidebarTab}
                                selectedAppName={selectedApp.name}
                            />
                        </>
                    )}
                </div>
            </div>
        )
    }
    const hideResistanceBox = (): void => {
        setShowResistanceBox(false)
    }

    const onClickDeploy = (e: SyntheticEvent) => {
        if (showStrategyFeasibilityPage) {
            setShowStrategyFeasibilityPage(false)
        }
        if (isPartialActionAllowed && BulkDeployResistanceTippy && !showResistanceBox) {
            setShowResistanceBox(true)
        } else {
            isBulkDeploymentTriggered.current = true
            stopPropagation(e)
            onClickTriggerBulkCD(skipHibernatedApps, pipelineIdVsStrategyMap)
            setShowResistanceBox(false)
        }
    }

    const onClickStartDeploy = (e): void => {
        if (BulkCDStrategy && bulkDeploymentStrategy !== 'DEFAULT') {
            setShowStrategyFeasibilityPage(true)
            return
        }
        onClickDeploy(e)
    }

    const isDeployDisabled = (): boolean =>
        appList.every((app) => app.warningMessage || tagNotFoundWarningsMap.has(app.appId) || !app.material?.length)

    const renderFooterSection = (): JSX.Element => {
        if (responseListLength) {
            return (
                <TriggerResponseModalFooter
                    closePopup={closeBulkCDModal}
                    responseList={responseList}
                    isLoading={isLoading}
                    onClickRetryDeploy={onClickTriggerBulkCD}
                    skipHibernatedApps={skipHibernatedApps}
                    pipelineIdVsStrategyMap={pipelineIdVsStrategyMap}
                />
            )
        }

        const isCDStage = stage === DeploymentNodeType.CD
        const isDeployButtonDisabled: boolean = isDeployDisabled()
        const canDeployWithoutApproval = getIsNonApprovedImageSelected(appList)
        const canImageApproverDeploy = getIsImageApprovedByDeployerSelected(appList)
        const showSkipHibernatedCheckbox = !!SkipHibernatedCheckbox && canFetchHelmAppStatus

        return (
            <div
                className={`dc__border-top flex ${showSkipHibernatedCheckbox ? 'dc__content-space' : 'right'} bg__primary px-20 py-16`}
            >
                {showSkipHibernatedCheckbox && (
                    <SkipHibernatedCheckbox
                        isDeploymentLoading={isLoading}
                        envId={appList[0].envId}
                        envName={appList[0].envName}
                        appIds={appList.map((app) => app.appId)}
                        skipHibernated={skipHibernatedApps}
                        setSkipHibernated={setSkipHibernatedApps}
                    />
                )}
                <div className="flex dc__gap-8">
                    {isCDStage && SelectDeploymentStrategy && !isLoading && !responseListLength && (
                        <SelectDeploymentStrategy
                            pipelineIds={appList.map((app) => +app.cdPipelineId)}
                            isBulkStrategyChange
                            deploymentStrategy={bulkDeploymentStrategy}
                            setDeploymentStrategy={setBulkDeploymentStrategy}
                        />
                    )}
                    <div className="dc__position-rel tippy-over">
                        <AnimatedDeployButton
                            dataTestId="cd-trigger-deploy-button"
                            text={BUTTON_TITLE[stage]}
                            startIcon={<Icon name={isCDStage ? 'ic-rocket-launch' : 'ic-play-outline'} color={null} />}
                            onButtonClick={onClickStartDeploy}
                            disabled={isDeployButtonDisabled}
                            isLoading={isLoading}
                            animateStartIcon={isCDStage}
                            style={
                                canDeployWithoutApproval || canImageApproverDeploy
                                    ? ButtonStyleType.warning
                                    : ButtonStyleType.default
                            }
                            tooltipContent={
                                canDeployWithoutApproval || canImageApproverDeploy
                                    ? 'You are authorized to deploy as an exception user for some applications'
                                    : ''
                            }
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="bg__primary bulk-ci-trigger-container">
                {renderHeaderSection()}
                {BulkCDStrategy && showStrategyFeasibilityPage ? (
                    <BulkCDStrategy
                        envName={appList[0].envName}
                        onClickDeploy={onClickDeploy}
                        bulkDeploymentStrategy={bulkDeploymentStrategy}
                        pipelineIdVsStrategyMap={pipelineIdVsStrategyMap}
                        setPipelineIdVsStrategyMap={setPipelineIdVsStrategyMap}
                        appList={getSelectedAppListForBulkStrategy(appList, feasiblePipelineIds)}
                    />
                ) : (
                    <>
                        {renderBodySection()}
                        {renderFooterSection()}
                    </>
                )}
            </div>
            {showResistanceBox && (
                <BulkDeployResistanceTippy
                    actionHandler={onClickStartDeploy}
                    handleOnClose={hideResistanceBox}
                    modalType={MODAL_TYPE.DEPLOY}
                />
            )}
        </Drawer>
    )
}

export default BulkCDTrigger
