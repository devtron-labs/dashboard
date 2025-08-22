import { useState } from 'react'
import { generatePath, Route, useHistory, useRouteMatch } from 'react-router-dom'

import {
    ActionMenu,
    ActionMenuItemType,
    Button,
    ComponentSizeType,
    Icon,
    SERVER_MODE,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { CREATE_CLUSTER_PATH } from '@Config/routes'
import CreateCluster from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/CreateCluster.component'
import { CreateClusterTypeEnum } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/types'

import { UpgradeToEnterpriseDialog } from '../UpgradeToEnterprise'

enum ConnectClusterOptions {
    CONNECT_CLUSTER = 'connect-cluster',
    CONNECT_USING_SERVER_URL = CreateClusterTypeEnum.CONNECT_USING_SERVER_URL,
    CONNECT_USING_KUBECONFIG = CreateClusterTypeEnum.CONNECT_USING_KUBECONFIG,
    CREATE_CLUSTER = CreateClusterTypeEnum.CREATE_CLUSTER,
    ADD_ISOLATED_CLUSTER = CreateClusterTypeEnum.ADD_ISOLATED_CLUSTER,
}

const AddClusterButton = ({
    clusterCount,
    handleReloadClusterList,
}: {
    clusterCount: number
    handleReloadClusterList: () => void
}) => {
    const { path } = useRouteMatch()
    const { push } = useHistory()
    const { serverMode, licenseData } = useMainContext()

    const [hasClickedConnectCluster, setHasClickedConnectCluster] = useState(false)
    const [showUpgradeToEnterprise, setShowUpgradeToEnterprise] = useState(false)

    const isFreemium = licenseData?.isFreemium ?? false
    const isClusterAdditionAllowed = !isFreemium || clusterCount < licenseData?.moduleLimits?.maxAllowedClusters

    const handleOpenUpgradeDialog = () => {
        setShowUpgradeToEnterprise(true)
    }

    const handleCloseUpgradeDialog = () => {
        setShowUpgradeToEnterprise(false)
    }

    const handleActionMenuClick = (item: ActionMenuItemType<ConnectClusterOptions>) => {
        if (item.id === ConnectClusterOptions.CONNECT_CLUSTER) {
            setHasClickedConnectCluster(true)
        }
    }

    const handleOpenActionMenu = (open: boolean) => {
        if (!open) {
            setHasClickedConnectCluster(false)
        }
    }

    const handleCloseCreateClusterModal = () => {
        push(path)
    }

    const buttonProps = {
        dataTestId: 'add-cluster-button',
        text: 'Add Cluster',
        endIcon: <Icon name="ic-caret-down-small" color={null} />,
        size: ComponentSizeType.medium,
    }

    return (
        <>
            {isClusterAdditionAllowed ? (
                <>
                    <ActionMenu<ConnectClusterOptions>
                        id="add-cluster-button"
                        onClick={handleActionMenuClick}
                        options={[
                            hasClickedConnectCluster
                                ? {
                                      groupLabel: 'Connect Kubernetes Cluster',
                                      items: [
                                          {
                                              id: ConnectClusterOptions.CONNECT_USING_SERVER_URL,
                                              label: 'Use Server URL & Token',
                                              description: 'Connect cluster using Server URL and Bearer token',
                                              startIcon: { name: 'ic-link' },
                                              to: generatePath(`${path}/${CREATE_CLUSTER_PATH}`, {
                                                  type: CreateClusterTypeEnum.CONNECT_USING_SERVER_URL,
                                              }),
                                              componentType: 'link',
                                          },
                                          {
                                              id: ConnectClusterOptions.CONNECT_USING_KUBECONFIG,
                                              label: 'Use kubeconfig',
                                              description: 'Effortlessly connect your clusters using kubeconfig',
                                              startIcon: { name: 'ic-file-code' },
                                              to: generatePath(`${path}/${CREATE_CLUSTER_PATH}`, {
                                                  type: CreateClusterTypeEnum.CONNECT_USING_KUBECONFIG,
                                              }),
                                              componentType: 'link',
                                          },
                                      ],
                                  }
                                : {
                                      items: [
                                          {
                                              id: ConnectClusterOptions.CONNECT_CLUSTER,
                                              label: 'Connect Kubernetes Cluster',
                                              description: 'Connect an existing Kubernetes cluster',
                                              startIcon: { name: 'ic-link' },
                                              doNotCloseMenuOnClick: true,
                                          },
                                          {
                                              id: ConnectClusterOptions.CREATE_CLUSTER,
                                              label: 'Create Kubernetes Cluster',
                                              description: 'Create and connect new Kubernetes cluster',
                                              startIcon: { name: 'ic-new' },
                                              componentType: 'link',
                                              to: generatePath(`${path}/${CREATE_CLUSTER_PATH}`, {
                                                  type: CreateClusterTypeEnum.CREATE_CLUSTER,
                                              }),
                                          },
                                          ...(serverMode === SERVER_MODE.EA_ONLY
                                              ? []
                                              : [
                                                    {
                                                        id: ConnectClusterOptions.ADD_ISOLATED_CLUSTER,
                                                        label: 'Create Isolated Cluster',
                                                        description:
                                                            'Manage deployments to a disconnected Kubernetes cluster',
                                                        startIcon: { name: 'ic-cluster-isolated' },
                                                        componentType: 'link',
                                                        to: generatePath(`${path}/${CREATE_CLUSTER_PATH}`, {
                                                            type: CreateClusterTypeEnum.ADD_ISOLATED_CLUSTER,
                                                        }),
                                                    } as ActionMenuItemType<ConnectClusterOptions>,
                                                ]),
                                      ],
                                  },
                        ]}
                        buttonProps={buttonProps}
                        onOpen={handleOpenActionMenu}
                    />
                    <Route path={`${path}/${CREATE_CLUSTER_PATH}`} exact>
                        <CreateCluster
                            handleReloadClusterList={handleReloadClusterList}
                            handleRedirectOnModalClose={handleCloseCreateClusterModal}
                        />
                    </Route>
                </>
            ) : (
                <Button {...buttonProps} onClick={handleOpenUpgradeDialog} />
            )}
            <UpgradeToEnterpriseDialog open={showUpgradeToEnterprise} handleClose={handleCloseUpgradeDialog} />
        </>
    )
}

export default AddClusterButton
