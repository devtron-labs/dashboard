import { useRef, useState } from 'react'

import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Drawer,
    getClassNameForStickyHeaderWithShadow,
    Icon,
    noop,
    showError,
    useStickyEvent,
} from '@devtron-labs/devtron-fe-common-lib'

import { clusterId } from '@Components/ClusterNodes/__mocks__/clusterAbout.mock'
import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'

import { List } from '../globalConfigurations/GlobalConfiguration'
import { getCluster } from './cluster.service'
import { ClusterListProps, EditClusterFormProps } from './cluster.type'
import { renderNoEnvironmentTab } from './cluster.util'
import { ClusterEnvironmentList } from './ClusterEnvironmentList'
import ClusterForm from './ClusterForm'

const VirtualClusterForm = importComponentFromFELibrary('VirtualClusterForm', null, 'function')

const getSSHConfig: (
    ...props
) => Pick<EditClusterFormProps, 'sshUsername' | 'sshPassword' | 'sshAuthKey' | 'sshServerAddress'> =
    importComponentFromFELibrary('getSSHConfig', noop, 'function')

export const ClusterList = ({
    isVirtualCluster,
    environments,
    reload,
    clusterName,
    sshTunnelConfig,
    isProd,
    serverURL,
    prometheusURL,
    proxyUrl,
    insecureSkipTlsVerify,
    installationId,
    clusterCategory,
    toConnectWithSSHTunnel,
    clusterCategoriesList,
}: ClusterListProps) => {
    const [editMode, toggleEditMode] = useState(false)
    const [prometheusAuth, setPrometheusAuth] = useState(undefined)

    const drawerRef = useRef(null)

    const { stickyElementRef, isStuck: isHeaderStuck } = useStickyEvent({
        containerSelector: '.global-configuration__component-wrapper',
        identifier: `cluster-list__${clusterName}`,
    })

    const handleModalClose = () => {
        toggleEditMode(false)
    }

    const newEnvs = clusterId ? [{ id: null }].concat(environments || []) : environments || []

    const handleEdit = async () => {
        try {
            const { result } = await getCluster(+clusterId)
            setPrometheusAuth(result.prometheusAuth)
            toggleEditMode((t) => !t)
        } catch (err) {
            showError(err)
        }
    }

    const editModeToggle = (): void => {
        if (!clusterId) {
            toggleEditMode((t) => !t)
        }
    }

    const handleToggleEditMode = (): void => {
        toggleEditMode((t) => !t)
    }

    const subTitle: string = isVirtualCluster ? 'Isolated cluster' : serverURL

    return (
        <article
            data-testid={`${clusterName ?? 'create'}-cluster-container`}
            className={`cluster-list ${
                // FIXME: clusterId is always truthy, so the below condition is always true
                clusterId ? 'cluster-list--update' : 'cluster-list--create collapsed-list'
            }`}
        >
            <List
                internalRef={stickyElementRef}
                className={`dc__border dc__zi-1 ${getClassNameForStickyHeaderWithShadow(isHeaderStuck)} ${
                    isHeaderStuck ? 'dc__no-border-radius' : ''
                }`}
                key={clusterId}
                onClick={editModeToggle}
            >
                {!clusterId && (
                    <List.Logo>
                        <Icon name="ic-add" color="B500" />
                    </List.Logo>
                )}
                <div className="flex left dc__gap-16">
                    {clusterId && (
                        <Icon name={isVirtualCluster ? 'ic-virtual-cluster' : 'ic-cluster'} color="B500" size={24} />
                    )}
                    <List.Title
                        title={clusterName || 'Add cluster'}
                        subtitle={subTitle}
                        className="fw-6 dc__mxw-400 dc__truncate-text"
                        tag={isProd ? 'Prod' : null}
                    />
                    {clusterCategory && (
                        <span className="dc__truncate-text dc__border bg__secondary eb-5 px-6 fs-12 lh-20 br-4 flex dc_width-max-content flex top cb-5 h-100">
                            {clusterCategory.name}
                        </span>
                    )}
                    {clusterName && (
                        <div className="flex dc__align-right dc__gap-16">
                            <Button
                                dataTestId={`add-environment-button-${clusterName}`}
                                component={ButtonComponentType.link}
                                linkProps={{
                                    to: `${URLS.GLOBAL_CONFIG_CLUSTER}/${clusterName}${URLS.CREATE_ENVIRONMENT}`,
                                }}
                                startIcon={<Icon name="ic-add" color={null} />}
                                text="Add Environment"
                                variant={ButtonVariantType.text}
                                size={ComponentSizeType.small}
                            />

                            <div className="dc__divider" />
                        </div>
                    )}
                </div>
                {clusterId && (
                    <Button
                        dataTestId={`edit_cluster_pencil-${clusterName}`}
                        ariaLabel="Edit Cluster"
                        icon={<Icon name="ic-pencil" color={null} />}
                        size={ComponentSizeType.small}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.neutral}
                        onClick={handleEdit}
                    />
                )}
            </List>
            {!window._env_.K8S_CLIENT && Array.isArray(newEnvs) && newEnvs.length > 1 ? (
                <ClusterEnvironmentList
                    clusterId={clusterId}
                    reload={reload}
                    newEnvs={newEnvs}
                    isVirtualCluster={isVirtualCluster}
                    clusterName={clusterName}
                />
            ) : (
                clusterId && renderNoEnvironmentTab()
            )}
            {editMode &&
                (!isVirtualCluster ? (
                    <Drawer position="right" width="1000px" onEscape={handleToggleEditMode}>
                        <div className="h-100 bg__primary" ref={drawerRef}>
                            <ClusterForm
                                {...getSSHConfig(sshTunnelConfig)}
                                id={+clusterId}
                                clusterName={clusterName}
                                serverUrl={serverURL}
                                reload={reload}
                                prometheusUrl={prometheusURL}
                                prometheusAuth={prometheusAuth}
                                proxyUrl={proxyUrl}
                                isConnectedViaSSHTunnel={toConnectWithSSHTunnel}
                                toggleEditMode={toggleEditMode}
                                isProd={isProd}
                                isTlsConnection={!insecureSkipTlsVerify}
                                installationId={installationId}
                                clusterCategoriesList={clusterCategoriesList}
                                clusterCategory={clusterCategory}
                            />
                        </div>
                    </Drawer>
                ) : (
                    <VirtualClusterForm
                        id={clusterId}
                        clusterName={clusterName}
                        handleModalClose={handleModalClose}
                        reload={reload}
                    />
                ))}
        </article>
    )
}
