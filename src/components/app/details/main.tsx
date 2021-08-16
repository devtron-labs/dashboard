import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react';
import { Switch, Route, Redirect, NavLink } from 'react-router-dom';
import { ErrorBoundary, Progressing, BreadCrumb, useBreadcrumb, useAsync, showError, ClearIndicator, MultiValueRemove, VisibleModal, } from '../../common';
import { getAppListMin } from '../../../services/service';
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import { URLS } from '../../../config';
import AppSelector from '../../AppSelector'
import ReactGA from 'react-ga';
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg';
import AppConfig from './appConfig/AppConfig';
import './appDetails/appDetails.scss';
import './app.css';
import { ReactComponent as Info } from '../../../assets/icons/ic-info-outlined.svg';
import Tippy from '@tippyjs/react';
import { fetchAppMetaInfo } from '../service';
import Creatable from 'react-select/creatable'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';
import { components } from 'react-select';
import { ReactComponent as RedWarning } from '../../../assets/icons/ic-error-medium.svg';

const CreatableStyle = {
    multiValue: (base, state) => {
        return ({
            ...base,
            // border: validateEmail(state.data.value) ? `1px solid var(--N200)` : `1px solid var(--R500)`,
            borderRadius: `4px`,
            // background: validateEmail(state.data.value) ? 'white' : 'var(--R100)',
            height: '30px',
            margin: '0 8px 4px 0',
            padding: '1px',
            fontSize: '12px',
        })
    },
    control: (base, state) => ({
        ...base,
        border: state.isFocused ? '1px solid #06c' : '1px solid #d0d4d9', // default border color
        boxShadow: 'none', // no box-shadow
        minHeight: '72px',
    }),
}

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

const MultiValueContainer = ({ validator, ...props }) => {
    const { children, data, innerProps, selectProps } = props
    const { label, value } = data
    const isValidEmail = validator ? validator(value) : true
    return (
        <components.MultiValueContainer {...{ data, innerProps, selectProps }} >
            <div className={`flex fs-12 ml-4`}>
                {!isValidEmail && <RedWarning className="mr-4" />}
                <div className={`${isValidEmail ? 'cn-9' : 'cr-5'}`}>{label}</div>
            </div>
            {children[1]}
        </components.MultiValueContainer>
    );
};

export function AppHeader() {
    const { appId } = useParams<{ appId }>();
    const match = useRouteMatch();
    const history = useHistory();
    const location = useLocation();
    const currentPathname = useRef("");
    const [loading, result, error, reload] = useAsync(() => fetchAppMetaInfo(appId))
    const [showInfoModal, setShowModal] = useState(false)
    const [labelTags, setLabelTags] = useState<{ tags: OptionType[], inputTagValue: string, tagError: string }>({ tags: [], inputTagValue: '', tagError: '' })
    const [submitting, setSubmitting] = useState(false)


    useEffect(() => {
        // setLabelTags({ tags: [{ label: id, value: id }], inputTagValue: '', tagError: '' })
    })

    function validateTags(tag) {
        var re = /^[a-zA-Z0-9]+:[.*]$/;
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

    async function handleSubmit(e) {
        const validForm = validateForm()
        if (!validForm) {
            return
        }
        setSubmitting(true)
        const payload = {

        }
        try {
            return ' hi'
            // const { result } = await saveUser(payload)
            // if (id) {
            //     updateCallback(index, result)
            //     toast.success('Update successfully');
            // }
            // else {
            //     createCallback(result)
            //     toast.success('Saved Successfully');
            // }
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

    function handleInputChange(inputTagValue) {
        setLabelTags(tags => ({ ...tags, inputTagValue: inputTagValue, tagError: '' }))
    }

    const createOption = (label: string) => ({
        label,
        value: label,
    });

    const handleKeyDown = useCallback((event) => {
        let { tags, inputTagValue } = labelTags;
        inputTagValue = inputTagValue.trim();
        switch (event.key) {
            case 'Enter':
            case 'Tab':
            case ',':
            case ' ': // space
                if (inputTagValue) {
                    let newTag = inputTagValue.split(',').map((e) => { e = e.trim(); return createOption(e) });
                    setLabelTags({
                        inputTagValue: '',
                        tags: [...tags, ...newTag],
                        tagError: '',
                    });
                }
                if (event.key !== 'Tab') {
                    event.preventDefault();
                }
                break;
        }
    }, [labelTags])

    function handleCreatableBlur(e) {
        let { tags, inputTagValue } = labelTags
        labelTags.inputTagValue = inputTagValue.trim()
        if (!inputTagValue) return
        setLabelTags({
            inputTagValue: '',
            tags: [...tags, createOption(e.target.value)],
            tagError: '',
        });
    };

    function handleEmailChange(newValue: any, actionMeta: any) {
        setLabelTags(tags => ({ ...tags, tags: newValue || [], tagError: '' }))
    };

    return <div className="page-header" style={{ gridTemplateColumns: "unset" }}>
        <h1 className="m-0 fw-6 flex left fs-18 cn-9">
            <BreadCrumb breadcrumbs={breadcrumbs} />
            <div className="tab-list__info-icon" onClick={() => setShowModal(true)}><Info className="icon-dim-20 fcn-5" /></div>
            {/* <Tippy className="default-tt" arrow={false} content={result?.result.projectName}>
                <Info className="icon-dim-20 fcn-5" />
            </Tippy> */}
            {showInfoModal &&
                <VisibleModal className="app-status__material-modal">
                    <form >
                        <div className="modal__body  br-4 bcn-0 p-20">
                            <div className="modal__header">
                                <div className="fs-20 cn-9 fw-6 box-shadow">About</div>
                                <button type="button" className="transparent" onClick={() => setShowModal(false)}>
                                    <Close className="icon-dim-24" />
                                </button>
                            </div>
                            <div className="pt-12">
                                <div className="cn-6 fs-12 mb-2">App name</div>
                                <div className="cn-9 fs-14 mb-16">mrinalinin-test</div>
                            </div>
                            <div>
                                <div className="cn-6 fs-12 mb-2">Created on</div>
                                <div className="cn-9 fs-14 mb-16">Mon, 12 Jun 2019, 09:27 AM</div>
                            </div>
                            <div>
                                <div className="cn-6 fs-12 mb-2">Created by</div>
                                <div className="cn-9 fs-14 mb-16">Sam Billings</div>
                            </div>
                            <div>
                                <div className="cn-6 fs-12 mb-2">Project</div>
                                <div className="cn-9 fs-14 mb-16">Devtron demo</div>
                            </div>
                            <span className="form__label"> Tags (only key:value allowed)</span>
                            <Creatable
                                className={"create-app_tags"}
                                components={{
                                    DropdownIndicator: () => null,
                                    ClearIndicator,
                                    MultiValueRemove,
                                    MultiValueContainer: ({ ...props }) => <MultiValueContainer {...props} validator={validateTags} />,
                                    IndicatorSeparator: () => null,
                                    Menu: () => null,
                                }
                                }
                                styles={CreatableStyle}
                                autoFocus
                                isMulti
                                isClearable
                                inputValue={labelTags.inputTagValue}
                                placeholder="Add a tag..."
                                isValidNewOption={() => false}
                                backspaceRemovesValue
                                value={labelTags.tags}
                                onBlur={handleCreatableBlur}
                                onInputChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onChange={handleEmailChange}
                            />
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
