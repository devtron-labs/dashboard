import { useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    sortCallback,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Trash } from '@Icons/ic-delete-interactive.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'
import { ClusterEnvironmentDrawer } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/ClusterEnvironmentDrawer'
import { EnvironmentDeleteComponent } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/EnvironmentDeleteComponent'

import { deleteEnvironment } from './cluster.service'
import { ClusterEnvironmentListProps } from './cluster.type'
import { CONFIGURATION_TYPES } from './constants'

const ManageCategoryButton = importComponentFromFELibrary('ManageCategoryButton', null, 'function')

export const ClusterEnvironmentList = ({
    clusterId,
    reload,
    isVirtualCluster,
    newEnvs,
    clusterName,
}: ClusterEnvironmentListProps) => {
    const [environment, setEnvironment] = useState(null)
    const [confirmation, setConfirmation] = useState(false)
    const [showWindow, setShowWindow] = useState(false)

    const hasCategory = !!ManageCategoryButton

    const baseTableClassName = `dc__grid dc__column-gap-12 cluster-env-list_table${hasCategory ? '--with-category' : ''} dc__align-item-center lh-20 px-16`

    const showWindowModal = () => setShowWindow(true)

    const hideClusterDrawer = () => setShowWindow(false)

    const showConfirmationModal = () => setConfirmation(true)

    const hideConfirmationModal = () => setConfirmation(false)

    const onDelete = async () => {
        const deletePayload = {
            id: environment.id,
            environment_name: environment.environmentName,
            cluster_id: +environment.clusterId,
            prometheus_endpoint: environment.prometheusEndpoint,
            namespace: environment.namespace || '',
            active: true,
            default: environment.isProduction,
            description: environment.description || '',
        }
        await deleteEnvironment(deletePayload)
        reload()
    }

    const renderActionButton = (environmentName) => (
        <div className="dc__visible-hover--child">
            <div className="flex dc__gap-4">
                <Button
                    dataTestId={`env-edit-button-${environmentName}`}
                    icon={<Icon name="ic-pencil" color={null} />}
                    ariaLabel="Edit Environment"
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.neutral}
                    size={ComponentSizeType.xs}
                    onClick={showWindowModal}
                />
                <Button
                    dataTestId={`env-delete-button-${environmentName}`}
                    icon={<Trash />}
                    onClick={showConfirmationModal}
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.negativeGrey}
                    size={ComponentSizeType.xs}
                    ariaLabel="Delete"
                />
            </div>
        </div>
    )

    const renderEnvironmentList = () =>
        newEnvs
            .sort((a, b) => sortCallback('environment_name', a, b))
            .map(
                ({
                    id,
                    environment_name: environmentName,
                    prometheus_url: prometheusEndpoint,
                    namespace,
                    default: isProduction,
                    description,
                    category,
                }) =>
                    environmentName && (
                        <div
                            data-testid={`env-container-${environmentName}`}
                            className={`${baseTableClassName} dc__hover-n50 py-8 fs-13 fw-4 h-44 dc__visible-hover dc__visible-hover--parent`}
                            key={id}
                            onClick={() =>
                                setEnvironment({
                                    id,
                                    environmentName,
                                    prometheusEndpoint,
                                    clusterId,
                                    namespace,
                                    category: {
                                        label: category?.name,
                                        value: category?.id,
                                    },
                                    isProduction,
                                    description,
                                })
                            }
                        >
                            <div className="cursor flex w-100">
                                <Icon
                                    name={isVirtualCluster ? 'ic-environment-isolated' : 'ic-env'}
                                    color="B500"
                                    size={20}
                                />
                            </div>

                            <div
                                className="dc__truncate-text flex left cb-5 cursor"
                                onClick={showWindowModal}
                                data-testid={`env-${environmentName}`}
                            >
                                {environmentName}

                                {isProduction && (
                                    <div className="bg__secondary dc__border pr-6 pl-6 fs-12 h-20 ml-8 flex cn-7 br-4 ">
                                        Prod
                                    </div>
                                )}
                            </div>
                            <div className="dc__truncate-text flex left">{namespace}</div>
                            {hasCategory && (
                                <div>
                                    {category?.name ? (
                                        <span className="bg__secondary dc__border px-6 fs-12 lh-20 cn-7 br-4 dc__mxw-fit-content flex dc__truncate">
                                            <InteractiveCellText text={category.name} fontSize={12} />
                                        </span>
                                    ) : (
                                        '-'
                                    )}
                                </div>
                            )}

                            <div className="cluster-list__description dc__truncate-text  flex left">
                                {description || '-'}
                            </div>
                            {renderActionButton(environmentName)}
                        </div>
                    ),
            )

    return (
        <div className="pb-8">
            <div className={`${baseTableClassName} fs-12 py-6 fw-6 dc__border-top dc__border-bottom-n1`}>
                <div />
                <div>{CONFIGURATION_TYPES.ENVIRONMENT}</div>
                <div>{CONFIGURATION_TYPES.NAMESPACE}</div>
                {hasCategory && <div>{CONFIGURATION_TYPES.CATEGORY}</div>}
                <div>{CONFIGURATION_TYPES.DESCRIPTION}</div>
                <div />
            </div>
            {renderEnvironmentList()}

            {confirmation && (
                <EnvironmentDeleteComponent
                    environmentName={environment?.environmentName}
                    onDelete={onDelete}
                    closeConfirmationModal={hideConfirmationModal}
                />
            )}

            {showWindow && (
                <ClusterEnvironmentDrawer
                    reload={reload}
                    clusterName={clusterName}
                    clusterId={clusterId}
                    {...environment}
                    hideClusterDrawer={hideClusterDrawer}
                    isVirtual={isVirtualCluster}
                    category={environment?.category}
                />
            )}
        </div>
    )
}
