import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { useParams, useRouteMatch } from 'react-router'
import { URLS, AppListConstants } from '../../../config'
import './header.scss'
import PageHeader from '../../common/header/PageHeader'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { EAHeaderComponentType } from './appHeader.type'

const EAHeaderComponent = ({ title, redirectURL, appType }: EAHeaderComponentType) => {
    const match = useRouteMatch()
    const params = useParams<{ appId: string; appName: string }>()

    const renderBreadcrumbs = () => {
        return (
            <div className="m-0 flex left fs-12 cn-9fw-4 fs-16">
                <Link to={redirectURL} className="dc__devtron-breadcrumb__item">
                    <div className="cb-5">{title}</div>
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
                {appType !== AppListConstants.AppType.ARGO_APPS && (
                    <>
                        <li className="tab-list__tab">
                            <NavLink
                                activeClassName="active"
                                to={`${match.url}/${URLS.APP_VALUES}`}
                                className="tab-list__tab-link flex"
                                onClick={(event) => {
                                    ReactGA.event({
                                        category: 'External App',
                                        action: 'External App Values Clicked',
                                    })
                                }}
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
                                        category: 'External App',
                                        action: 'External App Deployment history Clicked',
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
        <div className="app-header-wrapper helm-app-page-header" style={{ gridTemplateColumns: 'unset' }}>
            <PageHeader
                isBreadcrumbs
                showTabs
                renderHeaderTabs={renderExternalHelmApp}
                breadCrumbs={renderBreadcrumbs}
                showAnnouncementHeader
            />
        </div>
    )
}

export default EAHeaderComponent
