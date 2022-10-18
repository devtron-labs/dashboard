import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { URLS, AppListConstants } from '../../../config'
import ReactGA from 'react-ga4'
import { useParams, useRouteMatch, useHistory } from 'react-router'
import './header.scss'
import PageHeader from '../../common/header/PageHeader'

function EAHeaderComponent() {
    const match = useRouteMatch()
    const history = useHistory()
    const params = useParams<{ appId: string; appName: string }>()
    const { path } = useRouteMatch()

    const renderBreadcrumbs = () => {
        return (
            <div className="m-0 flex left fs-12 cn-9fw-4 fs-16">
                <Link
                    to={`${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.HELM_APPS}`}
                    className="dc__devtron-breadcrumb__item"
                >
                    <div className="cb-5">Helm apps</div>
                </Link>
                <span className="ml-4 mr-4">/</span>
                <span>{params.appName}</span>
            </div>
        )
    }
    const renderExternalHelmApp = () => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_DETAILS}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'External App',
                                action: 'External App Details Clicked',
                            })
                        }}
                    >
                        App details
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_VALUES}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'External App',
                                action: 'External App Values Clicked',
                            })
                        }}
                    >
                        Values
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_DEPLOYMNENT_HISTORY}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'External App',
                                action: 'External App Deployment history Clicked',
                            })
                        }}
                    >
                        Deployment history
                    </NavLink>
                </li>
            </ul>
        )
    }
    return (
        <div className="app-header-wrapper helm-app-page-header" style={{ gridTemplateColumns: 'unset' }}>
            <PageHeader
                isBreadcrumbs={true}
                showTabs={true}
                renderHeaderTabs={renderExternalHelmApp}
                breadCrumbs={renderBreadcrumbs}
                showAnnouncementHeader={true}
            />
        </div>
    )
}

export default EAHeaderComponent
