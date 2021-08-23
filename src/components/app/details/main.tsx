import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react';
import { Switch, Route, Redirect, NavLink } from 'react-router-dom';
import { ErrorBoundary, Progressing, BreadCrumb, useBreadcrumb, useAsync, showError, VisibleModal, } from '../../common';
import { getAppListMin } from '../../../services/service';
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import { URLS, Moment12HourFormat } from '../../../config';
import AppSelector from '../../AppSelector'
import ReactGA from 'react-ga';
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg';
import AppConfig from './appConfig/AppConfig';
import './appDetails/appDetails.scss';
import './app.css';
import { ReactComponent as Info } from '../../../assets/icons/ic-info-outlined.svg';
import Tippy from '@tippyjs/react';
import { fetchAppMetaInfo, createAppLabels } from '../service';
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';
import moment from 'moment'
import { toast } from 'react-toastify';
import TagLabelSelect from './TagLabelSelect';
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg';

const TriggerView = lazy(() => import('./triggerView/TriggerView'));
const DeploymentMetrics = lazy(() => import('./metrics/DeploymentMetrics'));
const CIDetails = lazy(() => import('./cIDetails/CIDetails'));
const AppDetails = lazy(() => import('./appDetails/AppDetails'));
const CDDetails = lazy(() => import('./cdDetails/CDDetails'));
const TestRunList = lazy(() => import('./testViewer/TestRunList'));

export default function AppDetailsPage() {
    const { path } = useRouteMatch();
    const { appId } = useParams<{ appId }>();

    return <div className="app-details-page">
        <AppHeader />
        <ErrorBoundary>
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`} render={(props) => <AppDetails />} />
                    <Route path={`${path}/${URLS.APP_TRIGGER}`} render={(props) => <TriggerView />} />
                    <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?`}>
                        <CIDetails key={appId} />
                    </Route>
                    <Route path={`${path}/${URLS.APP_DEPLOYMENT_METRICS}/:envId(\\d+)?`} component={DeploymentMetrics} />
                    <Route path={`${path}/${URLS.APP_CD_DETAILS}/:envId(\\d+)?/:pipelineId(\\d+)?/:triggerId(\\d+)?`}>
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
}

interface OptionType {
    label: string;
    value: string;
}

