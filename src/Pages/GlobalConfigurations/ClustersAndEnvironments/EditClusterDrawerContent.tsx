import { APIResponseHandler, noop, useAsync } from '@devtron-labs/devtron-fe-common-lib'

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
    serverURL,
    reload,
    prometheusURL,
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
            {prometheusAuthResult?.result && (
                <ClusterForm
                    {...getSSHConfig(sshTunnelConfig)}
                    id={+clusterId}
                    clusterName={clusterName}
                    serverUrl={serverURL}
                    reload={reload}
                    prometheusUrl={prometheusURL}
                    prometheusAuth={prometheusAuthResult.result.prometheusAuth}
                    proxyUrl={proxyUrl}
                    isConnectedViaSSHTunnel={toConnectWithSSHTunnel}
                    hideEditModal={handleModalClose}
                    isProd={isProd}
                    isTlsConnection={!insecureSkipTlsVerify}
                    installationId={installationId}
                    category={category}
                />
            )}
        </APIResponseHandler>
    )
}

export default EditClusterDrawerContent
