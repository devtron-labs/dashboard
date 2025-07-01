import { useEffect, useRef } from 'react'
import { generatePath, useHistory, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'

import {
    ALL_NAMESPACE_OPTION,
    ClipboardButton,
    GVKType,
    highlightSearchText,
    K8sResourceDetailDataType,
    Nodes,
    noop,
    TableSignalEnum,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    DUMMY_RESOURCE_GVK_VERSION,
    K8S_EMPTY_GROUP,
    RESOURCE_ACTION_MENU,
    RESOURCE_BROWSER_ROUTES,
} from '../Constants'
import { ClusterDetailBaseParams } from '../Types'
import { renderResourceValue } from '../Utils'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import { ClusterUpgradeCompatibilityInfoTableCellComponentProps } from './types'
import { getFirstResourceFromKindResourceMap } from './utils'

const ClusterUpgradeCompatibilityInfoTableCellComponent = ({
    field: columnName,
    row: { id, data: resourceData },
    filterData: { searchKey: searchText },
    signals,
    reloadResourceListData,
    lowercaseKindToResourceGroupMap,
}: ClusterUpgradeCompatibilityInfoTableCellComponentProps) => {
    const { push } = useHistory()
    const { clusterId } = useParams<ClusterDetailBaseParams>()
    const nameButtonRef = useRef<HTMLButtonElement>(null)
    const contextMenuRef = useRef<HTMLButtonElement>(null)

    const handleResourceClick = (e) => {
        const { name, namespace, kind, tab = RESOURCE_ACTION_MENU.manifest } = e.currentTarget.dataset

        const group =
            getFirstResourceFromKindResourceMap(lowercaseKindToResourceGroupMap, kind.toLowerCase())?.gvk?.Group ||
            K8S_EMPTY_GROUP

        const url = generatePath(RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_DETAIL, {
            clusterId,
            namespace,
            name,
            kind: kind.toLowerCase(),
            group,
            version: DUMMY_RESOURCE_GVK_VERSION,
        })

        push(`${url}/${tab}`)
    }

    useEffect(() => {
        const openResourceCallback = ({ detail: { activeRowData } }) => {
            if (activeRowData.id === id) {
                nameButtonRef.current?.click()
            }
        }

        const openContextMenuCallback = ({ detail: { activeRowData } }) => {
            if (activeRowData.id === id) {
                contextMenuRef.current?.focus()
                contextMenuRef.current?.click()
            }
        }

        if (columnName === 'name') {
            signals.addEventListener(TableSignalEnum.ENTER_PRESSED, openResourceCallback)
            signals.addEventListener(TableSignalEnum.OPEN_CONTEXT_MENU, openContextMenuCallback)
        }

        return () => {
            if (columnName === 'name') {
                signals.removeEventListener(TableSignalEnum.ENTER_PRESSED, openResourceCallback)
                signals.removeEventListener(TableSignalEnum.OPEN_CONTEXT_MENU, openContextMenuCallback)
            }
        }
    }, [])

    // This should be used only if shouldOverrideSelectedResourceKind is true
    // Group and version are not available for Events / shouldOverrideSelectedResourceKind is true
    const getSelectedResourceKindOverride = (lowercaseKind: string) => {
        const gvkFromRawData: GVKType = getFirstResourceFromKindResourceMap(
            lowercaseKindToResourceGroupMap,
            lowercaseKind,
        ).gvk

        return {
            gvk: gvkFromRawData,
        }
    }

    const selectedResource = {
        ...getSelectedResourceKindOverride((resourceData.kind as string).toLowerCase()),
        namespaced: !!resourceData.namespace,
    }
    const shouldHideContextMenu = selectedResource.gvk.Kind === Nodes.Event

    return columnName === 'name' ? (
        <div
            className="flexbox dc__align-items-center dc__gap-4 dc__content-space dc__visible-hover dc__visible-hover--parent py-10"
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
                        data-kind={resourceData.kind}
                        onClick={!shouldHideContextMenu ? handleResourceClick : noop}
                        ref={nameButtonRef}
                    >
                        <span
                            className={!shouldHideContextMenu ? 'dc__link cursor' : ''}
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
                {!shouldHideContextMenu && (
                    <ClipboardButton content={String(resourceData.name)} rootClassName="p-2 dc__visible-hover--child" />
                )}
            </div>

            {!shouldHideContextMenu && (
                <ResourceBrowserActionMenu
                    ref={contextMenuRef}
                    clusterId={clusterId}
                    resourceData={resourceData as K8sResourceDetailDataType}
                    getResourceListData={reloadResourceListData as () => Promise<void>}
                    selectedResource={selectedResource}
                    hideDeleteResource
                    handleResourceClick={handleResourceClick}
                    handleClearBulkSelection={noop}
                />
            )}
        </div>
    ) : (
        <div className="flexbox dc__align-items-center py-10">
            <Tooltip content={renderResourceValue(resourceData[columnName]?.toString())}>
                <span
                    className="dc__truncate fs-12 lh-20"
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
        </div>
    )
}

export default ClusterUpgradeCompatibilityInfoTableCellComponent