export function AppHeader() {
    const { appId } = useParams<{ appId }>();
    const match = useRouteMatch();
    const history = useHistory();
    const location = useLocation();
    const currentPathname = useRef("");
    const [showInfoModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [keyRes, setKeyRes] = useState("")
    const [labelRes, setLabelRes] = useState("")
    const [labelTags, setLabelTags] = useState<{ tags: OptionType[], inputTagValue: string, tagError: string }>({ tags: [], inputTagValue: '', tagError: '' })
    const [loading, result, error, reload] = useAsync(() => fetchAppMetaInfo(appId))

    // useEffect(()=>{
    //   result?.result?.labels?.map((_label) => {
    //     let _resLabel = `${_label.value.toString()}`
    //     let _resKey = `${_label.key.toString()}`
    //     setLabelRes(_resLabel)
    //     setKeyRes(_resKey)
    //     })

    // },[])

    // let labelOptionRes = [
    //     {
    //         value: `hi`,
    //         label: `testing`
    //     }
    // ]
    useEffect(() => {
            
            fetchAppMetaInfo(appId).then((_result)=>{
                let labelOptionRes = _result?.result?.labels?.map((_label) => {
                    console.log(`${_label.key.toString()}:${_label.value.toString()}`)
                    return {
                        label: `${_label.key.toString()}:${_label.value.toString()}`,
                        value: `${_label.key.toString()}:${_label.value.toString()}`,
                    }
                })
                console.log(_result?.result)
               
                setLabelTags({ tags: labelOptionRes || [], inputTagValue: '', tagError: '' })
            })

    }, [])

    const createOption = (label: string) => (
        {
            label: label,
            value: label,
        });

    const handleKeyDown = useCallback((event) => {
        labelTags.inputTagValue = labelTags.inputTagValue.trim();
        switch (event.key) {
            case 'Enter':
            case 'Tab':
            case ',':
            case ' ': // space
                console.log(labelTags)
                if (labelTags.inputTagValue) {
                    let newTag = labelTags.inputTagValue.split(',').map((e) => { e = e.trim(); return createOption(e) });
                    setLabelTags({
                        inputTagValue: '',
                        tags: [...labelTags.tags, ...newTag],
                        tagError: '',
                    });
                }
                if (event.key !== 'Tab') {
                    event.preventDefault();
                }
                break;
        }
    }, [labelTags])

    function validateTags(tag) {
        var re = /^.+:.+$/;
        const result = re.test(String(tag).toLowerCase());
        return result;
    }

    function validateForm(): boolean {
        if (labelTags.tags.length !== labelTags.tags.map(tag => tag.value).filter(tag => validateTags(tag)).length) {
            setLabelTags(labelTags => ({ ...labelTags, tagError: 'Please provide tags in key:value format only' }))
            return false
        }
        return true
    }

    function handleInputChange(inputTagValue) {
        // console.log(labelTags)
        setLabelTags(tags => ({ ...tags, inputTagValue: inputTagValue, tagError: '' }))
    }

    function handleTagsChange(newValue: any, actionMeta: any) {
        setLabelTags(tags => ({ ...tags, tags: newValue || [], tagError: '' }))
    };

    function handleCreatableBlur(e) {
        labelTags.inputTagValue = labelTags.inputTagValue.trim()
        if (!labelTags.inputTagValue) return
        setLabelTags({
            inputTagValue: '',
            tags: [...labelTags.tags, createOption(e.target.value)],
            tagError: '',
        });
    };

    async function handleSubmit(e) {
        const validForm = validateForm()
        if (!validForm) {
            return
        }
        setSubmitting(true)

        let _optionTypes = [];
        if (labelTags.tags && labelTags.tags.length > 0) {
            labelTags.tags.forEach((_label) => {
                let _splittedTag = _label.value.split(':');
                _optionTypes.push({
                    key: _splittedTag[0],
                    value: _splittedTag[1]
                })
            })
        }

        const payload = {
            appId: parseInt(appId),
            labels: _optionTypes
        }

        try {
            const { result } = await createAppLabels(payload)
            await reload()
            toast.success('Successfully saved.')
        }
        catch (err) {
            showError(err)
        }
        finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    const handleAppChange = useCallback(({ label, value }) => {
        const tab = currentPathname.current.replace(match.url, "").split("/")[1];
        const newUrl = generatePath(match.path, { appId: value });
        history.push(`${newUrl}/${tab}`);
        ReactGA.event({
            category: 'App Selector',
            action: 'App Selection Changed',
            label: tab,
        });
    }, [location.pathname])

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':appId(\\d+)': {
                    component: (
                        <AppSelector
                            primaryKey="appId"
                            primaryValue="name"
                            matchedKeys={[]}
                            api={getAppListMin}
                            apiPrimaryKey="id"
                            onChange={handleAppChange}
                        />
                    ),
                    linked: false,
                },
                app: {
                    component: <span className="cn-5 fs-18 lowercase">apps</span>,
                    linked: true,
                },
            },
        },
        [appId],
    );

    return <div className="page-header" style={{ gridTemplateColumns: "unset" }}>
        <h1 className="m-0 fw-6 flex left fs-18 cn-9">
            <BreadCrumb breadcrumbs={breadcrumbs} />
            <div className="tab-list__info-icon ml-4 cursor" onClick={() => setShowModal(true)}>
                <Tippy className="default-tt " arrow={false} content={'About app'}>
                    <Info className="icon-dim-20 fcn-5" />
                </Tippy>
            </div>
            {showInfoModal &&
                <VisibleModal className="app-status__material-modal">
                    {/* {console.log(result)} */}
                    <form >
                        <div className="modal__body br-8 bcn-0 p-20">
                            <div className="modal__header">
                                <div className="fs-20 cn-9 fw-6">About</div>
                                <button className="transparent" onClick={() => setShowModal(false)}>
                                    <Close className="icon-dim-24 cursor" />
                                </button>
                            </div>
                            <div className="pt-12">
                                <div className="cn-6 fs-12 mb-2">App name</div>
                                <div className="cn-9 fs-14 mb-16">{result?.result?.appName}</div>
                            </div>
                            <div>
                                <div className="cn-6 fs-12 mb-2">Created on</div>
                                <div className="cn-9 fs-14 mb-16">{moment(result?.result?.createdOn).format(Moment12HourFormat)}</div>
                            </div>
                            <div>
                                <div className="cn-6 fs-12 mb-2">Created by</div>
                                <div className="cn-9 fs-14 mb-16">{result?.result?.createdBy}</div>
                            </div>
                            <div>
                                <div className="cn-6 fs-12 mb-2">Project</div>
                                <div className="cn-9 fs-14 mb-16">{result?.result?.projectName}</div>
                            </div>
                            <TagLabelSelect validateTags={validateTags} labelTags={labelTags} onInputChange={handleInputChange} onTagsChange={handleTagsChange} onKeyDown={handleKeyDown} onCreatableBlur={handleCreatableBlur} />
                            <div className="cr-5 fs-11">
                                {/* <Error className="form__icon form__icon--error" /> */}
                                {labelTags.tagError}
                            </div>
                            <div className='form__buttons mt-40'>
                                <button className=' cta' type="submit" disabled={submitting} onClick={(e) => { e.preventDefault(); handleSubmit(e) }} tabIndex={5} > Save </button>
                            </div>
                        </div>
                    </form>
                </VisibleModal>}
        </h1>

        <ul role="tablist" className="tab-list">
            <li className="tab-list__tab ellipsis-right">
                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_DETAILS}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'App Details Clicked',
                        });
                    }}>App Details
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_TRIGGER}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'Trigger Clicked',
                        });
                    }}>Trigger
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_CI_DETAILS}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'Build History Clicked',
                        });
                    }}>Build History
                </NavLink>
            </li>
            <li className="tab-list__tab">

                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_CD_DETAILS}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'Deployment History Clicked',
                        });
                    }}>Deployment History
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_DEPLOYMENT_METRICS}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'Deployment Metrics Clicked',
                        });
                    }}>Deployment Metrics
                </NavLink>
            </li>

            <li className="tab-list__tab">
                <NavLink activeClassName="active"
                    to={`${match.url}/${URLS.APP_CONFIG}`}
                    className="tab-list__tab-link flex" onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'App Configuration Clicked',
                        });
                    }}>
                    <Settings className="tab-list__icon icon-dim-16 fcn-9 mr-4" />
                    App Configuration
                </NavLink>
            </li>
            {/* commented for time being */}
            {/* <li className="tab-list__tab">
                    <NavLink activeClassName="active" to={`${url}/tests`} className="tab-list__tab-link">
                        Tests
                    </NavLink>
                </li> */}
        </ul>

    </div>
}
