import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, useHistory, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'

import {
    ALL_NAMESPACE_OPTION,
    Button,
    ButtonVariantType,
    ClipboardButton,
    ConditionalWrap,
    getAIAnalyticsEvents,
    highlightSearchText,
    Icon,
    IconName,
    K8sResourceDetailDataType,
    Nodes,
    noop,
    RESOURCE_BROWSER_ROUTES,
    ResourceBrowserActionMenuEnum,
    TableSignalEnum,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICErrorExclamation } from '@Icons/ic-error-exclamation.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { AddEnvironmentFormPrefilledInfoType } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/cluster.type'
import { ClusterEnvironmentDrawer } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/ClusterEnvironmentDrawer'
import { ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/constants'

import { AI_BUTTON_CONFIG_MAP, EVENT_LIST, K8S_EMPTY_GROUP, NODE_LIST_HEADERS_TO_KEY_MAP } from '../Constants'
import { ClusterDetailBaseParams } from '../Types'
import { getRenderInvolvedObjectButton, getRenderNodeButton, renderResourceValue } from '../Utils'
import NodeActionsMenu from './NodeActionsMenu'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import { K8sResourceListTableCellComponentProps } from './types'
import { getClassNameForColumn, getFirstResourceFromKindResourceMap, getShowAIButton, getStatusClass } from './utils'

const ExplainWithAIButton = importComponentFromFELibrary('ExplainWithAIButton', null, 'function')
const PodRestartIcon = importComponentFromFELibrary('PodRestartIcon')

const K8sResourceListTableCellComponent = ({
    field: columnName,
    row: { id, data: resourceData },
    filterData: { searchKey: searchText },
    signals,
    selectedResource,
    reloadResourceListData,
    addTab,
    isEventListing,
    lowercaseKindToResourceGroupMap,
    clusterName,
}: K8sResourceListTableCellComponentProps) => {
    const { push } = useHistory()
    const { clusterId } = useParams<ClusterDetailBaseParams>()
    const isNodeListing = selectedResource?.gvk.Kind === Nodes.Node
    const isNodeListingAndNodeHasErrors = isNodeListing && !!resourceData[NODE_LIST_HEADERS_TO_KEY_MAP.errors]
    const isNodeUnschedulable = isNodeListing && !!resourceData.unschedulable
    const nameButtonRef = useRef<HTMLButtonElement>(null)
    const contextMenuRef = useRef<HTMLButtonElement>(null)

    const [showCreateEnvironmentDrawer, setShowCreateEnvironmentDrawer] = useState(false)

    const getAddEnvironmentClickHandler = (namespace: string) => () => {
        const environmentFormData: AddEnvironmentFormPrefilledInfoType = {
            namespace,
        }

        localStorage.setItem(ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY, JSON.stringify(environmentFormData))

        setShowCreateEnvironmentDrawer(true)
    }

    const handleCloseCreateEnvironmentDrawer = () => {
        setShowCreateEnvironmentDrawer(false)
    }

    const handleResourceClick = (e: MouseEvent<HTMLButtonElement>) => {
        const {
            name,
            namespace = ALL_NAMESPACE_OPTION.value,
            kind,
            group: _group,
            tab = ResourceBrowserActionMenuEnum.manifest,
        } = e.currentTarget.dataset

        const url = generatePath(RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_DETAIL, {
            clusterId,
            namespace,
            name,
            kind: kind.toLowerCase(),
            group: _group || K8S_EMPTY_GROUP,
        })

        push(`${url}/${tab}`)
    }

    const handleNodeClick = async (e: MouseEvent<HTMLButtonElement>) => {
        const { name } = e.currentTarget.dataset
        const _url = generatePath(RESOURCE_BROWSER_ROUTES.NODE_DETAIL, { clusterId, name })
        await addTab({ idPrefix: K8S_EMPTY_GROUP, kind: 'node', name, url: _url })
        push(_url)
    }

    useEffect(() => {
        const handleEnterPressed = ({ detail: { activeRowData } }) => {
            if (activeRowData.id === id) {
                nameButtonRef.current?.click()
            }
        }

        const handleOpenContextMenu = ({ detail: { activeRowData } }) => {
            if (activeRowData.id === id) {
                contextMenuRef.current?.click()
                contextMenuRef.current?.focus()
            }
        }

        if (columnName === 'name') {
            signals.addEventListener(TableSignalEnum.ENTER_PRESSED, handleEnterPressed)
            signals.addEventListener(TableSignalEnum.OPEN_CONTEXT_MENU, handleOpenContextMenu)
        }

        return () => {
            if (columnName === 'name') {
                signals.removeEventListener(TableSignalEnum.ENTER_PRESSED, handleEnterPressed)
                signals.removeEventListener(TableSignalEnum.OPEN_CONTEXT_MENU, handleOpenContextMenu)
            }
        }
    }, [])

    const gvkString = useMemo(
        () =>
            Object.values(selectedResource?.gvk ?? {})
                .filter((value) => !!value)
                .join('/'),
        [selectedResource],
    )

    const aiButtonConfig = AI_BUTTON_CONFIG_MAP[gvkString]
    const showAIButton =
        !!ExplainWithAIButton && getShowAIButton(aiButtonConfig, columnName, resourceData[columnName] as string)

    const handleEventInvolvedObjectClick = () => {
        const [kind, name] = (resourceData[columnName] as string).split('/')
        const group =
            getFirstResourceFromKindResourceMap(lowercaseKindToResourceGroupMap, kind)?.gvk?.Group || K8S_EMPTY_GROUP

        push(
            generatePath(RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_DETAIL, {
                clusterId,
                namespace: resourceData.namespace as string,
                name,
                group,
                kind,
            }),
        )
    }

    const onAddEnvironmentKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter') {
            e.stopPropagation()
        }
    }

    const onClickHandler = isNodeListing ? handleNodeClick : handleResourceClick

    const renderActionMenu = () =>
        !isNodeListing ? (
            <ResourceBrowserActionMenu
                ref={contextMenuRef}
                clusterId={clusterId}
                resourceData={resourceData as K8sResourceDetailDataType}
                getResourceListData={reloadResourceListData as () => Promise<void>}
                selectedResource={selectedResource}
                handleResourceClick={handleResourceClick}
                handleClearBulkSelection={noop}
            />
        ) : (
            <NodeActionsMenu
                ref={contextMenuRef}
                getNodeListData={reloadResourceListData as () => Promise<void>}
                addTab={addTab}
                nodeData={resourceData as K8sResourceDetailDataType}
                handleClearBulkSelection={noop}
            />
        )

    const getConditionalWrap = () =>
        columnName === 'node'
            ? getRenderNodeButton(resourceData as K8sResourceDetailDataType, columnName, handleNodeClick)
            : getRenderInvolvedObjectButton(resourceData[columnName] as string, handleEventInvolvedObjectClick)

    if (columnName === 'type' && isEventListing) {
        const iconName: IconName =
            (resourceData.type as string).toLowerCase() === 'normal' ? 'ic-info-filled-color' : 'ic-warning'

        return (
            <div className="py-10">
                <Icon name={iconName} size={20} color={null} />
            </div>
        )
    }

    const eventDetails = {
        message: resourceData.message as string,
        namespace: resourceData.namespace as string,
        object: resourceData[EVENT_LIST.dataKeys.involvedObject] as string,
        source: resourceData.source as string,
        count: resourceData.count as number,
        age: resourceData.age as string,
        lastSeen: resourceData[EVENT_LIST.dataKeys.lastSeen] as string,
    }

    return (
        <>
            {columnName === 'name' ? (
                <div
                    className="flexbox dc__align-items-center dc__gap-4 dc__content-space dc__visible-hover dc__visible-hover--parent py-10 pr-6"
                    data-testid="created-resource-name"
                >
                    <div className="flex left dc__gap-4">
                        <Tooltip content={resourceData.name}>
                            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                            <button
                                type="button"
                                className="dc__unset-button-styles dc__align-left dc__truncate"
                                data-name={resourceData.name}
                                data-namespace={resourceData.namespace || ALL_NAMESPACE_OPTION.value}
                                data-kind={selectedResource.gvk.Kind}
                                data-group={selectedResource.gvk.Group || K8S_EMPTY_GROUP}
                                onClick={onClickHandler}
                                ref={nameButtonRef}
                            >
                                <span
                                    className="dc__link cursor"
                                    // eslint-disable-next-line react/no-danger
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            highlightSearchText({
                                                searchText,
                                                text: String(resourceData.name),
                                                highlightClasses: 'p-0 fw-6 bcy-2',
                                            }),
                                        ),
                                    }}
                                />
                            </button>
                        </Tooltip>
                        <ClipboardButton
                            content={String(resourceData.name)}
                            rootClassName="p-2 dc__visible-hover--child"
                            iconSize={16}
                        />
                    </div>
                    {renderActionMenu()}
                </div>
            ) : (
                <div
                    className={`flexbox ${!isEventListing ? 'dc__align-items-center' : 'dc__align-start'} py-10 ${
                        columnName === 'status' || columnName === 'type'
                            ? `app-summary__status-name dc__no-text-transform ${getStatusClass(String(resourceData[columnName]), isNodeListing)}`
                            : ''
                    } ${columnName === 'errors' ? 'app-summary__status-name f-error dc__no-text-transform' : ''}`}
                >
                    <ConditionalWrap
                        condition={columnName === 'node' || columnName === 'involved object'}
                        wrap={getConditionalWrap()}
                    >
                        {columnName === 'errors' && isNodeListingAndNodeHasErrors && (
                            <ICErrorExclamation className="icon-dim-16 dc__no-shrink mr-4" />
                        )}
                        <Tooltip content={renderResourceValue(resourceData[columnName]?.toString())}>
                            <span
                                className={getClassNameForColumn(columnName, isNodeUnschedulable)}
                                data-testid={`${columnName}-count`}
                                // eslint-disable-next-line react/no-danger
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        highlightSearchText({
                                            searchText,
                                            text: renderResourceValue(resourceData[columnName]?.toString()),
                                            highlightClasses: 'p-0 fw-6 bcy-2',
                                        }),
                                    ),
                                }}
                            />
                        </Tooltip>
                        {selectedResource?.gvk.Kind.toLowerCase() === Nodes.Namespace.toLowerCase() &&
                            columnName === 'environment' &&
                            !resourceData.environment && (
                                <Button
                                    text="Add environment"
                                    dataTestId="add-environment"
                                    variant={ButtonVariantType.text}
                                    onClick={getAddEnvironmentClickHandler(resourceData.name as string)}
                                    buttonProps={{
                                        onKeyDown: onAddEnvironmentKeyDown,
                                    }}
                                />
                            )}
                        {columnName === 'status' && isNodeUnschedulable && (
                            <>
                                <span className="dc__bullet mr-4 ml-4 mw-4 bcn-4" />
                                <Tooltip content="Scheduling disabled">
                                    <span className="cr-5 dc__truncate">SchedulingDisabled</span>
                                </Tooltip>
                            </>
                        )}
                        {ExplainWithAIButton &&
                            columnName === 'explainButton' &&
                            isEventListing &&
                            resourceData.type === 'Warning' && (
                                <ExplainWithAIButton
                                    intelligenceConfig={{
                                        clusterId,
                                        metadata: eventDetails,
                                        prompt: JSON.stringify(eventDetails),
                                        analyticsCategory: getAIAnalyticsEvents('RB_RESOURCE'),
                                    }}
                                />
                            )}
                        <span>
                            {columnName === 'restarts' && Number(resourceData.restarts) !== 0 && PodRestartIcon && (
                                <PodRestartIcon
                                    clusterId={clusterId}
                                    name={resourceData.name}
                                    namespace={resourceData.namespace}
                                />
                            )}
                        </span>
                    </ConditionalWrap>
                    {showAIButton && (
                        <div className="ml-4">
                            <ExplainWithAIButton
                                isIconButton
                                intelligenceConfig={{
                                    clusterId,
                                    metadata: {
                                        object: `${selectedResource?.gvk?.Kind}/${resourceData.name}`,
                                        namespace: resourceData.namespace,
                                        status: resourceData.status ?? '',
                                    },
                                    prompt: `Debug what's wrong with ${resourceData.name}/${selectedResource?.gvk?.Kind} of ${resourceData.namespace}`,
                                    analyticsCategory: getAIAnalyticsEvents('RB__RESOURCE'),
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {showCreateEnvironmentDrawer && (
                <ClusterEnvironmentDrawer
                    reload={reloadResourceListData}
                    clusterName={clusterName}
                    id={null}
                    environmentName={null}
                    clusterId={Number(clusterId)}
                    namespace={null}
                    isProduction={null}
                    description={null}
                    hideClusterDrawer={handleCloseCreateEnvironmentDrawer}
                    isVirtual={false} // NOTE: if a cluster is visible in RB, it is not a virtual cluster
                    category={null}
                />
            )}
        </>
    )
}

export default K8sResourceListTableCellComponent
