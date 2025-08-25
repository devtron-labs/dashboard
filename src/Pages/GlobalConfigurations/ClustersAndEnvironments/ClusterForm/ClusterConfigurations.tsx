import { useState } from 'react'
import TippyHeadless from '@tippyjs/react/headless'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    CustomInput,
    DEFAULT_SECRET_PLACEHOLDER,
    DTSwitch,
    Icon,
    RadioGroup,
    RadioGroupItem,
    REMOTE_CONNECTION_TYPE_LABEL_MAP,
    RemoteConnectionType,
    Textarea,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { CLUSTER_COMMAND } from '@Config/constants'

import { DEFAULT_CLUSTER_ID, RemoteConnectionTypeCluster, SSHAuthenticationType } from '../cluster.type'
import ClusterInfoStepsModal from '../ClusterInfoStepsModal'
import { ClusterConfigPages, ClusterConfigurationsProps } from './types'

const RemoteConnectionRadio = importComponentFromFELibrary('RemoteConnectionRadio', null, 'function')
const AssignCategorySelect = importComponentFromFELibrary('AssignCategorySelect', null, 'function')

const ClusterConfigurations = ({
    id,
    remoteConnectionMethod,
    isTlsConnection,
    state,
    handleOnChange,
    handleOnBlur,
    handleOnFocus,
    toggleCheckTlsConnection,
    SSHConnectionType,
    changeRemoteConnectionType,
    changeSSHAuthenticationType,
    selectedCategory,
    setSelectedCategory,
    initialIsTlsConnection,
}: ClusterConfigurationsProps) => {
    const [clusterConfigPage, setClusterConfigPage] = useState<ClusterConfigPages>(ClusterConfigPages.BASIC_CONFIG)

    const isDefaultCluster = id === DEFAULT_CLUSTER_ID

    const handleConfigureConnectionProtocol = () => {
        setClusterConfigPage(ClusterConfigPages.CONNECTION_PROTOCOL_CONFIG)
    }

    const handleConfigureTLSConnection = () => {
        setClusterConfigPage(ClusterConfigPages.TLS_CONFIG)
    }

    const handleBackToBasicConfig = () => {
        setClusterConfigPage(ClusterConfigPages.BASIC_CONFIG)
    }

    const getIsBackDisabled = () => {
        if (clusterConfigPage === ClusterConfigPages.CONNECTION_PROTOCOL_CONFIG) {
            switch (remoteConnectionMethod) {
                case RemoteConnectionType.Proxy:
                    return !state.proxyUrl?.value || state.proxyUrl?.error
                case RemoteConnectionType.SSHTunnel:
                    return (
                        !state.sshUsername?.value ||
                        state.sshUsername?.error ||
                        !state.sshServerAddress?.value ||
                        state.sshServerAddress?.error ||
                        (SSHConnectionType === SSHAuthenticationType.Password ||
                        SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key
                            ? !state.sshPassword?.value || state.sshPassword?.error
                            : false) ||
                        (SSHConnectionType === SSHAuthenticationType.SSH_Private_Key ||
                        SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key
                            ? !state.sshAuthKey?.value || state.sshAuthKey?.error
                            : false)
                    )
                case RemoteConnectionType.Direct:
                default:
                    return false
            }
        }

        if (clusterConfigPage === ClusterConfigPages.TLS_CONFIG) {
            const hasError =
                state.certificateAuthorityData.error || state.tlsClientKey.error || state.tlsClientCert.error

            const hasAllValues =
                id && initialIsTlsConnection
                    ? true
                    : state.certificateAuthorityData.value && state.tlsClientKey.value && state.tlsClientCert.value

            return isTlsConnection && (hasError || !hasAllValues)
        }

        return false
    }

    const renderBackToBasicConfigButton = () => {
        const isDisabled = getIsBackDisabled()
        return (
            <Button
                dataTestId="back-to-config"
                icon={<Icon name="ic-caret-down-small" color={null} rotateBy={90} />}
                ariaLabel="back to configurations"
                showAriaLabelInTippy={false}
                size={ComponentSizeType.xxs}
                variant={ButtonVariantType.secondary}
                style={ButtonStyleType.neutral}
                onClick={handleBackToBasicConfig}
                disabled={isDisabled}
                showTooltip={isDisabled}
                tooltipProps={{
                    content: 'Please resolve errors and fill all required values before proceeding.',
                }}
            />
        )
    }

    const renderClusterInfo = () => {
        const k8sClusters = Object.values(CLUSTER_COMMAND)
        return (
            <>
                {k8sClusters.map((cluster, key) => (
                    <>
                        <TippyHeadless
                            className=""
                            theme="light"
                            placement="bottom"
                            trigger="click"
                            interactive
                            render={() => (
                                <ClusterInfoStepsModal
                                    subTitle={cluster.title}
                                    command={cluster.command}
                                    clusterName={cluster.clusterName}
                                />
                            )}
                            maxWidth="468px"
                        >
                            <span className="ml-4 mr-2 cb-5 cursor">{cluster.heading}</span>
                        </TippyHeadless>
                        {key !== k8sClusters.length - 1 && <span className="cn-2">|</span>}
                    </>
                ))}
            </>
        )
    }

    const getTokenText = () => {
        if (!id) {
            return state.token.value
        }

        return id === DEFAULT_CLUSTER_ID ? '' : DEFAULT_SECRET_PLACEHOLDER
    }

    const getClusterLabel = () => (
        <div className="flex left dc__gap-12">
            <span>
                Server URL & Bearer token
                {!isDefaultCluster && <span className="cr-5">&nbsp;*</span>}
            </span>
            <div className="flex dc__gap-4">
                <Icon name="ic-help-outline" color={null} />
                <span>
                    <span>How to find for </span>
                    {renderClusterInfo()}
                </span>
            </div>
        </div>
    )

    const renderConnectionProtocolConfig = () => {
        const proxyConfig =
            remoteConnectionMethod === RemoteConnectionType.Proxy
                ? {
                      proxyUrl: { value: state.proxyUrl?.value, error: state.proxyUrl?.error },
                  }
                : {}

        const sshConfig =
            remoteConnectionMethod === RemoteConnectionType.SSHTunnel
                ? {
                      sshUsername: { value: state.sshUsername?.value, error: state.sshUsername?.error },
                      sshPassword:
                          SSHConnectionType === SSHAuthenticationType.Password ||
                          SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key
                              ? { value: state.sshPassword?.value, error: state.sshPassword?.error }
                              : { value: '', error: '' },
                      sshAuthKey:
                          SSHConnectionType === SSHAuthenticationType.SSH_Private_Key ||
                          SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key
                              ? { value: state.sshAuthKey?.value, error: state.sshAuthKey?.error }
                              : { value: '', error: '' },
                      sshServerAddress: { value: state.sshServerAddress?.value, error: state.sshServerAddress?.error },
                  }
                : {}

        const passedRemoteConnectionMethod = { value: remoteConnectionMethod, error: '' }

        return (
            <div className="flexbox-col flex-grow-1">
                <div className="flexbox dc__align-items-center px-20 py-12 dc__gap-12 border__secondary--bottom">
                    {renderBackToBasicConfigButton()}
                    <span className="fs-12 lh-20 fw-6 cn-9">Connection protocol</span>
                </div>
                <div className="flexbox-col p-20 dc__gap-12">
                    <span className="fs-15 lh-1-5 fw-6 cn-9">Choose how Devtron connects with this cluster</span>
                    <div className="bg__primary br-8 border__secondary p-20">
                        <RemoteConnectionRadio
                            resourceType={RemoteConnectionTypeCluster}
                            connectionMethod={passedRemoteConnectionMethod}
                            proxyConfig={proxyConfig}
                            sshConfig={sshConfig}
                            changeRemoteConnectionType={changeRemoteConnectionType}
                            changeSSHAuthenticationType={changeSSHAuthenticationType}
                            handleOnChange={handleOnChange}
                        />
                    </div>
                </div>
            </div>
        )
    }

    const renderTLSConnectionConfig = () => (
        <div className="flexbox-col flex-grow-1">
            <div className="flexbox dc__align-items-center px-20 py-12 dc__gap-12 border__secondary--bottom">
                {renderBackToBasicConfigButton()}
                <span className="fs-12 lh-20 fw-6 cn-9">Secure TLS Connection</span>
            </div>
            <div className="p-20">
                <div className="flexbox-col p-20 br-8 border__secondary bg__primary dc__gap-16">
                    <div className="flexbox dc__align-items-center dc__content-space">
                        <div className="flexbox-col">
                            <span className="fs-13 fw-6 lh-1-5 cn-9">Secure TLS connection</span>
                            <span className="fs-12 fw-4 lh-1-5 cn-7">
                                Enable a secure TLS connection to encrypt communication and authenticate with the
                                cluster
                            </span>
                        </div>
                        <DTSwitch
                            name="toggle-tls-connection"
                            ariaLabel="Toggle secure TLS connection"
                            isChecked={isTlsConnection}
                            onChange={toggleCheckTlsConnection}
                        />
                    </div>
                    {isTlsConnection && (
                        <>
                            <Textarea
                                required
                                label="Certificate Authority Data"
                                name="certificateAuthorityData"
                                value={
                                    initialIsTlsConnection && id
                                        ? DEFAULT_SECRET_PLACEHOLDER
                                        : state.certificateAuthorityData.value
                                }
                                onChange={handleOnChange}
                                onBlur={handleOnBlur}
                                onFocus={handleOnFocus}
                                placeholder="Enter CA Data"
                                error={state.certificateAuthorityData.error}
                            />
                            <Textarea
                                label="TLS Key"
                                required
                                name="tlsClientKey"
                                value={
                                    initialIsTlsConnection && id ? DEFAULT_SECRET_PLACEHOLDER : state.tlsClientKey.value
                                }
                                onChange={handleOnChange}
                                onBlur={handleOnBlur}
                                onFocus={handleOnFocus}
                                placeholder="Enter TLS Key"
                                error={state.tlsClientKey.error}
                            />
                            <Textarea
                                label="TLS Certificate"
                                required
                                name="tlsClientCert"
                                value={
                                    initialIsTlsConnection && id
                                        ? DEFAULT_SECRET_PLACEHOLDER
                                        : state.tlsClientCert.value
                                }
                                onChange={handleOnChange}
                                onBlur={handleOnBlur}
                                onFocus={handleOnFocus}
                                placeholder="Enter TLS Certificate"
                                error={state.tlsClientCert.error}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )

    const renderBasicClusterConfig = () => (
        <div className="flexbox-col dc__gap-20 p-20 flex-grow-1">
            <div className={`p-20 bg__primary flexbox-col dc__gap-16 br-8 border__secondary `}>
                <CustomInput
                    required
                    name="cluster_name"
                    disabled={isDefaultCluster}
                    value={state.cluster_name.value}
                    error={state.cluster_name.error}
                    onChange={handleOnChange}
                    label="Cluster Name"
                    placeholder="Cluster Name"
                />
                <CustomInput
                    name="url"
                    value={state.url.value}
                    error={state.url.error}
                    onChange={handleOnChange}
                    label={getClusterLabel()}
                    disabled={isDefaultCluster}
                    placeholder="Enter server URL"
                />
                {id !== DEFAULT_CLUSTER_ID && (
                    <Textarea
                        name="token"
                        value={getTokenText()}
                        onChange={handleOnChange}
                        onBlur={handleOnBlur}
                        onFocus={handleOnFocus}
                        placeholder="Enter bearer token"
                        error={state.token.error}
                    />
                )}
                <div className="flex left dc__gap-24 fs-13">
                    <div className="dc__required-field cn-7">Type of Clusters</div>
                    <RadioGroup
                        name="isProd"
                        className="radio-group-no-border"
                        value={state.isProd.value}
                        onChange={handleOnChange}
                    >
                        <RadioGroupItem value="true">Production</RadioGroupItem>
                        <RadioGroupItem value="false">Non - Production</RadioGroupItem>
                    </RadioGroup>
                </div>

                {AssignCategorySelect && (
                    <div className="w-250">
                        <AssignCategorySelect
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                        />
                    </div>
                )}
            </div>
            {id !== DEFAULT_CLUSTER_ID && (
                <div className="flexbox-col dc__gap-12">
                    <span className="fs-15 lh-1-5 cn-9 fw-6">Connection preferences</span>
                    {RemoteConnectionRadio && (
                        <div className="py-12 px-16 flexbox dc__align-items-center br-8 border__secondary dc__content-space bg__primary">
                            <div className="flexbox-col">
                                <span className="fs-13 fw-6 lh-1-5 cn-9">Select a connection protocol</span>
                                <span className="fs-12 fw-4 lh-1-5 cn-7">
                                    Choose how Devtron connects with this cluster
                                </span>
                            </div>
                            <Button
                                dataTestId="connection-protocol-config"
                                text={REMOTE_CONNECTION_TYPE_LABEL_MAP[remoteConnectionMethod]}
                                endIcon={<Icon name="ic-caret-right" color={null} />}
                                variant={ButtonVariantType.text}
                                size={ComponentSizeType.medium}
                                style={ButtonStyleType.neutral}
                                onClick={handleConfigureConnectionProtocol}
                            />
                        </div>
                    )}
                    <div className="py-12 px-16 flexbox dc__align-items-center br-8 border__secondary dc__content-space bg__primary">
                        <div className="flexbox-col">
                            <span className="fs-13 fw-6 lh-1-5 cn-9">Secure TLS connection</span>
                            <span className="fs-12 fw-4 lh-1-5 cn-7">
                                Enable a secure TLS connection to encrypt communication and authenticate with the
                                cluster
                            </span>
                        </div>
                        <Button
                            dataTestId="tls-connection-config"
                            text={isTlsConnection ? 'On' : 'Off'}
                            endIcon={<Icon name="ic-caret-right" color={null} />}
                            variant={ButtonVariantType.text}
                            size={ComponentSizeType.medium}
                            style={ButtonStyleType.neutral}
                            onClick={handleConfigureTLSConnection}
                        />
                    </div>
                </div>
            )}
        </div>
    )

    switch (clusterConfigPage) {
        case ClusterConfigPages.CONNECTION_PROTOCOL_CONFIG:
            return renderConnectionProtocolConfig()

        case ClusterConfigPages.TLS_CONFIG:
            return renderTLSConnectionConfig()

        case ClusterConfigPages.BASIC_CONFIG:
        default:
            return renderBasicClusterConfig()
    }
}

export default ClusterConfigurations
