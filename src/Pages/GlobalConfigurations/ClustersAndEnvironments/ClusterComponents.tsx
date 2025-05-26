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

import { useCallback, useEffect, useRef, useState } from 'react'
import { generatePath, Route, useHistory } from 'react-router-dom'

import {
    Button,
    ButtonComponentType,
    ButtonVariantType,
    ComponentSizeType,
    ErrorScreenNotAuthorized,
    FeatureTitleWithInfo,
    Icon,
    noop,
    Progressing,
    Reload,
    showError,
    sortCallback,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { ViewType } from '@Config/constants'
import { URLS } from '@Config/routes'
import { ClusterEnvironmentDrawer } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/ClusterEnvironmentDrawer'
import CreateCluster from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/CreateCluster.component'
import { CreateClusterTypeEnum } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/types'
import ManageCategories from '@Pages/GlobalConfigurations/ClustersAndEnvironments/ManageCategories/ManageCategories.component'

import { getClusterList, getEnvironmentList } from './cluster.service'
import { ClusterMetadataTypes, ClusterProps, POLLING_INTERVAL } from './cluster.type'
import { ClusterList } from './ClusterList'
import { useCategoryList } from './useCategoryList'

const getRemoteConnectionConfig = importComponentFromFELibrary('getRemoteConnectionConfig', noop, 'function')

const ClusterComponents = ({ isSuperAdmin }: ClusterProps) => {
    const [view, setView] = useState(ViewType.LOADING)
    const [clusters, setClusters] = useState<ClusterMetadataTypes[]>([])
    const [clusterEnvMap, setClusterEnvMap] = useState({})

    const timerRef = useRef(null)

    const history = useHistory()

    const { categoryLoader, categoryList, categoryListError, reloadCategoryList } = useCategoryList()

    const pollClusterList = useCallback(async () => {
        try {
            const { result } = await getClusterList()
            let updatedClusters = result
                ? result.map((c) => ({
                      ...c,
                      environments: clusterEnvMap[c.id],
                  }))
                : []

            updatedClusters = updatedClusters.concat({
                id: null,
                cluster_name: '',
                server_url: '',
                proxyUrl: '',
                sshTunnelConfig: {
                    user: '',
                    password: '',
                    authKey: '',
                    sshServerAddress: '',
                },
                active: true,
                config: {},
                environments: [],
                insecureSkipTlsVerify: true,
                isVirtualCluster: false,
                remoteConnectionConfig: getRemoteConnectionConfig(),
                installationId: 0,
            })

            updatedClusters = updatedClusters.sort((a, b) => sortCallback('cluster_name', a, b))
            setClusters(updatedClusters)

            const stillPolling = updatedClusters.find(
                (c) => c.agentInstallationStage === 1 || c.agentInstallationStage === 3,
            )
            if (!stillPolling && timerRef.current) {
                clearInterval(timerRef.current)
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            // silent fail or optional error toast
        }
    }, [clusterEnvMap])

    const initialize = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }

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
                    environments: clusterEnvironmentMap[cluster.id],
                }))

                clustersList = clustersList.sort((a, b) => sortCallback('cluster_name', a, b))

                setClusters(clustersList)
                setClusterEnvMap(clusterEnvironmentMap)
                setView(ViewType.FORM)

                const pollingCluster = clustersList.find(
                    (c) => c.agentInstallationStage === 1 || c.agentInstallationStage === 3,
                )
                if (pollingCluster) {
                    timerRef.current = setInterval(pollClusterList, POLLING_INTERVAL)
                }
            })
            .catch((error) => {
                showError(error)
                setView(ViewType.ERROR)
            })
    }, [])

    const handleRedirectToClusterList = () => {
        history.push(URLS.GLOBAL_CONFIG_CLUSTER)
    }

    useEffect(() => {
        if (isSuperAdmin) {
            initialize()
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [initialize, isSuperAdmin])

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
                    <Button
                        dataTestId="manage_categories_button"
                        linkProps={{ to: URLS.GLOBAL_CONFIG_MANAGE_CATEGORIES }}
                        component={ButtonComponentType.link}
                        startIcon={<Icon name="ic-shapes" color={null} />}
                        size={ComponentSizeType.medium}
                        text="Manage Categories"
                        variant={ButtonVariantType.secondary}
                    />
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

            {clusters.map(
                (cluster) =>
                    cluster.id && (
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
                            clusterCategory={cluster.clusterCategory}
                            toConnectWithSSHTunnel={cluster.toConnectWithSSHTunnel}
                            categoryList={categoryList?.clusterCategories}
                        />
                    ),
            )}

            <Route path={URLS.GLOBAL_CONFIG_MANAGE_CATEGORIES}>
                <ManageCategories
                    clusterCategoriesList={categoryList?.clusterCategories}
                    categoryLoader={categoryLoader}
                    categoryListError={categoryListError}
                    reloadCategoryList={reloadCategoryList}
                />
            </Route>

            <Route path={URLS.GLOBAL_CONFIG_CREATE_CLUSTER}>
                <CreateCluster handleReloadClusterList={initialize} />
            </Route>

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
                            categoryList={categoryList?.clusterCategories}
                        />
                    )
                }}
            />
        </section>
    )
}

export default ClusterComponents
