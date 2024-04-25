import React, { useEffect, useState } from 'react'
import {
    ButtonWithLoader,
    CHECKBOX_VALUE,
    Checkbox,
    Drawer,
    GenericEmptyState,
    InfoColourBar,
    noop,
    showError,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'
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
import { getMockRestartWorkloadRotatePods } from './service'
import { APP_DETAILS_TEXT } from './constants'

export const RestartWorkloadModal = ({ closeModal, selectedAppIds, envName, envId }: RestartWorkloadModalProps) => {
    const [bulkRotatePodsMap, setBulkRotatePodsMap] = useState<Record<number, BulkRotatePodsMetaData>>({})
    const [expandedAppIds, setExpandedAppIds] = useState<number[]>([])
    const [restartLoader, setRestartLoader] = useState<boolean>(false)

    const getPodsToRotate = async () => {
        const _bulkRotatePodsMap: Record<number, BulkRotatePodsMetaData> = {}
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getMockRestartWorkloadRotatePods(selectedAppIds, envId).then((response) => {
            const _restartPodMap = response.result.restartPodMap
            // Iterate over the restartPodMap and create a bulkRotatePodsMap
            Object.keys(_restartPodMap).forEach((appId) => {
                const _resourcesMetaDataMap: ResourcesMetaDataMap = {}

                const appInfoObject: AppInfoMetaDataDTO = _restartPodMap[appId]
                appInfoObject.resourceIdentifiers.forEach((resourceIdentifier: ResourceIdentifierDTO) => {
                    const kindNameKey: string = `${resourceIdentifier.groupVersionKind.Kind}/${resourceIdentifier.name}`
                    const _resourceMetaData: ResourceMetaData = {
                        group: resourceIdentifier.groupVersionKind.Group,
                        kind: resourceIdentifier.groupVersionKind.Kind,
                        version: resourceIdentifier.groupVersionKind.Version,
                        name: resourceIdentifier.name,
                        containsError: resourceIdentifier.containsError,
                        errorMessage: resourceIdentifier.errorMessage,
                        isChecked: false,
                        value: null,
                    }

                    // inserting in the resourceMetaDataMap
                    _resourcesMetaDataMap[kindNameKey] = _resourceMetaData
                })
                const _bulkRotatePodsMetaData: BulkRotatePodsMetaData = {
                    resources: _resourcesMetaDataMap,
                    appName: appInfoObject.appName,
                    isChecked: false,
                    value: null,
                }
                _bulkRotatePodsMap[+appId] = _bulkRotatePodsMetaData
            })
            setBulkRotatePodsMap(_bulkRotatePodsMap)
        })
    }

    useEffect(() => {
        setRestartLoader(true)
        try {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            getPodsToRotate()
        } catch (err) {
            showError(err)
        } finally {
            setRestartLoader(false)
        }
    }, [])

    const toggleWorkloadCollapse = (appId?: number) => {
        if (expandedAppIds.includes(appId)) {
            setExpandedAppIds(expandedAppIds.filter((id) => id !== appId))
        } else {
            setExpandedAppIds([...expandedAppIds, appId])
        }
    }

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex dc__content-space dc__border-bottom pt-16 pr-20 pb-16 pl-20">
                <div className="fs-16 fw-6">
                    {` Restart workloads '${selectedAppIds.length} applications' on '${envName}'`}
                </div>
                <Close className="icon-dim-24 cursor" onClick={closeModal} />
            </div>
        )
    }

    const renderWorkloadTableHeader = () => (
        <div className="flex dc__content-space pl-16 pr-16 pt-8 pb-8 fs-12 fw-6 cn-7 dc__border-bottom-n1">
            <div className="dc__uppercase">{APP_DETAILS_TEXT.APPLICATIONS}</div>
            <div className="flex dc__gap-4">
                {APP_DETAILS_TEXT.EXPAND_ALL}
                <DropdownIcon className="icon-dim-16 rotate dc__flip-270" />
            </div>
        </div>
    )

    const handleWorkloadSelection = (
        appId: number,
        _kindName: string,
        key: APP_DETAILS_TEXT.APP_NAME | APP_DETAILS_TEXT.KIND_NAME,
    ) => {
        const getCheckboxValue = (arr): CHECKBOX_VALUE.INTERMEDIATE | CHECKBOX_VALUE.CHECKED | null => {
            if (arr.length === 0 || Array) {
                return null
            }
            if (arr.every((item) => item.isChecked)) {
                return CHECKBOX_VALUE.CHECKED
            }
            if (arr.some((item) => item.isChecked)) {
                return CHECKBOX_VALUE.INTERMEDIATE
            }
            return null
        }

        const _bulkRotatePodsMap = { ...bulkRotatePodsMap }
        if (key === APP_DETAILS_TEXT.APP_NAME && _bulkRotatePodsMap[appId].appName) {
            _bulkRotatePodsMap[appId].isChecked = _bulkRotatePodsMap[appId].value !== CHECKBOX_VALUE.CHECKED
            _bulkRotatePodsMap[appId].value = _bulkRotatePodsMap[appId].isChecked && CHECKBOX_VALUE.CHECKED

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
            // TODO remove nesting
            // eslint-disable-next-line no-nested-ternary
            _bulkRotatePodsMap[appId].value = getCheckboxValue(Object.values(_bulkRotatePodsMap[appId].resources))
            _bulkRotatePodsMap[appId].isChecked =
                _bulkRotatePodsMap[appId].value === CHECKBOX_VALUE.CHECKED ||
                _bulkRotatePodsMap[appId].value === CHECKBOX_VALUE.INTERMEDIATE
        }
        setBulkRotatePodsMap(_bulkRotatePodsMap)
    }

    const renderWorkloadDetails = (appId: number, appName: string, resources: ResourcesMetaDataMap) =>
        expandedAppIds.includes(appId) &&
        appName === bulkRotatePodsMap[appId].appName && (
            <div className="dc__gap-4 pt-8 pb-8">
                {Object.keys(resources).map((kindName) => (
                    <div
                        key={kindName}
                        data-testid="workload-details"
                        className="flex left p-8 dc__border-left cursor"
                        onClick={() => handleWorkloadSelection(appId, kindName, APP_DETAILS_TEXT.KIND_NAME)}
                    >
                        <Checkbox
                            rootClassName="mt-3 mb-3"
                            dataTestId="enforce-policy"
                            isChecked={bulkRotatePodsMap[appId].resources[kindName].isChecked}
                            value={bulkRotatePodsMap[appId].resources[kindName].value}
                            onChange={noop}
                            onClick={stopPropagation}
                            name={APP_DETAILS_TEXT.KIND_NAME}
                        />
                        <span className="fw-6">{kindName}</span>
                    </div>
                ))}
            </div>
        )

    const renderRestartWorkloadModalListItems = () =>
        Object.keys(bulkRotatePodsMap).map((appId) => {
            return (
                <div className="pl-16 pr-16">
                    <div key={appId} className="flex dc__content-space pt-12 pb-12 cursor">
                        <div
                            className="flex left cursor"
                            onClick={() =>
                                handleWorkloadSelection(
                                    +appId,
                                    bulkRotatePodsMap[appId].appName,
                                    APP_DETAILS_TEXT.APP_NAME,
                                )
                            }
                        >
                            <Checkbox
                                rootClassName="mt-3 mb-3"
                                dataTestId="enforce-policy"
                                isChecked={bulkRotatePodsMap[appId].isChecked}
                                value={bulkRotatePodsMap[appId].value}
                                onClick={stopPropagation}
                                name={APP_DETAILS_TEXT.APP_NAME}
                                onChange={noop}
                            />
                            {bulkRotatePodsMap[appId].appName}
                        </div>
                        <div className="flex dc__gap-4" onClick={() => toggleWorkloadCollapse(+appId)}>
                            {Object.keys(bulkRotatePodsMap[appId].resources).length} workload
                            <DropdownIcon className="icon-dim-16 rotate dc__flip-270 rotate" />
                        </div>
                    </div>
                    {renderWorkloadDetails(
                        +appId,
                        bulkRotatePodsMap[appId].appName,
                        bulkRotatePodsMap[appId].resources,
                    )}
                </div>
            )
        })

    const renderRestartWorkloadModalList = () => {
        return (
            <div className="flexbox-col dc__gap-12">
                {renderWorkloadTableHeader()}
                {renderRestartWorkloadModalListItems()}
            </div>
        )
    }
    const renderFooterSection = () => {
        return (
            <div className="dc__position-abs dc__bottom-12 w-100 pl-20 pr-20 pt-16 pr-16 dc__border-top">
                <div className="flex dc__content-end w-100 dc__align-end dc__gap-12 ">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="flex bcn-0 dc__border-radius-4-imp h-36 pl-16 pr-16 pt-8 pb-8 dc__border"
                    >
                        Cancel
                    </button>
                    <ButtonWithLoader
                        rootClassName="cta flex h-36 pl-16 pr-16 pt-8 pb-8 dc__border-radius-4-imp"
                        isLoading={restartLoader}
                    >
                        {APP_DETAILS_TEXT.RESTART_WORKLOAD}
                    </ButtonWithLoader>
                </div>
            </div>
        )
    }

    return (
        <Drawer onEscape={closeModal} position="right" width="800" parentClassName="h-100">
            <div onClick={stopPropagation} className="bcn-0 h-100">
                {restartLoader ? (
                    <GenericEmptyState
                        title={`Fetching workload for ${selectedAppIds.length} Applications`}
                        subTitle="Restarting workloads"
                        SvgImage={MechanicalIcon}
                    />
                ) : (
                    <>
                        {renderHeaderSection()}
                        <InfoColourBar
                            message={APP_DETAILS_TEXT.APP_GROUP_INFO_TEXT}
                            classname="info_bar dc__no-border-radius dc__no-top-border"
                            Icon={InfoIcon}
                        />
                        {renderRestartWorkloadModalList()}
                        {renderFooterSection()}
                    </>
                )}
            </div>
        </Drawer>
    )
}
