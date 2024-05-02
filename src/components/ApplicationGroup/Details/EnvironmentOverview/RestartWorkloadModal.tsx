import React, { useEffect, useRef, useState } from 'react'
import {
    ACTION_STATE,
    ButtonWithLoader,
    CHECKBOX_VALUE,
    Checkbox,
    DEPLOYMENT_WINDOW_TYPE,
    Drawer,
    ErrorScreenManager,
    GenericEmptyState,
    InfoColourBar,
    MODAL_TYPE,
    showError,
    stopPropagation,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory, useLocation } from 'react-router-dom'
import {
    AppInfoMetaDataDTO,
    BulkRotatePodsMetaData,
    ResourceIdentifierDTO,
    ResourceMetaData,
    ResourcesMetaDataMap,
    RestartWorkloadModalProps,
} from '../../AppGroup.types'
import { ReactComponent as MechanicalIcon } from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as DropdownIcon } from '../../../../assets/icons/ic-arrow-left.svg'
import { ReactComponent as RotateIcon } from '../../../../assets/icons/ic-arrows_clockwise.svg'
import { ReactComponent as Retry } from '../../../../assets/icons/ic-arrow-clockwise.svg'
import { getRestartWorkloadRotatePods, postRestartWorkloadRotatePods } from './service'
import { APP_DETAILS_TEXT, URL_SEARCH_PARAMS } from './constants'
import './envOverview.scss'
import { RestartStatusListDrawer } from './RestartStatusListDrawer'
import { ApiQueuingWithBatch } from '../../AppGroup.service'
import { importComponentFromFELibrary } from '../../../common'
import { AllExpandableDropdown } from './AllExpandableDropdown'
import { ReactComponent as Warn } from '../../../../assets/icons/ic-warning.svg'

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
export const RestartWorkloadModal = ({
    restartLoader,
    setRestartLoader,
    selectedAppIds,
    envName,
    envId,
}: RestartWorkloadModalProps) => {
    const [bulkRotatePodsMap, setBulkRotatePodsMap] = useState<Record<number, BulkRotatePodsMetaData>>({})
    const [expandedAppIds, setExpandedAppIds] = useState<number[]>([])
    const [selectAllApps, setSelectAllApps] = useState({
        isChecked: false,
        value: null,
    })
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [statusModalLoading, setStatusModalLoading] = useState(false)
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const [showResistanceBox, setShowResistanceBox] = useState(false)
    const [isExpandableButtonClicked, setExpandableButtonClicked] = useState(false)
    const { searchParams } = useSearchString()
    const history = useHistory()
    const [showStatusModal, setShowStatusModal] = useState(false)
    const location = useLocation()
    const httpProtocol = useRef('')

    const [isPartialActionAllowed, setIsPartialActionAllowed] = useState(false)

    const getDeploymentWindowData = async () => {
        const appEnvMap = Object.keys(bulkRotatePodsMap).map((appId) => {
            return { appId: +appId, envId: +envId }
        })
        let _isPartialActionAllowed = false

        const { result } = await getDeploymentWindowStateAppGroup(appEnvMap)
        const _appDeploymentWindowMap = {}
        result?.appData?.forEach((data) => {
            _appDeploymentWindowMap[data.appId] = processDeploymentWindowMetadata(data.deploymentProfileList, envId)
            if (!_isPartialActionAllowed) {
                _isPartialActionAllowed =
                    _appDeploymentWindowMap[data.appId].type === DEPLOYMENT_WINDOW_TYPE.BLACKOUT ||
                    !_appDeploymentWindowMap[data.appId].isActive
                        ? _appDeploymentWindowMap[data.appId].userActionState === ACTION_STATE.PARTIAL
                        : false
            }

            setIsPartialActionAllowed(_isPartialActionAllowed)
        })
    }

    useEffect(() => {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                const protocol = entry.nextHopProtocol
                if (protocol && entry.initiatorType === 'fetch') {
                    httpProtocol.current = protocol
                    observer.disconnect()
                }
            })
        })

        observer.observe({ type: 'resource', buffered: true })
        return () => {
            observer.disconnect()
        }
    }, [])

    const openStatusModal = () => {
        setShowStatusModal(true)
    }

    const setAllAppsCheckboxValue = (_bulkRotatePodsMap: Record<number, BulkRotatePodsMetaData>) => {
        const _selectAllApps = { ...selectAllApps }
        const allChecked = Object.values(bulkRotatePodsMap).every((app) => app.isChecked)
        if (allChecked) {
            _selectAllApps.isChecked = true
            _selectAllApps.value = CHECKBOX_VALUE.CHECKED
        } else if (Object.keys(_bulkRotatePodsMap).length > 0) {
            const someChecked = Object.values(bulkRotatePodsMap).some((app) => app.isChecked)
            if (someChecked) {
                _selectAllApps.isChecked = true
                _selectAllApps.value = CHECKBOX_VALUE.INTERMEDIATE
            } else {
                _selectAllApps.isChecked = false
                _selectAllApps.value = ''
            }
        }
        setSelectAllApps(_selectAllApps)
    }

    const closeDrawer = (e) => {
        stopPropagation(e)
        const newParams = { ...searchParams }
        delete newParams.modal

        abortControllerRef.current.abort()
        history.push({ search: new URLSearchParams(newParams).toString() })
    }
    const getPodsToRotate = async () => {
        setRestartLoader(true)
        const _bulkRotatePodsMap: Record<number, BulkRotatePodsMetaData> = {}
        return getRestartWorkloadRotatePods(selectedAppIds.join(','), envId, abortControllerRef.current.signal)
            .then((response) => {
                if (response.result) {
                    const _restartPodMap = response.result.restartPodMap
                    // Iterate over the restartPodMap and create a bulkRotatePodsMap
                    Object.keys(_restartPodMap).forEach((appId) => {
                        const _resourcesMetaDataMap: ResourcesMetaDataMap = {}
                        const appInfoObject: AppInfoMetaDataDTO = _restartPodMap[appId]

                        appInfoObject.resourceMetaData.forEach((resourceIdentifier: ResourceIdentifierDTO) => {
                            const kindNameKey: string = `${resourceIdentifier.groupVersionKind.Kind}/${resourceIdentifier.name}`
                            const _resourceMetaData: ResourceMetaData = {
                                group: resourceIdentifier.groupVersionKind.Group,
                                kind: resourceIdentifier.groupVersionKind.Kind,
                                version: resourceIdentifier.groupVersionKind.Version,
                                name: resourceIdentifier.name,
                                containsError: resourceIdentifier.containsError,
                                errorResponse: resourceIdentifier.errorResponse,
                                isChecked: !!selectedAppIds.includes(+appId),
                                value: !!selectedAppIds.includes(+appId) && CHECKBOX_VALUE.CHECKED,
                            }
                            // inserting in the resourceMetaDataMap
                            _resourcesMetaDataMap[kindNameKey] = _resourceMetaData
                        })

                        const _bulkRotatePodsMetaData: BulkRotatePodsMetaData = {
                            resources: _resourcesMetaDataMap,
                            appName: appInfoObject.appName,
                            isChecked: !!selectedAppIds.includes(+appId),
                            value: !!selectedAppIds.includes(+appId) && CHECKBOX_VALUE.CHECKED,
                            namespace: response.result.namespace,
                        }

                        _bulkRotatePodsMap[+appId] = _bulkRotatePodsMetaData
                    })
                }
                setBulkRotatePodsMap(_bulkRotatePodsMap)
                setAllAppsCheckboxValue(_bulkRotatePodsMap)

                return null
            })
            .catch((err) => {
                setErrorStatusCode(err.code)
            })
            .finally(() => {
                setRestartLoader(false)
            })
    }

    useEffect(() => {
        if (!location.search || !location.search?.includes(URL_SEARCH_PARAMS.BULK_RESTART_WORKLOAD)) {
            return
        }
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getPodsToRotate()
    }, [location])

    const toggleWorkloadCollapse = (appId: number) => {
        if (expandedAppIds.includes(appId)) {
            setExpandedAppIds(expandedAppIds.filter((id) => id !== appId))
        } else {
            setExpandedAppIds([...expandedAppIds, appId])
        }
    }

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex dc__content-space dc__border-bottom pt-12 pr-20 pb-12 pl-20">
                <div className="fs-16 fw-6 lh-1-5">{` Restart workloads on '${envName}'`}</div>
                <Close className="icon-dim-24 cursor" onClick={closeDrawer} />
            </div>
        )
    }

    const handleWorkloadSelection = (
        appId: number,
        _kindName: string,
        key: APP_DETAILS_TEXT.APP_NAME | APP_DETAILS_TEXT.KIND_NAME | APP_DETAILS_TEXT.ALL,
    ) => {
        const _bulkRotatePodsMap = { ...bulkRotatePodsMap }

        if (key === APP_DETAILS_TEXT.APP_NAME && _bulkRotatePodsMap[appId].appName) {
            _bulkRotatePodsMap[appId].isChecked = _bulkRotatePodsMap[appId].value !== CHECKBOX_VALUE.CHECKED
            _bulkRotatePodsMap[appId].value = _bulkRotatePodsMap[appId].isChecked ? CHECKBOX_VALUE.CHECKED : null

            // handling app level value for checkbox
            Object.keys(_bulkRotatePodsMap[appId].resources).forEach((kindName) => {
                _bulkRotatePodsMap[appId].resources[kindName].isChecked = _bulkRotatePodsMap[appId].isChecked
                _bulkRotatePodsMap[appId].resources[kindName].value = _bulkRotatePodsMap[appId].value
                    ? CHECKBOX_VALUE.CHECKED
                    : null
            })
        }
        if (key === APP_DETAILS_TEXT.KIND_NAME && _bulkRotatePodsMap[appId].resources[_kindName]) {
            // handling resource level value for checkbox
            _bulkRotatePodsMap[appId].resources[_kindName].isChecked =
                !_bulkRotatePodsMap[appId].resources[_kindName].isChecked
            _bulkRotatePodsMap[appId].resources[_kindName].value = _bulkRotatePodsMap[appId].resources[_kindName]
                .isChecked
                ? CHECKBOX_VALUE.CHECKED
                : null
            // handling app level value for checkbox
            // eslint-disable-next-line no-nested-ternary
            _bulkRotatePodsMap[appId].value = Object.values(_bulkRotatePodsMap[appId].resources).every(
                (_resource) => _resource.isChecked,
            )
                ? CHECKBOX_VALUE.CHECKED
                : Object.values(_bulkRotatePodsMap[appId].resources).some((_resource) => _resource.isChecked)
                  ? CHECKBOX_VALUE.INTERMEDIATE
                  : null
            _bulkRotatePodsMap[appId].isChecked =
                _bulkRotatePodsMap[appId].value === CHECKBOX_VALUE.CHECKED ||
                _bulkRotatePodsMap[appId].value === CHECKBOX_VALUE.INTERMEDIATE
        }
        setBulkRotatePodsMap(_bulkRotatePodsMap)
        setAllAppsCheckboxValue(_bulkRotatePodsMap)
    }

    const handleAllWorkloadSelection = () => {
        const _bulkRotatePodsMap = { ...bulkRotatePodsMap }
        const _selectAllApps = { ...selectAllApps }
        const _selectAllAppsValue = _selectAllApps.value === CHECKBOX_VALUE.CHECKED ? null : CHECKBOX_VALUE.CHECKED
        _selectAllApps.isChecked = _selectAllAppsValue === CHECKBOX_VALUE.CHECKED
        _selectAllApps.value = _selectAllAppsValue
        Object.keys(_bulkRotatePodsMap).forEach((appId) => {
            _bulkRotatePodsMap[appId].isChecked = _selectAllApps.isChecked
            _bulkRotatePodsMap[appId].value = _selectAllApps.value
            Object.keys(_bulkRotatePodsMap[appId].resources).forEach((kindName) => {
                _bulkRotatePodsMap[appId].resources[kindName].isChecked = _selectAllApps.isChecked
                _bulkRotatePodsMap[appId].resources[kindName].value = _selectAllApps.value
            })
        })
        setBulkRotatePodsMap(_bulkRotatePodsMap)
        setSelectAllApps(_selectAllApps)
    }

    const renderWorkloadTableHeader = () => (
        <div className="flex dc__content-space dc__border-bottom-n1 pl-16 pr-16">
            <Checkbox
                rootClassName="mt-3 mb-3"
                dataTestId="enforce-policy"
                isChecked={selectAllApps.isChecked}
                value={selectAllApps.value}
                onChange={handleAllWorkloadSelection}
                onClick={stopPropagation}
                name={APP_DETAILS_TEXT.KIND_NAME}
            />
            <div className="flex dc__content-space pt-8 pb-8 fs-12 fw-6 cn-7 w-100">
                <div>{APP_DETAILS_TEXT.APPLICATIONS}</div>
                <AllExpandableDropdown
                    expandedAppIds={expandedAppIds}
                    setExpandedAppIds={setExpandedAppIds}
                    bulkRotatePodsMap={bulkRotatePodsMap}
                    SvgImage={DropdownIcon}
                    iconClassName={`icon-dim-16 ${isExpandableButtonClicked ? 'dc__flip-90' : 'dc__flip-270'}`}
                    dropdownLabel={
                        isExpandableButtonClicked ? APP_DETAILS_TEXT.COLLAPSED_ALL : APP_DETAILS_TEXT.EXPAND_ALL
                    }
                    isExpandableButtonClicked={isExpandableButtonClicked}
                    setExpandableButtonClicked={setExpandableButtonClicked}
                />
            </div>
        </div>
    )

    const renderWorkloadDetails = (appId: number, appName: string, resources: ResourcesMetaDataMap) => {
        if (!expandedAppIds.includes(appId) || appName !== bulkRotatePodsMap[appId].appName) {
            return null
        }
        if (Object.keys(resources).length === 0) {
            return (
                <div className="dc__border-left cn-7 p-8 ml-8">
                    <div className="dc__border-dashed p-20 flex center bc-n50">
                        <div className="w-300 flex dc__align-center">
                            No workloads found. ‘{appName}’ is not deployed on ‘{envName}’
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="dc__gap-4 pl-8">
                {Object.keys(resources).map((kindName) => {
                    const { isChecked } = resources[kindName]
                    return (
                        <div
                            key={kindName}
                            data-testid="workload-details"
                            className="flex left dc__border-left cursor"
                            onClick={() => handleWorkloadSelection(appId, kindName, APP_DETAILS_TEXT.KIND_NAME)}
                        >
                            <div className={`p-8 flex left w-100 ml-8 dc__hover-n50 ${isChecked ? 'bc-b50' : 'bcn-0'}`}>
                                <Checkbox
                                    rootClassName="mt-3 mb-3"
                                    dataTestId="enforce-policy"
                                    isChecked={bulkRotatePodsMap[appId].resources[kindName].isChecked}
                                    value={bulkRotatePodsMap[appId].resources[kindName].value}
                                    onChange={() =>
                                        handleWorkloadSelection(appId, kindName, APP_DETAILS_TEXT.KIND_NAME)
                                    }
                                    name={APP_DETAILS_TEXT.KIND_NAME}
                                />
                                {kindName}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderRestartWorkloadModalListItems = () => {
        return (
            <div className="drawer-body-section__list-drawer dc__overflow-auto bcn-0">
                {Object.keys(bulkRotatePodsMap).map((appId) => {
                    return (
                        <div className="pl-16 pr-16" key={appId}>
                            <div key={appId} className="flex dc__content-space cursor dc__hover-n50">
                                <Checkbox
                                    rootClassName="mt-3 mb-3"
                                    dataTestId="enforce-policy"
                                    isChecked={bulkRotatePodsMap[appId].isChecked}
                                    value={bulkRotatePodsMap[appId].value}
                                    onClick={stopPropagation}
                                    name={APP_DETAILS_TEXT.APP_NAME}
                                    disabled={Object.keys(bulkRotatePodsMap[appId].resources).length === 0}
                                    onChange={() =>
                                        handleWorkloadSelection(
                                            +appId,
                                            bulkRotatePodsMap[appId].appName,
                                            APP_DETAILS_TEXT.APP_NAME,
                                        )
                                    }
                                />
                                <div
                                    className="flex dc__content-space w-100 pt-12 pb-12"
                                    onClick={() => toggleWorkloadCollapse(+appId)}
                                >
                                    <span className="fw-6">{bulkRotatePodsMap[appId].appName}</span>
                                    <div className="flex dc__gap-4">
                                        {Object.keys(bulkRotatePodsMap[appId].resources).length} workload
                                        <DropdownIcon
                                            className={`icon-dim-16 rotate ${expandedAppIds.includes(+appId) ? 'dc__flip-90' : 'dc__flip-270'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                            {renderWorkloadDetails(
                                +appId,
                                bulkRotatePodsMap[appId].appName,
                                bulkRotatePodsMap[appId].resources,
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderRestartWorkloadModalList = () => {
        if (showStatusModal) {
            return (
                <RestartStatusListDrawer
                    bulkRotatePodsMap={bulkRotatePodsMap}
                    statusModalLoading={statusModalLoading}
                    envName={envName}
                />
            )
        }
        if (restartLoader) {
            return (
                <div className="drawer-section__empty flex">
                    <GenericEmptyState
                        title={`Fetching workload for ${selectedAppIds.length} Applications`}
                        subTitle={APP_DETAILS_TEXT.APP_GROUP_RESTART_WORKLOAD_SUBTITLE}
                        SvgImage={MechanicalIcon}
                    />
                </div>
            )
        }

        if (statusModalLoading) {
            return (
                <div className="drawer-section__empty flex">
                    <GenericEmptyState
                        title={`Restarting selected workload on ${envName}`}
                        subTitle={APP_DETAILS_TEXT.APP_GROUP_RESTART_WORKLOAD_SUBTITLE}
                        SvgImage={MechanicalIcon}
                    >
                        <InfoColourBar
                            message={APP_DETAILS_TEXT.APP_GROUP_EMPTY_WORKLOAD_INFO_BAR}
                            classname="warn cn-9 lh-2 w-100"
                            Icon={Warn}
                            iconClass="warning-icon h-100-imp"
                            iconSize={20}
                        />
                    </GenericEmptyState>
                </div>
            )
        }

        return (
            <div className="flexbox-col">
                <InfoColourBar
                    message={APP_DETAILS_TEXT.APP_GROUP_INFO_TEXT}
                    classname="info_bar dc__no-border-radius dc__no-top-border"
                    Icon={InfoIcon}
                />
                {renderWorkloadTableHeader()}
                {renderRestartWorkloadModalListItems()}
            </div>
        )
    }

    const updateBulkRotatePodsMapWithStatusCounts = (postResponse, appId) => {
        const _resourcesMetaDataMap: ResourcesMetaDataMap = {}
        let failedCount = 0
        postResponse.result.responses?.forEach((resourceIdentifier: ResourceIdentifierDTO) => {
            const kindNameKey: string = `${resourceIdentifier.groupVersionKind.Kind}/${resourceIdentifier.name}`
            failedCount =
                resourceIdentifier.errorResponse && resourceIdentifier.errorResponse.length > 0
                    ? failedCount + 1
                    : failedCount
            const _resourceMetaData: ResourceMetaData = {
                group: resourceIdentifier.groupVersionKind.Group,
                kind: resourceIdentifier.groupVersionKind.Kind,
                version: resourceIdentifier.groupVersionKind.Version,
                name: resourceIdentifier.name,
                containsError: postResponse.containsError,
                errorResponse: resourceIdentifier.errorResponse,
                isChecked: true,
                value: CHECKBOX_VALUE.CHECKED,
            }
            _resourcesMetaDataMap[kindNameKey] = _resourceMetaData
        })

        let _bulkRotatePodsMetaData: BulkRotatePodsMetaData = bulkRotatePodsMap[appId]
        // updating _bulkRotatePodsMetaData with the new values
        _bulkRotatePodsMetaData = {
            ..._bulkRotatePodsMetaData,
            resources: _resourcesMetaDataMap,
            successCount: postResponse.result.responses && postResponse.result.responses.length - failedCount,
            failedCount,
        }

        // setting the updated _bulkRotatePodsMetaData in the bulkRotatePodsMap with status counts
        setBulkRotatePodsMap((prev) => ({ ...prev, [appId]: _bulkRotatePodsMetaData }))
    }

    const postRestartPodBatchFunction = (payload) => () => {
        return postRestartWorkloadRotatePods(payload)
            .then((response) => {
                if (response.result) {
                    openStatusModal()
                    // showing the status modal in case batch promise resolved
                    updateBulkRotatePodsMapWithStatusCounts(response, payload.appId)
                }
            })
            .catch((err) => {
                showError(err)
            })
    }

    const createFunctionCallsFromRestartPodMap = () => {
        // default case for restart workload for all apps
        let predicateFnAppId = (appId) => bulkRotatePodsMap[+appId].isChecked

        // retry logic for failed resources app selection
        if (showStatusModal) {
            // so only if errored, select the appId
            predicateFnAppId = (appId) =>
                bulkRotatePodsMap[+appId].isChecked && bulkRotatePodsMap[+appId].failedCount > 0
        }

        return Object.keys(bulkRotatePodsMap)
            .filter(predicateFnAppId)
            .map((appId) => {
                const bulkRotatePodsMetaData: BulkRotatePodsMetaData = bulkRotatePodsMap[appId]

                let predicateFnResources = (kindName) => bulkRotatePodsMetaData.resources[kindName].isChecked
                // Logic for retrying failed resources
                if (showStatusModal) {
                    // predicateFnResources filters out the resources which are checked and errored
                    predicateFnResources = (kindName) =>
                        bulkRotatePodsMetaData.resources[kindName].isChecked &&
                        bulkRotatePodsMetaData.resources[kindName].errorResponse.length > 0
                }

                const _resources = Object.keys(bulkRotatePodsMetaData.resources)
                    .filter(predicateFnResources)
                    .map((kindName) => {
                        return {
                            name: bulkRotatePodsMetaData.resources[kindName].name,
                            namespace: bulkRotatePodsMetaData.namespace,
                            groupVersionKind: {
                                Group: bulkRotatePodsMetaData.resources[kindName].group,
                                Version: bulkRotatePodsMetaData.resources[kindName].version,
                                Kind: bulkRotatePodsMetaData.resources[kindName].kind,
                            },
                        }
                    })
                const payload = {
                    appId: +appId,
                    environmentId: +envId,
                    resources: _resources,
                }
                return postRestartPodBatchFunction(payload)
            })
    }

    const isDisabled = (): boolean => {
        if (showStatusModal) {
            return statusModalLoading
        }
        return (
            restartLoader ||
            statusModalLoading ||
            Object.values(bulkRotatePodsMap)
                .map((app) => app.isChecked)
                .every((isChecked) => !isChecked)
        )
    }

    const onSave = async () => {
        if (isDisabled()) {
            return null
        }
        if (isPartialActionAllowed && BulkDeployResistanceTippy && !showResistanceBox) {
            setShowResistanceBox(true)
        }

        const functionCalls = createFunctionCallsFromRestartPodMap()
        setStatusModalLoading(true)

        ApiQueuingWithBatch(functionCalls, httpProtocol.current)
            .then(async () => {
                if (getDeploymentWindowStateAppGroup) {
                    await getDeploymentWindowData()
                }
            })
            .catch((error) => {
                showError(error)
            })
            .finally(() => {
                setStatusModalLoading(false)
            })

        return null
    }

    const renderFooterSection = () => {
        return (
            <div className="pl-20 pr-20 pt-16 pb-16 dc__border-top">
                <div className={`flex ${showStatusModal ? 'dc__content-space' : 'right'} w-100 dc__gap-12 `}>
                    {showStatusModal && (
                        <button
                            type="button"
                            onClick={closeDrawer}
                            className="flex bcn-0 dc__border-radius-4-imp h-36 pl-16 pr-16 pt-8 pb-8 dc__border"
                        >
                            Cancel
                        </button>
                    )}
                    <ButtonWithLoader
                        rootClassName={`cta flex h-36 pl-16 pr-16 pt-8 pb-8 dc__border-radius-4-imp dc__gap-8 ${isDisabled() ? 'dc__disabled' : ''}`}
                        isLoading={restartLoader}
                        onClick={onSave}
                    >
                        {showStatusModal ? (
                            <Retry className="icon-dim-16 icon-dim-16 scn-0 dc__no-svg-fill" />
                        ) : (
                            <RotateIcon className="dc__no-svg-fill icon-dim-16 scn-0" />
                        )}
                        {showStatusModal ? APP_DETAILS_TEXT.RETRY_FAILED : APP_DETAILS_TEXT.RESTART_WORKLOAD}
                    </ButtonWithLoader>
                </div>
            </div>
        )
    }

    const renderBodySection = () => {
        if (errorStatusCode) {
            return <ErrorScreenManager code={errorStatusCode} />
        }

        return (
            <>
                {renderRestartWorkloadModalList()}
                {renderFooterSection()}
            </>
        )
    }

    const hideResistanceBox = (): void => {
        setShowResistanceBox(false)
    }
    return (
        <Drawer onEscape={closeDrawer} position="right" width="800" parentClassName="h-100">
            <div onClick={stopPropagation} className="bulk-restart-workload-wrapper bcn-0 cn-9 w-800 h-100 fs-13 lh-20">
                {renderHeaderSection()}
                {renderBodySection()}
            </div>
            {showResistanceBox && (
                <BulkDeployResistanceTippy
                    actionHandler={onSave}
                    handleOnClose={hideResistanceBox}
                    modalType={MODAL_TYPE.OVERVIEW}
                />
            )}
        </Drawer>
    )
}
