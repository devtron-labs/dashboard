import React, { Suspense, useEffect, useRef, useState } from 'react'
import { useRouteMatch, useParams, Redirect, useLocation, useHistory } from 'react-router'
import { Switch, Route } from 'react-router-dom'
import { URLS } from '../../config'
import { sortOptionsByValue } from '../common'
import { ErrorScreenManager, DetailsProgressing } from '@devtron-labs/devtron-fe-common-lib'
import ValuesComponent from './values/ChartValues.component'
import AppHeaderComponent from './headers/AppHeader.component'
import ChartHeaderComponent from './headers/ChartHeader.component'
import {
    getInstalledAppDetail,
    getInstalledChartDetail,
    getInstalledChartResourceTree,
} from './appDetails/appDetails.api'
import AppDetailsComponent from './appDetails/AppDetails.component'
import { AppDetails, AppType, EnvType } from './appDetails/appDetails.type'
import IndexStore from './appDetails/index.store'
import { checkIfToRefetchData, deleteRefetchDataFromUrl } from '../util/URLUtil'
import ChartDeploymentHistory from './chartDeploymentHistory/ChartDeploymentHistory.component'
import { ExternalLinkIdentifierType, ExternalLinksAndToolsType } from '../externalLinks/ExternalLinks.type'
import { getExternalLinks, getMonitoringTools } from '../externalLinks/ExternalLinks.service'
import { sortByUpdatedOn } from '../externalLinks/ExternalLinks.utils'
import { AppDetailsEmptyState } from '../common/AppDetailsEmptyState'

let initTimer = null

function RouterComponent({ envType }) {
    const [isLoading, setIsLoading] = useState(true)
    const params = useParams<{ appId: string; envId: string; nodeType: string }>()
    const { path } = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [errorResponseCode, setErrorResponseCode] = useState(undefined)
    const [externalLinksAndTools, setExternalLinksAndTools] = useState<ExternalLinksAndToolsType>({
        externalLinks: [],
        monitoringTools: [],
    })
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [loadingResourceTree, setLoadingResourceTree] = useState(false)
    const appDetailsRef = useRef({} as AppDetails)

    useEffect(() => {
        IndexStore.setEnvDetails(envType, +params.appId, +params.envId)

        setIsLoading(true)
        setLoadingDetails(true)
        setLoadingResourceTree(true)

        if (initTimer) {
            clearTimeout(initTimer)
        }
        if (location.search.includes('newDeployment')) {
            setTimeout(() => {
                _init()
            }, 30000)
        } else {
            _init()
        }
    }, [params.appId, params.envId])

    // clearing the timer on component unmount
    useEffect(() => {
        return (): void => {
            if (initTimer) {
                clearTimeout(initTimer)
            }
        }
    }, [])

    useEffect(() => {
        if (checkIfToRefetchData(location)) {
            setTimeout(() => {
                _getAndSetAppDetail()
                deleteRefetchDataFromUrl(history, location)
            }, 5000)
        }
    }, [location.search])

    const _init = () => {
        _getAndSetAppDetail()
        initTimer = setTimeout(() => {
            _init()
        }, window._env_.HELM_APP_DETAILS_POLLING_INTERVAL || 30000)
    }

    const _getAndSetAppDetail = async () => {
        try {
            if (envType === EnvType.CHART) {
                // Get App Details
                getInstalledChartDetail(+params.appId, +params.envId)
                    .then((response) => {
                        appDetailsRef.current = {
                            ...appDetailsRef.current,
                            ...response.result,
                        }
                        IndexStore.publishAppDetails(appDetailsRef.current, AppType.DEVTRON_HELM_CHART)
                        getExternalLinksAndTools(response.result?.clusterId)
                    })
                    .finally(() => {
                        setLoadingDetails(false)
                    })
                // Get App Resource Tree
                getInstalledChartResourceTree(+params.appId, +params.envId)
                    .then((response) => {
                        appDetailsRef.current = {
                            ...appDetailsRef.current,
                            ...response.result,
                        }
                        IndexStore.publishAppDetails(appDetailsRef.current, AppType.DEVTRON_HELM_CHART)
                    })
                    .finally(() => {
                        setLoadingResourceTree(false)
                    })
            } else {
                // Sohel: Revisit this flow
                const response = await getInstalledAppDetail(+params.appId, +params.envId)
                IndexStore.publishAppDetails(response.result, AppType.DEVTRON_APP)
            }

            setErrorResponseCode(undefined)
        } catch (e: any) {
            if (e?.code) {
                setErrorResponseCode(e.code)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const getExternalLinksAndTools = (clusterId) => {
        if (clusterId) {
            Promise.all([
                getMonitoringTools(),
                getExternalLinks(clusterId, params.appId, ExternalLinkIdentifierType.DevtronInstalledApp),
            ])
                .then(([monitoringToolsRes, externalLinksRes]) => {
                    setExternalLinksAndTools({
                        externalLinks: externalLinksRes.result?.sort(sortByUpdatedOn) || [],
                        monitoringTools:
                            monitoringToolsRes.result
                                ?.map((tool) => ({
                                    label: tool.name,
                                    value: tool.id,
                                    icon: tool.icon,
                                }))
                                .sort(sortOptionsByValue) || [],
                    })
                })
                .catch((e) => {
                    setExternalLinksAndTools(externalLinksAndTools)
                })
        } else {
            setIsLoading(false)
        }
    }

    const renderErrorScreen = () => {
        if (errorResponseCode === 404) {
            return (
                <div className="h-100">
                    {EnvType.APPLICATION === envType ? (
                        <AppHeaderComponent />
                    ) : (
                        <ChartHeaderComponent errorResponseCode={errorResponseCode} />
                    )}
                    <AppDetailsEmptyState envType={EnvType.CHART} />
                </div>
            )
        } else if (errorResponseCode) {
            return (
                <div className="dc__loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )
        } else {
            return null
        }
    }

    return (
        <React.Fragment>
            {isLoading && <DetailsProgressing loadingText="Please wait…" size={24} fullHeight />}
            {renderErrorScreen()}
            {!isLoading && !errorResponseCode && (
                <>
                    {EnvType.APPLICATION === envType ? <AppHeaderComponent /> : <ChartHeaderComponent />}
                    <Suspense fallback={<DetailsProgressing loadingText="Please wait…" size={24} />}>
                        <Switch>
                            <Route path={`${path}/${URLS.APP_DETAILS}`}>
                                <AppDetailsComponent
                                    externalLinks={externalLinksAndTools.externalLinks}
                                    monitoringTools={externalLinksAndTools.monitoringTools}
                                    isExternalApp={false}
                                    _init={_init}
                                    loadingDetails={loadingDetails}
                                    loadingResourceTree={loadingResourceTree}
                                />
                            </Route>
                            <Route path={`${path}/${URLS.APP_VALUES}`}>
                                <ValuesComponent appId={params.appId} init={_init} />
                            </Route>
                            <Route path={`${path}/${URLS.APP_DEPLOYMNENT_HISTORY}`}>
                                <ChartDeploymentHistory appId={params.appId} isExternal={false} />
                            </Route>
                            <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                        </Switch>
                    </Suspense>
                </>
            )}
        </React.Fragment>
    )
}

export default RouterComponent
