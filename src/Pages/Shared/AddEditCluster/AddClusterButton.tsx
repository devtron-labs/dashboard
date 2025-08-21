import { useState } from 'react'
import { generatePath, useRouteMatch } from 'react-router-dom'

import {
    ActionMenu,
    ActionMenuItemType,
    ComponentSizeType,
    Icon,
    SERVER_MODE,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { CREATE_CLUSTER_PATH } from '@Config/routes'
import { CreateClusterTypeEnum } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/types'

enum ConnectClusterOptions {
    CONNECT_CLUSTER = 'connect-cluster',
    CONNECT_USING_SERVER_URL = CreateClusterTypeEnum.CONNECT_USING_SERVER_URL,
    CONNECT_USING_KUBECONFIG = CreateClusterTypeEnum.CONNECT_USING_KUBECONFIG,
    CREATE_CLUSTER = CreateClusterTypeEnum.CREATE_CLUSTER,
    ADD_ISOLATED_CLUSTER = CreateClusterTypeEnum.ADD_ISOLATED_CLUSTER,
}

const AddClusterButton = () => {
    const { path } = useRouteMatch()
    const { serverMode } = useMainContext()

    const [hasClickedConnectCluster, setHasClickedConnectCluster] = useState(false)

    const handleActionMenuClick = (item: ActionMenuItemType<ConnectClusterOptions>) => {
        if (item.id === ConnectClusterOptions.CONNECT_CLUSTER) {
            setHasClickedConnectCluster(true)
        }
    }

    const handleOpen = (open: boolean) => {
        if (!open) {
            setHasClickedConnectCluster(false)
        }
    }

    return (
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
                                            description: 'Manage deployments to a disconnected Kubernetes cluster',
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
            buttonProps={{
                dataTestId: 'add-cluster-button',
                text: 'Add Cluster',
                endIcon: <Icon name="ic-caret-down-small" color={null} />,
                size: ComponentSizeType.medium,
            }}
            onOpen={handleOpen}
        />
    )
}

export default AddClusterButton
