import { FunctionComponent } from 'react'
import { generatePath, Link, useHistory, useLocation, useParams } from 'react-router-dom'

import {
    ActionMenu,
    ActionMenuItemType,
    Button,
    ButtonStyleType,
    ButtonVariantType,
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
    Tooltip,
    URLS as COMMON_URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'

import {
    ClusterEnvTabs,
    ClusterListFields,
    ClusterRowData,
    DEFAULT_CLUSTER_ID,
    EditDeleteClusterProps,
} from './cluster.type'
import { ClusterEnvironmentDrawer } from './ClusterEnvironmentDrawer'
import DeleteClusterConfirmationModal from './DeleteClusterConfirmationModal'
import EditClusterDrawerContent from './EditClusterDrawerContent'

const HibernationRulesModal = importComponentFromFELibrary('HibernationRulesModal', null, 'function')
const VirtualClusterForm = importComponentFromFELibrary('VirtualClusterForm', null, 'function')

export const ClusterListCellComponent: FunctionComponent<
    TableCellComponentProps<ClusterRowData, FiltersTypeEnum.STATE, {}>
> = ({
    field,
    row: {
        data: { clusterId, clusterName, clusterType, envCount, serverUrl, clusterCategory, isVirtualCluster },
    },
    isRowActive,
}: TableCellComponentProps<ClusterRowData, FiltersTypeEnum.STATE, {}>) => {
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

    switch (field) {
        case ClusterListFields.ICON:
            return (
                <span className="flex py-8">
                    <Icon name="ic-bg-cluster" color={null} size={24} />
                </span>
            )
        case ClusterListFields.CLUSTER_NAME:
            return (
                <Link
                    to={getUrlWithSearchParams(URLS.GLOBAL_CONFIG_CLUSTER, {
                        selectedTab: ClusterEnvTabs.ENVIRONMENTS,
                        clusterId,
                    })}
                    className="flex left py-8 dc__truncate"
                >
                    {clusterName}
                </Link>
            )
        case ClusterListFields.CLUSTER_TYPE:
            return <span className="flex left py-8">{clusterType}</span>
        case ClusterListFields.ENV_COUNT:
            return <span className="flex left py-8">{envCount ? `${envCount}` : 'No'} Environments</span>
        case ClusterListFields.CLUSTER_CATEGORY:
            return <span className="flex left py-8 dc__truncate">{clusterCategory}</span>
        case ClusterListFields.SERVER_URL:
            return (
                <Tooltip content={serverUrl}>
                    <span className="flex left py-8 dc__truncate">{serverUrl}</span>
                </Tooltip>
            )
        case ClusterListFields.ACTIONS:
            return (
                <div className={isRowActive ? '' : 'dc__opacity-hover--child'}>
                    <div className="flex dc__gap-8 py-8">
                        <Button
                            dataTestId={`add-env-${clusterId}`}
                            ariaLabel={`add-env-${clusterId}`}
                            icon={<Icon name="ic-add" color={null} />}
                            showAriaLabelInTippy={false}
                            variant={ButtonVariantType.borderLess}
                            size={ComponentSizeType.xs}
                            onClick={handleAddEnv}
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
                                dataTestId: 'cluster-actions',
                                icon: <Icon name="ic-more-vertical" color={null} />,
                                size: ComponentSizeType.xs,
                                variant: ButtonVariantType.borderLess,
                                style: ButtonStyleType.neutral,
                                showAriaLabelInTippy: false,
                            }}
                        />
                    </div>
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
    handleClose
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
            // eslint-disable-next-line react/no-array-index-key
            <div key={idx} className="px-20 py-8 dc__grid environment-row dc__align-items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <span key={index} className="shimmer" />
                ))}
            </div>
        ))}
    </>
)
