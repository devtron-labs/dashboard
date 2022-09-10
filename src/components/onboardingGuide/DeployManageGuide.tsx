import React, { useContext, useEffect, useState } from 'react'
import HelmSearch from '../../assets/img/guided-helm-search.png'
import HelmInCluster from '../../assets/img/guided-helm-cluster.png'
import ChartRepository from '../../assets/img/guided-chart-repository.png'
import HelmCollage from '../../assets/img/guided-helm-collage.png'
import { NavLink, useHistory } from 'react-router-dom'
import { SERVER_MODE, URLS } from '../../config'
import './onboardingGuide.scss'
import { Progressing, showError } from '../common'
import { getDevtronInstalledHelmApps } from '../app/list-new/AppListService'
import { mainContext } from '../common/navigation/NavigationRoutes'
import { NAVIGATION, handlePostHogEventUpdate, POSTHOG_EVENT_ONBOARDING } from './onboarding.utils'
import GuideCommonHeader from './GuideCommonHeader'
import { getClusterListMinWithoutAuth } from '../../services/service'
import { DeployManageGuideType } from './OnboardingGuide.type'

function DeployManageGuide({ isGettingStartedClicked, loginCount }: DeployManageGuideType) {
    const history = useHistory()
    const [devtronHelmCount, setDevtronHelmCount] = useState(0)
    const [loader, setLoader] = useState(false)
    const { serverMode } = useContext(mainContext)
    const [isDefaultCluster, setDefaultCluster] = useState(false)

    const _getInit = async () => {
        if (serverMode === SERVER_MODE.FULL) {
            setLoader(true)

            try {
                const [installedHelmAppsRes, clusterListMinRes] = await Promise.all([
                    getDevtronInstalledHelmApps(''),
                    getClusterListMinWithoutAuth(),
                ])
                setLoader(false)
                setDevtronHelmCount(installedHelmAppsRes?.result?.helmApps.length)
                setDefaultCluster(clusterListMinRes?.result?.some((data) => data.cluster_name === 'default_cluster'))
            } catch (err) {
                showError(err)
            }
        }
    }

    useEffect(() => {
        _getInit()
    }, [])

    const redirectToAppList = () => {
        history.push(`${URLS.APP}/${URLS.APP_LIST}`)
    }

    const onClickChartCard = (e) => {
        handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.CONNECT_CHART_REPOSITORY)
    }

    const onClickViewApplication = (e) => {
        handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.VIEW_APPLICATION)
    }

    const onClickHelmChart = (e) => {
        handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.BROWSE_HELM_CHART)
    }

    const onClickCluster = (e) => {
        handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.CONNECT_CLUSTER)
    }

    return loader ? (
        <div className="w-100 flex" style={{ height: 'calc(100vh - 80px)' }}>
            <Progressing pageLoader />
        </div>
    ) : (
        <div className="deploy-manage-container">
            <GuideCommonHeader
                loginCount={loginCount}
                title="Deploy and manage helm apps"
                subtitle="This helps us in guiding you towards relevant product features"
                onClickCloseButton={redirectToAppList}
                isGettingStartedClicked={isGettingStartedClicked}
            />
            <div className="deploy-manage__body bcn-0 flex position-rel">
                <div className="deploy-manage__abs">
                    <div className="deploy-manage-cards__wrap">
                        {devtronHelmCount > 0 && (
                            <div className="deploy-card bcn-0 flex w-400 br-4 en-2 bw-1 ">
                                <NavLink
                                    to={isDefaultCluster ? NAVIGATION.AUTOCOMPLETE : NAVIGATION.HELM_APPS}
                                    activeClassName="active"
                                    className="dc__no-decor fw-6 cursor cn-9 flex"
                                    onClick={onClickViewApplication}
                                >
                                    <img
                                        className="left-radius-4 bcn-1"
                                        src={HelmSearch}
                                        width="200"
                                        height="150"
                                        alt="Please connect cluster"
                                    />
                                    <div className="dc__lh-22 fw-6 fs-16 pl-20 pr-20">
                                        Check deployed helm apps <br />
                                        <div className="fs-14 cb-5 mt-8">View applications</div>
                                    </div>
                                </NavLink>
                            </div>
                        )}

                        <div className="deploy-card bcn-0 w-400 br-4 en-2 bw-1 ">
                            <NavLink
                                to={URLS.CHARTS_DISCOVER}
                                activeClassName="active"
                                className="dc__no-decor fw-6 cursor cn-9 flex"
                                onClick={onClickHelmChart}
                            >
                                <img
                                    className="left-radius-4 bcn-1"
                                    src={HelmCollage}
                                    width="200"
                                    height="150"
                                    alt="Please connect cluster"
                                />
                                <div className="dc__lh-22 fw-6 fs-16 pl-20 pr-20">
                                    I want to deploy popular helm charts <br />
                                    <div className="fs-14 cb-5 mt-8">Browse helm charts</div>
                                </div>
                            </NavLink>
                        </div>
                        <div className="deploy-card bcn-0 w-400 br-4 en-2 bw-1 ">
                            <NavLink
                                to={URLS.GLOBAL_CONFIG_CLUSTER}
                                activeClassName="active"
                                className="dc__no-decor fw-6 cursor cn-9 flex"
                                onClick={onClickCluster}
                            >
                                <img
                                    className="left-radius-4 bcn-1"
                                    src={HelmInCluster}
                                    width="200"
                                    height="150"
                                    alt="Please connect cluster"
                                />
                                <div className="dc__lh-22 fw-6 fs-16 pl-20 pr-20">
                                    I have helm applications in other clusters <br />
                                    <div className="fs-14 cb-5 mt-8"> Connect a cluster</div>
                                </div>
                            </NavLink>
                        </div>
                        <div className="deploy-card bcn-0 w-400 br-4 en-2 bw-1 ">
                            <NavLink
                                to={URLS.GLOBAL_CONFIG_CHART}
                                activeClassName="active"
                                className="dc__no-decor fw-6 cursor cn-9 flex"
                                onClick={onClickChartCard}
                            >
                                <img
                                    className="left-radius-4 bcn-1"
                                    src={ChartRepository}
                                    width="200"
                                    height="150"
                                    alt="Please connect cluster"
                                />
                                <div className="dc__lh-22 fw-6 fs-16 pl-20 pr-20">
                                    I want to connect my own chart repository <br />
                                    <div className="fs-14 cb-5 mt-8"> Connect chart repository</div>
                                </div>
                            </NavLink>
                        </div>
                    </div>
                    <div className="fs-14 flex column mt-40 mb-20">
                        <NavLink
                            to={`${URLS.APP}/${URLS.APP_LIST}`}
                            className="guide_skip dc__no-decor cb-5 fw-6 cursor mb-4"
                        >
                            Skip and explore Devtron on your own
                        </NavLink>
                        <div className="cn-7">Tip: You can return here anytime from the Help menu</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeployManageGuide
