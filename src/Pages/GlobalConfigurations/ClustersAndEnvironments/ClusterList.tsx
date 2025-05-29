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
    SelectPickerOptionType,
    showError,
    useStickyEvent,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'

import { List } from '../../../components/globalConfigurations/GlobalConfiguration'
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
    category,
    toConnectWithSSHTunnel,
    clusterId,
}: ClusterListProps) => {
    const [editMode, setEditMode] = useState(false)
    const [prometheusAuth, setPrometheusAuth] = useState(null)

    const [selectedCategory, setSelectedCategory] = useState<SelectPickerOptionType>(
        category
            ? {
                  label: category.name,
                  value: category.id,
              }
            : null,
    )

    const drawerRef = useRef(null)

    const { stickyElementRef, isStuck: isHeaderStuck } = useStickyEvent({
        containerSelector: '.global-configuration__component-wrapper',
        identifier: `cluster-list__${clusterName}`,
    })

    const handleModalClose = () => {
        setEditMode(false)
    }

    const newEnvs = clusterId ? [{ id: null }].concat(environments || []) : environments || []

    const handleEdit = async () => {
        try {
            const { result } = await getCluster(+clusterId)
            setPrometheusAuth(result.prometheusAuth)
            setEditMode((t) => !t)
        } catch (err) {
            showError(err)
        }
    }

    const editModeToggle = (): void => {
        if (!clusterId) {
            setEditMode((t) => !t)
        }
    }

    const handleToggleEditMode = (): void => {
        setEditMode((t) => !t)
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
                        <Icon name={isVirtualCluster ? 'ic-cluster-isolated' : 'ic-cluster'} color="B500" size={24} />
                    )}
                    <List.Title
                        title={clusterName || 'Add cluster'}
                        subtitle={subTitle}
                        className="fw-6"
                        tag={isProd ? 'Prod' : null}
                        category={category && category.name}
                    />
                    {clusterName && (
                        <div className="flex dc__align-right dc__gap-16 dc__no-shrink">
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
                    clusterId={String(clusterId)}
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
                                setEditMode={setEditMode}
                                isProd={isProd}
                                isTlsConnection={!insecureSkipTlsVerify}
                                installationId={installationId}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                            />
                        </div>
                    </Drawer>
                ) : (
                    <VirtualClusterForm
                        id={+clusterId}
                        clusterName={clusterName}
                        handleModalClose={handleModalClose}
                        reload={reload}
                        category={selectedCategory}
                    />
                ))}
        </article>
    )
}
