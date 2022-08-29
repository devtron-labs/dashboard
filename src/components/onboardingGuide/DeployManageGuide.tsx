import React, { useContext, useEffect, useState } from 'react'
import HelmSearch from '../../assets/img/guided-helm-search.png'
import HelmInCluster from '../../assets/img/guided-helm-cluster.png'
import ChartRepository from '../../assets/img/guided-chart-repository.png'
import HelmCollage from '../../assets/img/guided-helm-collage.png'
import { NavLink, useHistory } from 'react-router-dom'
import { SERVER_MODE, URLS } from '../../config'
import { ReactComponent as GoBack } from '../../assets/icons/ic-arrow-forward.svg'
import './onboardingGuide.scss'
import ReactGA from 'react-ga'
import { Progressing, showError } from '../common'
import { getDevtronInstalledHelmApps } from '../app/list-new/AppListService'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { mainContext } from '../common/navigation/NavigationRoutes'

function DeployManageGuide({ isDeployManageCardClicked }) {
    const history = useHistory()
    const [devtronHelmCount, setDevtronHelmCount] = useState(0)
    const [loader, setLoader] = useState(false)
    const { serverMode, setPageOverflowEnabled } = useContext(mainContext)

    const _getInit = () => {
        if (serverMode === SERVER_MODE.FULL) {
            setLoader(true)
            try {
                getDevtronInstalledHelmApps('').then((response) => {
                    setDevtronHelmCount(response.result.helmApps.length)
                    setLoader(false)
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

    const redirectToOnboardingPage = () => {
        history.goBack()
    }

    const onClickViewApplication = () => {
        ReactGA.event({
            category: 'Onboarding',
            action: 'Onboarding Guide Clicked',
        })
    }

    return (
        <div>
            {loader ? (
                <div className="w-100 flex" style={{ height: 'calc(100vh - 80px)' }}>
                    <Progressing pageLoader />
                </div>
            ) : (
                <div className="deploy-manage-container">
                    <div className="deploy-manage__header  h-300">
                        {/* {isDeployManageCardClicked && (
                            <button
                                type="button"
                                className="w-100 flex right transparent p-20"
                                onClick={redirectToOnboardingPage}
                            >
                                <Close className="icon-dim-24" />
                            </button>
                        )} */}
                        <div className={`${isDeployManageCardClicked ? '' : 'h-300'} flex h-300`}>
                            <div className="bcn-0 deploy_arrow flex cursor" onClick={redirectToOnboardingPage}>
                                <GoBack className="rotate icon-dim-24" style={{ ['--rotateBy' as any]: '180deg' }} />
                            </div>
                            <div className="ml-32">
                                <h1 className="fw-6 mb-8">Deploy and manage helm apps</h1>
                                <p className="fs-14 cn-7">
                                    This helps us in guiding you towards relevant product features
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="deploy-manage__body bcn-0 flex position-rel">
                      <div className='deploy-manage__abs'>
                        <div className="deploy-manage-cards__wrap">
                            {devtronHelmCount > 0 && (
                                <div className="deploy-card bcn-0 flex w-400 br-4 en-2 bw-1 ">
                                    <img
                                        className=" bcn-1"
                                        src={HelmSearch}
                                        width="200"
                                        height="150"
                                        alt="Please connect cluster"
                                    />
                                    <div className="fw-6 fs-16 pl-20 pr-20">
                                        {devtronHelmCount} helm applications found in default_cluster <br />
                                        <NavLink
                                            to={`${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`}
                                            activeClassName="active"
                                            onClick={onClickViewApplication}
                                        >
                                            View applications
                                        </NavLink>
                                    </div>
                                </div>
                            )}

                            <div className="deploy-card bcn-0 flex w-400 br-4 en-2 bw-1 ">
                                <img
                                    className=" bcn-1"
                                    src={HelmCollage}
                                    width="200"
                                    height="150"
                                    alt="Please connect cluster"
                                />
                                <div className="fw-6 fs-16 pl-20 pr-20">
                                    I want to deploy popular helm charts <br />
                                    <NavLink to={URLS.CHARTS_DISCOVER} activeClassName="active">
                                        Browse helm charts
                                    </NavLink>
                                </div>
                            </div>
                            <div className="deploy-card bcn-0  flex w-400 br-4 en-2 bw-1 ">
                                <img
                                    className=" bcn-1"
                                    src={HelmInCluster}
                                    width="200"
                                    height="150"
                                    alt="Please connect cluster"
                                />
                                <div className="fw-6 fs-16 pl-20 pr-20">
                                    I have helm applications in other clusters <br />
                                    <NavLink to={URLS.GLOBAL_CONFIG_CLUSTER} activeClassName="active">
                                        Connect a cluster
                                    </NavLink>
                                </div>
                            </div>
                            <div className="deploy-card bcn-0 flex w-400 br-4 en-2 bw-1 ">
                                <img
                                    className=" bcn-1"
                                    src={ChartRepository}
                                    width="200"
                                    height="150"
                                    alt="Please connect cluster"
                                />
                                <div className="fw-6 fs-16 pl-20 pr-20">
                                    I want to connect my own chart repository <br />
                                    <NavLink to={URLS.GLOBAL_CONFIG_CHART} activeClassName="active">
                                        Connect chart repository
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="fs-14 flex column mt-20 mb-20">
                            <NavLink to={`${URLS.APP}/${URLS.APP_LIST}`} className="cb-5 fw-6 cursor mb-8">
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
