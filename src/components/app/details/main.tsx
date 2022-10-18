import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import { ErrorBoundary, Progressing, BreadCrumb, useBreadcrumb, useAsync, showError, VisibleModal } from '../../common'
import { getAppListMin } from '../../../services/service'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import { URLS } from '../../../config'
import { AppSelector } from '../../AppSelector'
import ReactGA from 'react-ga4'
import AppConfig from './appConfig/AppConfig'
import './appDetails/appDetails.scss'
import './app.css'
import Tippy from '@tippyjs/react'
import { getAppMetaInfo, createAppLabels } from '../service'
import { toast } from 'react-toastify'
import { NumberOptionType, OptionType } from '../types'
import AboutAppInfoModal from './AboutAppInfoModal'
import { validateTags, TAG_VALIDATION_MESSAGE, createOption, handleKeyDown } from '../appLabelCommon'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { ReactComponent as Info } from '../../../assets/icons/ic-info-outlined.svg'
import { EnvType } from '../../v2/appDetails/appDetails.type'
import PageHeader from '../../common/header/PageHeader'
import { AppDetailsProps } from './triggerView/types'

const TriggerView = lazy(() => import('./triggerView/TriggerView'))
const DeploymentMetrics = lazy(() => import('./metrics/DeploymentMetrics'))
const CIDetails = lazy(() => import('./cIDetails/CIDetails'))
const AppDetails = lazy(() => import('./appDetails/AppDetails'))
const IndexComponent = lazy(() => import('../../v2/index'))

const CDDetails = lazy(() => import('./cdDetails/CDDetails'))
const TestRunList = lazy(() => import('./testViewer/TestRunList'))

