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

import { FunctionComponent, useEffect, useRef } from 'react'
import { generatePath, Link, useHistory, useLocation, useParams } from 'react-router-dom'

import {
    ActionMenu,
    ActionMenuItemType,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ClusterStatusType,
    ComponentSizeType,
    Drawer,
    FiltersTypeEnum,
    GenericEmptyState,
    getUrlWithSearchParams,
    Icon,
    IconName,
    noop,
    stopPropagation,
    TableCellComponentProps,
    TableSignalEnum,
    Tooltip,
    URLS as COMMON_URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'

import {
    Cluster,
    ClusterEnvTabs,
    ClusterListFields,
    ClusterRowData,
    DEFAULT_CLUSTER_ID,
    EditDeleteClusterProps,
} from './cluster.type'
import { getBulletColorAccToStatus } from './cluster.util'
import { ClusterEnvironmentDrawer } from './ClusterEnvironmentDrawer'
import DeleteClusterConfirmationModal from './DeleteClusterConfirmationModal'
import EditClusterDrawerContent from './EditClusterDrawerContent'

const HibernationRulesModal = importComponentFromFELibrary('HibernationRulesModal', null, 'function')
const VirtualClusterForm = importComponentFromFELibrary('VirtualClusterForm', null, 'function')

export const ClusterIconWithStatus = ({
    clusterStatus,
    isVirtualCluster,
}: {
    clusterStatus: ClusterStatusType
    isVirtualCluster: boolean
}) => {
    const statusColor = getBulletColorAccToStatus(clusterStatus)
    return (
        <span className="dc__position-rel dc__overflow-hidden icon-dim-24">
            <Icon name="ic-bg-cluster" color={null} size={24} />
            {!isVirtualCluster && (
                <span
                    className={`dc__position-abs dc__top-16 icon-dim-10 dc__border-radius-50-per dc__right-2--neg ${statusColor}`}
                    style={{ border: '2px solid var(--N0)' }}
                />
            )}
        </span>
    )
}

export const ClusterActions = ({ clusterId, isVirtualCluster }: { clusterId: number; isVirtualCluster: boolean }) => {
    const { push } = useHistory()
    const { search } = useLocation()

    const handleEditCluster = () => {
        push({ pathname: generatePath(COMMON_URLS.GLOBAL_CONFIG_EDIT_CLUSTER, { clusterId }), search })
    }

    const handleAddEnv = () => {
        push({
            pathname: generatePath(`${URLS.GLOBAL_CONFIG_CLUSTER}${URLS.CREATE_ENVIRONMENT}/:clusterId`, {
                clusterId,
            }),
            search,
        })
    }

    const handleActionMenuClick = (item: ActionMenuItemType) => {
        switch (item.id) {
            case 'edit-pod-spread':
                push({
                    pathname: generatePath(`${URLS.GLOBAL_CONFIG_CLUSTER}/${URLS.POD_SPREAD}/:clusterId`, {
                        clusterId,
                    }),
                    search,
                })
                break
            case 'hibernation-rules':
                push({
                    pathname: generatePath(`${URLS.GLOBAL_CONFIG_CLUSTER}/${URLS.HIBERNATION_RULES}/:clusterId`, {
                        clusterId,
                    }),
                    search,
                })
                break
            case 'delete-cluster':
                if (clusterId === DEFAULT_CLUSTER_ID) {
                    break
                }
                push({
                    pathname: generatePath(`${URLS.GLOBAL_CONFIG_CLUSTER}/${URLS.DELETE_CLUSTER}/:clusterId`, {
                        clusterId,
                    }),
                    search,
                })
                break
            default:
                break
        }
    }

    return (
        <div className="flex dc__gap-8">
            <Button
                dataTestId={`add-env-${clusterId}`}
                ariaLabel={`add-env-${clusterId}`}
                icon={<Icon name="ic-add" color={null} />}
                showAriaLabelInTippy={false}
                variant={ButtonVariantType.borderLess}
                size={ComponentSizeType.xs}
                onClick={handleAddEnv}
                showTooltip
                tooltipProps={{
                    content: 'Add Environment',
                }}
            />
            <Button
                dataTestId={`edit-cluster-${clusterId}`}
                ariaLabel={`edit-cluster-${clusterId}`}
                icon={<Icon name="ic-pencil" color={null} />}
                variant={ButtonVariantType.borderLess}
                showAriaLabelInTippy={false}
                style={ButtonStyleType.neutral}
                size={ComponentSizeType.xs}
                onClick={handleEditCluster}
                showTooltip
                tooltipProps={{
                    content: 'Edit Cluster',
                }}
            />
            <ActionMenu
                id="cluster-actions-action-menu"
                onClick={handleActionMenuClick}
                options={[
                    ...(!isVirtualCluster && HibernationRulesModal
                        ? [
                              {
                                  items: [
                                      {
                                          id: 'edit-pod-spread',
                                          label: 'Edit Pod Spread',
                                          startIcon: { name: 'ic-two-cubes' as IconName },
                                      },
                                      {
                                          id: 'hibernation-rules',
                                          label: 'Hibernation Rules',
                                          startIcon: {
                                              name: 'ic-hibernate-circle' as IconName,
                                          },
                                      },
                                  ],
                              },
                          ]
                        : []),
                    {
                        items: [
                            {
                                id: 'delete-cluster',
                                label: 'Delete cluster',
                                startIcon: { name: 'ic-delete' },
                                isDisabled: clusterId === DEFAULT_CLUSTER_ID,
                                type: 'negative',
                            },
                        ],
                    },
                ]}
                buttonProps={{
                    ariaLabel: 'cluster-actions',
                    dataTestId: `cluster-actions-${clusterId}`,
                    icon: <Icon name="ic-more-vertical" color={null} />,
                    size: ComponentSizeType.xs,
                    variant: ButtonVariantType.borderLess,
                    style: ButtonStyleType.neutral,
                    showAriaLabelInTippy: false,
                }}
            />
        </div>
    )
}

export const ClusterListCellComponent: FunctionComponent<
    TableCellComponentProps<ClusterRowData, FiltersTypeEnum.STATE, {}>
> = ({
    field,
    row: {
        data: { clusterId, clusterName, clusterType, envCount, serverUrl, clusterCategory, isVirtualCluster, status },
    },
    isRowActive,
    signals,
}: TableCellComponentProps<ClusterRowData, FiltersTypeEnum.STATE, {}>) => {
    const linkRef = useRef<HTMLAnchorElement>(null)

    useEffect(() => {
        const handleEnter = ({ detail: { activeRowData } }) => {
            if (activeRowData.data.clusterId === clusterId) {
                linkRef.current?.click()
            }
        }

        if (isRowActive) {
            signals.addEventListener(TableSignalEnum.ENTER_PRESSED, handleEnter)
        }

        return () => {
            signals.removeEventListener(TableSignalEnum.ENTER_PRESSED, handleEnter)
        }
    }, [isRowActive])

    switch (field) {
        case ClusterListFields.ICON:
            return (
                <div className="flex left py-10">
                    <ClusterIconWithStatus clusterStatus={status} isVirtualCluster={isVirtualCluster} />
                </div>
            )
        case ClusterListFields.CLUSTER_NAME:
            return (
                <Link
                    ref={linkRef}
                    to={getUrlWithSearchParams(URLS.GLOBAL_CONFIG_CLUSTER, {
                        selectedTab: ClusterEnvTabs.ENVIRONMENTS,
                        clusterId,
                    })}
                    className="flex left py-10"
                >
                    <Tooltip content={clusterName}>
                        <span className="dc__truncate">{clusterName}</span>
                    </Tooltip>
                </Link>
            )
        case ClusterListFields.CLUSTER_TYPE:
            return <span className="flex left py-10">{clusterType}</span>
        case ClusterListFields.ENV_COUNT:
            return <span className="flex left py-10">{envCount ? `${envCount}` : 'No'} Environments</span>
        case ClusterListFields.CLUSTER_CATEGORY:
            return (
                <div className="flex left py-10">
                    <Tooltip content={clusterCategory}>
                        <span className="dc__truncate">{clusterCategory}</span>
                    </Tooltip>
                </div>
            )
        case ClusterListFields.SERVER_URL:
            return (
                <div className="flex left py-10">
                    <Tooltip content={serverUrl}>
                        <span className="dc__truncate">{serverUrl}</span>
                    </Tooltip>
                </div>
            )
        case ClusterListFields.ACTIONS:
            return (
                <div className={`${isRowActive ? '' : 'dc__opacity-hover--child'} py-10`}>
                    <ClusterActions clusterId={clusterId} isVirtualCluster={isVirtualCluster} />
                </div>
            )
        default:
            return null
    }
}

export const AddEnvironment = ({
    reloadEnvironments,
    handleClose,
}: {
    reloadEnvironments: () => void
    handleClose: () => void
}) => {
    const { clusterId } = useParams<{ clusterId?: string }>()

    return (
        <ClusterEnvironmentDrawer
            drawerType="addEnv"
            reload={reloadEnvironments}
            clusterId={clusterId ? +clusterId : null}
            hideClusterDrawer={handleClose}
        />
    )
}

export const AddEnvironmentFromClusterName = ({
    reloadEnvironments,
    handleClose,
    clusterList,
}: {
    clusterList: Cluster[]
    reloadEnvironments: () => void
    handleClose: () => void
}) => {
    const { clusterName } = useParams<{ clusterName?: string }>()

    const clusterId = clusterList.find((c) => c.clusterName === clusterName)?.clusterId

    return (
        <ClusterEnvironmentDrawer
            drawerType="addEnv"
            reload={reloadEnvironments}
            clusterId={clusterId}
            hideClusterDrawer={handleClose}
        />
    )
}

export const EditCluster = ({ clusterList, reloadClusterList, handleClose }: EditDeleteClusterProps) => {
    const { clusterId } = useParams<{ clusterId: string }>()
    const cluster = clusterList.find((c) => c.clusterId === +clusterId)

    if (!cluster || !cluster.isVirtualCluster) {
        return (
            <Drawer position="right" width="1000px" onClose={handleClose}>
                <div className="h-100 bg__primary" onClick={stopPropagation}>
                    {!cluster ? (
                        <GenericEmptyState
                            title="Cluster not found"
                            subTitle="The cluster that you are looking is not available."
                        />
                    ) : (
                        <EditClusterDrawerContent
                            handleModalClose={handleClose}
                            sshTunnelConfig={cluster.sshTunnelConfig}
                            clusterId={cluster.clusterId}
                            clusterName={cluster.clusterName}
                            serverUrl={cluster.serverUrl}
                            reload={reloadClusterList}
                            prometheusUrl={cluster.prometheusUrl}
                            proxyUrl={cluster.proxyUrl}
                            toConnectWithSSHTunnel={cluster.toConnectWithSSHTunnel}
                            isProd={cluster.isProd}
                            installationId={cluster.installationId}
                            category={cluster.category}
                            insecureSkipTlsVerify={cluster.insecureSkipTlsVerify}
                        />
                    )}
                </div>
            </Drawer>
        )
    }
    return (
        <VirtualClusterForm
            id={+cluster.clusterId}
            clusterName={cluster.clusterName}
            handleModalClose={handleClose}
            reload={reloadClusterList}
            category={cluster.category}
            isProd={cluster.isProd}
        />
    )
}

export const DeleteCluster = ({ clusterList, reloadClusterList, handleClose }: EditDeleteClusterProps) => {
    const { clusterId } = useParams<{ clusterId: string }>()
    const cluster = clusterList.find((c) => c.clusterId === +clusterId)

    if (!cluster) {
        handleClose()
    }

    return (
        <DeleteClusterConfirmationModal
            clusterId={String(cluster.clusterId)}
            clusterName={cluster.clusterName}
            handleClose={handleClose}
            handleSuccess={noop}
            reload={reloadClusterList}
            installationId={String(cluster.installationId)}
        />
    )
}

export const ClusterEnvLoader = () => (
    <>
        {Array.from({ length: 3 }).map((_, idx) => (
            <div
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                className={`px-20 py-8 dc__grid environment-row ${VirtualClusterForm ? 'with-category' : ''} dc__align-items-center`}
            >
                {Array.from({ length: 5 }).map((_val, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <span key={index} className="shimmer" />
                ))}
            </div>
        ))}
    </>
)
