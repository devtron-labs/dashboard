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
import { Prompt, Redirect, useHistory, useParams } from 'react-router-dom'
import { useState } from 'react'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { URLS } from '@Config/routes'
import { importComponentFromFELibrary } from '@Components/common'
import ClusterForm from '@Components/cluster/ClusterForm'

import { CreateClusterParams, CreateClusterProps, CreateClusterTypeEnum } from './types'
import Sidebar from './Sidebar'
import FooterComponent from './FooterComponent'

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

    const handleRedirectToResourceBrowser = () => {
        push(URLS.RESOURCE_BROWSER)
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
                return (
                    <CreateClusterForm
                        apiCallInProgress={apiCallInProgress}
                        setApiCallInProgress={setApiCallInProgress}
                        handleModalClose={handleRedirectToResourceBrowser}
                        FooterComponent={FooterComponent}
                    />
                )
            case CreateClusterTypeEnum.ADD_ISOLATED_CLUSTER:
                return (
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
