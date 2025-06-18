import { generatePath, useHistory } from 'react-router-dom'

import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    getClassNameForStickyHeaderWithShadow,
    Icon,
    URLS as COMMON_URLS,
    useStickyEvent,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'

import { List } from '../../../components/globalConfigurations/GlobalConfiguration'
import { ClusterListProps } from './cluster.type'
import { renderNoEnvironmentTab } from './cluster.util'
import { ClusterEnvironmentList } from './ClusterEnvironmentList'

const EditClusterPopup = importComponentFromFELibrary('EditClusterPopup', null, 'function')

export const ClusterList = ({
    isVirtualCluster,
    environments,
    reload,
    clusterName,
    isProd,
    serverURL,
    clusterId,
    category,
}: ClusterListProps) => {
    const history = useHistory()

    const { stickyElementRef, isStuck: isHeaderStuck } = useStickyEvent({
        containerSelector: '.global-configuration__component-wrapper',
        identifier: `cluster-list__${clusterName}`,
    })

    const handleEdit = async () => {
        history.push(generatePath(COMMON_URLS.GLOBAL_CONFIG_EDIT_CLUSTER, { clusterId }))
    }

    const handleOpenPodSpreadModal = () => {
        history.push(`${URLS.GLOBAL_CONFIG_CLUSTER}/${clusterName}/${URLS.POD_SPREAD}`)
    }

    const handleOpenHibernationRulesModal = () => {
        history.push(`${URLS.GLOBAL_CONFIG_CLUSTER}/${clusterName}/${URLS.HIBERNATION_RULES}`)
    }

    const renderEditButton = () => {
        if (!clusterName) {
            return null
        }

        if (EditClusterPopup && !isVirtualCluster) {
            return (
                <EditClusterPopup
                    handleOpenEditClusterModal={handleEdit}
                    handleOpenPodSpreadModal={handleOpenPodSpreadModal}
                    handleOpenHibernationRulesModal={handleOpenHibernationRulesModal}
                    clusterId={clusterId}
                />
            )
        }

        return (
            <Button
                dataTestId={`edit_cluster_pencil-${clusterName}`}
                ariaLabel="Edit Cluster"
                icon={<Icon name="ic-pencil" color={null} />}
                size={ComponentSizeType.small}
                variant={ButtonVariantType.borderLess}
                style={ButtonStyleType.neutral}
                onClick={handleEdit}
            />
        )
    }

    const subTitle: string = isVirtualCluster ? 'Isolated cluster' : serverURL

    return (
        <article
            data-testid={`${clusterName ?? 'create'}-cluster-container`}
            className="cluster-list cluster-list--update"
        >
            <List
                internalRef={stickyElementRef}
                className={`dc__border dc__zi-1 ${getClassNameForStickyHeaderWithShadow(isHeaderStuck)} ${
                    isHeaderStuck ? 'dc__no-border-radius' : ''
                } cursor-default-imp`}
                key={clusterId}
            >
                <div className="flex left dc__gap-16">
                    <Icon name={isVirtualCluster ? 'ic-cluster-isolated' : 'ic-cluster'} color="B500" size={24} />
                    <List.Title
                        title={clusterName}
                        subtitle={subTitle}
                        className="fw-6"
                        tag={isProd ? 'Prod' : null}
                        category={category?.label ? String(category.label) : ''}
                    />
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
                </div>
                {renderEditButton()}
            </List>

            {!window._env_.K8S_CLIENT && Array.isArray(environments) && environments.length > 0 ? (
                <ClusterEnvironmentList
                    clusterId={String(clusterId)}
                    reload={reload}
                    newEnvs={environments}
                    isVirtualCluster={isVirtualCluster}
                    clusterName={clusterName}
                />
            ) : (
                renderNoEnvironmentTab()
            )}
        </article>
    )
}
