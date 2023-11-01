import React, { useContext, useEffect, useRef, useState } from 'react'
import ReactSelect, { components } from 'react-select'
import ReactGA from 'react-ga4'
import { toast } from 'react-toastify'
import {
    CDMaterialProps,
    CDMaterialState,
    DeploymentWithConfigType,
    FilterConditionViews,
    MATERIAL_TYPE,
    STAGE_TYPE,
    TriggerViewContextType,
    BulkSelectionEvents,
} from './types'
import { GitTriggers } from '../cicdHistory/types'
import close from '../../../../assets/icons/ic-close.svg'
import arrow from '../../../../assets/icons/misc/arrow-chevron-down-black.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check-circle.svg'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as WarningIcon } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as BackIcon } from '../../../../assets/icons/ic-arrow-backward.svg'
import { ReactComponent as BotIcon } from '../../../../assets/icons/ic-bot.svg'
import { ReactComponent as World } from '../../../../assets/icons/ic-world.svg'
import { ReactComponent as Failed } from '../../../../assets/icons/ic-rocket-fail.svg'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as SearchIcon } from '../../../../assets/icons/ic-search.svg'
import { ReactComponent as RefreshIcon } from '../../../../assets/icons/ic-arrows_clockwise.svg'
import { ReactComponent as ICAbort } from '../../../../assets/icons/ic-abort.svg'
import { ReactComponent as Clear } from '../../../../assets/icons/ic-error.svg'
import play from '../../../../assets/icons/misc/arrow-solid-right.svg'
import docker from '../../../../assets/icons/misc/docker.svg'
import noartifact from '../../../../assets/img/no-artifact@2x.png'
import noResults from '../../../../assets/img/empty-noresult@2x.png'
import { ButtonWithLoader, importComponentFromFELibrary } from '../../../common'
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
    getRandomColor,
    CDModalTab,
    ScanVulnerabilitiesTable,
    ImageTagButton,
    ImageTagsContainer,
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
} from '@devtron-labs/devtron-fe-common-lib'
import { CDButtonLabelMap, getCommonConfigSelectStyles, TriggerViewContext } from './config'
import {
    getLatestDeploymentConfig,
    getRecentDeploymentConfig,
    getSpecificDeploymentConfig,
    triggerCDNode,
} from '../../service'
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../../../v2/devtronStackManager/DevtronStackManager.type'
import { DropdownIndicator, Option } from '../../../v2/common/ReactSelect.utils'
import {
    LAST_SAVED_CONFIG_OPTION,
    SPECIFIC_TRIGGER_CONFIG_OPTION,
    checkForDiff,
    getDeployConfigOptions,
    processResolvedPromise,
} from './TriggerView.utils'
import TriggerViewConfigDiff from './triggerViewConfigDiff/TriggerViewConfigDiff'
import Tippy from '@tippyjs/react'
import { ARTIFACT_STATUS, NO_VULNERABILITY_TEXT, EXCLUDED_IMAGE_TOOLTIP, TRIGGER_VIEW_GA_EVENTS } from './Constants'
import { ScannedByToolModal } from '../../../common/security/ScannedByToolModal'
import { ModuleNameMap } from '../../../../config'
import { EMPTY_STATE_STATUS, TOAST_BUTTON_TEXT_VIEW_DETAILS } from '../../../../config/constantMessaging'
import { abortEarlierRequests, getInitialState } from './cdMaterials.utils'
import { getLastExecutionByArtifactAppEnv } from '../../../../services/service'

const ApprovalInfoTippy = importComponentFromFELibrary('ApprovalInfoTippy')
const ExpireApproval = importComponentFromFELibrary('ExpireApproval')
const ApprovedImagesMessage = importComponentFromFELibrary('ApprovedImagesMessage')
const ApprovalEmptyState = importComponentFromFELibrary('ApprovalEmptyState')
const FilterActionBar = importComponentFromFELibrary('FilterActionBar')
const ConfiguredFilters = importComponentFromFELibrary('ConfiguredFilters')
const CDMaterialInfo = importComponentFromFELibrary('CDMaterialInfo')
const getDeployManifestDownload = importComponentFromFELibrary('getDeployManifestDownload', null, 'function')

