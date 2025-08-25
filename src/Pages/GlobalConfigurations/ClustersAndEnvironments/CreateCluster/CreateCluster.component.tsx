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

import { useState } from 'react'
import { generatePath, Prompt, Redirect, useHistory, useParams } from 'react-router-dom'

import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DEFAULT_ROUTE_PROMPT_MESSAGE,
    Drawer,
    Icon,
    ModalSidebarPanel,
    stopPropagation,
    VirtualClusterSidebar,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'
import ClusterForm from '@Pages/GlobalConfigurations/ClustersAndEnvironments/ClusterForm/ClusterForm'
import EnterpriseTrialDialog from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/EnterpriseTrialDialog'

import ConnectClusterViaKubeconfig from '../ClusterForm/ConnectClusterViaKubeconfig'
import { CREATE_CLUSTER_TITLE } from './constants'
import { CreateClusterParams, CreateClusterProps, CreateClusterTypeEnum } from './types'

const CreateClusterForm = importComponentFromFELibrary(
    'CreateClusterForm',
    () => (
        <EnterpriseTrialDialog
            featureTitle="Create Kubernetes Cluster"
            featureDescription="Use Devtron to easily create Kubernetes clusters on popular cloud providers. Simplify cluster
                provisioning and management with a guided, user-friendly interface."
        />
    ),
    'function',
)
const VirtualClusterForm = importComponentFromFELibrary(
    'VirtualClusterForm',
    <div className="flexbox flex-grow-1">
        <VirtualClusterSidebar />
        <div className="p-20 bg__secondary">
            <EnterpriseTrialDialog
                featureTitle="Isolated Cluster"
                featureDescription="An isolated cluster in Devtron is an air-gapped Kubernetes cluster with restricted network access."
            />
        </div>
    </div>,
    'function',
)

const CreateCluster = ({ handleReloadClusterList, handleRedirectOnModalClose }: CreateClusterProps) => {
    const { type } = useParams<CreateClusterParams>()
    const { push } = useHistory()

    const [apiCallInProgress, setApiCallInProgress] = useState(false)

    const handleRedirectToClusterList = () => {
        push(URLS.GLOBAL_CONFIG_CLUSTER)
        handleReloadClusterList()
    }

    const handleModalClose = handleRedirectOnModalClose ?? handleRedirectToClusterList

    const handleRedirectToClusterInstallationStatus = (installationId: string) => {
        push(generatePath(URLS.RESOURCE_BROWSER_INSTALLATION_CLUSTER, { installationId }))
    }

    const renderContent = () => {
        switch (type) {
            case CreateClusterTypeEnum.CONNECT_USING_SERVER_URL:
                return (
                    <ClusterForm
                        handleCloseCreateClusterForm={handleModalClose}
                        reload={handleReloadClusterList}
                        handleModalClose={handleModalClose}
                        category={null}
                    />
                )
            case CreateClusterTypeEnum.CONNECT_USING_KUBECONFIG:
                return (
                    <ConnectClusterViaKubeconfig reload={handleReloadClusterList} handleModalClose={handleModalClose} />
                )
            case CreateClusterTypeEnum.CREATE_CLUSTER:
                return (
                    <div className="flexbox dc__overflow-auto create-cluster-form">
                        <ModalSidebarPanel
                            heading="Create Kubernetes Cluster"
                            icon={<Icon name="ic-kubernetes" size={48} color={null} />}
                            documentationLink="GLOBAL_CONFIG_CLUSTER"
                            rootClassName="dc__no-background-imp dc__no-shrink p-20"
                        >
                            <p className="m-0">
                                Use Devtron to easily create Kubernetes clusters on popular cloud providers. Simplify
                                cluster provisioning and management with a guided, user-friendly interface.
                            </p>
                        </ModalSidebarPanel>
                        <CreateClusterForm
                            apiCallInProgress={apiCallInProgress}
                            setApiCallInProgress={setApiCallInProgress}
                            handleModalClose={handleModalClose}
                            handleRedirectToClusterInstallationStatus={handleRedirectToClusterInstallationStatus}
                        />
                    </div>
                )
            case CreateClusterTypeEnum.ADD_ISOLATED_CLUSTER:
                return (
                    <VirtualClusterForm
                        handleModalClose={handleModalClose}
                        reload={handleReloadClusterList}
                        category={null}
                    />
                )
            default:
                return <Redirect to={URLS.GLOBAL_CONFIG_CLUSTER} />
        }
    }

    return (
        <Drawer position="right" width="1024px" onEscape={handleModalClose} onClose={handleModalClose}>
            <div className="bg__primary h-100 cn-9 w-100 flexbox-col dc__overflow-hidden" onClick={stopPropagation}>
                <header className="px-20 flexbox-col dc__border-bottom">
                    <div className="flex py-12 dc__content-space lh-24">
                        <h3 className="m-0 fs-16 fw-6 lh-1-43">{CREATE_CLUSTER_TITLE[type]}</h3>

                        <Button
                            icon={<Icon name="ic-close-large" color={null} />}
                            dataTestId="close-create-cluster-modal-button"
                            component={ButtonComponentType.button}
                            style={ButtonStyleType.negativeGrey}
                            size={ComponentSizeType.xs}
                            variant={ButtonVariantType.borderLess}
                            ariaLabel="Close new cluster drawer"
                            showTooltip={apiCallInProgress}
                            tooltipProps={{
                                content: DEFAULT_ROUTE_PROMPT_MESSAGE,
                            }}
                            disabled={apiCallInProgress}
                            onClick={handleModalClose}
                            showAriaLabelInTippy={false}
                        />
                    </div>
                </header>

                {renderContent()}

                <Prompt when={apiCallInProgress} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
            </div>
        </Drawer>
    )
}

export default CreateCluster
