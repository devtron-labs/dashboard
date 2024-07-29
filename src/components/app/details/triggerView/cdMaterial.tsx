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
import ReactSelect, { components } from 'react-select'
import ReactGA from 'react-ga4'
import { toast } from 'react-toastify'
import { Prompt, useHistory } from 'react-router-dom'
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
    Reload,
    useSearchString,
    handleUTCTime,
    ServerErrors,
    DeploymentAppTypes,
    ToastBodyWithButton,
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
    useDownload,
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
import { ReactComponent as WarningIcon } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as BackIcon } from '../../../../assets/icons/ic-arrow-backward.svg'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as InfoOutline } from '../../../../assets/icons/ic-info-outline.svg'
import { ReactComponent as SearchIcon } from '../../../../assets/icons/ic-search.svg'
import { ReactComponent as RefreshIcon } from '../../../../assets/icons/ic-arrows_clockwise.svg'
import { ReactComponent as Clear } from '../../../../assets/icons/ic-error.svg'
import { ReactComponent as PlayIC } from '../../../../assets/icons/misc/arrow-solid-right.svg'

import noartifact from '../../../../assets/img/no-artifact@2x.png'
import { getCTAClass, importComponentFromFELibrary } from '../../../common'
import { CDButtonLabelMap, getCommonConfigSelectStyles, TriggerViewContext } from './config'
import {
    getLatestDeploymentConfig,
    getRecentDeploymentConfig,
    getSpecificDeploymentConfig,
    triggerCDNode,
} from '../../service'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { DropdownIndicator, Option } from '../../../v2/common/ReactSelect.utils'
import {
    DEPLOYMENT_CONFIGURATION_NAV_MAP,
    LAST_SAVED_CONFIG_OPTION,
    SPECIFIC_TRIGGER_CONFIG_OPTION,
    LATEST_TRIGGER_CONFIG_OPTION,
    checkForDiff,
    getDeployConfigOptions,
    processResolvedPromise,
} from './TriggerView.utils'
import TriggerViewConfigDiff from './triggerViewConfigDiff/TriggerViewConfigDiff'
import { TRIGGER_VIEW_GA_EVENTS, CD_MATERIAL_GA_EVENT, TRIGGER_VIEW_PARAMS } from './Constants'
import { EMPTY_STATE_STATUS, TOAST_BUTTON_TEXT_VIEW_DETAILS } from '../../../../config/constantMessaging'
import { abortEarlierRequests, getInitialState } from './cdMaterials.utils'
import { DEFAULT_ROUTE_PROMPT_MESSAGE } from '../../../../config'

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
    triggerDeploy,
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
}: Readonly<CDMaterialProps>) => {
    // stageType should handle approval node, compute CDMaterialServiceEnum, create queryParams state
    // FIXME: the query params returned by useSearchString seems faulty
    const history = useHistory()
    const { searchParams } = useSearchString()
    const { handleDownload } = useDownload()
    // Add dep here
    const { isSuperAdmin } = useSuperAdmin()

    const searchImageTag = searchParams.search

    const [material, setMaterial] = useState<CDMaterialType[]>([])
    const [state, setState] = useState<CDMaterialState>(getInitialState(materialType, material, searchImageTag))
    // It is derived from materialResult and can be fixed as a constant fix this
    const [isConsumedImageAvailable, setIsConsumedImageAvailable] = useState<boolean>(false)
    // Should be able to abort request using useAsync
    const abortControllerRef = useRef(new AbortController())
    const abortDeployRef = useRef(null)

    // TODO: Ask if pipelineId always changes on change of app else add appId as dependency
    const [loadingMaterials, responseList, materialsError, reloadMaterials] = useAsync(
        () =>
            abortEarlierRequests(abortControllerRef, () =>
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
            ),
        // NOTE: Add state.filterView if want to add filtering support from backend
        [pipelineId, stageType, materialType, searchImageTag],
    )

    const materialsResult = responseList?.[0]
    const deploymentWindowMetadata = responseList?.[1] ?? {}

    const { onClickCDMaterial } = useContext<TriggerViewContextType>(TriggerViewContext)
    const [noMoreImages, setNoMoreImages] = useState<boolean>(false)
    const [tagsEditable, setTagsEditable] = useState<boolean>(false)
    const [appReleaseTagNames, setAppReleaseTagNames] = useState<string[]>([])
    const [showAppliedFilters, setShowAppliedFilters] = useState<boolean>(false)
    const [deploymentLoading, setDeploymentLoading] = useState<boolean>(false)
    const [appliedFilterList, setAppliedFilterList] = useState<FilterConditionsListType[]>([])
    const [value, setValue] = useState()
    const [showDeploymentWindowConfirmation, setShowDeploymentWindowConfirmation] = useState(false)

    const resourceFilters = materialsResult?.resourceFilters ?? []
    const hideImageTaggingHardDelete = materialsResult?.hideImageTaggingHardDelete ?? false
    const requestedUserId = materialsResult?.requestedUserId ?? ''
    const userApprovalConfig = materialsResult?.userApprovalConfig
    const isApprovalConfigured = userApprovalConfig?.requiredCount > 0
    const canApproverDeploy = materialsResult?.canApproverDeploy ?? false
    const showConfigDiffView = searchParams.mode === 'review-config' && searchParams.deploy && searchParams.config

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
            toast.error('Issue while fetching security module status')
        }
    }

    const getWfrId = (initSelectedMaterial?: CDMaterialType) => {
        if (
            state.selectedConfigToDeploy?.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
            state.recentDeploymentConfig
        ) {
            return state.recentDeploymentConfig.wfrId
        }

        if (initSelectedMaterial) {
            return initSelectedMaterial.wfrId
        }
        return state.selectedMaterial ? state.selectedMaterial.wfrId : material?.find((_mat) => _mat.isSelected)?.wfrId
    }

    // Ask whether this id is true or not
    const getCDArtifactId = () =>
        state.selectedMaterial ? state.selectedMaterial.id : material?.find((_mat) => _mat.isSelected)?.id

    const getDeploymentConfigDetails = async (initSelectedMaterial) => {
        setState((prevState) => ({ ...prevState, checkingDiff: true }))
        Promise.allSettled([
            getRecentDeploymentConfig(appId, pipelineId),
            getLatestDeploymentConfig(appId, pipelineId),
            initSelectedMaterial && state.isRollbackTrigger
                ? getSpecificDeploymentConfig(appId, pipelineId, getWfrId(initSelectedMaterial))
                : noop,
        ])
            .then(
                ([recentDeploymentConfigRes, latestDeploymentConfigRes, specificDeploymentConfigRes]: {
                    status: string
                    value?: any
                    reason?: any
                }[]) => {
                    const _recentDeploymentConfig = processResolvedPromise(recentDeploymentConfigRes, true)
                    const _specificDeploymentConfig = processResolvedPromise(specificDeploymentConfigRes)
                    const _latestDeploymentConfig = processResolvedPromise(latestDeploymentConfigRes)
                    const _diffOptions = state.isRollbackTrigger
                        ? checkForDiff(_recentDeploymentConfig, _specificDeploymentConfig)
                        : checkForDiff(_recentDeploymentConfig, _latestDeploymentConfig)
                    setState((prevState) => ({
                        ...prevState,
                        recentDeploymentConfig: _recentDeploymentConfig, // last deployed config
                        latestDeploymentConfig: _latestDeploymentConfig, // last saved config
                        specificDeploymentConfig: _specificDeploymentConfig, // config of one particular wfrId
                        diffFound: _diffOptions && Object.values(_diffOptions).some((d) => d),
                        diffOptions: _diffOptions,
                        checkingDiff: false,
                    }))
                },
            )
            .catch((error) => {
                showError(error)
            })
            .finally(() => {
                setState((prevState) => ({ ...prevState, checkingDiff: false }))
            })
    }

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

                    setMaterial(_newMaterials)
                    const _isConsumedImageAvailable =
                        _newMaterials.some((materialItem) => materialItem.deployed && materialItem.latest) ?? false

                    setIsConsumedImageAvailable(_isConsumedImageAvailable)

                    getSecurityModuleStatus()
                    // NOTE: Would be better if move rollback out
                    if (
                        (state.isRollbackTrigger || state.isSelectImageTrigger) &&
                        materialsResult.materials.length > 0
                    ) {
                        const initSelectedMaterial = _newMaterials.find((mat) => mat.isSelected)
                        getDeploymentConfigDetails(initSelectedMaterial)
                    }
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

                setMaterial(materialsResult.materials)
                const _isConsumedImageAvailable =
                    materialsResult.materials?.some((materialItem) => materialItem.deployed && materialItem.latest) ??
                    false

                setIsConsumedImageAvailable(_isConsumedImageAvailable)

                getSecurityModuleStatus()

                if ((state.isRollbackTrigger || state.isSelectImageTrigger) && materialsResult.materials.length > 0) {
                    const initSelectedMaterial = materialsResult.materials.find((mat) => mat.isSelected)
                    getDeploymentConfigDetails(initSelectedMaterial)
                }
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
    const checkForConfigDiff = async (selectedMaterial: CDMaterialType) => {
        if (state.isRollbackTrigger && state.selectedMaterial?.wfrId !== selectedMaterial.wfrId) {
            const isSpecificTriggerConfig =
                state.selectedConfigToDeploy.value === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG
            setState((prevState) => ({
                ...prevState,
                selectedMaterial,
                checkingDiff: isSpecificTriggerConfig,
            }))

            try {
                const { result } = await getSpecificDeploymentConfig(appId, pipelineId, selectedMaterial.wfrId)
                if (result) {
                    const _specificDeploymentConfig = processResolvedPromise({
                        status: 'fulfilled',
                        value: {
                            result,
                        },
                    })

                    if (isSpecificTriggerConfig) {
                        const _diffOptions = checkForDiff(state.recentDeploymentConfig, _specificDeploymentConfig)

                        setState((prevState) => ({
                            ...prevState,
                            specificDeploymentConfig: _specificDeploymentConfig,
                            diffFound: _diffOptions && Object.values(_diffOptions).some((d) => d),
                            diffOptions: _diffOptions,
                        }))
                    } else {
                        setState((prevState) => ({
                            ...prevState,
                            specificDeploymentConfig: _specificDeploymentConfig,
                        }))
                    }
                }
            } catch (error) {
                showError(error)
            } finally {
                setState((prevState) => ({
                    ...prevState,
                    checkingDiff: false,
                }))
            }
        }
    }

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

        checkForConfigDiff(selectedMaterial)
    }

    const handleDisableFiltersView = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        setState((prevState) => ({
            ...prevState,
            showConfiguredFilters: false,
        }))
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

    const getIsImageApprover = (userApprovalMetadata?: UserApprovalMetadataType) =>
        userApprovalMetadata?.approvedUsersData &&
        userApprovalMetadata.approvedUsersData.some((_approver) => _approver.userId === requestedUserId)

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

    const handleFilterKeyPress = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Enter') {
            if (event.target.value !== searchImageTag) {
                setSearchValue(event.target.value)
            }
        } else if (theKeyCode === 'Backspace' && state.searchText.length === 1) {
            clearSearch(event)
        }
    }

    const handleEnableFiltersView = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        setState((prevState) => ({
            ...prevState,
            showConfiguredFilters: true,
        }))
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

    const isConfigPresent = () =>
        (state.selectedConfigToDeploy.value === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
            state.specificDeploymentConfig?.deploymentTemplate &&
            state.specificDeploymentConfig.pipelineStrategy) ||
        (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LAST_SAVED_CONFIG &&
            state.latestDeploymentConfig?.deploymentTemplate &&
            state.latestDeploymentConfig.pipelineStrategy)

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

    const canReviewConfig = () =>
        (state.recentDeploymentConfig?.deploymentTemplate &&
            state.recentDeploymentConfig.pipelineStrategy &&
            (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG ||
                isConfigPresent())) ||
        !state.recentDeploymentConfig

    const onClickSetInitialParams = (modeParamValue: string) => {
        if (canReviewConfig()) {
            const newParams = {
                ...searchParams,
                mode: modeParamValue,
                config: DEPLOYMENT_CONFIGURATION_NAV_MAP.DEPLOYMENT_TEMPLATE.key,
                deploy: getConfigToDeployValue(),
            }

            history.push({
                search: new URLSearchParams(newParams).toString(),
            })
        }
    }

    const canDeployWithConfig = () =>
        (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
            state.recentDeploymentConfig?.deploymentTemplate &&
            state.recentDeploymentConfig.pipelineStrategy) ||
        isConfigPresent()

    const isDeployButtonDisabled = () => {
        const selectedImage = material.find((artifact) => artifact.isSelected)

        return (
            !selectedImage ||
            !state.areMaterialsPassingFilters ||
            (state.isRollbackTrigger && (state.checkingDiff || !canDeployWithConfig())) ||
            (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
                !state.recentDeploymentConfig)
        )
    }

    const getBaseTemplateConfiguration = (selected = null) => {
        const selectedConfig = selected?.value || state.selectedConfigToDeploy.value
        return selectedConfig === DeploymentWithConfigType.LAST_SAVED_CONFIG
            ? state.latestDeploymentConfig
            : selectedConfig === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG
              ? state.recentDeploymentConfig
              : state.specificDeploymentConfig
    }

    const setConfigParams = (deploy: string) => {
        const newParams = {
            ...searchParams,
            deploy,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    const handleConfigSelection = (selected) => {
        if (selected.value !== state.selectedConfigToDeploy.value) {
            const _diffOptions = checkForDiff(state.recentDeploymentConfig, getBaseTemplateConfiguration(selected))
            setState((prevState) => ({
                ...prevState,
                selectedConfigToDeploy: selected ? selected : getInitialSelectedConfigToDeploy(),
                diffFound: _diffOptions && Object.values(_diffOptions).some((d) => d),
                diffOptions: _diffOptions,
            }))
            setConfigParams(selected.value)
        }
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
                const toastBody = (
                    <ToastBodyWithButton
                        onClick={() => redirectToDeploymentStepsPage(cdPipelineId, environmentId)}
                        title=""
                        subtitle={userMessage ?? internalMessage}
                        buttonText={TOAST_BUTTON_TEXT_VIEW_DETAILS}
                    />
                )
                toast.error(toastBody, { autoClose: false })
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
        ReactGA.event(TRIGGER_VIEW_GA_EVENTS.CDTriggered(nodeType))
        setDeploymentLoading(true)

        if (_appId && pipelineId && ciArtifactId) {
            triggerCDNode(
                pipelineId,
                ciArtifactId,
                _appId.toString(),
                nodeType,
                deploymentWithConfig,
                wfrId,
                abortDeployRef.current.signal,
            )
                .then((response: any) => {
                    if (response.result) {
                        isVirtualEnvironment &&
                            deploymentAppType == DeploymentAppTypes.MANIFEST_DOWNLOAD &&
                            onClickManifestDownload(_appId, envId, response.result.helmPackageName, nodeType)

                        const msg =
                            materialType == MATERIAL_TYPE.rollbackMaterialList
                                ? 'Rollback Initiated'
                                : 'Deployment Initiated'

                        toast.success(msg)
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
            toast.error(message)
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

        if (isFromBulkCD) {
            // It doesn't need any params btw
            triggerDeploy(stageType, appId, Number(getCDArtifactId()))
            return
        }

        if (state.isRollbackTrigger || state.isSelectImageTrigger) {
            handleDeployment(
                stageType,
                appId,
                Number(getCDArtifactId()),
                e,
                state.selectedConfigToDeploy.value,
                getWfrId(),
            )
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
                                toast.info(`${baseSuccessMessage} ${infoMessage}`)
                            } else {
                                toast.success(`${baseSuccessMessage} ${infoMessage}`)
                            }
                        } else {
                            toast.success(baseSuccessMessage)
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

    const isConfigAvailable = (optionValue: string) => {
        if (
            (optionValue === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
                (!state.specificDeploymentConfig?.deploymentTemplate ||
                    !state.specificDeploymentConfig.pipelineStrategy)) ||
            (optionValue === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
                (!state.recentDeploymentConfig?.deploymentTemplate ||
                    !state.recentDeploymentConfig.pipelineStrategy)) ||
            (optionValue === DeploymentWithConfigType.LAST_SAVED_CONFIG &&
                (!state.latestDeploymentConfig?.deploymentTemplate || !state.latestDeploymentConfig.pipelineStrategy))
        ) {
            return false
        }

        return true
    }

    const getTriggerBodyHeight = (isApprovalConfigured: boolean) => {
        const subHeight = window?._env_?.ANNOUNCEMENT_BANNER_MSG ? 37 : 0

        if (showConfigDiffView) {
            return `calc(100vh - 141px - ${subHeight}px)`
        }
        if (
            isApprovalConfigured &&
            (state.isRollbackTrigger || material.length - Number(isConsumedImageAvailable) > 0)
        ) {
            return `calc(100vh - 156px - ${subHeight}px)`
        }
        return `calc(100vh - 116px - ${subHeight}px)`
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
                    image={noartifact}
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
                    image={noartifact}
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
                image={noartifact}
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
                        <div className="bcn-0 pt-12 br-4 pb-12 en-2 bw-1 m-12">
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
                                isSecurityModuleInstalled={state.isSecurityModuleInstalled}
                                artifactId={+mat.id}
                                applicationId={appId}
                                environmentId={envId}
                                changesCard={renderGitMaterialInfo(mat)}
                                isScanned={mat.scanned}
                                isScanEnabled={mat.scanEnabled}
                            />
                        )}
                </ImageCard>
            )
        })

    const renderSearch = (): JSX.Element => (
        <div className="flexbox flex-grow-1 pt-8 pb-8 pl-10 pr-10 dc__gap-8 dc__align-self-stretch dc__align-items-center bc-n50 dc__border dc__border-radius-4-imp focus-within-border-b5 dc__hover-border-n300 h-32 w-250">
            <SearchIcon className="icon-dim-16" />

            <input
                data-testid="ci-trigger-search-by-commit-hash"
                type="text"
                placeholder="Search by image tag"
                value={state.searchText}
                className="flex-grow-1 dc__no-border dc__outline-none-imp bc-n50 lh-20 fs-13 cn-9 fw-4 p-0 placeholder-cn5"
                onChange={handleInputChange}
                onKeyDown={handleFilterKeyPress}
                autoFocus
            />

            {state.searchApplied && (
                <button
                    className="dc__outline-none-imp dc__no-border p-0 bc-n50 flex"
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search input"
                >
                    <Clear className="icon-dim-16 icon-n4 dc__vertical-align-middle" />
                </button>
            )}
        </div>
    )

    const renderMaterialList = (isApprovalConfigured: boolean) => {
        const { consumedImage, materialList, eligibleImagesCount } =
            getConsumedAndAvailableMaterialList(isApprovalConfigured)
        const selectImageTitle = state.isRollbackTrigger ? 'Select from previously deployed images' : 'Select Image'
        const titleText = isApprovalConfigured ? 'Approved images' : selectImageTitle
        const showActionBar =
            FilterActionBar && !state.searchApplied && !!resourceFilters?.length && !state.showConfiguredFilters

        return (
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
                            <SearchIcon onClick={handleSearchClick} className="icon-dim-16 icon-color-n6 cursor" />
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
                        {state.loadingMore ? <Progressing styles={{ height: '32px' }} /> : 'Fetch more images'}
                    </button>
                )}
            </>
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

    const formatOptionLabel = (option) => (
        <div className="flex left column w-100">
            <span className="dc__ellipsis-right">{option.label}</span>
            <small className="cn-6">{option.infoText}</small>
            <div className="dc__border-bottom" />
        </div>
    )

    const customValueContainer = (props) => (
        <components.ValueContainer {...props}>
            <div className="fs-13 fw-4 cn-9">
                Deploy:&nbsp; <span className="cb-5 fw-6">{props.selectProps.value?.label}</span>
            </div>
            {React.cloneElement(props.children[1], {
                style: { position: 'absolute' },
            })}
        </components.ValueContainer>
    )

    const renderConfigDiffStatus = () => {
        const _canReviewConfig = canReviewConfig() && state.recentDeploymentConfig !== null
        const isLastDeployedOption =
            state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG
        const statusColorClasses = state.checkingDiff
            ? 'cn-0 bcb-5'
            : !_canReviewConfig
              ? 'cn-9 bcn-1 cursor-not-allowed'
              : state.diffFound
                ? 'cn-0 bcr-5'
                : 'cn-0 bcg-5'
        let checkingdiff: JSX.Element
        let configNotAvailable: JSX.Element
        let noDiff: JSX.Element
        let diffFound: JSX.Element
        if (state.checkingDiff) {
            checkingdiff = (
                <>
                    Checking diff&nbsp;
                    <Progressing
                        size={16}
                        styles={{
                            width: 'auto',
                        }}
                    />
                </>
            )
        } else if (!_canReviewConfig) {
            configNotAvailable = state.recentDeploymentConfig && (
                <>
                    <WarningIcon className="no-config-found-icon icon-dim-16" />
                    &nbsp; Config Not Available
                </>
            )
        } else if (state.diffFound) {
            diffFound = (
                <>
                    <WarningIcon className="config-diff-found-icon icon-dim-16" />
                    &nbsp; <span className="config-diff-status">Config Diff</span>
                </>
            )
        } else {
            noDiff = <span className="config-diff-status">No Config Diff</span>
        }
        return (
            <Tippy
                className="default-tt cursor"
                arrow={false}
                content={`${diffFound ? 'Config' : 'No config'} diff from last deployed`}
            >
                <button
                    className={`trigger-modal__config-diff-status flex pl-16 pr-16 dc__right-radius-4 dc__no-background  dc__outline-none-imp dc__no-border ${
                        _canReviewConfig ? 'cursor' : 'config-not-found'
                    } ${isLastDeployedOption ? 'pt-10 pb-10' : 'pt-7 pb-7'}`}
                    disabled={state.checkingDiff}
                    type="button"
                    onClick={() => onClickSetInitialParams('review-config')}
                >
                    {!isLastDeployedOption && (state.recentDeploymentConfig !== null || state.checkingDiff) && (
                        <div
                            className={`flex pt-3 pb-3 pl-12 pr-12 dc__border-radius-24 fs-12 fw-6 lh-20 ${statusColorClasses}`}
                        >
                            {checkingdiff}
                            {configNotAvailable}
                            {diffFound}
                            {noDiff}
                        </div>
                    )}
                    {((!state.checkingDiff && _canReviewConfig) ||
                        isLastDeployedOption ||
                        !state.recentDeploymentConfig) && (
                        <span className={`dc__uppercase cb-5 pointer ${!isLastDeployedOption ? 'ml-12' : ''}`}>
                            REVIEW
                        </span>
                    )}
                </button>
            </Tippy>
        )
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
                    (!state.specificDeploymentConfig?.deploymentTemplate ||
                        !state.specificDeploymentConfig?.pipelineStrategy)
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
            } else {
                deployTrigger(e)
            }
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
                className={`trigger-modal__trigger ${
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
                        <div className="flex left dc__border br-4 h-42">
                            <div className="flex">
                                <ReactSelect
                                    options={getDeployConfigOptions(
                                        state.isRollbackTrigger,
                                        state.recentDeploymentConfig !== null,
                                    )}
                                    components={{
                                        IndicatorSeparator: null,
                                        DropdownIndicator,
                                        Option,
                                        ValueContainer: customValueContainer,
                                    }}
                                    isDisabled={state.checkingDiff}
                                    isSearchable={false}
                                    formatOptionLabel={formatOptionLabel}
                                    classNamePrefix="deploy-config-select"
                                    placeholder="Select Config"
                                    menuPlacement="top"
                                    value={state.selectedConfigToDeploy}
                                    styles={getCommonConfigSelectStyles({
                                        valueContainer: (base, state) => ({
                                            ...base,
                                            minWidth: '135px',
                                            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                                        }),
                                    })}
                                    onChange={handleConfigSelection}
                                />
                            </div>
                            <span className="dc__border-left h-100" />
                            {/* FIXME: This will cause two tippy which should not be there */}
                            <ConditionalWrap
                                condition={!state.checkingDiff && disableDeployButton}
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
                                {renderConfigDiffStatus()}
                            </ConditionalWrap>
                        </div>
                    )}
                <ConditionalWrap
                    condition={!state.checkingDiff && isDeployButtonDisabled()}
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
                                {isVirtualEnvironment && ' to virtual env'}
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
        if (state.checkingDiff) {
            return <Progressing pageLoader />
        }

        return (
            <TriggerViewConfigDiff
                currentConfiguration={state.recentDeploymentConfig}
                baseTemplateConfiguration={getBaseTemplateConfiguration()}
                selectedConfigToDeploy={state.selectedConfigToDeploy}
                handleConfigSelection={handleConfigSelection}
                isConfigAvailable={isConfigAvailable}
                diffOptions={state.diffOptions}
                isRollbackTriggerSelected={state.isRollbackTrigger}
                isRecentConfigAvailable={state.recentDeploymentConfig !== null}
                canReviewConfig={showConfigDiffView && canReviewConfig()}
            />
        )
    }

    const renderTriggerBody = (isApprovalConfigured: boolean) => (
        <div
            className={`trigger-modal__body ${showConfigDiffView && canReviewConfig() ? 'p-0' : ''}`}
            style={{
                height: getTriggerBodyHeight(isApprovalConfigured),
            }}
        >
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
                    <div className="flex left">
                        <button
                            type="button"
                            className="dc__transparent icon-dim-24"
                            onClick={() => onClickSetInitialParams('list')}
                        >
                            <BackIcon />
                        </button>
                        <div className="flex column left ml-16">
                            <h1 className="modal__title mb-8">{renderCDModalHeader()}</h1>
                            {state.selectedMaterial && (
                                <div className="flex left dc__column-gap-24">
                                    <ArtifactInfo
                                        {...getArtifactInfoProps(
                                            state.selectedMaterial,
                                            (stageType === DeploymentNodeType.CD || state.isRollbackTrigger) &&
                                                isApprovalConfigured &&
                                                ApprovalInfoTippy,
                                        )}
                                    />
                                </div>
                            )}
                        </div>
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

                <div className="flexbox-col dc__gap-12 dc__align-items-center h-100 w-100 pl-20 pr-20">
                    <div className="flexbox dc__align-items-center dc__content-space pt-20 pb-16 w-100">
                        <div className="shimmer-loading" style={{ width: '100px', height: '20px' }} />
                    </div>

                    <div className="shimmer-loading w-100" style={{ height: '150px' }} />
                    <div className="shimmer-loading w-100" style={{ height: '150px' }} />
                    <div className="shimmer-loading w-100" style={{ height: '150px' }} />
                    <div className="shimmer-loading w-100" style={{ height: '150px' }} />
                </div>
            </>
        )
    }

    if (materialsError) {
        showError(materialsError)

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

                <Reload reload={reloadMaterialsPropagation} />
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
