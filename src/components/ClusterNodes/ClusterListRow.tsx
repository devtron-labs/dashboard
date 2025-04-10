import { Link } from 'react-router-dom'

import {
    ALL_NAMESPACE_OPTION,
    BulkSelectionEvents,
    BulkSelectionIdentifiersType,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CHECKBOX_VALUE,
    ClusterDetail,
    ClusterStatusType,
    ComponentSizeType,
    Icon,
    Tooltip,
    URLS,
    useBulkSelection,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Error } from '@Icons/ic-error-exclamation.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '@Components/ResourceBrowser/Constants'
import { AppDetailsTabs } from '@Components/v2/appDetails/appDetails.store'

import { ClusterMapInitialStatus } from './ClusterMapInitialStatus'
import { CLUSTER_PROD_TYPE } from './constants'
import { KubeConfigButton } from './KubeConfigButton'
import { ClusterListRowTypes } from './types'

export const ClusterListRow = ({ clusterData, index, clusterListLoader }: ClusterListRowTypes) => {
    // const KubeConfigButton = importComponentFromFELibrary('KubeConfigButton', null, 'function')
    const ClusterStatusCell = importComponentFromFELibrary('ClusterStatus', null, 'function')
    const CompareClusterButton = importComponentFromFELibrary('CompareClusterButton', null, 'function')

    const {
        selectedIdentifiers: bulkSelectionState,
        isBulkSelectionApplied,
        handleBulkSelection,
        getSelectedIdentifiersCount,
    } = useBulkSelection<BulkSelectionIdentifiersType<ClusterDetail>>()
    const errorCount = clusterData.nodeErrors ? Object.keys(clusterData.nodeErrors).length : 0

    const handleSelection = () => {
        const { name } = clusterData
        if (isBulkSelectionApplied) {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_IDENTIFIERS_AFTER_ACROSS_SELECTION,
                data: {
                    identifierIds: [name],
                },
            })
        } else if (bulkSelectionState[name]) {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_IDENTIFIERS,
                data: {
                    identifierIds: [name],
                },
            })
        } else {
            handleBulkSelection({
                action: BulkSelectionEvents.SELECT_IDENTIFIER,
                data: {
                    identifierObject: {
                        ...bulkSelectionState,
                        [name]: clusterData,
                    },
                },
            })
        }
    }

    const terminalURL = `${URLS.RESOURCE_BROWSER}/${clusterData.id}/all}/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}`

    const hideDataOnLoad = (value) => {
        if (clusterListLoader) {
            return null
        }
        return value
    }

    const renderClusterStatus = ({ errorInNodeListing, status }: ClusterDetail) => {
        if (ClusterStatusCell && status) {
            return <ClusterStatusCell status={status} errorInNodeListing={errorInNodeListing} />
        }

        return <ClusterMapInitialStatus errorInNodeListing={errorInNodeListing} />
    }
    const isIdentifierSelected = !!bulkSelectionState[clusterData.name] || isBulkSelectionApplied

    return (
        <div
            key={`cluster-${clusterData.id}`}
            className={`cluster-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20 hover-class dc__visible-hover dc__visible-hover--parent
                 ${clusterListLoader ? 'show-shimmer-loading dc__align-items-center' : ''}`}
        >
            <div
                className={
                    isIdentifierSelected || getSelectedIdentifiersCount() > 0
                        ? 'dc__visible'
                        : 'dc__visible-hover--child flexbox'
                }
            >
                <Checkbox
                    isChecked={isIdentifierSelected}
                    onChange={handleSelection}
                    rootClassName="icon-dim-20 m-0"
                    dataTestId={`activate-${clusterData.name}`}
                    tabIndex={index - 1}
                    value={CHECKBOX_VALUE.CHECKED}
                />
            </div>

            {!isIdentifierSelected && getSelectedIdentifiersCount() === 0 && (
                <div className="dc__visible-hover--hide-child flex left">
                    <Icon name="ic-bg-cluster" color={null} size={20} />
                </div>
            )}
            <div data-testid={`cluster-row-${clusterData.name}`} className="flex left dc__overflow-hidden">
                <Link
                    className="dc__ellipsis-right dc__no-decor lh-24"
                    to={`${URLS.RESOURCE_BROWSER}/${clusterData.id}/${ALL_NAMESPACE_OPTION.value}/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`}
                >
                    {clusterData.name}
                </Link>
                {/* NOTE: visible-hover plays with display prop; therefore need to set display: flex on a new div */}
                <div className="cursor dc__visible-hover--child ml-8">
                    <div className="flexbox dc__align-items-center dc__gap-4">
                        {!!clusterData.nodeCount && !clusterListLoader && (
                            <Button
                                icon={<Icon name="ic-terminal-fill" color={null} size={16} />}
                                ariaLabel="View terminal"
                                size={ComponentSizeType.xs}
                                dataTestId={`cluster-terminal-${clusterData.name}`}
                                style={ButtonStyleType.neutral}
                                variant={ButtonVariantType.borderLess}
                                component={ButtonComponentType.link}
                                linkProps={{
                                    to: terminalURL,
                                }}
                            />
                        )}
                        {CompareClusterButton && clusterData.status !== ClusterStatusType.CONNECTION_FAILED && (
                            <CompareClusterButton sourceClusterId={clusterData.id} isIconButton />
                        )}
                        {/* {KubeConfigButton && <KubeConfigButton clusterName={clusterData.name} />} */}
                        <KubeConfigButton clusterName={clusterData.name} />
                    </div>
                </div>
            </div>

            {renderClusterStatus(clusterData)}

            <div className="child-shimmer-loading">
                {hideDataOnLoad(clusterData.isProd ? CLUSTER_PROD_TYPE.PRODUCTION : CLUSTER_PROD_TYPE.NON_PRODUCTION)}
            </div>
            <div className="child-shimmer-loading">{hideDataOnLoad(clusterData.nodeCount)}</div>
            <div className="child-shimmer-loading">
                {errorCount > 0 &&
                    hideDataOnLoad(
                        <>
                            <Error className="mr-3 icon-dim-16 dc__position-rel top-3" />
                            <span className="cr-5">{errorCount}</span>
                        </>,
                    )}
            </div>
            <div className="flexbox child-shimmer-loading">
                {hideDataOnLoad(
                    <Tooltip content={clusterData.serverVersion}>
                        <span className="dc__truncate">{clusterData.serverVersion}</span>
                    </Tooltip>,
                )}
            </div>
            <div className="child-shimmer-loading">{hideDataOnLoad(clusterData.cpu?.capacity)}</div>
            <div className="child-shimmer-loading">{hideDataOnLoad(clusterData.memory?.capacity)}</div>
        </div>
    )
}
