import { AuthenticationType, RemoteConnectionType } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { SSHAuthenticationType } from '../cluster.type'
import { ClusterFormKeys, GetClusterFormValidationSchemaProps } from './types'

const RemoteConnectionRadio = importComponentFromFELibrary('RemoteConnectionRadio', null, 'function')

export const renderKubeConfigClusterCountInfo = (clusterCount: number) => (
    <div>
        <div className="flex left dc__gap-4">
            <span className="fw-6">{clusterCount} valid cluster(s). </span>
            <span>Select the cluster you want to add/update</span>
        </div>
    </div>
)

export const getClusterFormValidationSchema = ({
    isPrometheusEnabled,
    id,
    isDefaultCluster,
    isTlsConnection,
    remoteConnectionMethod,
    SSHConnectionType,
}: GetClusterFormValidationSchemaProps): Record<ClusterFormKeys, any> => ({
    cluster_name: {
        required: true,
        validators: [
            { error: 'Name is required', regex: /^.*$/ },
            { error: "Use only lowercase alphanumeric characters, '-', '_' or '.'", regex: /^[a-z0-9-._]+$/ },
            { error: "Cannot start/end with '-', '_' or '.'", regex: /^(?![-._]).*[^-._]$/ },
            { error: 'Minimum 3 and Maximum 63 characters required', regex: /^.{3,63}$/ },
        ],
    },
    url: {
        required: true,
        validator: { error: 'URL is required', regex: /^.*$/ },
    },
    authType: {
        required: false,
        validator: { error: 'Authentication Type is required', regex: /^(?!\s*$).+/ },
        onChangeClearErrorsKeys: ['userName', 'password'],
    },
    userName: {
        getIsRequired: (state) => !!(isPrometheusEnabled && state.authType?.value === AuthenticationType.BASIC),
        validator: { error: 'username is required', regex: /^(?!\s*$).+/ },
    },
    password: {
        getIsRequired: (state) => !!(isPrometheusEnabled && state.authType?.value === AuthenticationType.BASIC),
        validator: { error: 'password is required', regex: /^(?!\s*$).+/ },
    },
    prometheusTlsClientKey: {
        required: false,
    },
    prometheusTlsClientCert: {
        required: false,
    },
    proxyUrl: {
        required: RemoteConnectionRadio && remoteConnectionMethod === RemoteConnectionType.Proxy,
        validator: {
            error: 'Please provide a valid URL. URL must start with http:// or https://',
            regex: /^(http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/,
        },
    },
    sshUsername: {
        required: RemoteConnectionRadio && remoteConnectionMethod === RemoteConnectionType.SSHTunnel,
        validator: {
            error: 'Username or User Identifier is required. Username cannot contain spaces or special characters other than _ and -',
            regex: /^[A-Za-z0-9_-]+$/,
        },
    },
    sshPassword: {
        required:
            RemoteConnectionRadio &&
            remoteConnectionMethod === RemoteConnectionType.SSHTunnel &&
            (SSHConnectionType === SSHAuthenticationType.Password ||
                SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key),
        validator: { error: 'password is required', regex: /^(?!\s*$).+/ },
    },
    sshAuthKey: {
        required:
            RemoteConnectionRadio &&
            remoteConnectionMethod === RemoteConnectionType.SSHTunnel &&
            (SSHConnectionType === SSHAuthenticationType.SSH_Private_Key ||
                SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key),
        validator: { error: 'private key is required', regex: /^(?!\s*$).+/ },
    },
    sshServerAddress: {
        required: RemoteConnectionRadio && remoteConnectionMethod === RemoteConnectionType.SSHTunnel,
        validator:
            remoteConnectionMethod === RemoteConnectionType.SSHTunnel
                ? {
                      error: 'Please provide a valid URL. URL must start with http:// or https://',
                      regex: /^(http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/,
                  }
                : { error: '', regex: /^(?!\s*$).+/ },
    },
    tlsClientKey: {
        required: id ? false : isTlsConnection,
    },
    tlsClientCert: {
        required: id ? false : isTlsConnection,
    },
    certificateAuthorityData: {
        required: id ? false : isTlsConnection,
    },
    token:
        isDefaultCluster || id
            ? {}
            : {
                  required: true,
                  validator: { error: 'token is required', regex: /[^]+/ },
              },
    endpoint: {
        required: !!isPrometheusEnabled,
        validator: { error: 'endpoint is required', regex: /^.*$/ },
    },
})
