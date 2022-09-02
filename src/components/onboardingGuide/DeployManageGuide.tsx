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
import { NAVIGATION, OnClickedHandler, POSTHOG_EVENT_ONBOARDING } from './onboarding.utils'
import CommonGuide from './CommonGuide'
import { getClusterListMinWithoutAuth } from '../../services/service'

function DeployManageGuide({ isGettingStartedClicked, loginCount }) {
    const history = useHistory()
    const [devtronHelmCount, setDevtronHelmCount] = useState(0)
    const [loader, setLoader] = useState(false)
    const { serverMode } = useContext(mainContext)
    const [ isDefaultCluster, setIsDefaultCluster] = useState(false)

    const _getInit = () => {
        if (serverMode === SERVER_MODE.FULL) {
            setLoader(true)
            try {
                getDevtronInstalledHelmApps('').then((response) => {
                    setDevtronHelmCount(response.result.helmApps.length)
                    setLoader(false)
                })
                getClusterListMinWithoutAuth().then((response) => {
                  setIsDefaultCluster(response?.result?.some((data) => data.cluster_name === 'default_cluster'))
                })
            } catch (err) {
                showError(err)
                setLoader(false)
            }
        }
    }
    useEffect(() => {
        _getInit()
    }, [])

    const redirectToAppList = () => {
        history.push(`${URLS.APP}/${URLS.APP_LIST}`)
    }


    return (
        <div>
            {loader ? (
                <div className="w-100 flex" style={{ height: 'calc(100vh - 80px)' }}>
                    <Progressing pageLoader />
                </div>
            ) : (
                <div className="deploy-manage-container">
                    <CommonGuide
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
                                            className="no-decor fw-6 cursor cn-9 flex"
                                            onClick={() => OnClickedHandler(POSTHOG_EVENT_ONBOARDING.VIEW_APPLICATION)}
                                        >
                                            <img
                                                className="left-radius-4 bcn-1"
                                                src={HelmSearch}
                                                width="200"
                                                height="150"
                                                alt="Please connect cluster"
                                            />
                                            <div className="lh-22 fw-6 fs-16 pl-20 pr-20">
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
                                        className="no-decor fw-6 cursor cn-9 flex"
                                        onClick={() => OnClickedHandler(POSTHOG_EVENT_ONBOARDING.BROWSW_HELM_CHART)}
                                    >
                                        <img
                                            className="left-radius-4 bcn-1"
                                            src={HelmCollage}
                                            width="200"
                                            height="150"
                                            alt="Please connect cluster"
                                        />
                                        <div className="lh-22 fw-6 fs-16 pl-20 pr-20">
                                            I want to deploy popular helm charts <br />
                                            <div className="fs-14 cb-5 mt-8">Browse helm charts</div>
                                        </div>
                                    </NavLink>
                                </div>
                                <div className="deploy-card bcn-0 w-400 br-4 en-2 bw-1 ">
                                    <NavLink
                                        to={URLS.GLOBAL_CONFIG_CLUSTER}
                                        activeClassName="active"
                                        className="no-decor fw-6 cursor cn-9 flex"
                                        onClick={() => OnClickedHandler(POSTHOG_EVENT_ONBOARDING.CONNECT_CLUSTER)}
                                    >
                                        <img
                                            className="left-radius-4 bcn-1"
                                            src={HelmInCluster}
                                            width="200"
                                            height="150"
                                            alt="Please connect cluster"
                                        />
                                        <div className="lh-22 fw-6 fs-16 pl-20 pr-20">
                                            I have helm applications in other clusters <br />
                                            <div className="fs-14 cb-5 mt-8"> Connect a cluster</div>
                                        </div>
                                    </NavLink>
                                </div>
                                <div className="deploy-card bcn-0 w-400 br-4 en-2 bw-1 ">
                                    <NavLink
                                        to={URLS.GLOBAL_CONFIG_CHART}
                                        activeClassName="active"
                                        className="no-decor fw-6 cursor cn-9 flex"
                                        onClick={() =>
                                            OnClickedHandler(POSTHOG_EVENT_ONBOARDING.CONNECT_CHART_REPOSITORY)
                                        }
                                    >
                                        <img
                                            className="left-radius-4 bcn-1"
                                            src={ChartRepository}
                                            width="200"
                                            height="150"
                                            alt="Please connect cluster"
                                        />
                                        <div className="lh-22 fw-6 fs-16 pl-20 pr-20">
                                            I want to connect my own chart repository <br />
                                            <div className="fs-14 cb-5 mt-8"> Connect chart repository</div>
                                        </div>
                                    </NavLink>
                                </div>
                            </div>
                            <div className="fs-14 flex column mt-40 mb-20">
                                <NavLink
                                    to={`${URLS.APP}/${URLS.APP_LIST}`}
                                    className="guide_skip no-decor cb-5 fw-6 cursor mb-4"
                                >
                                    Skip and explore Devtron on your own
                                </NavLink>
                                <div className="cn-7">Tip: You can return here anytime from the Help menu</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DeployManageGuide
