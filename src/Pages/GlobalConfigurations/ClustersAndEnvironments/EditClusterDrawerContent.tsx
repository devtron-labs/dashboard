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

import { APIResponseHandler, noop, useQuery } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'

import ClusterForm from './ClusterForm/ClusterForm'
import { getEditClusterDrawerMetadata } from './cluster.service'
import { EditClusterDrawerContentProps, EditClusterDrawerMetadataType, EditClusterFormProps } from './cluster.type'

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
    costModuleConfig,
}: EditClusterDrawerContentProps) => {
    const {
        isFetching: isMetadataLoading,
        data: metadata,
        error: metadataError,
        refetch: reloadMetadata,
    } = useQuery<EditClusterDrawerMetadataType, EditClusterDrawerMetadataType, [string, number], false>({
        queryKey: ['get-cluster-metadata', clusterId],
        queryFn: () => getEditClusterDrawerMetadata(clusterId),
        enabled: !!clusterId,
    })

    const { prometheusAuthResult, clusterProvider, costModuleSchema } = metadata || {
        prometheusAuthResult: null,
        clusterProvider: null,
        costModuleSchema: null,
    }

    return (
        <APIResponseHandler
            isLoading={isMetadataLoading}
            progressingProps={{
                pageLoader: true,
            }}
            error={metadataError}
            errorScreenManagerProps={{
                code: metadataError?.code,
                redirectURL: URLS.GLOBAL_CONFIG_CLUSTER,
                reload: reloadMetadata,
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
                handleModalClose={handleModalClose}
                isProd={isProd}
                isTlsConnection={!insecureSkipTlsVerify}
                installationId={installationId}
                category={category}
                clusterProvider={clusterProvider}
                costModuleSchema={costModuleSchema}
                costModuleConfig={costModuleConfig}
            />
        </APIResponseHandler>
    )
}

export default EditClusterDrawerContent