export default function CDMaterial({
    materialType,
    appId,
    envId,
    pipelineId,
    stageType,
    isFromBulkCD,
    envName,
    closeCDModal,
    triggerType,
    isApplicationGroupTrigger,
    history,
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
}: Readonly<CDMaterialProps>) {
    // stageType should handle approval node, compute CDMaterialServiceEnum, create queryParams state
    // FIXME: the queryparams returned by useSearchString seems faulty
    const { searchParams } = useSearchString()
    const searchImageTag = searchParams.search

    const [material, setMaterial] = useState<CDMaterialType[]>([])
    const [state, setState] = useState<CDMaterialState>(getInitialState(materialType, material, searchImageTag))
    // Should be able to abort request using useAsync
    const abortControllerRef = useRef(new AbortController())
    // TODO: Ask if pipelineId always changes on change of app else add appId as dependency
    const [loadingMaterials, materialsResult, materialsError, reloadMaterials] = useAsync(
        () =>
            abortEarlierRequests(abortControllerRef, () =>
                genericCDMaterialsService(
                    materialType === MATERIAL_TYPE.rollbackMaterialList
                        ? CDMaterialServiceEnum.ROLLBACK
                        : CDMaterialServiceEnum.CD_MATERIALS,
                    pipelineId,
                    // Dont think need to set stageType to approval in case of approval node
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
            ),
        // NOTE: Add state.filterView if want to add filtering support from backend
        [pipelineId, stageType, materialType, searchImageTag],
    )

    const { onClickCDMaterial } = useContext<TriggerViewContextType>(TriggerViewContext)
    const [noMoreImages, setNoMoreImages] = useState<boolean>(false)
    const [tagsEditable, setTagsEditable] = useState<boolean>(false)
    const [appReleaseTagNames, setAppReleaseTagNames] = useState<string[]>([])
    const [showAppliedFilters, setShowAppliedFilters] = useState<boolean>(false)
    const [deploymentLoading, setDeploymentLoading] = useState<boolean>(false)
    const [appliedFilterList, setAppliedFilterList] = useState<FilterConditionsListType[]>([])

    const resourceFilters = materialsResult?.resourceFilters ?? []
    const hideImageTaggingHardDelete = materialsResult?.hideImageTaggingHardDelete ?? false
    const requestedUserId = materialsResult?.requestedUserId ?? ''
    const userApprovalConfig = materialsResult?.userApprovalConfig
    const isApprovalConfigured = userApprovalConfig?.requiredCount > 0

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
        if (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG) {
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
        ]).then(
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
                    recentDeploymentConfig: _recentDeploymentConfig, //last deployed config
                    latestDeploymentConfig: _latestDeploymentConfig, //last saved config
                    specificDeploymentConfig: _specificDeploymentConfig, //config of one particular wfrId
                    diffFound: _diffOptions && Object.values(_diffOptions).some((d) => d),
                    diffOptions: _diffOptions,
                    checkingDiff: false,
                }))
            },
        )
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

    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            isRollbackTrigger: materialType === MATERIAL_TYPE.rollbackMaterialList,
            isSelectImageTrigger: materialType === MATERIAL_TYPE.inputMaterialList,
            selectedConfigToDeploy:
                materialType === MATERIAL_TYPE.rollbackMaterialList
                    ? SPECIFIC_TRIGGER_CONFIG_OPTION
                    : LAST_SAVED_CONFIG_OPTION,
        }))
    }, [materialType])

    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            filterView: FilterConditionViews.ELIGIBLE,
            showConfiguredFilters: false,
        }))
        setShowAppliedFilters(false)
    }, [appId])

    /* ------------ Helping utilities  ------------*/
    const toggleSourceInfo = (
        materialIndex: number,
        selectedCDDetail?: { id?: number; type?: DeploymentNodeType } | null,
    ) => {
        const _material = [...material]
        _material[materialIndex].showSourceInfo = !_material[materialIndex].showSourceInfo
        setMaterial(_material)
    }

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

    const changeTab = (
        materialIndex: number,
        artifactId: number,
        tab,
        selectedCDDetail?: { id?: number; type?: DeploymentNodeType } | null,
        appId?: number,
    ): void => {
        const _material = [...material]
        _material[materialIndex].tab = tab

        if (tab === CDModalTab.Changes) {
            setMaterial(_material)
            return
        }

        if (material[materialIndex].scanned || material[materialIndex].scanEnabled) {
            _material[materialIndex].vulnerabilitiesLoading = true
            setMaterial([..._material])
            getLastExecutionByArtifactAppEnv(artifactId, appId, envId)
                .then((response) => {
                    _material[materialIndex].vulnerabilities = response.result.vulnerabilities
                    _material[materialIndex].lastExecution = response.result.lastExecution
                    _material[materialIndex].scanToolId = response.result.scanToolId
                })
                .catch((error) => {
                    showError(error)
                })
                .finally(() => {
                    _material[materialIndex].vulnerabilitiesLoading = false
                    setMaterial([..._material])
                })
        } else {
            setMaterial([..._material])
        }
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
        if (!isApplicationGroupTrigger) {
            onClickCDMaterial(pipelineId, DeploymentNodeType.CD, true)
        }

        history.push({
            search: `approval-node=${pipelineId}`,
        })
    }

    const getIsApprovalRequester = (userApprovalMetadata?: UserApprovalMetadataType) =>
        userApprovalMetadata?.requestedUserData && userApprovalMetadata.requestedUserData.userId === requestedUserId

    const getIsImageApprover = (userApprovalMetadata?: UserApprovalMetadataType) =>
        userApprovalMetadata?.approvedUsersData &&
        userApprovalMetadata.approvedUsersData.some((_approver) => _approver.userId === requestedUserId)

    // NOTE: Pure
    const getIsMaterialInfoAvailable = (materialInfo: MaterialInfo[]) => {
        let isMaterialInfoAvailable = true
        if (materialInfo) {
            for (const _info of materialInfo) {
                isMaterialInfoAvailable =
                    isMaterialInfoAvailable &&
                    !!(_info.webhookData || _info.author || _info.message || _info.modifiedTime || _info.revision)

                if (!isMaterialInfoAvailable) {
                    break
                }
            }
        }

        return isMaterialInfoAvailable
    }

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

    const canReviewConfig = () =>
        (state.recentDeploymentConfig?.deploymentTemplate &&
            state.recentDeploymentConfig.pipelineStrategy &&
            (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG ||
                isConfigPresent())) ||
        !state.recentDeploymentConfig

    const reviewConfig = () => {
        if (canReviewConfig()) {
            setState((prevState) => ({
                ...prevState,
                showConfigDiffView: !prevState.showConfigDiffView,
            }))
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

    const handleConfigSelection = (selected) => {
        if (selected.value !== state.selectedConfigToDeploy.value) {
            const _diffOptions = checkForDiff(state.recentDeploymentConfig, getBaseTemplateConfiguration(selected))

            setState((prevState) => ({
                ...prevState,
                selectedConfigToDeploy: selected,
                diffFound: _diffOptions && Object.values(_diffOptions).some((d) => d),
                diffOptions: _diffOptions,
            }))
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
        } else if (cdWorkflowType === DeploymentNodeType.POSTCD) {
            return `${helmPackageName} (Post)`
        } else {
            return helmPackageName
        }
    }

    const onClickManifestDownload = (appId: number, envId: number, helmPackageName: string, cdWorkflowType: string) => {
        const downloadManifestDownload = {
            appId: appId,
            envId: envId,
            appName: getHelmPackageName(helmPackageName, cdWorkflowType),
            cdWorkflowType: cdWorkflowType,
        }
        if (getDeployManifestDownload) {
            getDeployManifestDownload(downloadManifestDownload)
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
            triggerCDNode(pipelineId, ciArtifactId, _appId.toString(), nodeType, deploymentWithConfig, wfrId)
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
                        : showError(errors)
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

        // Blocking the deploy action if already deploying or config is not available
        if (isLoading || isDeployButtonDisabled()) {
            return
        }

        if (isFromBulkCD) {
            // It does'nt need any params btw
            triggerDeploy(stageType, appId, Number(getCDArtifactId()))
            return
        }

        if (state.isRollbackTrigger || state.isSelectImageTrigger) {
            handleDeployment(
                stageType,
                appId,
                Number(getCDArtifactId()),
                e,
                state.selectedConfigToDeploy?.value,
                getWfrId(),
            )
            return
        }

        handleDeployment(stageType, appId, Number(getCDArtifactId()), e)
    }

    const loadOlderImages = () => {
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
                    offset: material.length,
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
                        if (materialsResponse.resourceFilters?.length && !state.searchApplied) {
                            const eligibleImages = _newMaterialsResponse.filter(
                                (mat) => mat.filterState === FilterStates.ALLOWED,
                            ).length

                            const infoMessage =
                                eligibleImages === 0
                                    ? 'No new eligible images found.'
                                    : `${eligibleImages} new eligible images found.`

                            if (state.filterView === FilterConditionViews.ELIGIBLE) {
                                toast.success(`${baseSuccessMessage} ${infoMessage}`)
                            } else {
                                toast.info(`${baseSuccessMessage} ${infoMessage}`)
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
        if (state.showConfigDiffView) {
            return 'calc(100vh - 141px)'
        } else if (isApprovalConfigured && (state.isRollbackTrigger || material.length > 1)) {
            return 'calc(100vh - 156px)'
        } else {
            return 'calc(100vh - 116px)'
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
            rootClassName="flex cta h-36"
            onClick={loadOlderImages}
            disabled={state.loadingMore}
            isLoading={state.loadingMore}
            loaderColor="white"
        >
            Fetch More Images
        </ButtonWithLoader>
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
            if (noMoreImages) {
                return (
                    <GenericEmptyState
                        image={noResults}
                        title="No eligible image found"
                        subTitle={`Latest ${material.length} images are not passing the filter conditions`}
                    />
                )
            } else {
                return (
                    <GenericEmptyState
                        image={noResults}
                        title="No eligible image found"
                        subTitle={`Latest ${material.length} images are not passing the filter conditions`}
                        isButtonAvailable
                        renderButton={renderLoadMoreButton}
                    />
                )
            }
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
                const _gitCommit: GitTriggers = {
                    Commit: mat.revision,
                    Author: mat.author,
                    Date: mat.modifiedTime,
                    Message: mat.message,
                    WebhookData: JSON.parse(mat.webhookData),
                    Changes: [],
                    GitRepoUrl: '',
                    GitRepoName: '',
                    CiConfigureSourceType: '',
                    CiConfigureSourceValue: '',
                }

                if (materialData.appliedFilters?.length > 0 && CDMaterialInfo) {
                    return (
                        <CDMaterialInfo
                            commitTimestamp={handleUTCTime(materialData.createdTime)}
                            appliedFiltersTimestamp={handleUTCTime(materialData.appliedFiltersTimestamp)}
                            envName={envName}
                            // Should not use Arrow function here but seems like no choice
                            showConfiguredFilters={(e: React.MouseEvent) => handleShowAppliedFilters(e, materialData)}
                            filterState={materialData.appliedFiltersState}
                            dataSource={materialData.dataSource}
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
                                    selectedCommitInfo={''}
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
                            {/* TODO: Move into fe-common */}
                            <GitCommitInfoGeneric
                                index={index}
                                materialUrl={mat.url}
                                showMaterialInfoHeader
                                commitInfo={_gitCommit}
                                materialSourceType={mat.type}
                                selectedCommitInfo={''}
                                materialSourceValue={mat.branch}
                            />
                        </div>
                    )
                )
            })}
        </>
    )

    // NOTE: Pure component, Conditions can be optimized.
    const renderVulnerabilities = (mat: CDMaterialType) => {
        if (!mat.scanned) {
            return (
                <div className="security-tab-empty">
                    <p className="security-tab-empty__title">Image was not scanned</p>
                </div>
            )
        } else if (!mat.scanEnabled) {
            return (
                <div className="security-tab-empty">
                    <p className="security-tab-empty__title">Scan is Disabled</p>
                </div>
            )
        } else if (mat.vulnerabilitiesLoading) {
            return (
                <div className="security-tab-empty">
                    <Progressing />
                </div>
            )
        } else if (!mat.vulnerabilitiesLoading && mat.vulnerabilities.length === 0) {
            return (
                <div className="security-tab-empty summary-view__card">
                    <p className="security-tab-empty__title">{NO_VULNERABILITY_TEXT.Secured}</p>
                    <p>{NO_VULNERABILITY_TEXT.NoVulnerabilityFound}</p>
                    <p className="security-tab-empty__subtitle">{mat.lastExecution}</p>
                    <p className="workflow__header dc__border-radius-24 bcn-0">
                        <ScannedByToolModal scanToolId={mat.scanToolId} />
                    </p>
                </div>
            )
        } else {
            return (
                <div className="security-tab">
                    <div className="flexbox dc__content-space">
                        <span className="flex left security-tab__last-scanned ">Scanned on {mat.lastExecution} </span>
                        <span className="flex right">
                            <ScannedByToolModal scanToolId={mat.scanToolId} />
                        </span>
                    </div>
                    <ScanVulnerabilitiesTable vulnerabilities={mat.vulnerabilities} />
                </div>
            )
        }
    }

    // NOTE: Make it pure component by taking parentEnvironment as args
    const renderActiveCD = (mat: CDMaterialType) => (
        <>
            {mat.latest && (
                <span className="bcg-1 br-4 eg-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                    <div className="fw-4 fs-11 lh-16 flex">
                        <World className="icon-dim-16 mr-4 scg-5" />
                        {isVirtualEnvironment ? 'Last deployed ' : 'Active '} on
                        <span className="fw-6 ml-4">{envName} </span>
                    </div>
                </span>
            )}

            {/* NOTE: Have Removed mat?.isVirtualEnvironment since its not even a type, test this */}
            {mat.runningOnParentCd && (
                <span className="bcg-1 br-4 eg-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                    <div className="fw-4 fs-11 lh-16 flex">
                        <World className="icon-dim-16 mr-4 scg-5" />
                        {isVirtualEnvironment ? 'Last deployed ' : 'Active '} on
                        <span className="fw-6 ml-4">{parentEnvironmentName}</span>
                    </div>
                </span>
            )}
        </>
    )

    const renderProgressingCD = () => (
        <span className="bcy-1 br-4 ey-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
            <div className="fw-4 fs-11 lh-16 flex">
                <div className={`dc__app-summary__icon icon-dim-16 mr-6 progressing progressing--node`} />
                Deploying on <span className="fw-6 ml-4">{envName} </span>
            </div>
        </span>
    )

    const renderFailedCD = () => (
        <span className="bcr-1 br-4 er-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
            <div className="fw-4 fs-11 lh-16 flex">
                <Failed className="icon-dim-16 mr-4" />
                Last deployment failed on <span className="fw-6 ml-4">{envName} </span>
            </div>
        </span>
    )

    const renderSequentialCDCardTitle = (mat) => {
        if (stageType !== STAGE_TYPE.CD) {
            return
        }

        if (
            mat.latest ||
            mat.runningOnParentCd ||
            mat.artifactStatus === ARTIFACT_STATUS.Progressing ||
            mat.artifactStatus === ARTIFACT_STATUS.Degraded ||
            mat.artifactStatus === ARTIFACT_STATUS.Failed ||
            mat.index == 0
        ) {
            return (
                <div>
                    <div className="bcn-0 br-4 mb-8 flex left">
                        {renderActiveCD(mat)}
                        {mat.artifactStatus === ARTIFACT_STATUS.Progressing && renderProgressingCD()}
                        {(mat.artifactStatus === ARTIFACT_STATUS.Degraded ||
                            mat.artifactStatus === ARTIFACT_STATUS.Failed) &&
                            renderFailedCD()}
                        {/* WARNING: Latest from mat is not same as this tag */}
                        {mat.index == 0 && materialType !== MATERIAL_TYPE.rollbackMaterialList && !searchImageTag && (
                            <div className="">
                                <ImageTagButton
                                    text="Latest"
                                    isSoftDeleted={false}
                                    isEditing={false}
                                    tagId={0}
                                    softDeleteTags={[]}
                                    isSuperAdmin={[]}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    }

    const renderMaterialCTA = (
        mat: CDMaterialType,
        isApprovalRequester: boolean = false,
        isImageApprover: boolean = false,
        disableSelection: boolean = false,
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
        } else if (disableSelection || isImageApprover) {
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
        } else if (mat.isSelected) {
            return (
                <Check
                    className={`${
                        materialType !== 'none' && isApprovalRequester && !isImageApprover && !disableSelection
                            ? ''
                            : 'dc__align-right'
                    } icon-dim-24 cursor`}
                    data-testid={`cd-artifact-selected-check-${mat.index}`}
                />
            )
        } else {
            const cursorClass = mat.isSelected ? 'cursor-default' : 'cursor'
            const selectClassName = mat.vulnerable ? 'cursor-not-allowed' : cursorClass

            return (
                <span
                    className={selectClassName}
                    onClick={(event) => {
                        event.stopPropagation()
                        if (!disableSelection && !isImageApprover && !mat.vulnerable) {
                            handleImageSelection(mat.index, mat)
                        }
                    }}
                    data-testid={`cd-artifact-select-${mat.index}`}
                >
                    SELECT
                </span>
            )
        }
    }

    const renderMaterialInfo = (
        mat: CDMaterialType,
        isApprovalConfigured: boolean,
        hideSelector?: boolean,
        disableSelection?: boolean,
    ) => {
        const isApprovalRequester = getIsApprovalRequester(mat.userApprovalMetadata)
        const isImageApprover = getIsImageApprover(mat.userApprovalMetadata)

        return (
            <>
                <div className="flex left column">
                    {mat.filterState === FilterStates.ALLOWED ? (
                        <div data-testid="cd-trigger-modal-image-value" className="commit-hash commit-hash--docker">
                            <img src={docker} alt="" className="commit-hash__icon" />
                            {mat.image}
                        </div>
                    ) : (
                        <Tippy
                            className="default-tt w-200"
                            arrow={false}
                            placement="top"
                            content={EXCLUDED_IMAGE_TOOLTIP}
                        >
                            <div className="flexbox pt-2 pb-2 pl-8 pr-8 br-4 bcr-1 dc__align-items-center dc__gap-4">
                                <ICAbort className="icon-dim-20 fcr-5" />

                                <p className="m-0 fs-12 lh-16 fw-4 cr-5">{mat.image}</p>
                            </div>
                        </Tippy>
                    )}
                    {stageType !== STAGE_TYPE.CD && mat.latest && (
                        <span className="last-deployed-status">Last Run</span>
                    )}
                </div>
                {!disableSelection &&
                    (stageType === DeploymentNodeType.CD || state.isRollbackTrigger) &&
                    isApprovalConfigured && (
                        <>
                            {ApprovalInfoTippy ? (
                                <ApprovalInfoTippy
                                    matId={mat.id}
                                    appId={appId}
                                    pipelineId={pipelineId}
                                    stageType={stageType}
                                    requestedUserId={requestedUserId}
                                    userApprovalMetadata={mat.userApprovalMetadata}
                                    onClickCDMaterial={onClickCDMaterial}
                                />
                            ) : (
                                <div />
                            )}
                        </>
                    )}
                {materialType === MATERIAL_TYPE.none ? (
                    <div />
                ) : (
                    <div className="material-history__info flex left fs-13">
                        <DeployIcon className="icon-dim-16 scn-6 mr-8" />
                        <span className="fs-13 fw-4">{mat.deployedTime}</span>
                    </div>
                )}

                {!!mat.deployedBy && state.isRollbackTrigger ? (
                    <div className="material-history__deployed-by flex left">
                        {mat.deployedBy === 'system' ? (
                            <>
                                <BotIcon className="icon-dim-16 mr-6" />
                                <span className="fs-13 fw-4">Auto triggered</span>
                            </>
                        ) : (
                            <>
                                <span
                                    className="flex fs-13 fw-6 lh-18 icon-dim-20 mr-6 cn-0 m-auto dc__border-transparent dc__uppercase dc__border-radius-50-per"
                                    style={{
                                        backgroundColor: getRandomColor(mat.deployedBy),
                                    }}
                                >
                                    {mat.deployedBy[0]}
                                </span>
                                <span className="fs-13 fw-4">{mat.deployedBy}</span>
                            </>
                        )}
                    </div>
                ) : (
                    <div />
                )}
                {!hideSelector && (
                    <div className="material-history__select-text fs-13 w-auto dc__no-text-transform flex right cursor-default">
                        {materialType !== 'none' &&
                            isApprovalRequester &&
                            !isImageApprover &&
                            !disableSelection &&
                            ExpireApproval && (
                                <>
                                    <ExpireApproval
                                        matId={mat.id}
                                        appId={appId}
                                        pipelineId={pipelineId}
                                        stageType={stageType}
                                        userApprovalMetadata={mat.userApprovalMetadata}
                                        onClickCDMaterial={onClickCDMaterial}
                                    />

                                    {mat.filterState !== FilterStates.ALLOWED && (
                                        <div className="flex dc__gap-12 mr-12">
                                            <div className="h-12 dc__border-left" />
                                        </div>
                                    )}
                                </>
                            )}
                        {renderMaterialCTA(mat, isApprovalRequester, isImageApprover, disableSelection)}
                    </div>
                )}
            </>
        )
    }

    const renderMaterial = (materialList: CDMaterialType[], disableSelection: boolean, isApprovalConfigured: boolean) =>
        materialList.map((mat) => {
            const isMaterialInfoAvailable = getIsMaterialInfoAvailable(mat.materialInfo)
            const approvedImageClass = getApprovedImageClass(disableSelection, isApprovalConfigured)

            const isApprovalRequester = getIsApprovalRequester(mat.userApprovalMetadata)
            const isImageApprover = getIsImageApprover(mat.userApprovalMetadata)
            const hideSourceInfo = !state.materialInEditModeMap.get(+mat.id)
            return (
                <div
                    key={`material-history-${mat.index}`}
                    className={`material-history material-history--cd image-tag-parent-card ${
                        mat.isSelected && !disableSelection && !getIsImageApprover(mat.userApprovalMetadata)
                            ? 'material-history-selected'
                            : ''
                    }`}
                >
                    <div className="p-12 bcn-0 br-4">
                        <div className="dc__content-space flexbox dc__align-start">
                            <div>
                                {renderSequentialCDCardTitle(mat)}
                                <div
                                    data-testid={`cd-material-history-image-${mat.index}`}
                                    className={`material-history__top cursor-default ${approvedImageClass}`}
                                >
                                    {renderMaterialInfo(mat, isApprovalConfigured, true, disableSelection)}
                                </div>
                            </div>
                            <div className="material-history__select-text fs-13 w-auto dc__no-text-transform flex right cursor-default">
                                {materialType !== 'none' &&
                                    isApprovalRequester &&
                                    !isImageApprover &&
                                    !disableSelection &&
                                    ExpireApproval && (
                                        <>
                                            <ExpireApproval
                                                matId={mat.id}
                                                appId={appId}
                                                pipelineId={pipelineId}
                                                stageType={stageType}
                                                userApprovalMetadata={mat.userApprovalMetadata}
                                                onClickCDMaterial={onClickCDMaterial}
                                            />

                                            {mat.filterState !== FilterStates.ALLOWED && (
                                                <div className="flex dc__gap-12 mr-12">
                                                    <div className="h-12 dc__border-left" />
                                                </div>
                                            )}
                                        </>
                                    )}
                                {renderMaterialCTA(mat, isApprovalRequester, isImageApprover, disableSelection)}
                            </div>
                        </div>
                        <div data-testid={`image-tags-container-${mat.index}`}>
                            <ImageTagsContainer
                                ciPipelineId={ciPipelineId}
                                artifactId={+mat.id}
                                imageComment={mat.imageComment}
                                imageReleaseTags={mat.imageReleaseTags}
                                appReleaseTagNames={appReleaseTagNames}
                                setAppReleaseTagNames={setAppReleaseTagNames}
                                tagsEditable={tagsEditable}
                                toggleCardMode={toggleCardMode}
                                setTagsEditable={setTagsEditable}
                                forceReInit
                                hideHardDelete={hideImageTaggingHardDelete}
                                updateCurrentAppMaterial={updateCurrentAppMaterial}
                            />
                        </div>
                    </div>
                    {mat.materialInfo.length > 0 &&
                        (isMaterialInfoAvailable || mat.appliedFilters?.length) &&
                        hideSourceInfo && (
                            <>
                                <ul
                                    className={`tab-list tab-list--vulnerability ${
                                        mat.showSourceInfo ? '' : 'tab-bottom-radius'
                                    }`}
                                >
                                    {mat.showSourceInfo &&
                                        (state.isSecurityModuleInstalled && !hideInfoTabsContainer ? (
                                            <>
                                                <li className="tab-list__tab">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            changeTab(
                                                                mat.index,
                                                                Number(mat.id),
                                                                CDModalTab.Changes,
                                                                {
                                                                    id: pipelineId,
                                                                    type: stageType,
                                                                },
                                                                appId,
                                                            )
                                                        }}
                                                        className={`dc__transparent tab-list__tab-link tab-list__tab-link--vulnerability ${
                                                            mat.tab === CDModalTab.Changes ? 'active' : ''
                                                        }`}
                                                    >
                                                        Changes
                                                    </button>
                                                </li>
                                                <li className="tab-list__tab">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            changeTab(
                                                                mat.index,
                                                                Number(mat.id),
                                                                CDModalTab.Security,
                                                                isFromBulkCD
                                                                    ? {
                                                                          id: pipelineId,
                                                                          type: stageType,
                                                                      }
                                                                    : null,
                                                                appId,
                                                            )
                                                        }}
                                                        className={`dc__transparent tab-list__tab-link tab-list__tab-link--vulnerability ${
                                                            mat.tab === CDModalTab.Security ? 'active' : ''
                                                        }`}
                                                    >
                                                        Security
                                                        {mat.vulnerabilitiesLoading
                                                            ? ''
                                                            : ` (${mat.vulnerabilities.length})`}
                                                    </button>
                                                </li>
                                            </>
                                        ) : (
                                            <div className="fs-13 fw-6 flex">Source</div>
                                        ))}
                                    <li className="flex dc__align-right">
                                        <button
                                            type="button"
                                            className="material-history__changes-btn"
                                            data-testid={
                                                mat.showSourceInfo ? 'collapse-show-info' : 'collapse-hide-info'
                                            }
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                toggleSourceInfo(
                                                    mat.index,
                                                    isFromBulkCD ? { id: pipelineId, type: stageType } : null,
                                                )
                                            }}
                                        >
                                            {mat.showSourceInfo ? 'Hide Source Info' : 'Show Source Info'}
                                            <img
                                                src={arrow}
                                                alt=""
                                                style={{ transform: `${mat.showSourceInfo ? 'rotate(-180deg)' : ''}` }}
                                            />
                                        </button>
                                    </li>
                                </ul>
                                {mat.showSourceInfo &&
                                    (mat.tab === CDModalTab.Changes
                                        ? renderGitMaterialInfo(mat)
                                        : renderVulnerabilities(mat))}
                            </>
                        )}
                </div>
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

                {!!resourceFilters?.length &&
                    !state.searchApplied &&
                    state.filterView === FilterConditionViews.ELIGIBLE &&
                    !!materialList?.length && (
                        <div className="flex cn-7 fs-13 fw-4 lh-24 dc__gap-4 pb-12">
                            <WarningIcon className="icon-dim-12" />
                            No more eligible images found
                        </div>
                    )}

                {!noMoreImages && !!materialList?.length && (
                    <button
                        className="show-older-images-cta cta ghosted flex h-32"
                        onClick={loadOlderImages}
                        type="button"
                    >
                        {state.loadingMore ? <Progressing styles={{ height: '32px' }} /> : 'Show older images'}
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
        let checkingdiff: JSX.Element, configNotAvailable: JSX.Element, noDiff: JSX.Element, diffFound: JSX.Element
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
        } else {
            if (!_canReviewConfig) {
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
        }
        return (
            <Tippy
                className="default-tt cursor"
                arrow={false}
                content={(diffFound ? 'Config' : 'No config') + ' diff from last deployed'}
            >
                <button
                    className={`trigger-modal__config-diff-status flex pl-16 pr-16 dc__right-radius-4 dc__no-background  dc__outline-none-imp dc__no-border ${
                        _canReviewConfig ? 'cursor' : 'config-not-found'
                    } ${isLastDeployedOption ? 'pt-10 pb-10' : 'pt-7 pb-7'}`}
                    disabled={state.checkingDiff}
                    type="button"
                    onClick={reviewConfig}
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
                    (!state.specificDeploymentConfig ||
                        !state.specificDeploymentConfig.deploymentTemplate ||
                        !state.specificDeploymentConfig.pipelineStrategy)
                        ? 'Please select a different image or configuration to deploy'
                        : 'Please select a different configuration to deploy'}
                </p>
            </>
        )
    }

    const getDeployButtonIcon = () =>
        stageType === STAGE_TYPE.CD ? (
            <DeployIcon className="icon-dim-16 dc__no-svg-fill mr-8" />
        ) : (
            <img src={play} alt="trigger" className="trigger-btn__icon" />
        )

    const renderTriggerModalCTA = (isApprovalConfigured: boolean) => {
        const buttonLabel = CDButtonLabelMap[stageType]
        const disableDeployButton =
            isDeployButtonDisabled() ||
            (material.length > 0 && getIsImageApprover(state.selectedMaterial?.userApprovalMetadata))
        const hideConfigDiffSelector = isApprovalConfigured && disableDeployButton

        return (
            <div
                className={`trigger-modal__trigger ${
                    (!state.isRollbackTrigger && !state.isSelectImageTrigger) ||
                    state.showConfigDiffView ||
                    stageType === DeploymentNodeType.PRECD ||
                    stageType === DeploymentNodeType.POSTCD
                        ? 'flex right'
                        : ''
                }`}
            >
                {!hideConfigDiffSelector &&
                    (state.isRollbackTrigger || state.isSelectImageTrigger) &&
                    !state.showConfigDiffView &&
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
                        className={`cta flex ml-auto h-36 ${disableDeployButton ? 'disabled-opacity' : ''}`}
                        onClick={disableDeployButton ? noop : deployTrigger}
                        type="button"
                    >
                        {deploymentLoading || isSaveLoading ? (
                            <Progressing />
                        ) : (
                            <>
                                {getDeployButtonIcon()}
                                {buttonLabel} {isVirtualEnvironment && 'to virtual env'}
                            </>
                        )}
                    </button>
                </ConditionalWrap>
            </div>
        )
    }

    const renderTriggerBody = (isApprovalConfigured: boolean) => (
        <div
            className={`trigger-modal__body ${state.showConfigDiffView && canReviewConfig() ? 'p-0' : ''}`}
            style={{
                height: getTriggerBodyHeight(isApprovalConfigured),
            }}
        >
            {state.showConfigDiffView && canReviewConfig() ? (
                <TriggerViewConfigDiff
                    currentConfiguration={state.recentDeploymentConfig}
                    baseTemplateConfiguration={getBaseTemplateConfiguration()}
                    selectedConfigToDeploy={state.selectedConfigToDeploy}
                    handleConfigSelection={handleConfigSelection}
                    isConfigAvailable={isConfigAvailable}
                    diffOptions={state.diffOptions}
                    isRollbackTriggerSelected={state.isRollbackTrigger}
                    isRecentConfigAvailable={state.recentDeploymentConfig !== null}
                />
            ) : (
                renderMaterialList(isApprovalConfigured)
            )}
        </div>
    )

    const renderCDModal = (isApprovalConfigured: boolean) => (
        <>
            <div className="trigger-modal__header">
                {state.showConfigDiffView ? (
                    <div className="flex left">
                        <button type="button" className="dc__transparent icon-dim-24" onClick={reviewConfig}>
                            <BackIcon />
                        </button>
                        <div className="flex column left ml-16">
                            <h1 className="modal__title mb-8">{renderCDModalHeader()}</h1>
                            {state.selectedMaterial && (
                                <div className="flex left dc__column-gap-24">
                                    {renderMaterialInfo(state.selectedMaterial, isApprovalConfigured, true)}
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

            {/* FIXME: This material.length>1 needs to be optimised */}
            {isApprovalConfigured && ApprovedImagesMessage && (state.isRollbackTrigger || material.length > 1) && (
                <InfoColourBar
                    message={<ApprovedImagesMessage viewAllImages={viewAllImages} />}
                    classname="info_bar dc__no-border-radius dc__no-top-border"
                    Icon={InfoIcon}
                    iconClass="icon-dim-20"
                />
            )}
            {renderTriggerBody(isApprovalConfigured)}
            {renderTriggerModalCTA(isApprovalConfigured)}
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
        return isFromBulkCD ? renderTriggerBody(isApprovalConfigured) : renderCDModal(isApprovalConfigured)
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
