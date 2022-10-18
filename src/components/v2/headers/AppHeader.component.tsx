import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { URLS } from '../../../config'
import { BreadCrumb, useBreadcrumb } from '../../common'
import ReactGA from 'react-ga4'
import { AppSelector } from '../../AppSelector'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import { getAppMetaInfo } from '../../app/service'
import { OptionType } from './appHeader.type'
import { useSharedState } from '../utils/useSharedState'
import './header.scss'
import IndexStore from '../appDetails/index.store'
import PageHeader from '../../common/header/PageHeader'

function AppHeaderComponent() {
    const { appId } = useParams<{ appId }>()
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const [showInfoModal, setShowInfoModal] = useState(false)
    const currentPathname = useRef('')
    const [result, setResult] = useState(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const [labelTags, setLabelTags] = useState<{ tags: OptionType[]; inputTagValue: string; tagError: string }>({
        tags: [],
        inputTagValue: '',
        tagError: '',
    })
    const params = useParams<{ appId: string }>()
    const [envDetails] = useSharedState(IndexStore.getEnvDetails(), IndexStore.getEnvDetailsObservable())
    const [appName, setAppName] = useState('')

    const getAppMetaInfoRes = () => {
        setIsLoading(true)
        const res = getAppMetaInfo(appId).then((_result) => {
            setAppName(_result?.result?.appName)
            let labelOptionRes = _result?.result?.labels?.map((_label) => {
                return {
                    label: `${_label.key?.toString()}:${_label.value?.toString()}`,
                    value: `${_label.key?.toString()}:${_label.value?.toString()}`,
                }
            })
            setResult(_result)
            setIsLoading(false)
            setLabelTags({ tags: labelOptionRes || [], inputTagValue: '', tagError: '' })
        })
    }

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    const handleAppChange = useCallback(
        ({ label, value }) => {
            // const tab = currentPathname.current.replace(match.url, "").split("/")[1];
            const newUrl = generatePath(match.path, { appId: value })
            history.push(newUrl)
            ReactGA.event({
                category: 'App Selector',
                action: 'App Selection Changed',
                label: label,
            })
        },
        [location.pathname],
    )

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':appId(\\d+)': {
                    component: <AppSelector onChange={handleAppChange} appId={appId} appName={appName} />,
                    linked: false,
                },
                app: {
                    component: <span className="cn-5 fs-16 dc__lowercase">apps</span>,
                    linked: true,
                },
            },
        },
        [appId],
    )

    const renderBreadcrumbs = () => {
        return <BreadCrumb breadcrumbs={breadcrumbs.slice(0, breadcrumbs.length - 2)} />
    }

    const renderHelmDetailsTabs = () => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab dc__ellipsis-right fs-13">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/env/${envDetails.envId}`}
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
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_VALUES}/${envDetails.envId}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Values Clicked',
                            })
                        }}
                    >
                        Values
                    </NavLink>
                </li>
            </ul>
        )
    }

    return (
      <div className="app-header-wrapper">
        <PageHeader
            isBreadcrumbs={true}
            breadCrumbs={renderBreadcrumbs}
            showTabs={true}
            renderHeaderTabs={renderHelmDetailsTabs}
            showAnnouncementHeader={true}
        />
        </div>
    )
}

export default AppHeaderComponent
