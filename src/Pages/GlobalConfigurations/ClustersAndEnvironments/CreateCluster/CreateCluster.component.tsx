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
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import ClusterForm from '@Components/cluster/ClusterForm'
import { importComponentFromFELibrary } from '@Components/common'
import EnterpriseTrialDialog from '@Components/EnterpriseTrialDialog'
import { URLS } from '@Config/routes'

import FooterComponent from './FooterComponent'
import Sidebar from './Sidebar'
import { CreateClusterParams, CreateClusterProps, CreateClusterTypeEnum } from './types'

import './styles.scss'

// TODO: show a default component that says its a enterprise feature
const CreateClusterForm = importComponentFromFELibrary('CreateClusterForm', null, 'function')

const CreateCluster = ({ handleReloadClusterList, clusterFormProps }: CreateClusterProps) => {
    const { type } = useParams<CreateClusterParams>()

    const [apiCallInProgress, setApiCallInProgress] = useState(false)

    const { push } = useHistory()

    const handleRedirectToClusterList = () => {
        push(URLS.GLOBAL_CONFIG_CLUSTER)
        handleReloadClusterList()
    }

    const handleRedirectToClusterInstallationStatus = (installationId: string) => {
        push(generatePath(URLS.RESOURCE_BROWSER_INSTALLATION_CLUSTER, { installationId }))
    }

    const renderContent = () => {
        switch (type) {
            case CreateClusterTypeEnum.CONNECT_CLUSTER:
                return (
                    <ClusterForm
                        key={type}
                        {...clusterFormProps}
                        reload={handleReloadClusterList}
                        apiCallInProgress={apiCallInProgress}
                        setApiCallInProgress={setApiCallInProgress}
                        handleModalClose={handleRedirectToClusterList}
                        FooterComponent={FooterComponent}
                        isVirtualCluster={false}
                    />
                )
            case CreateClusterTypeEnum.CREATE_EKS_CLUSTER:
                return CreateClusterForm ? (
                    <CreateClusterForm
                        apiCallInProgress={apiCallInProgress}
                        setApiCallInProgress={setApiCallInProgress}
                        handleModalClose={handleRedirectToClusterList}
                        handleRedirectToClusterInstallationStatus={handleRedirectToClusterInstallationStatus}
                        FooterComponent={FooterComponent}
                    />
                ) : (
                    <EnterpriseTrialDialog
                        featureTitle="EKS Cluster"
                        featureDescription="With Devtron, you can effortlessly create an Amazon EKS cluster."
                    />
                )
            case CreateClusterTypeEnum.ADD_ISOLATED_CLUSTER:
                return CreateClusterForm ? (
                    <ClusterForm
                        key={type}
                        {...clusterFormProps}
                        reload={handleReloadClusterList}
                        apiCallInProgress={apiCallInProgress}
                        setApiCallInProgress={setApiCallInProgress}
                        handleModalClose={handleRedirectToClusterList}
                        FooterComponent={FooterComponent}
                        isVirtualCluster
                    />
                ) : (
                    <EnterpriseTrialDialog
                        featureTitle="Isolated Cluster"
                        featureDescription="An isolated cluster in Devtron is an air-gapped Kubernetes cluster with restricted network access."
                    />
                )
            default:
                return <Redirect to={URLS.GLOBAL_CONFIG_CLUSTER} />
        }
    }

    return (
        <Drawer
            position="right"
            width="1024px"
            onEscape={handleRedirectToClusterList}
            onClose={handleRedirectToClusterList}
        >
            <dialog
                className="bg__primary h-100 cn-9 w-100 flexbox-col dc__overflow-hidden p-0 create-cluster"
                onClick={stopPropagation}
            >
                <header className="px-20 py-12 lh-24 flexbox dc__content-space dc__align-items-center dc__border-bottom">
                    <span className="fs-16 fw-6 dc__first-letter-capitalize">New Cluster</span>

                    <Button
                        icon={<ICClose />}
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
                        onClick={handleRedirectToClusterList}
                        showAriaLabelInTippy={false}
                    />
                </header>

                <div className="flexbox flex-grow-1 dc__overflow-hidden create-cluster__body">
                    <Sidebar />

                    <div className="bg__tertiary flex-grow-1 flexbox-col dc__overflow-auto p-20 dc__gap-16">
                        {renderContent()}
                    </div>
                </div>

                <Prompt when={apiCallInProgress} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
            </dialog>
        </Drawer>
    )
}

export default CreateCluster