export default function AppDetailsPage({ isV2 }: AppDetailsProps) {
    const { path } = useRouteMatch()
    const { appId } = useParams<{ appId }>()

    return (
        <div className="app-details-page">
            {!isV2 && <AppHeader />}
            <ErrorBoundary>
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        {isV2 ? (
                            <Route
                                path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`}
                                render={(props) => <IndexComponent envType={EnvType.APPLICATION} />}
                            />
                        ) : (
                            <Route
                                path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`}
                                render={(props) => <AppDetails />}
                            />
                        )}
                        <Route path={`${path}/${URLS.APP_TRIGGER}`} render={(props) => <TriggerView />} />
                        <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?`}>
                            <CIDetails key={appId} />
                        </Route>
                        <Route
                            path={`${path}/${URLS.APP_DEPLOYMENT_METRICS}/:envId(\\d+)?`}
                            component={DeploymentMetrics}
                        />
                        <Route
                            path={`${path}/${URLS.APP_CD_DETAILS}/:envId(\\d+)?/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                        >
                            <CDDetails key={appId} />
                        </Route>
                        <Route path={`${path}/${URLS.APP_CONFIG}`} component={AppConfig} />
                        {/* commented for time being */}
                        {/* <Route path={`${path}/tests/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                            render={() => <TestRunList />}
                        /> */}
                        <Redirect to={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`} />
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}

export function AppHeader() {
    const { appId } = useParams<{ appId }>()
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const currentPathname = useRef('')
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [labelTags, setLabelTags] = useState<{ tags: OptionType[]; inputTagValue: string; tagError: string }>({
        tags: [],
        inputTagValue: '',
        tagError: '',
    })
    const [result, setResult] = useState(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const [appName, setAppName] = useState('')

    const getAppMetaInfoRes = async () => {
        try {
            setIsLoading(true)
            const { result } = await getAppMetaInfo(appId)
            if (result) {
                setAppName(result?.appName)
                const labelOptionRes = result?.labels?.map((_label) => {
                    return {
                        label: `${_label.key?.toString()}:${_label.value?.toString()}`,
                        value: `${_label.key?.toString()}:${_label.value?.toString()}`,
                    }
                })
                setResult(result)
                setIsLoading(false)
                setLabelTags({ tags: labelOptionRes || [], inputTagValue: '', tagError: '' })
            }
        } catch (err) {
            showError(err)
        }
    }

    useEffect(() => {
        try {
            getAppMetaInfoRes()
        } catch (err) {
            showError(err)
        }
    }, [appId])

    function validateForm(): boolean {
        if (
            labelTags.tags.length !== labelTags.tags.map((tag) => tag.value).filter((tag) => validateTags(tag)).length
        ) {
            setLabelTags((labelTags) => ({ ...labelTags, tagError: TAG_VALIDATION_MESSAGE.error }))
            return false
        }
        return true
    }

    function handleInputChange(inputTagValue) {
        setLabelTags((tags) => ({ ...tags, inputTagValue: inputTagValue, tagError: '' }))
    }

    function handleTagsChange(newValue: any, actionMeta: any) {
        setLabelTags((tags) => ({ ...tags, tags: newValue || [], tagError: '' }))
    }

    function handleCreatableBlur(e) {
        labelTags.inputTagValue = labelTags.inputTagValue.trim()
        if (!labelTags.inputTagValue) return
        setLabelTags({
            inputTagValue: '',
            tags: [...labelTags.tags, createOption(e.target.value)],
            tagError: '',
        })
    }

    async function handleSubmit(e: any, projectMetadata: NumberOptionType) {
        const validForm = validateForm()
        if (!validForm) {
            return
        }
        setSubmitting(true)

        let _optionTypes = []
        if (labelTags.tags && labelTags.tags.length > 0) {
            labelTags.tags.forEach((_label) => {
                let colonIndex = _label.value.indexOf(':')
                let splittedTagBeforeColon = _label.value.substring(0, colonIndex)
                let splittedTagAfterColon = _label.value.substring(colonIndex + 1)
                _optionTypes.push({
                    key: splittedTagBeforeColon,
                    value: splittedTagAfterColon,
                })
            })
        }

        const payload = {
            id: parseInt(appId),
            labels: _optionTypes,
            teamId: projectMetadata.value,
        }

        try {
            await createAppLabels(payload)
            setShowInfoModal(false)
            if (result.projectName === projectMetadata.label) {
                toast.success('Successfully saved')
            } else {
                toast.success(`Application '${result.appName}' is moved to project '${projectMetadata.label}'`)
                await getAppMetaInfoRes()
            }
        } catch (err) {
            if (err['code'] === 403 && result.projectName !== projectMetadata.label) {
                toast.error(`You don't have the required access to the target project ${projectMetadata.label}`)
            } else {
                showError(err)
            }
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    const handleAppChange = useCallback(
        ({ label, value }) => {
            const tab = currentPathname.current.replace(match.url, '').split('/')[1]
            const newUrl = generatePath(match.path, { appId: value })
            history.push(`${newUrl}/${tab}`)
            ReactGA.event({
                category: 'App Selector',
                action: 'App Selection Changed',
                label: tab,
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
                    component: <span className="cb-5 fs-16 dc__capitalize">devtron apps</span>,
                    linked: true,
                },
            },
        },
        [appId, appName],
    )

    let newTag = labelTags.inputTagValue.split(',').map((e) => {
        e = e.trim()
        return createOption(e)
    })
    const setAppTagLabel = () =>
        setLabelTags({
            inputTagValue: '',
            tags: [...labelTags.tags, ...newTag],
            tagError: '',
        })

    const renderInfoModal = () => {
        return (
            showInfoModal && (
                <VisibleModal className="app-status__material-modal">
                    <div className="modal__body br-8 bcn-0 mt-0-imp p-0 dc__no-top-radius">
                        <AboutAppInfoModal
                            appId={appId}
                            appMetaResult={result}
                            onClose={setShowInfoModal}
                            isLoading={isLoading}
                            labelTags={labelTags}
                            handleCreatableBlur={handleCreatableBlur}
                            handleInputChange={handleInputChange}
                            handleKeyDown={(event) => handleKeyDown(labelTags, setAppTagLabel, event)}
                            handleSubmit={handleSubmit}
                            handleTagsChange={handleTagsChange}
                            submitting={submitting}
                        />
                    </div>
                </VisibleModal>
            )
        )
    }

    const renderAppDetailsTabs = () => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab dc__ellipsis-right">
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
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_TRIGGER}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Build & Deploy Clicked',
                            })
                        }}
                    >
                        Build & Deploy
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CI_DETAILS}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Build History Clicked',
                            })
                        }}
                    >
                        Build History
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CD_DETAILS}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Deployment History Clicked',
                            })
                        }}
                    >
                        Deployment History
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_DEPLOYMENT_METRICS}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Deployment Metrics Clicked',
                            })
                        }}
                    >
                        Deployment Metrics
                    </NavLink>
                </li>

                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CONFIG}`}
                        className="tab-list__tab-link flex"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'App Configuration Clicked',
                            })
                        }}
                    >
                        <Settings className="tab-list__icon icon-dim-16 fcn-9 mr-4" />
                        App Configuration
                    </NavLink>
                </li>
            </ul>
        )
    }

    const renderBreadcrumbs = () => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    const handleInfoModal = () => {
        setShowInfoModal(true)
    }

    return (
        <>
            <PageHeader
                breadCrumbs={renderBreadcrumbs}
                isBreadcrumbs={true}
                showTabs={true}
                renderHeaderTabs={renderAppDetailsTabs}
                isTippyShown={true}
                TippyIcon={Info}
                onClickTippybutton={handleInfoModal}
                tippyMessage={'About app'}
                showAnnouncementHeader={true}
            />
            {showInfoModal && renderInfoModal()}
        </>
    )
}
