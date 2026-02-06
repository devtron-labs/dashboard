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

import { memo, useMemo } from 'react'
import { generatePath, Link } from 'react-router-dom'

import {
    BulkSelectionIdentifiersType,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ClusterDetail,
    ClusterStatusType,
    ComponentSizeType,
    ConditionalWrap,
    Icon,
    InstallationClusterStatus,
    RESOURCE_BROWSER_ROUTES,
    Tooltip,
    useBulkSelection,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Error } from '@Icons/ic-error-exclamation.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { getClusterChangeRedirectionUrl } from '@Components/ResourceBrowser/Utils'

import { CLUSTER_PROD_TYPE } from '../constants'
import { ClusterStatus } from './ClusterStatus'
import { ClusterListRowTypes } from './types'

const CompareClusterButton = importComponentFromFELibrary('CompareClusterButton', null, 'function')
const KubeConfigButton = importComponentFromFELibrary('KubeConfigButton', null, 'function')
const KubeConfigRowCheckbox = importComponentFromFELibrary('KubeConfigRowCheckbox', null, 'function')

const ClusterListRowComponent = ({
    clusterData,
    clusterListLoader,
    onChangeShowKubeConfigModal,
    setSelectedClusterName,
}: ClusterListRowTypes) => {
    const { selectedIdentifiers, getSelectedIdentifiersCount } =
        useBulkSelection<BulkSelectionIdentifiersType<ClusterDetail>>()
    const identifierCount = getSelectedIdentifiersCount()
    const isIdentifierSelected = Boolean(selectedIdentifiers[clusterData.name])

    const errorCount = useMemo(
        () => (clusterData.nodeErrors ? Object.keys(clusterData.nodeErrors).length : 0),
        [clusterData.nodeErrors],
    )

    const isClusterInCreationPhase = Boolean(clusterData.installationId && !clusterData.id)

    const clusterLinkURL = useMemo(
        () =>
            getClusterChangeRedirectionUrl(
                isClusterInCreationPhase,
                String(isClusterInCreationPhase ? clusterData.installationId : clusterData.id),
            ),
        [isClusterInCreationPhase, clusterData.installationId, clusterData.id],
    )

    const hideDataOnLoad = (value) => (clusterListLoader ? null : value)

    const wrapWithLinkForClusterName = (children) => (
        <Link className="dc__ellipsis-right dc__no-decor" to={clusterLinkURL}>
            {children}
        </Link>
    )

    return (
        <div
            className={`cluster-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 py-12 px-20 hover-class dc__visible-hover dc__visible-hover--parent
            ${clusterListLoader ? 'show-shimmer-loading dc__align-items-center' : ''}`}
        >
            {KubeConfigRowCheckbox && <KubeConfigRowCheckbox clusterData={clusterData} />}
            {!isIdentifierSelected && identifierCount === 0 && (
                <div className={`${KubeConfigRowCheckbox ? 'dc__visible-hover--hide-child' : ''} flex left`}>
                    <Icon name="ic-bg-cluster" color={null} size={24} />
                </div>
            )}
            <div data-testid={`cluster-row-${clusterData.name}`} className="flex left dc__overflow-hidden">
                <ConditionalWrap
                    wrap={wrapWithLinkForClusterName}
                    condition={(clusterData.status as string) !== InstallationClusterStatus.Deleted}
                >
                    <span className="lh-24">{clusterData.name}</span>
                </ConditionalWrap>
                {/* NOTE: visible-hover plays with display prop; therefore need to set display: flex on a new div */}
                {clusterData.id && (
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
                                        to: generatePath(RESOURCE_BROWSER_ROUTES.TERMINAL, {
                                            clusterId: clusterData.id,
                                        }),
                                    }}
                                />
                            )}

                            {CompareClusterButton && clusterData.status !== ClusterStatusType.CONNECTION_FAILED && (
                                <CompareClusterButton sourceClusterId={clusterData.id} isIconButton />
                            )}

                            {KubeConfigButton && (
                                <KubeConfigButton
                                    onChangeShowKubeConfigModal={onChangeShowKubeConfigModal}
                                    clusterName={clusterData.name}
                                    setSelectedClusterName={setSelectedClusterName}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="child-shimmer-loading">
                {hideDataOnLoad(
                    clusterData.status && (
                        <ClusterStatus
                            status={clusterData.status}
                            errorInNodeListing={clusterData.errorInNodeListing}
                        />
                    ),
                )}
            </div>

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

const ClusterListRow = memo(
    ClusterListRowComponent,
    (prev, next) => prev.clusterData === next.clusterData && prev.clusterListLoader === next.clusterListLoader,
)

ClusterListRow.displayName = 'ClusterListRow'

export default ClusterListRow
