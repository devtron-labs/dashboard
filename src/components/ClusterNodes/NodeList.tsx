import React, { useState, useEffect } from 'react'
import { useRouteMatch, useParams, useHistory } from 'react-router-dom'
import { getClusterListMin } from './clusterNodes.service'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { showError, BreadCrumb, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'
import { ClusterListType, CLUSTER_PAGE_TAB_TYPE } from './types'
import { CLUSTER_PAGE_TAB } from './constants'
import PageHeader from '../common/header/PageHeader'
import ReactSelect from 'react-select'
import { appSelectorStyle, DropdownIndicator } from '../AppSelector/AppSelectorUtil'
import { OptionType } from '../app/types'
import './clusterNodes.scss'
import ClusterDetails from './ClusterDetails'
import ClusterAbout from './ClusterAbout'

export default function NodeList({ imageList, isSuperAdmin, namespaceList }) {
    const match = useRouteMatch()
    const history = useHistory()
    const [lastDataSync, setLastDataSync] = useState(false)
    const { clusterId } = useParams<{ clusterId: string }>()
    const [clusterList, setClusterList] = useState<OptionType[]>([])
    const [selectedCluster, setSelectedCluster] = useState<OptionType>({
        label: '',
        value: '',
    })
    const [selectedTabName, setSelectedTabName] = useState<CLUSTER_PAGE_TAB_TYPE>(CLUSTER_PAGE_TAB.DETAILS)

    useEffect(() => {
        getClusterListMin()
            .then((response) => {
                setLastDataSync(!lastDataSync)
                if (response.result) {
                    const optionList = response.result
                        .filter((cluster) => !cluster.errorInNodeListing)
                        .map((cluster) => {
                            const _clusterId = cluster.id?.toString()
                            if (_clusterId === clusterId) {
                                setSelectedCluster({
                                    label: cluster.name,
                                    value: _clusterId,
                                })
                            }
                            return {
                                label: cluster.name,
                                value: _clusterId,
                            }
                        })
                    setClusterList(optionList)
                }
            })
            .catch((error) => {
                showError(error)
            })
    }, [])

    const onClusterChange = (selectedValue: OptionType): void => {
        setSelectedCluster(selectedValue)
        history.push(match.url.replace(clusterId, selectedValue.value))
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                clusters: {
                    component: 'Clusters',
                    linked: true,
                },
                ':clusterId': {
                    component: (
                        <ReactSelect
                            classNamePrefix='cluster-select-header'
                            options={clusterList}
                            onChange={onClusterChange}
                            components={{
                                IndicatorSeparator: null,
                                DropdownIndicator,
                            }}
                            value={selectedCluster}
                            styles={appSelectorStyle}
                        />
                    ),
                    linked: false,
                },
            },
        },
        [clusterId, clusterList],
    )

    const renderBreadcrumbs = (): JSX.Element => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    const changeNodeTab = (e): void => {
        const _tabIndex = Number(e.currentTarget.dataset.tabIndex)
        if (_tabIndex === 0) {
            setSelectedTabName(CLUSTER_PAGE_TAB.ABOUT)
        } else if (_tabIndex === 1) {
            setSelectedTabName(CLUSTER_PAGE_TAB.DETAILS)
        }
    }

    const renderClusterTabs = (): JSX.Element => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab pointer" data-tab-index="0" data-testid="cluster-about-tab" onClick={changeNodeTab}>
                    <div
                        className={`mb-6 fs-13 tab-hover${
                            selectedTabName == CLUSTER_PAGE_TAB.ABOUT ? ' fw-6 active' : ' fw-4'
                        }`}
                    >
                        {CLUSTER_PAGE_TAB.ABOUT}
                    </div>
                    {selectedTabName == CLUSTER_PAGE_TAB.ABOUT && <div className="node-details__active-tab" />}
                </li>
                <li className="tab-list__tab pointer" data-tab-index="1" data-testid="cluster-details-tab" onClick={changeNodeTab}>
                    <div
                        className={`mb-6 flexbox fs-13 tab-hover${
                            selectedTabName == CLUSTER_PAGE_TAB.DETAILS ? ' fw-6 active' : ' fw-4'
                        }`}
                    >
                        {CLUSTER_PAGE_TAB.DETAILS}
                    </div>
                    {selectedTabName == CLUSTER_PAGE_TAB.DETAILS && <div className="node-details__active-tab" />}
                </li>
            </ul>
        )
    }

    return (
        <div className="cluster-about-page h-100 dc__overflow-hidden">
            <PageHeader
                breadCrumbs={renderBreadcrumbs}
                isBreadcrumbs={true}
                showTabs={true}
                renderHeaderTabs={renderClusterTabs}
            />
            {selectedTabName === CLUSTER_PAGE_TAB.ABOUT && (
                <ClusterAbout clusterId={clusterId} isSuperAdmin={isSuperAdmin} />
            )}
            {selectedTabName === CLUSTER_PAGE_TAB.DETAILS && (
                <ClusterDetails
                    imageList={imageList}
                    isSuperAdmin={isSuperAdmin}
                    namespaceList={namespaceList}
                    clusterId={clusterId}
                />
            )}
        </div>
    )
}
