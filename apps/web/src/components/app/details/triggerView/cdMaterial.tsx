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
import ReactGA from 'react-ga4'
import { generatePath, Prompt, useHistory, useRouteMatch } from 'react-router-dom'
import {
    CDMaterialType,
    showError,
    Progressing,
    ConditionalWrap,
    InfoColourBar,
    noop,
    MaterialInfo,
    UserApprovalMetadataType,
    DeploymentNodeType,
    GenericEmptyState,
    FilterStates,
    stopPropagation,
    useAsync,
    genericCDMaterialsService,
    CDMaterialServiceEnum,
    useSearchString,
    handleUTCTime,
    ServerErrors,
    DeploymentAppTypes,
    FilterConditionsListType,
    useSuperAdmin,
    ImageCard,
    ExcludedImageNode,
    ImageCardAccordion,
    ArtifactInfo,
    ArtifactInfoProps,
    EXCLUDED_IMAGE_TOOLTIP,
    STAGE_TYPE,
    getIsMaterialInfoAvailable,
    ModuleNameMap,
    ModuleStatus,
    getGitCommitInfo,
    ImageTaggingContainerType,
    SequentialCDCardTitleProps,
    AnnouncementBanner,
    ButtonWithLoader,
    ACTION_STATE,
    MODAL_TYPE,
    DEPLOYMENT_WINDOW_TYPE,
    DeploymentWithConfigType,
    usePrompt,
    getIsRequestAborted,
    GitCommitInfoGeneric,
    ErrorScreenManager,
    useDownload,
    SearchBar,
    CDMaterialSidebarType,
    RuntimeParamsListItemType,
    CDMaterialResponseType,
    CD_MATERIAL_SIDEBAR_TABS,
    getIsManualApprovalConfigured,
    useUserEmail,
    ToastManager,
    ToastVariantType,
    EnvResourceType,
    abortPreviousRequests,
    AppDetailsPayload,
    ResponseType,
    ApiResponseResultType,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import {
    CDMaterialProps,
    CDMaterialState,
    FilterConditionViews,
    MATERIAL_TYPE,
    TriggerViewContextType,
    BulkSelectionEvents,
    RenderCTAType,
} from './types'
import close from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check-circle.svg'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as BackIcon } from '../../../../assets/icons/ic-arrow-backward.svg'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as InfoOutline } from '../../../../assets/icons/ic-info-outline.svg'
import { ReactComponent as SearchIcon } from '../../../../assets/icons/ic-search.svg'
import { ReactComponent as RefreshIcon } from '../../../../assets/icons/ic-arrows_clockwise.svg'
import { ReactComponent as PlayIC } from '../../../../assets/icons/misc/arrow-solid-right.svg'

import noArtifact from '../../../../assets/img/no-artifact@2x.png'
import { getCTAClass, importComponentFromFELibrary, useAppContext } from '../../../common'
import { CDButtonLabelMap, TriggerViewContext } from './config'
import { triggerCDNode } from '../../service'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import {
    LAST_SAVED_CONFIG_OPTION,
    SPECIFIC_TRIGGER_CONFIG_OPTION,
    LATEST_TRIGGER_CONFIG_OPTION,
} from './TriggerView.utils'
import { TRIGGER_VIEW_GA_EVENTS, CD_MATERIAL_GA_EVENT, TRIGGER_VIEW_PARAMS } from './Constants'
import { EMPTY_STATE_STATUS, TOAST_BUTTON_TEXT_VIEW_DETAILS } from '../../../../config/constantMessaging'
import { getInitialState, getWfrId } from './cdMaterials.utils'
import { DEFAULT_ROUTE_PROMPT_MESSAGE } from '../../../../config'
import { PipelineConfigDiff } from './PipelineConfigDiff'
import { usePipelineDeploymentConfig } from './PipelineConfigDiff/usePipelineDeploymentConfig'
import { PipelineConfigDiffStatusTile } from './PipelineConfigDiff/PipelineConfigDiffStatusTile'

const ApprovalInfoTippy = importComponentFromFELibrary('ApprovalInfoTippy')
const ExpireApproval = importComponentFromFELibrary('ExpireApproval')
const ApprovedImagesMessage = importComponentFromFELibrary('ApprovedImagesMessage')
const ApprovalEmptyState = importComponentFromFELibrary('ApprovalEmptyState')
const FilterActionBar = importComponentFromFELibrary('FilterActionBar')
const ConfiguredFilters = importComponentFromFELibrary('ConfiguredFilters')
const CDMaterialInfo = importComponentFromFELibrary('CDMaterialInfo')
const getDownloadManifestUrl = importComponentFromFELibrary('getDownloadManifestUrl', null, 'function')
const ImagePromotionInfoChip = importComponentFromFELibrary('ImagePromotionInfoChip', null, 'function')
const getDeploymentWindowProfileMetaData = importComponentFromFELibrary(
    'getDeploymentWindowProfileMetaData',
    null,
    'function',
)
const MaintenanceWindowInfoBar = importComponentFromFELibrary('MaintenanceWindowInfoBar')
const DeploymentWindowConfirmationDialog = importComponentFromFELibrary('DeploymentWindowConfirmationDialog')
const RuntimeParamTabs = importComponentFromFELibrary('RuntimeParamTabs', null, 'function')
const RuntimeParameters = importComponentFromFELibrary('RuntimeParameters', null, 'function')
const getIsImageApproverFromUserApprovalMetaData: (
    email: string,
    userApprovalMetadata: UserApprovalMetadataType,
) => boolean = importComponentFromFELibrary('getIsImageApproverFromUserApprovalMetaData', () => false, 'function')
const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')
const getSecurityScan: ({
    appId,
    envId,
    installedAppId,
}: AppDetailsPayload) => Promise<ResponseType<ApiResponseResultType>> = importComponentFromFELibrary(
    'getSecurityScan',
    null,
    'function',
)
const SecurityModalSidebar = importComponentFromFELibrary('SecurityModalSidebar', null, 'function')

const CDMaterial = ({
    materialType,
    appId,
    envId,
    pipelineId,
    stageType,
    isFromBulkCD,
    envName,
    closeCDModal,
    triggerType,
    isVirtualEnvironment,
    parentEnvironmentName,
    isLoading,
    // Handle the case of external pipeline, it might be undefined or zero in that case
    ciPipelineId,
    updateCurrentAppMaterial,
    hideInfoTabsContainer,
    isSaveLoading,
    // WARNING: Be mindful that we need to send materials instead of material since its expecting response
    updateBulkCDMaterialsItem,
    // Have'nt sent this from Bulk since not required
    deploymentAppType,
    selectedImageFromBulk,
    isRedirectedFromAppDetails,
    selectedAppName,
    bulkRuntimeParams,
    handleBulkRuntimeParamChange,
    handleBulkRuntimeParamError,
    bulkSidebarTab,
}: Readonly<CDMaterialProps>) => {
    // stageType should handle approval node, compute CDMaterialServiceEnum, create queryParams state
    // FIXME: the query params returned by useSearchString seems faulty
    const history = useHistory()
    const { path, params } = useRouteMatch()
    const { searchParams } = useSearchString()
    const { handleDownload } = useDownload()
    // Add dep here
    const { isSuperAdmin } = useSuperAdmin()
    // NOTE: Won't be available in app group will use data from props for that
    // DO Not consume directly, use appName variable instead
    const { currentAppName } = useAppContext()

    const appName = selectedAppName || currentAppName
    const { email } = useUserEmail()

    const searchImageTag = searchParams.search
    const isScanV2Enabled = window._env_.ENABLE_RESOURCE_SCAN_V2 && !!isFELibAvailable

    const [material, setMaterial] = useState<CDMaterialType[]>([])
    const [state, setState] = useState<CDMaterialState>(getInitialState(materialType, material, searchImageTag))
    // It is derived from materialResult and can be fixed as a constant fix this
    const [isConsumedImageAvailable, setIsConsumedImageAvailable] = useState<boolean>(false)
    // Should be able to abort request using useAsync
    const abortControllerRef = useRef(new AbortController())
    const abortDeployRef = useRef(null)

    const isPreOrPostCD = stageType === DeploymentNodeType.PRECD || stageType === DeploymentNodeType.POSTCD

    // TODO: Ask if pipelineId always changes on change of app else add appId as dependency
    const [loadingMaterials, responseList, materialsError, reloadMaterials] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    Promise.all([
                        genericCDMaterialsService(
                            materialType === MATERIAL_TYPE.rollbackMaterialList
                                ? CDMaterialServiceEnum.ROLLBACK
                                : CDMaterialServiceEnum.CD_MATERIALS,
                            pipelineId,
                            // Don't think need to set stageType to approval in case of approval node
                            stageType ?? DeploymentNodeType.CD,
                            abortControllerRef.current.signal,
                            // It is meant to fetch the first 20 materials
                            {
                                offset: 0,
                                size: 20,
                                search: searchImageTag,
                                // Since by default we are setting filterView to eligible and in case of no filters everything is eligible
                                // So there should'nt be any additional api call
                                // NOTE: Uncomment this when backend supports the filtering, there will be some minor handling like number of images in segmented control
                                // filter:
                                //     state.filterView === FilterConditionViews.ELIGIBLE && !state.searchApplied
                                //         ? CDMaterialFilterQuery.RESOURCE
                                //         : null,
                            },
                        ),
                        getDeploymentWindowProfileMetaData && !isFromBulkCD
                            ? getDeploymentWindowProfileMetaData(appId, envId)
                            : null,
                    ]),
                abortControllerRef,
            ),
        // NOTE: Add state.filterView if want to add filtering support from backend
        [pipelineId, stageType, materialType, searchImageTag],
        !!pipelineId,
    )

    const materialsResult: CDMaterialResponseType = responseList?.[0]
    const deploymentWindowMetadata = responseList?.[1] ?? {}

    const { onClickCDMaterial } = useContext<TriggerViewContextType>(TriggerViewContext)
    const [noMoreImages, setNoMoreImages] = useState<boolean>(false)
    const [tagsEditable, setTagsEditable] = useState<boolean>(false)
    const [appReleaseTagNames, setAppReleaseTagNames] = useState<string[]>([])
    const [showAppliedFilters, setShowAppliedFilters] = useState<boolean>(false)
    const [deploymentLoading, setDeploymentLoading] = useState<boolean>(false)
    const [appliedFilterList, setAppliedFilterList] = useState<FilterConditionsListType[]>([])
    // ----- RUNTIME PARAMS States (To be overridden by parent props in case of bulk) -------
    const [currentSidebarTab, setCurrentSidebarTab] = useState<CDMaterialSidebarType>(CDMaterialSidebarType.IMAGE)
    const [runtimeParamsList, setRuntimeParamsList] = useState<RuntimeParamsListItemType[]>([])
    const [runtimeParamsErrorState, setRuntimeParamsErrorState] = useState<boolean>(false)
    const [value, setValue] = useState()
    const [showDeploymentWindowConfirmation, setShowDeploymentWindowConfirmation] = useState(false)

    const resourceFilters = materialsResult?.resourceFilters ?? []
    const hideImageTaggingHardDelete = materialsResult?.hideImageTaggingHardDelete ?? false
    const requestedUserId = materialsResult?.requestedUserId ?? ''
    const userApprovalConfig = materialsResult?.userApprovalConfig
    const isApprovalConfigured = getIsManualApprovalConfigured(userApprovalConfig)
    const canApproverDeploy = materialsResult?.canApproverDeploy ?? false
    const showConfigDiffView = searchParams.mode === 'review-config' && searchParams.deploy && searchParams.diffView

    const {
        pipelineDeploymentConfigLoading,
        pipelineDeploymentConfig,
        deploymentConfigSelectorProps,
        diffFound,
        noLastDeploymentConfig,
        noSpecificDeploymentConfig,
        canDeployWithConfig,
        canReviewConfig,
        scopeVariablesConfig,
        urlFilters,
        lastDeploymentWfrId,
        errorConfig,
    } = usePipelineDeploymentConfig({
        appId,
        envId,
        appName,
        envName,
        isRollbackTriggerSelected: state.isRollbackTrigger,
        pipelineId,
        wfrId: getWfrId(state.selectedMaterial, material),
    })

    usePrompt({ shouldPrompt: deploymentLoading })

    /* ------------ Utils required in useEffect  ------------*/
    const getSecurityModuleStatus = async () => {
        try {
            const { result } = await getModuleInfo(ModuleNameMap.SECURITY)
            if (result?.status === ModuleStatus.INSTALLED) {
                setState((prevState) => ({ ...prevState, isSecurityModuleInstalled: true }))
            }
        } catch (error) {
            setState((prevState) => ({ ...prevState, isSecurityModuleInstalled: false }))
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Issue while fetching security module status',
            })
        }
    }

    // Ask whether this id is true or not
    const getCDArtifactId = () =>
        state.selectedMaterial ? state.selectedMaterial.id : material?.find((_mat) => _mat.isSelected)?.id

    const setSearchValue = (searchValue: string) => {
        const newParams: any = {
            ...searchParams,
            search: searchValue,
        }

        if (!searchValue) {
            delete newParams.search
        }

        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    /* ------------ UseEffects  ------------*/
    useEffect(() => {
        abortDeployRef.current = new AbortController()
        return () => {
            abortDeployRef.current.abort()
        }
    }, [])

    useEffect(() => {
        if (materialsError) {
            showError(materialsError)
            return
        }

        if (!loadingMaterials && materialsResult) {
            if (selectedImageFromBulk) {
                const selectedImageIndex = materialsResult.materials.findIndex(
                    (materialItem) => materialItem.image === selectedImageFromBulk,
                )
                if (selectedImageIndex === -1 && selectedImageFromBulk !== BulkSelectionEvents.SELECT_NONE) {
                    setSearchValue(selectedImageFromBulk)
                } else {
                    const _newMaterials = [...materialsResult.materials]
                    if (selectedImageIndex !== -1) {
                        _newMaterials[selectedImageIndex].isSelected = true
                        _newMaterials.forEach((mat, index) => {
                            if (index !== selectedImageIndex) {
                                mat.isSelected = false
                            }
                        })
                    } else {
                        _newMaterials.forEach((mat) => {
                            mat.isSelected = false
                        })
                    }

                    setTagsEditable(materialsResult.tagsEditable)
                    setAppReleaseTagNames(materialsResult.appReleaseTagNames)
                    setNoMoreImages(materialsResult.materials.length >= materialsResult.totalCount)
                    setRuntimeParamsList(materialsResult.runtimeParams || [])

                    setMaterial(_newMaterials)
                    const _isConsumedImageAvailable =
                        _newMaterials.some((materialItem) => materialItem.deployed && materialItem.latest) ?? false

                    setIsConsumedImageAvailable(_isConsumedImageAvailable)

                    getSecurityModuleStatus()

                    const _newBulkResponse = {
                        ...materialsResult,
                        materials: _newMaterials,
                    }
                    updateBulkCDMaterialsItem?.(_newBulkResponse)
                }
            } else {
                setTagsEditable(materialsResult.tagsEditable)
                setAppReleaseTagNames(materialsResult.appReleaseTagNames)
                setNoMoreImages(materialsResult.materials.length >= materialsResult.totalCount)
                setRuntimeParamsList(materialsResult.runtimeParams || [])

                setMaterial(materialsResult.materials)
                const _isConsumedImageAvailable =
                    materialsResult.materials?.some((materialItem) => materialItem.deployed && materialItem.latest) ??
                    false

                setIsConsumedImageAvailable(_isConsumedImageAvailable)

                getSecurityModuleStatus()

                updateBulkCDMaterialsItem?.(materialsResult)
            }
        }
    }, [materialsResult, loadingMaterials])

    useEffect(() => {
        // selectedImage is going to be updated since on selection of image we are updating the state
        if (selectedImageFromBulk && material?.length) {
            const selectedImageIndex = material.findIndex(
                (materialItem) => materialItem.image === selectedImageFromBulk,
            )

            if (selectedImageFromBulk === BulkSelectionEvents.SELECT_NONE) {
                const _newMaterials = [...material]
                _newMaterials.forEach((mat) => {
                    mat.isSelected = false
                })
                setMaterial([..._newMaterials])
                updateBulkCDMaterialsItem?.({
                    ...materialsResult,
                    materials: _newMaterials,
                })
            } else if (selectedImageIndex === -1) {
                setSearchValue(selectedImageFromBulk)
            } else if (!material[selectedImageIndex].isSelected) {
                const _newMaterials = [...material]
                _newMaterials[selectedImageIndex].isSelected = true
                _newMaterials.forEach((mat, index) => {
                    if (index !== selectedImageIndex) {
                        mat.isSelected = false
                    }
                })
                setMaterial([..._newMaterials])
                updateBulkCDMaterialsItem?.({
                    ...materialsResult,
                    materials: _newMaterials,
                })
            }
        }
    }, [material, selectedImageFromBulk])

    useEffect(() => {
        if (searchImageTag) {
            setState((prevState) => ({
                ...prevState,
                searchApplied: true,
                showSearch: true,
                searchText: searchImageTag,
            }))
        } else {
            setState((prevState) => ({
                ...prevState,
                searchApplied: false,
                showSearch: false,
                searchText: '',
            }))
        }
    }, [searchImageTag])

    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            selectedMaterial: material.find((_mat) => _mat.isSelected),
            areMaterialsPassingFilters:
                material.filter((materialDetails) => materialDetails.filterState === FilterStates.ALLOWED).length > 0,
        }))
        // The above states are derived from material so no need to make a state for them and shift the config diff here
    }, [material])

    const getInitialSelectedConfigToDeploy = () => {
        if (
            (materialType === MATERIAL_TYPE.rollbackMaterialList && !searchParams.deploy) ||
            searchParams.deploy === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG
        ) {
            return SPECIFIC_TRIGGER_CONFIG_OPTION
        }
        if (searchParams.deploy === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG) {
            return LATEST_TRIGGER_CONFIG_OPTION
        }
        return LAST_SAVED_CONFIG_OPTION
    }
    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            isRollbackTrigger: materialType === MATERIAL_TYPE.rollbackMaterialList,
            isSelectImageTrigger: materialType === MATERIAL_TYPE.inputMaterialList,
            selectedConfigToDeploy: getInitialSelectedConfigToDeploy(),
        }))
    }, [materialType])

    useEffect(() => {
        if (searchParams.deploy) {
            setState((prevState) => ({
                ...prevState,
                selectedConfigToDeploy: getInitialSelectedConfigToDeploy(),
            }))
        }
    }, [searchParams.deploy])

    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            filterView: FilterConditionViews.ELIGIBLE,
            showConfiguredFilters: false,
        }))
        setShowAppliedFilters(false)
    }, [appId])

    /* ------------ Helping utilities  ------------*/
    const handleImageSelection = (index: number, selectedMaterial: CDMaterialType) => {
        const _updatedMaterial = [...material]
        _updatedMaterial[index].isSelected = true

        _updatedMaterial.forEach((mat, _index) => {
            if (_index !== index) {
                mat.isSelected = false
            }
        })

        setMaterial(_updatedMaterial)
        if (
            (materialType === 'none' || state.isSelectImageTrigger) &&
            state.selectedMaterial?.image !== selectedMaterial.image
        ) {
            setState((prevState) => ({
                ...prevState,
                selectedMaterial,
            }))
        }

        // We have to update the parent state in case of bulkCD
        updateBulkCDMaterialsItem?.({
            ...materialsResult,
            materials: _updatedMaterial,
        })
    }

    const handleDisableFiltersView = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        setState((prevState) => ({
            ...prevState,
            showConfiguredFilters: false,
        }))
    }

    const handleRuntimeParamChange: typeof handleBulkRuntimeParamChange = (
        updatedRuntimeParams: RuntimeParamsListItemType[],
    ) => {
        setRuntimeParamsList(updatedRuntimeParams)
    }

    const handleRuntimeParamError = (errorState: boolean) => {
        setRuntimeParamsErrorState(errorState)
    }

    const clearSearch = (e: React.MouseEvent<HTMLButtonElement>): void => {
        stopPropagation(e)
        if (state.searchText) {
            setSearchValue('')
        }
    }

    const viewAllImages = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        if (isRedirectedFromAppDetails) {
            history.push({
                search: `${TRIGGER_VIEW_PARAMS.APPROVAL_NODE}=${pipelineId}&${TRIGGER_VIEW_PARAMS.APPROVAL_STATE}=${TRIGGER_VIEW_PARAMS.APPROVAL}`,
            })
        } else {
            closeCDModal(e)
            onClickCDMaterial(pipelineId, DeploymentNodeType.CD, true)
        }
    }

    const getIsApprovalRequester = (userApprovalMetadata?: UserApprovalMetadataType) =>
        userApprovalMetadata?.requestedUserData && userApprovalMetadata.requestedUserData.userId === requestedUserId

    const getIsImageApprover = (userApprovalMetadata?: UserApprovalMetadataType): boolean =>
        getIsImageApproverFromUserApprovalMetaData(email, userApprovalMetadata)

    // NOTE: Pure
    const getApprovedImageClass = (disableSelection: boolean, isApprovalConfigured: boolean) => {
        const disabledClassPostfix = disableSelection ? '-disabled' : ''
        return isApprovalConfigured ? `material-history__approved-image${disabledClassPostfix}` : ''
    }

    const toggleCardMode = (index) => {
        setState((prevState) => {
            const _isEditModeList = new Map(prevState.materialInEditModeMap)
            _isEditModeList.set(index, !_isEditModeList.get(index))
            return {
                ...prevState,
                materialInEditModeMap: _isEditModeList,
            }
        })
    }

    const processConsumedAndApprovedImages = () => {
        const consumedImage = []
        const approvedImages = []
        material.forEach((mat) => {
            if (!mat.userApprovalMetadata || mat.userApprovalMetadata.approvalRuntimeState !== 2) {
                mat.isSelected = false
                consumedImage.push(mat)
            } else {
                approvedImages.push(mat)
            }
        })
        return { consumedImage, approvedImages }
    }

    const getConsumedAndAvailableMaterialList = (isApprovalConfigured: boolean) => {
        let _consumedImage = []
        let materialList: CDMaterialType[] = []

        if (isApprovalConfigured) {
            const { consumedImage, approvedImages } = processConsumedAndApprovedImages()
            _consumedImage = consumedImage
            materialList = approvedImages
        } else {
            materialList = material
        }

        const eligibleImagesCount = materialList.filter((mat) => mat.filterState === FilterStates.ALLOWED).length

        if (!state.searchApplied && resourceFilters?.length && state.filterView === FilterConditionViews.ELIGIBLE) {
            materialList = materialList.filter((mat) => mat.filterState === FilterStates.ALLOWED)
        }

        return {
            consumedImage: _consumedImage,
            materialList,
            eligibleImagesCount,
        }
    }

    const handleRefresh = (e) => {
        stopPropagation(e)

        if (state.searchApplied) {
            reloadMaterials()
        } else {
            reloadMaterials()

            setState((prevState) => ({
                ...prevState,
                showSearch: false,
            }))
        }
    }

    const handleSearchClick = (e) => {
        stopPropagation(e)
        setState((prevState) => ({
            ...prevState,
            showSearch: true,
        }))
    }

    const handleInputChange = (event): void => {
        setState({
            ...state,
            searchText: event.target.value,
        })
    }

    const handleFilterKeyPress = (_searchText: string): void => {
        setState({
            ...state,
            searchText: _searchText,
        })
        if (_searchText !== searchImageTag) {
            setSearchValue(_searchText)
        }
    }

    const handleEnableFiltersView = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        setState((prevState) => ({
            ...prevState,
            showConfiguredFilters: true,
        }))
    }

    const handleSidebarTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (runtimeParamsErrorState) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve all the errors before switching tabs',
            })
            return
        }

        setCurrentSidebarTab(e.target.value as CDMaterialSidebarType)
    }

    const handleFilterTabsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation()
        const { value } = e.target
        setState((prevState) => ({
            ...prevState,
            filterView: value as FilterConditionViews,
        }))
    }

    const handleAllImagesView = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        setState((prevState) => ({
            ...prevState,
            filterView: FilterConditionViews.ALL,
        }))
    }

    const getFilterActionBarTabs = (filteredImagesCount: number, consumedImageCount: number) => [
        {
            label: `Eligible images ${filteredImagesCount}/${material.length - consumedImageCount}`,
            value: FilterConditionViews.ELIGIBLE,
        },
        {
            label: `Latest ${material.length - consumedImageCount} images`,
            value: FilterConditionViews.ALL,
        },
    ]

    const getConfigToDeployValue = () => {
        if (searchParams.deploy) {
            return searchParams.deploy
        } else {
            if (materialType === MATERIAL_TYPE.rollbackMaterialList) {
                return DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG
            } else {
                return DeploymentWithConfigType.LAST_SAVED_CONFIG
            }
        }
    }

    const onClickSetInitialParams = (modeParamValue: 'list' | 'review-config') => {
        const newParams = new URLSearchParams({
            ...searchParams,
            mode: modeParamValue,
            deploy: getConfigToDeployValue(),
            diffView: 'true',
        })

        if (modeParamValue === 'list') {
            newParams.delete('diffView')
            newParams.delete('sortOrder')
            newParams.delete('sortBy')
        }

        history.push({
            pathname:
                modeParamValue === 'review-config'
                    ? `${generatePath(path, params)}/${EnvResourceType.DeploymentTemplate}`
                    : generatePath(path, params),
            search: newParams.toString(),
        })
    }

    const isDeployButtonDisabled = () => {
        const selectedImage = material.find((artifact) => artifact.isSelected)

        return (
            !selectedImage ||
            !state.areMaterialsPassingFilters ||
            (state.isRollbackTrigger && (pipelineDeploymentConfigLoading || !canDeployWithConfig())) ||
            (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
                noLastDeploymentConfig)
        )
    }

    // NOTE: In the three functions below we already have data from props so can be handled in a better way
    const redirectToDeploymentStepsPage = (cdPipelineId: number, environmentId: number) => {
        history.push(`/app/${appId}/cd-details/${environmentId}/${cdPipelineId}`)
    }

    const handleTriggerErrorMessageForHelmManifestPush = (
        serverError: any,
        cdPipelineId: number,
        environmentId: number,
    ) => {
        if (
            serverError instanceof ServerErrors &&
            Array.isArray(serverError.errors) &&
            serverError.code !== 403 &&
            serverError.code !== 408
        ) {
            serverError.errors.map(({ userMessage, internalMessage }) => {
                ToastManager.showToast(
                    {
                        variant: ToastVariantType.error,
                        description: userMessage ?? internalMessage,
                        buttonProps: {
                            text: TOAST_BUTTON_TEXT_VIEW_DETAILS,
                            dataTestId: 'cd-material-view-details-btns',
                            onClick: () => redirectToDeploymentStepsPage(cdPipelineId, environmentId),
                        },
                    },
                    {
                        autoClose: false,
                    },
                )
            })
        } else {
            showError(serverError)
        }
    }

    const getHelmPackageName = (helmPackageName: string, cdWorkflowType: string) => {
        // Not using WorkflowType enum since sending DeploymentNodeType
        if (cdWorkflowType === DeploymentNodeType.PRECD) {
            return `${helmPackageName} (Pre)`
        }
        if (cdWorkflowType === DeploymentNodeType.POSTCD) {
            return `${helmPackageName} (Post)`
        }
        return helmPackageName
    }

    const onClickManifestDownload = (appId: number, envId: number, helmPackageName: string, cdWorkflowType: string) => {
        if (!getDownloadManifestUrl) {
            return
        }
        const downloadManifestDownload = {
            appId,
            envId,
            appName: getHelmPackageName(helmPackageName, cdWorkflowType),
            cdWorkflowType,
        }
        const downloadUrl = getDownloadManifestUrl(downloadManifestDownload)
        handleDownload({
            downloadUrl,
            fileName: downloadManifestDownload.appName,
            downloadSuccessToastContent: 'Manifest Downloaded Successfully',
        })
    }

    const showErrorIfNotAborted = (errors: ServerErrors) => {
        if (!getIsRequestAborted(errors)) {
            showError(errors)
        }
    }

    const handleDeployment = (
        nodeType: DeploymentNodeType,
        _appId: number,
        ciArtifactId: number,
        e: React.MouseEvent,
        deploymentWithConfig?: string,
        wfrId?: number,
    ) => {
        if (runtimeParamsErrorState) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve all the errors before deploying',
            })
            return
        }

        ReactGA.event(TRIGGER_VIEW_GA_EVENTS.CDTriggered(nodeType))
        setDeploymentLoading(true)

        if (_appId && pipelineId && ciArtifactId) {
            triggerCDNode({
                pipelineId,
                ciArtifactId,
                appId: _appId.toString(),
                stageType: nodeType,
                deploymentWithConfig,
                wfrId,
                abortSignal: abortDeployRef.current.signal,
                runtimeParams: runtimeParamsList,
            })
                .then((response: any) => {
                    if (response.result) {
                        isVirtualEnvironment &&
                            deploymentAppType == DeploymentAppTypes.MANIFEST_DOWNLOAD &&
                            onClickManifestDownload(_appId, envId, response.result.helmPackageName, nodeType)

                        const msg =
                            materialType == MATERIAL_TYPE.rollbackMaterialList
                                ? 'Rollback Initiated'
                                : 'Deployment Initiated'

                        ToastManager.showToast({
                            variant: ToastVariantType.success,
                            description: msg,
                        })
                        setDeploymentLoading(false)
                        closeCDModal(e)
                    }
                })
                .catch((errors: ServerErrors) => {
                    // TODO: Ask why this was only there in TriggerView
                    isVirtualEnvironment && deploymentAppType == DeploymentAppTypes.MANIFEST_PUSH
                        ? handleTriggerErrorMessageForHelmManifestPush(errors, pipelineId, envId)
                        : showErrorIfNotAborted(errors)
                    setDeploymentLoading(false)
                })
        } else {
            let message = _appId ? '' : 'app id missing '
            message += pipelineId ? '' : 'pipeline id missing '
            message += ciArtifactId ? '' : 'Artifact id missing '
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: message,
            })
            setDeploymentLoading(false)
        }
    }

    const deployTrigger = (e: React.MouseEvent) => {
        e.stopPropagation()
        handleConfirmationClose(e)
        // Blocking the deploy action if already deploying or config is not available
        if (isLoading || isDeployButtonDisabled()) {
            return
        }

        if (state.isRollbackTrigger || state.isSelectImageTrigger) {
            const wfrId = state.isRollbackTrigger ? getWfrId(state.selectedMaterial, material) : lastDeploymentWfrId
            handleDeployment(stageType, appId, Number(getCDArtifactId()), e, state.selectedConfigToDeploy.value, wfrId)
            return
        }

        handleDeployment(stageType, appId, Number(getCDArtifactId()), e)
    }

    const loadOlderImages = () => {
        ReactGA.event(CD_MATERIAL_GA_EVENT.FetchMoreImagesClicked)
        if (!state.loadingMore) {
            setState((prevState) => ({
                ...prevState,
                loadingMore: true,
            }))

            abortControllerRef.current.abort()
            abortControllerRef.current = new AbortController()

            genericCDMaterialsService(
                materialType === MATERIAL_TYPE.rollbackMaterialList
                    ? CDMaterialServiceEnum.ROLLBACK
                    : CDMaterialServiceEnum.CD_MATERIALS,
                pipelineId,
                stageType,
                abortControllerRef.current.signal,
                {
                    offset: material.length - Number(isConsumedImageAvailable),
                    size: 20,
                    search: searchImageTag,
                },
            )
                .then((materialsResponse) => {
                    if (materialsResponse) {
                        // NOTE: Looping through _newResponse and removing elements that are already deployed and latest
                        // NOTE: This is done to avoid duplicate images
                        const filteredNewMaterialResponse = [...materialsResponse.materials].filter(
                            (materialItem) => !(materialItem.deployed && materialItem.latest),
                        )

                        // updating the index of materials to maintain consistency
                        const _newMaterialsResponse = filteredNewMaterialResponse.map((materialItem, index) => ({
                            ...materialItem,
                            index: material.length + index,
                        }))

                        const _newMaterials = material.concat(_newMaterialsResponse)
                        setMaterial(_newMaterials)

                        const _updatedMaterialResponse = {
                            ...materialsResponse,
                            materials: _newMaterials,
                        }
                        updateBulkCDMaterialsItem?.(_updatedMaterialResponse)
                        setNoMoreImages(_newMaterials.length >= materialsResponse.totalCount)

                        const baseSuccessMessage = `Fetched ${_newMaterialsResponse.length} images.`
                        if (resourceFilters?.length && !state.searchApplied) {
                            const eligibleImages = _newMaterialsResponse.filter(
                                (mat) => mat.filterState === FilterStates.ALLOWED,
                            ).length

                            const infoMessage =
                                eligibleImages === 0
                                    ? 'No new eligible images found.'
                                    : `${eligibleImages} new eligible images found.`

                            if (state.filterView === FilterConditionViews.ELIGIBLE) {
                                ToastManager.showToast({
                                    variant: ToastVariantType.info,
                                    description: `${baseSuccessMessage} ${infoMessage}`,
                                })
                            } else {
                                ToastManager.showToast({
                                    variant: ToastVariantType.success,
                                    description: `${baseSuccessMessage} ${infoMessage}`,
                                })
                            }
                        } else {
                            ToastManager.showToast({
                                variant: ToastVariantType.success,
                                description: baseSuccessMessage,
                            })
                        }
                    }
                })
                .catch((error) => {
                    showError(error)
                })
                .finally(() => {
                    setState((prevState) => ({
                        ...prevState,
                        loadingMore: false,
                    }))
                })
        }
    }

    /* ------------ Render Utilities  ------------*/
    const renderGenerateButton = () => (
        <button className="flex cta h-32" onClick={clearSearch} type="button">
            Clear filter
        </button>
    )

    const renderLoadMoreButton = () => (
        <ButtonWithLoader
            rootClassName="cn-7 flex fs-12 fw-6 lh-18 br-4 dc__border mw-56 fetch-more-loading-button cta cancel"
            onClick={loadOlderImages}
            disabled={state.loadingMore}
            isLoading={state.loadingMore}
        >
            Fetch More Images
        </ButtonWithLoader>
    )

    const renderFilterEmptyStateSubtitle = (): JSX.Element => (
        <p className="m-0 flex cn-8 fs-13 fw-4 lh-20">
            <button
                className="dc__no-background p-0 dc__outline-none-imp dc__no-border dc__border-bottom-imp mr-4"
                type="button"
                onClick={handleEnableFiltersView}
            >
                Filter
            </button>
            is applied on
            <button
                className="dc__no-background p-0 dc__outline-none-imp dc__no-border dc__border-bottom-imp ml-4 mb-neg-1"
                type="button"
                onClick={handleAllImagesView}
            >
                {` latest ${material.length} images`}
            </button>
        </p>
    )

    const renderEmptyState = (
        isApprovalConfigured: boolean,
        consumedImagePresent?: boolean,
        noEligibleImages?: boolean,
    ) => {
        if (
            resourceFilters?.length &&
            noEligibleImages &&
            !state.searchApplied &&
            material.length - Number(consumedImagePresent) > 0
        ) {
            return (
                <GenericEmptyState
                    image={noArtifact}
                    title="No eligible image found"
                    subTitle={renderFilterEmptyStateSubtitle()}
                    isButtonAvailable={!noMoreImages}
                    renderButton={renderLoadMoreButton}
                />
            )
        }

        if (searchImageTag) {
            return (
                <GenericEmptyState
                    image={noArtifact}
                    title="No matching image available"
                    subTitle="We couldn't find any matching image"
                    isButtonAvailable
                    renderButton={renderGenerateButton}
                />
            )
        }

        if (isApprovalConfigured && ApprovalEmptyState) {
            return (
                <ApprovalEmptyState
                    className="dc__skip-align-reload-center"
                    consumedImagePresent={consumedImagePresent}
                    triggerType={triggerType}
                    isRollbackTrigger={state.isRollbackTrigger}
                    envName={envName}
                    viewAllImages={viewAllImages}
                />
            )
        }

        return (
            <GenericEmptyState
                image={noArtifact}
                title={EMPTY_STATE_STATUS.CD_MATERIAL.TITLE}
                subTitle={
                    materialType == MATERIAL_TYPE.rollbackMaterialList
                        ? 'Previously deployed images will be available here for rollback.'
                        : 'Please Trigger CI Pipeline and find the image here for deployment.'
                }
            />
        )
    }

    const handleShowAppliedFilters = (e: React.MouseEvent, materialData: CDMaterialType) => {
        e.stopPropagation()
        setAppliedFilterList(materialData?.appliedFilters ?? [])
        setShowAppliedFilters(true)
    }

    const handleDisableAppliedFiltersView = (e: React.MouseEvent) => {
        e.stopPropagation()
        setAppliedFilterList([])
        setShowAppliedFilters(false)
    }

    const reloadMaterialsPropagation = (e: React.MouseEvent) => {
        e.stopPropagation()
        reloadMaterials()
    }

    const renderGitMaterialInfo = (materialData: CDMaterialType) => (
        <>
            {materialData.materialInfo.map((mat: MaterialInfo, index) => {
                const _gitCommit = getGitCommitInfo(mat)

                if (
                    (materialData.appliedFilters?.length > 0 || materialData.deploymentWindowArtifactMetadata?.type) &&
                    CDMaterialInfo
                ) {
                    return (
                        <CDMaterialInfo
                            commitTimestamp={handleUTCTime(materialData.createdTime)}
                            appliedFiltersTimestamp={handleUTCTime(materialData.appliedFiltersTimestamp)}
                            envName={envName}
                            // Should not use Arrow function here but seems like no choice
                            showConfiguredFilters={(e: React.MouseEvent) => handleShowAppliedFilters(e, materialData)}
                            filterState={materialData.appliedFiltersState}
                            dataSource={materialData.dataSource}
                            deploymentWindowArtifactMetadata={materialData.deploymentWindowArtifactMetadata}
                            isFilterApplied={materialData.appliedFilters?.length > 0}
                        >
                            {(_gitCommit.WebhookData?.Data ||
                                _gitCommit.Author ||
                                _gitCommit.Message ||
                                _gitCommit.Date ||
                                _gitCommit.Commit) && (
                                <GitCommitInfoGeneric
                                    index={index}
                                    materialUrl={mat.url}
                                    showMaterialInfoHeader
                                    commitInfo={_gitCommit}
                                    materialSourceType={mat.type}
                                    selectedCommitInfo=""
                                    materialSourceValue={mat.branch}
                                />
                            )}
                        </CDMaterialInfo>
                    )
                }

                // FIXME: Key seems to be missing here, look into this issue later
                return (
                    (_gitCommit.WebhookData?.Data ||
                        _gitCommit.Author ||
                        _gitCommit.Message ||
                        _gitCommit.Date ||
                        _gitCommit.Commit) && (
                        <div className="bcn-0 br-4 en-2 bw-1 m-12">
                            <GitCommitInfoGeneric
                                index={index}
                                materialUrl={mat.url}
                                showMaterialInfoHeader
                                commitInfo={_gitCommit}
                                materialSourceType={mat.type}
                                selectedCommitInfo=""
                                materialSourceValue={mat.branch}
                            />
                        </div>
                    )
                )
            })}
        </>
    )

    const renderMaterialCTA = (
        mat: CDMaterialType,
        isImageApprover: boolean = false,
        disableSelection: boolean = false,
        shouldRenderExpireApproval: boolean = false,
    ) => {
        if (mat.filterState !== FilterStates.ALLOWED) {
            return (
                <Tippy className="default-tt w-200" arrow={false} placement="top" content={EXCLUDED_IMAGE_TOOLTIP}>
                    <i className="cr-5 fs-13 fw-4 lh-24 m-0 cursor-not-allowed">Excluded</i>
                </Tippy>
            )
        }

        if (mat.vulnerable) {
            return (
                <span
                    className="material-history__scan-error"
                    data-testid={`cd-artifact-vulnerability-disabled-${mat.index}`}
                >
                    Security Issues Found
                </span>
            )
        }
        if (disableSelection || (!canApproverDeploy && isImageApprover)) {
            return (
                <Tippy
                    className="default-tt w-200"
                    arrow={false}
                    placement="top"
                    content={
                        disableSelection
                            ? 'An image can be deployed only once after it has been approved. This image would need to be approved again for it to be eligible for deployment.'
                            : 'This image was approved by you. An image cannot be deployed by its approver.'
                    }
                >
                    <span className="dc__opacity-0_5" data-testid={`cd-approval-artifact-select-disabled-${mat.index}`}>
                        SELECT
                    </span>
                </Tippy>
            )
        }
        if (mat.isSelected) {
            return (
                <Check
                    className={`${shouldRenderExpireApproval ? '' : 'dc__align-right'} icon-dim-24 cursor`}
                    data-testid={`cd-artifact-selected-check-${mat.index}`}
                />
            )
        }
        const cursorClass = mat.isSelected ? 'cursor-default' : 'cursor'
        const selectClassName = mat.vulnerable ? 'cursor-not-allowed' : cursorClass

        return (
            <span
                className={selectClassName}
                onClick={(event) => {
                    event.stopPropagation()
                    handleImageSelection(mat.index, mat)
                }}
                data-testid={`cd-artifact-select-${mat.index}`}
            >
                SELECT
            </span>
        )
    }

    const renderCTA = ({ mat, disableSelection }: RenderCTAType) => {
        const isApprovalRequester = getIsApprovalRequester(mat.userApprovalMetadata)
        const isImageApprover = getIsImageApprover(mat.userApprovalMetadata)
        const shouldRenderExpireApproval =
            materialType !== MATERIAL_TYPE.none && isApprovalRequester && !isImageApprover && !disableSelection

        return (
            <>
                {shouldRenderExpireApproval && ExpireApproval && (
                    <>
                        <ExpireApproval
                            matId={mat.id}
                            appId={appId}
                            pipelineId={pipelineId}
                            userApprovalMetadata={mat.userApprovalMetadata}
                            reloadMaterials={reloadMaterials}
                        />

                        {mat.filterState !== FilterStates.ALLOWED && (
                            <div className="flex dc__gap-12 mr-12">
                                <div className="h-12 dc__border-left" />
                            </div>
                        )}
                    </>
                )}
                {renderMaterialCTA(mat, isImageApprover, disableSelection, shouldRenderExpireApproval)}
            </>
        )
    }

    // Not sending approvalChecksNode as it is not required in this case
    const getArtifactInfoProps = (mat: CDMaterialType, showApprovalInfoTippy: boolean): ArtifactInfoProps => ({
        imagePath: mat.imagePath,
        registryName: mat.registryName,
        registryType: mat.registryType,
        image: mat.image,
        deployedTime: mat.deployedTime,
        deployedBy: mat.deployedBy,
        isRollbackTrigger: state.isRollbackTrigger,
        excludedImagePathNode:
            mat.filterState === FilterStates.ALLOWED ? null : <ExcludedImageNode image={mat.image} />,
        approvalInfoTippy: showApprovalInfoTippy ? (
            <ApprovalInfoTippy
                matId={mat.id}
                appId={appId}
                pipelineId={pipelineId}
                requestedUserId={requestedUserId}
                userApprovalMetadata={mat.userApprovalMetadata}
                reloadMaterials={reloadMaterials}
            />
        ) : null,
    })

    const getImageTagContainerProps = (mat: CDMaterialType): ImageTaggingContainerType => ({
        ciPipelineId,
        artifactId: +mat.id,
        imageComment: mat.imageComment,
        imageReleaseTags: mat.imageReleaseTags,
        appReleaseTagNames,
        setAppReleaseTagNames,
        tagsEditable,
        toggleCardMode,
        setTagsEditable,
        forceReInit: true,
        hideHardDelete: hideImageTaggingHardDelete,
        updateCurrentAppMaterial,
        isSuperAdmin,
    })

    const getSequentialCDCardTitleProps = (mat: CDMaterialType): SequentialCDCardTitleProps => {
        const promotionApprovalMetadata = mat.promotionApprovalMetadata
        const promotionApprovedBy = promotionApprovalMetadata?.approvedUsersData?.map((users) => users.userEmail)

        return {
            isLatest: mat.latest,
            isRunningOnParentCD: mat.runningOnParentCd,
            artifactStatus: mat.artifactStatus,
            environmentName: envName,
            parentEnvironmentName,
            stageType,
            showLatestTag: +mat.index === 0 && materialType !== MATERIAL_TYPE.rollbackMaterialList && !searchImageTag,
            isVirtualEnvironment,
            additionalInfo:
                ImagePromotionInfoChip && promotionApprovalMetadata?.promotedFromType ? (
                    <ImagePromotionInfoChip
                        promotedTo={envName}
                        promotedFromType={promotionApprovalMetadata?.promotedFromType}
                        promotedFrom={promotionApprovalMetadata?.promotedFrom}
                        promotedBy={promotionApprovalMetadata?.requestedUserData?.userEmail}
                        approvedBy={promotionApprovedBy}
                        promotionPolicyName={promotionApprovalMetadata?.policy?.name}
                        showBackgroundColor
                    />
                ) : null,
        }
    }

    const renderMaterial = (materialList: CDMaterialType[], disableSelection: boolean, isApprovalConfigured: boolean) =>
        materialList.map((mat) => {
            const isMaterialInfoAvailable = getIsMaterialInfoAvailable(mat.materialInfo)
            const approvedImageClass = getApprovedImageClass(disableSelection, isApprovalConfigured)
            const isImageApprover = getIsImageApprover(mat.userApprovalMetadata)
            const hideSourceInfo = !state.materialInEditModeMap.get(+mat.id)
            const showApprovalInfoTippy =
                !disableSelection &&
                (stageType === DeploymentNodeType.CD || state.isRollbackTrigger) &&
                isApprovalConfigured &&
                ApprovalInfoTippy
            const imageCardRootClassName =
                mat.isSelected && !disableSelection && !isImageApprover ? 'material-history-selected' : ''

            return (
                <ImageCard
                    testIdLocator={String(mat.index)}
                    cta={renderCTA({
                        mat,
                        disableSelection,
                    })}
                    sequentialCDCardTitleProps={getSequentialCDCardTitleProps(mat)}
                    artifactInfoProps={getArtifactInfoProps(mat, showApprovalInfoTippy)}
                    imageTagContainerProps={getImageTagContainerProps(mat)}
                    rootClassName={imageCardRootClassName}
                    materialInfoRootClassName={approvedImageClass}
                    key={`material-history-${mat.index}`}
                >
                    {mat.materialInfo.length > 0 &&
                        !hideInfoTabsContainer &&
                        (isMaterialInfoAvailable || mat.appliedFilters?.length) &&
                        hideSourceInfo && (
                            <ImageCardAccordion
                                environmentId={envId}
                                isSecurityModuleInstalled={state.isSecurityModuleInstalled}
                                artifactId={+mat.id}
                                applicationId={appId}
                                changesCard={renderGitMaterialInfo(mat)}
                                isScanned={mat.scanned}
                                isScanEnabled={mat.scanEnabled}
                                SecurityModalSidebar={SecurityModalSidebar}
                                getSecurityScan={getSecurityScan}
                            />
                        )}
                </ImageCard>
            )
        })

    const renderSearch = (): JSX.Element => (
        <SearchBar
            initialSearchText={state.searchText}
            containerClassName="w-250"
            handleEnter={handleFilterKeyPress}
            inputProps={{
                placeholder: 'Search by image tag',
                autoFocus: true,
            }}
            dataTestId="ci-trigger-search-by-commit-hash"
        />
    )

    const renderMaterialListBodyWrapper = (children: JSX.Element) => (
        <div className="flexbox-col py-16 px-20 dc__overflow-scroll">{children}</div>
    )

    const renderRuntimeParamsSidebar = (areTabsDisabled: boolean = false) => {
        const showSidebar = isPreOrPostCD && !isFromBulkCD
        if (!showSidebar) {
            return null
        }

        return (
            <div className="flexbox-col bcn-0">
                {RuntimeParamTabs && (
                    <div className={`px-16 py-12 flex ${areTabsDisabled ? 'dc__disabled' : ''}`}>
                        <RuntimeParamTabs
                            tabs={CD_MATERIAL_SIDEBAR_TABS}
                            initialTab={currentSidebarTab}
                            onChange={areTabsDisabled ? noop : handleSidebarTabChange}
                        />
                    </div>
                )}

                <div className="flexbox dc__align-items-center px-16 py-8">
                    <span className="dc__uppercase cn-7 fs-12 fw-6 lh-20">Application</span>
                </div>

                <div className="flexbox dc__align-items-center px-16 py-12 dc__window-bg dc__border-bottom-n1">
                    <span className="cn-9 fs-13 fw-6 lh-16">{appName}</span>
                </div>
            </div>
        )
    }

    const renderMaterialList = (isApprovalConfigured: boolean) => {
        const { consumedImage, materialList, eligibleImagesCount } =
            getConsumedAndAvailableMaterialList(isApprovalConfigured)
        const selectImageTitle = state.isRollbackTrigger ? 'Select from previously deployed images' : 'Select Image'
        const titleText = isApprovalConfigured ? 'Approved images' : selectImageTitle
        const showActionBar =
            FilterActionBar && !state.searchApplied && !!resourceFilters?.length && !state.showConfiguredFilters

        return (
            <div
                className={`flex-grow-1 dc__overflow-scroll ${isPreOrPostCD && !isFromBulkCD ? 'display-grid cd-material__container-with-sidebar' : 'flexbox-col py-16 px-20'}`}
            >
                {renderRuntimeParamsSidebar()}

                <ConditionalWrap condition={isPreOrPostCD && !isFromBulkCD} wrap={renderMaterialListBodyWrapper}>
                    {(bulkSidebarTab
                        ? bulkSidebarTab === CDMaterialSidebarType.IMAGE
                        : currentSidebarTab === CDMaterialSidebarType.IMAGE) || !RuntimeParameters ? (
                        <>
                            {isApprovalConfigured && renderMaterial(consumedImage, true, isApprovalConfigured)}
                            <div className="material-list__title pb-16 flex dc__align-center dc__content-space">
                                {showActionBar ? (
                                    <FilterActionBar
                                        tabs={getFilterActionBarTabs(eligibleImagesCount, consumedImage.length)}
                                        onChange={handleFilterTabsChange}
                                        handleEnableFiltersView={handleEnableFiltersView}
                                        initialTab={state.filterView}
                                    />
                                ) : (
                                    <span className="flex dc__align-start">{titleText}</span>
                                )}

                                <span className="flexbox dc__align-items-center h-32 dc__gap-16">
                                    {state.showSearch ? (
                                        renderSearch()
                                    ) : (
                                        <SearchIcon
                                            onClick={handleSearchClick}
                                            className="icon-dim-16 icon-color-n6 cursor"
                                        />
                                    )}
                                    <RefreshIcon onClick={handleRefresh} className="icon-dim-16 scn-6 cursor" />
                                </span>
                            </div>

                            {materialList.length <= 0
                                ? renderEmptyState(isApprovalConfigured, consumedImage.length > 0, !eligibleImagesCount)
                                : renderMaterial(materialList, false, isApprovalConfigured)}

                            {!noMoreImages && !!materialList?.length && (
                                <button
                                    className="show-older-images-cta cta ghosted flex h-32"
                                    onClick={loadOlderImages}
                                    type="button"
                                >
                                    {state.loadingMore ? (
                                        <Progressing styles={{ height: '32px' }} />
                                    ) : (
                                        'Fetch more images'
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
                        <RuntimeParameters
                            rootClassName=""
                            parameters={bulkRuntimeParams || runtimeParamsList}
                            handleChange={handleBulkRuntimeParamChange || handleRuntimeParamChange}
                            onError={handleBulkRuntimeParamError || handleRuntimeParamError}
                            headingClassName="pb-14 flexbox dc__gap-4"
                        />
                    )}
                </ConditionalWrap>
            </div>
        )
    }

    const renderCDModalHeader = (): JSX.Element | string => {
        const _stageType = state.isRollbackTrigger ? STAGE_TYPE.ROLLBACK : stageType
        switch (_stageType) {
            case STAGE_TYPE.PRECD:
                return 'Pre Deployment'
            case STAGE_TYPE.CD:
                return (
                    <>
                        Deploy to <span className="fw-6">{envName}</span>
                    </>
                )
            case STAGE_TYPE.POSTCD:
                return 'Post Deployment'
            case STAGE_TYPE.ROLLBACK:
                return (
                    <>
                        Rollback for <span className="fw-6">{envName}</span>
                    </>
                )
            default:
                return ''
        }
    }

    const renderTippyContent = () => {
        if (!state.areMaterialsPassingFilters) {
            return (
                <>
                    <h2 className="fs-12 fw-6 lh-18 m-0">No eligible images found!</h2>
                    <p className="fs-12 fw-4 lh-18 m-0">
                        Please select an image that passes the configured filters to deploy
                    </p>
                </>
            )
        }

        return (
            <>
                <h2 className="fs-12 fw-6 lh-18 m-0">Selected Config not available!</h2>
                <p className="fs-12 fw-4 lh-18 m-0">
                    {state.selectedConfigToDeploy.value === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
                    noSpecificDeploymentConfig
                        ? 'Please select a different image or configuration to deploy'
                        : 'Please select a different configuration to deploy'}
                </p>
            </>
        )
    }

    const getDeployButtonIcon = () => {
        if (deploymentWindowMetadata.userActionState === ACTION_STATE.BLOCKED) {
            return null
        } else if (stageType !== STAGE_TYPE.CD) {
            return (
                <PlayIC
                    className={`icon-dim-16 mr-8 dc__no-svg-fill dc__stroke-width-2 ${deploymentWindowMetadata.userActionState === ACTION_STATE.PARTIAL ? 'scn-9' : 'scn-0'}`}
                />
            )
        }
        return (
            <DeployIcon
                className={`icon-dim-16 dc__no-svg-fill mr-8 ${deploymentWindowMetadata.userActionState === ACTION_STATE.PARTIAL ? 'scn-9' : ''}`}
            />
        )
    }

    const onClickDeploy = (e, disableDeployButton: boolean) => {
        e.stopPropagation()
        if (!disableDeployButton) {
            if (
                deploymentWindowMetadata.userActionState &&
                deploymentWindowMetadata.userActionState !== ACTION_STATE.ALLOWED
            ) {
                setShowDeploymentWindowConfirmation(true)
                return
            }

            deployTrigger(e)
        }
    }

    const renderTriggerModalCTA = (isApprovalConfigured: boolean) => {
        const buttonLabel =
            deploymentWindowMetadata.userActionState === ACTION_STATE.BLOCKED
                ? 'Deployment is blocked'
                : CDButtonLabelMap[stageType]
        const disableDeployButton =
            isDeployButtonDisabled() ||
            (material.length > 0 && getIsImageApprover(state.selectedMaterial?.userApprovalMetadata))
        const hideConfigDiffSelector = isApprovalConfigured && disableDeployButton

        return (
            <div
                className={`trigger-modal__trigger dc__position-sticky ${
                    (!state.isRollbackTrigger && !state.isSelectImageTrigger) ||
                    showConfigDiffView ||
                    stageType === DeploymentNodeType.PRECD ||
                    stageType === DeploymentNodeType.POSTCD
                        ? 'flex right'
                        : ''
                }`}
            >
                {!hideConfigDiffSelector &&
                    (state.isRollbackTrigger || state.isSelectImageTrigger) &&
                    !showConfigDiffView &&
                    stageType === DeploymentNodeType.CD && (
                        <PipelineConfigDiffStatusTile
                            isLoading={pipelineDeploymentConfigLoading}
                            deploymentConfigSelectorProps={deploymentConfigSelectorProps}
                            hasDiff={diffFound}
                            onClick={() => onClickSetInitialParams('review-config')}
                            noLastDeploymentConfig={noLastDeploymentConfig}
                            canReviewConfig={canReviewConfig()}
                            urlFilters={urlFilters}
                            showConfigNotAvailableTooltip={disableDeployButton}
                            renderConfigNotAvailableTooltip={renderTippyContent}
                        />
                    )}
                <ConditionalWrap
                    condition={!pipelineDeploymentConfigLoading && isDeployButtonDisabled()}
                    wrap={(children) => (
                        <Tippy
                            className="default-tt w-200"
                            arrow={false}
                            placement="top"
                            content={renderTippyContent()}
                        >
                            {children}
                        </Tippy>
                    )}
                >
                    <button
                        data-testid="cd-trigger-deploy-button"
                        disabled={deploymentLoading || isSaveLoading}
                        className={`${getCTAClass(deploymentWindowMetadata.userActionState, disableDeployButton)} h-36`}
                        onClick={(e) => onClickDeploy(e, disableDeployButton)}
                        type="button"
                    >
                        {deploymentLoading || isSaveLoading ? (
                            <Progressing />
                        ) : (
                            <>
                                {getDeployButtonIcon()}
                                {buttonLabel}
                                {isVirtualEnvironment && ' to isolated env'}
                                {deploymentWindowMetadata.userActionState === ACTION_STATE.BLOCKED && (
                                    <InfoOutline className="icon-dim-16 ml-5" />
                                )}
                            </>
                        )}
                    </button>
                </ConditionalWrap>
            </div>
        )
    }

    const renderTriggerViewConfigDiff = () => {
        return (
            <PipelineConfigDiff
                {...pipelineDeploymentConfig}
                isLoading={pipelineDeploymentConfigLoading}
                errorConfig={errorConfig}
                deploymentConfigSelectorProps={deploymentConfigSelectorProps}
                scopeVariablesConfig={scopeVariablesConfig}
                urlFilters={urlFilters}
            />
        )
    }

    const renderTriggerBody = (isApprovalConfigured: boolean) => (
        <div className="trigger-modal__body p-0 flex-grow-1 h-100">
            {showConfigDiffView && canReviewConfig()
                ? renderTriggerViewConfigDiff()
                : renderMaterialList(isApprovalConfigured)}
        </div>
    )

    const handleConfirmationClose = (e) => {
        e.stopPropagation()
        setShowDeploymentWindowConfirmation(false)
    }

    const renderCDModal = (isApprovalConfigured: boolean) => (
        <>
            <div className="trigger-modal__header">
                {showConfigDiffView ? (
                    <div className="flex dc__gap-16">
                        <button
                            type="button"
                            className="dc__transparent icon-dim-24 flex"
                            onClick={() => onClickSetInitialParams('list')}
                        >
                            <BackIcon />
                        </button>
                        <h2 className="modal__title">{renderCDModalHeader()}</h2>
                        {state.selectedMaterial && (
                            <ArtifactInfo
                                {...getArtifactInfoProps(
                                    state.selectedMaterial,
                                    (stageType === DeploymentNodeType.CD || state.isRollbackTrigger) &&
                                        isApprovalConfigured &&
                                        ApprovalInfoTippy,
                                )}
                            />
                        )}
                    </div>
                ) : (
                    <h1 className="modal__title">{renderCDModalHeader()}</h1>
                )}
                <button type="button" className="dc__transparent" onClick={closeCDModal}>
                    <img alt="close" src={close} />
                </button>
            </div>

            {!showConfigDiffView && window?._env_?.ANNOUNCEMENT_BANNER_MSG && (
                <AnnouncementBanner parentClassName="cd-trigger-announcement" isCDMaterial />
            )}

            {/* FIXME: This material.length>1 needs to be optimised */}
            {isApprovalConfigured &&
                ApprovedImagesMessage &&
                (state.isRollbackTrigger || material.length - Number(isConsumedImageAvailable) > 0) && (
                    <InfoColourBar
                        message={<ApprovedImagesMessage viewAllImages={viewAllImages} />}
                        classname="info_bar dc__no-border-radius dc__no-top-border"
                        Icon={InfoIcon}
                        iconClass="icon-dim-20"
                    />
                )}
            {!isFromBulkCD &&
                MaintenanceWindowInfoBar &&
                deploymentWindowMetadata.type === DEPLOYMENT_WINDOW_TYPE.MAINTENANCE &&
                deploymentWindowMetadata.isActive && (
                    <MaintenanceWindowInfoBar
                        windowName={deploymentWindowMetadata.name}
                        endTime={deploymentWindowMetadata.calculatedTimestamp}
                    />
                )}
            {renderTriggerBody(isApprovalConfigured)}
            {renderTriggerModalCTA(isApprovalConfigured)}
            {DeploymentWindowConfirmationDialog && showDeploymentWindowConfirmation && (
                <DeploymentWindowConfirmationDialog
                    onClose={handleConfirmationClose}
                    value={value}
                    setValue={setValue}
                    isLoading={isLoading}
                    type={MODAL_TYPE.DEPLOY}
                    onClickActionButton={deployTrigger}
                    appId={appId}
                    envId={envId}
                    envName={envName}
                />
            )}
            <Prompt when={deploymentLoading} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
        </>
    )

    /* ------------Main Rendering logic  ------------*/
    if (state.showConfiguredFilters && ConfiguredFilters) {
        return (
            <ConfiguredFilters
                isFromBulkCD={isFromBulkCD}
                resourceFilters={resourceFilters}
                handleDisableFiltersView={handleDisableFiltersView}
                envName={envName}
                closeModal={closeCDModal}
            />
        )
    }

    if (showAppliedFilters) {
        return (
            <ConfiguredFilters
                isFromBulkCD={isFromBulkCD}
                resourceFilters={appliedFilterList}
                handleDisableFiltersView={handleDisableAppliedFiltersView}
                envName={envName}
                closeModal={closeCDModal}
            />
        )
    }

    // NOTE: Can make a skeleton component for loader
    // TODO: Fix this condition for aborting the request
    if (loadingMaterials || materialsError?.code === 0) {
        return (
            <>
                {!isFromBulkCD && (
                    <div className="trigger-modal__header">
                        <h1 className="modal__title">{renderCDModalHeader()}</h1>
                        <button type="button" className="dc__transparent" onClick={closeCDModal}>
                            <img alt="close" src={close} />
                        </button>
                    </div>
                )}

                <div
                    className={`flexbox-col h-100 dc__overflow-scroll ${isPreOrPostCD && !isFromBulkCD ? 'display-grid cd-material__container-with-sidebar' : ''}`}
                >
                    {renderRuntimeParamsSidebar(true)}

                    <div className="flexbox-col dc__overflow-scroll dc__gap-12 dc__align-items-center h-100 w-100 pl-20 pr-20">
                        <div className="flexbox dc__align-items-center dc__content-space pt-20 pb-16 w-100">
                            <div className="shimmer-loading" style={{ width: '100px', height: '20px' }} />
                        </div>

                        <div className="shimmer-loading w-100" style={{ height: '150px' }} />
                        <div className="shimmer-loading w-100" style={{ height: '150px' }} />
                    </div>
                </div>
            </>
        )
    }

    if (materialsError) {
        return (
            <>
                {!isFromBulkCD && (
                    <div className="trigger-modal__header">
                        <h1 className="modal__title">{renderCDModalHeader()}</h1>
                        <button type="button" className="dc__transparent" onClick={closeCDModal}>
                            <img alt="close" src={close} />
                        </button>
                    </div>
                )}

                <ErrorScreenManager code={materialsError.code} reload={reloadMaterialsPropagation} />
            </>
        )
    }

    if (material.length > 0) {
        return isFromBulkCD ? (
            <>
                {!showConfigDiffView && window?._env_?.ANNOUNCEMENT_BANNER_MSG && (
                    <AnnouncementBanner parentClassName="cd-trigger-announcement" isCDMaterial />
                )}
                {renderTriggerBody(isApprovalConfigured)}
            </>
        ) : (
            renderCDModal(isApprovalConfigured)
        )
    }

    if (isFromBulkCD) {
        return renderEmptyState(isApprovalConfigured)
    }

    return (
        <>
            <div className="trigger-modal__header">
                <h1 className="modal__title">{renderCDModalHeader()}</h1>
                <button type="button" className="dc__transparent" onClick={closeCDModal}>
                    <img alt="close" src={close} />
                </button>
            </div>

            {renderEmptyState(isApprovalConfigured)}
        </>
    )
}

export default CDMaterial