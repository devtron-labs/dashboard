import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { URLS, AppListConstants } from '../../../config'
import ReactGA from 'react-ga4'
import { useRouteMatch } from 'react-router'
import './header.scss'
import IndexStore from '../appDetails/index.store'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import PageHeader from '../../common/header/PageHeader'
import { ChartHeaderComponentType } from './appHeader.type'

function ChartHeaderComponent({ errorResponseCode }: ChartHeaderComponentType) {
    const match = useRouteMatch()
    const appDetails = IndexStore.getAppDetails()

    const renderBreadcrumbs = () => {
        return (
            <div className="m-0 flex left ">
                <Link
                    to={`${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.HELM_APPS}`}
                    className="dc__devtron-breadcrumb__item"
                >
                    <span className="cb-5 fs-16">Helm Apps </span>
                </Link>
                {Object.keys(appDetails).length > 0 && (
                    <>
                        <span className="fs-16 cn-9 ml-4 mr-4"> / </span>
                        <span className="fs-16 cn-9">{appDetails.appName}</span>
                    </>
                )}
            </div>
        )
    }

    const renderHelmDetailsTabs = () => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab dc__ellipsis-right fs-13">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_DETAILS}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'App Details Clicked',
                            })
                        }}
                    >
                        App Details
                    </NavLink>
                </li>
                {!appDetails.deploymentAppDeleteRequest && !errorResponseCode && (
                    <>
                        <li className="tab-list__tab">
                            <NavLink
                                activeClassName="active"
                                to={`${match.url}/${URLS.APP_VALUES}`}
                                className="tab-list__tab-link flex"
                                onClick={(event) => {
                                    ReactGA.event({
                                        category: 'App',
                                        action: 'Values Clicked',
                                    })
                                }}
                                data-testid="helm-configure-link"
                            >
                                <Settings className="tab-list__icon icon-dim-16 fcn-7 mr-4" />
                                Configure
                            </NavLink>
                        </li>

                        <li className="tab-list__tab">
                            <NavLink
                                activeClassName="active"
                                to={`${match.url}/${URLS.APP_DEPLOYMNENT_HISTORY}`}
                                className="tab-list__tab-link"
                                onClick={(event) => {
                                    ReactGA.event({
                                        category: 'App',
                                        action: 'Deployment history Clicked',
                                    })
                                }}
                            >
                                Deployment history
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        )
    }

    return (
        <div className="app-header-wrapper helm-app-page-header">
            <PageHeader
                isBreadcrumbs={true}
                showTabs={true}
                renderHeaderTabs={renderHelmDetailsTabs}
                breadCrumbs={renderBreadcrumbs}
            />
        </div>
    )
}

export default ChartHeaderComponent
