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

import { useEffect, useState } from 'react'
import { generatePath, Route, useHistory } from 'react-router-dom'

import {
    Button,
    ButtonComponentType,
    ComponentSizeType,
    ErrorScreenNotAuthorized,
    FeatureTitleWithInfo,
    Icon,
    Progressing,
    Reload,
    showError,
    sortCallback,
    URLS as CommonURLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { ViewType } from '@Config/constants'
import { URLS } from '@Config/routes'
import { ClusterEnvironmentDrawer } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/ClusterEnvironmentDrawer'
import CreateCluster from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/CreateCluster.component'
import { CreateClusterTypeEnum } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/types'

import { getClusterList, getEnvironmentList } from './cluster.service'
import { ClusterMetadataTypes, ClusterProps } from './cluster.type'
import { getSelectParsedCategory } from './cluster.util'
import { ClusterList } from './ClusterList'

const ManageCategories = importComponentFromFELibrary('ManageCategories', null, 'function')
const ManageCategoryButton = importComponentFromFELibrary('ManageCategoryButton', null, 'function')
const PodSpreadModal = importComponentFromFELibrary('PodSpreadModal', null, 'function')
const HibernationRulesModal = importComponentFromFELibrary('HibernationRulesModal', null, 'function')

const ClusterComponents = ({ isSuperAdmin }: ClusterProps) => {
    const [view, setView] = useState(ViewType.LOADING)
    const [clusters, setClusters] = useState<ClusterMetadataTypes[]>([])

    const history = useHistory()

    const initialize = () => {
        Promise.all([getClusterList(), window._env_.K8S_CLIENT ? { result: undefined } : getEnvironmentList()])
            .then(([clusterRes, envResponse]) => {
                const environments = envResponse.result || []
                const clusterEnvironmentMap = environments.reduce((agg, curr) => {
                    const newAgg = { ...agg }
                    newAgg[curr.cluster_id] = newAgg[curr.cluster_id] || []
                    newAgg[curr.cluster_id].push(curr)
                    return newAgg
                }, {})

                let clustersList = clusterRes.result || []
                clustersList = clustersList.map((cluster) => ({
                    ...cluster,
                    environments: clusterEnvironmentMap[cluster.id] || [],
                    category: getSelectParsedCategory(cluster.category),
                }))

                clustersList = clustersList.sort((a, b) => sortCallback('cluster_name', a, b))

                setClusters(clustersList)
                setView(ViewType.FORM)
            })
            .catch((error) => {
                showError(error)
                setView(ViewType.ERROR)
            })
    }

    const handleRedirectToClusterList = () => {
        history.push(URLS.GLOBAL_CONFIG_CLUSTER)
    }

    useEffect(() => {
        if (isSuperAdmin) {
            initialize()
        }
    }, [isSuperAdmin])

    if (!isSuperAdmin) {
        return (
            <div className="dc__align-reload-center">
                <ErrorScreenNotAuthorized />
            </div>
        )
    }

    if (view === ViewType.LOADING) return <Progressing pageLoader />
    if (view === ViewType.ERROR) return <Reload className="dc__align-reload-center" />

    const moduleBasedTitle = `Clusters${window._env_.K8S_CLIENT ? '' : ' and Environments'}`

    return (
        <section className="global-configuration__component flex-1">
            <div data-testid="cluster_and_env_header" className="flexbox dc__content-space">
                <FeatureTitleWithInfo
                    title={moduleBasedTitle}
                    renderDescriptionContent={() => `Manage your organization’s ${moduleBasedTitle.toLowerCase()}.`}
                    docLink="GLOBAL_CONFIG_CLUSTER"
                    showInfoIconTippy
                    additionalContainerClasses="mb-20"
                />
                <div className="flexbox dc__gap-8">
                    {ManageCategoryButton && <ManageCategoryButton />}
                    <Button
                        dataTestId="add_cluster_button"
                        linkProps={{
                            to: generatePath(URLS.GLOBAL_CONFIG_CREATE_CLUSTER, {
                                type: CreateClusterTypeEnum.CONNECT_CLUSTER,
                            }),
                        }}
                        component={ButtonComponentType.link}
                        startIcon={<Icon name="ic-add" color="N700" />}
                        size={ComponentSizeType.medium}
                        text="New Cluster"
                    />
                </div>
            </div>

            {clusters.map((cluster) => (
                <ClusterList
                    reload={initialize}
                    key={cluster.id || Math.random().toString(36).substr(2, 5)}
                    clusterName={cluster.cluster_name}
                    isVirtualCluster={cluster.isVirtualCluster}
                    environments={cluster.environments}
                    sshTunnelConfig={cluster.sshTunnelConfig}
                    isProd={cluster.isProd}
                    serverURL={cluster.server_url}
                    prometheusURL={cluster.prometheus_url}
                    prometheusAuth={cluster.prometheusAuth}
                    proxyUrl={cluster.proxyUrl}
                    insecureSkipTlsVerify={cluster.insecureSkipTlsVerify}
                    installationId={cluster.installationId}
                    category={cluster.category}
                    toConnectWithSSHTunnel={cluster.toConnectWithSSHTunnel}
                    clusterId={cluster.id}
                />
            ))}

            {ManageCategories && (
                <Route path={CommonURLS.GLOBAL_CONFIG_MANAGE_CATEGORIES}>
                    <ManageCategories />
                </Route>
            )}

            <Route path={URLS.GLOBAL_CONFIG_CREATE_CLUSTER}>
                <CreateCluster handleReloadClusterList={initialize} />
            </Route>

            {PodSpreadModal && (
                <Route
                    path={`${URLS.GLOBAL_CONFIG_CLUSTER}/:clusterName/${URLS.POD_SPREAD}`}
                    render={(props) => {
                        const { clusterName } = props.match.params
                        const foundCluster: ClusterMetadataTypes | { id?: number } =
                            clusters.find((c) => c.cluster_name === clusterName) || {}
                        const { id: clusterId } = foundCluster

                        return <PodSpreadModal clusterId={clusterId} handleClose={handleRedirectToClusterList} />
                    }}
                />
            )}

            {HibernationRulesModal && (
                <Route
                    path={`${URLS.GLOBAL_CONFIG_CLUSTER}/:clusterName/${URLS.HIBERNATION_RULES}`}
                    render={(props) => {
                        const { clusterName } = props.match.params
                        const foundCluster: ClusterMetadataTypes | { id?: number } =
                            clusters.find((c) => c.cluster_name === clusterName) || {}
                        const { id: clusterId } = foundCluster

                        return <HibernationRulesModal clusterId={clusterId} handleClose={handleRedirectToClusterList} />
                    }}
                />
            )}

            <Route
                path={`${URLS.GLOBAL_CONFIG_CLUSTER}/:clusterName${URLS.CREATE_ENVIRONMENT}`}
                render={(props) => {
                    const { clusterName } = props.match.params
                    const foundCluster: ClusterMetadataTypes | { isVirtualCluster?: boolean; id?: null } =
                        clusters.find((c) => c.cluster_name === clusterName) || {}
                    const { isVirtualCluster, id: clusterId } = foundCluster

                    return (
                        <ClusterEnvironmentDrawer
                            reload={initialize}
                            clusterName={clusterName}
                            id={null}
                            environmentName={null}
                            clusterId={clusterId}
                            namespace={null}
                            isProduction={null}
                            description={null}
                            hideClusterDrawer={handleRedirectToClusterList}
                            isVirtual={isVirtualCluster}
                            category={null}
                        />
                    )
                }}
            />
        </section>
    )
}

export default ClusterComponents
