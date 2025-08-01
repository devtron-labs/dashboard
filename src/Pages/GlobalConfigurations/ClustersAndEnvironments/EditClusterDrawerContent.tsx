import {
    APIResponseHandler,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    noop,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'

import { getCluster } from './cluster.service'
import { EditClusterDrawerContentProps, EditClusterFormProps } from './cluster.type'
import ClusterForm from './ClusterForm'

const getSSHConfig: (
    ...props
) => Pick<EditClusterFormProps, 'sshUsername' | 'sshPassword' | 'sshAuthKey' | 'sshServerAddress'> =
    importComponentFromFELibrary('getSSHConfig', noop, 'function')

const EditClusterDrawerContent = ({
    handleModalClose,
    sshTunnelConfig,
    clusterId,
    clusterName,
    serverUrl,
    reload,
    prometheusUrl,
    proxyUrl,
    toConnectWithSSHTunnel,
    isProd,
    installationId,
    category,
    insecureSkipTlsVerify,
}: EditClusterDrawerContentProps) => {
    const [isPrometheusAuthLoading, prometheusAuthResult, prometheusAuthError, reloadPrometheusAuth] = useAsync(
        () => getCluster(+clusterId),
        [clusterId],
        !!clusterId,
    )

    return (
        <div className="h-100 cluster-form bg__primary flexbox-col">
            <div className="flex flex-align-center dc__border-bottom flex-justify bg__primary py-12 px-20">
                <h2 data-testid="add_cluster_header" className="fs-16 fw-6 lh-1-43 m-0 title-padding">
                    <span className="fw-6 fs-16 cn-9">Edit Cluster</span>
                </h2>

                <Button
                    icon={<Icon name="ic-close-large" color={null} />}
                    dataTestId="header_close_icon"
                    component={ButtonComponentType.button}
                    style={ButtonStyleType.negativeGrey}
                    size={ComponentSizeType.xs}
                    variant={ButtonVariantType.borderLess}
                    ariaLabel="Close edit cluster drawer"
                    onClick={handleModalClose}
                    showAriaLabelInTippy={false}
                />
            </div>
            <APIResponseHandler
                isLoading={isPrometheusAuthLoading}
                progressingProps={{
                    pageLoader: true,
                }}
                error={prometheusAuthError?.code}
                errorScreenManagerProps={{
                    redirectURL: URLS.GLOBAL_CONFIG_CLUSTER,
                    reload: reloadPrometheusAuth,
                }}
            >
                <ClusterForm
                    {...getSSHConfig(sshTunnelConfig)}
                    id={+clusterId}
                    clusterName={clusterName}
                    serverUrl={serverUrl}
                    reload={reload}
                    prometheusUrl={prometheusUrl}
                    prometheusAuth={prometheusAuthResult?.result.prometheusAuth}
                    proxyUrl={proxyUrl}
                    isConnectedViaSSHTunnel={toConnectWithSSHTunnel}
                    hideEditModal={handleModalClose}
                    isProd={isProd}
                    isTlsConnection={!insecureSkipTlsVerify}
                    installationId={installationId}
                    category={category}
                />
            </APIResponseHandler>
        </div>
    )
}

export default EditClusterDrawerContent
