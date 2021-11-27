import Tippy from '@tippyjs/react';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, match } from 'react-router-dom';
import { handleInputChange } from 'react-select/src/utils';
import { URLS } from '../../../config';
import { BreadCrumb, Info, showError, useBreadcrumb, VisibleModal } from '../../common';
import ReactGA from 'react-ga';
import { getAppListMin } from '../../../services/service';
import AppSelector from '../../AppSelector';
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import { getAppMetaInfo } from '../../app/service';
import { OptionType } from './appHeader.type'
import { useSharedState } from '../utils/useSharedState';
import IndexStore from '../appDetails/index.store';

function AppHeaderComponent() {
    const { appId } = useParams<{ appId }>();
    const match = useRouteMatch();
    const history = useHistory();
    const location = useLocation();
    const [showInfoModal, setShowInfoModal] = useState(false)
    const currentPathname = useRef("");
    const [result, setResult] = useState(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const [labelTags, setLabelTags] = useState<{ tags: OptionType[], inputTagValue: string, tagError: string }>({ tags: [], inputTagValue: '', tagError: '' })
    const params = useParams<{ appId: string}>()
    const [ envDetails ] = useSharedState(IndexStore.getEnvDetails(), IndexStore.getEnvDetailsObservable())

    const getAppMetaInfoRes = () => {
        setIsLoading(true)
        const res = getAppMetaInfo(appId).then((_result) => {
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

    // useEffect(() => {
    //     try {
    //         getAppMetaInfoRes()
    //     }
    //     catch (err) {
    //         showError(err)
    //     }
    // }, [appId])

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

    return (
        <div className="page-header pt-12" style={{ gridTemplateColumns: "unset" }}>
        <h1 className="m-0 fw-6 flex left fs-18 cn-9">
            <BreadCrumb breadcrumbs={breadcrumbs} />
            {/* <div className="tab-list__info-icon ml-4 cursor" onClick={() => { return setShowInfoModal(true), getAppMetaInfoRes() }}>
                <Tippy className="default-tt " arrow={false} content={'About app'}>
                    <Info className="icon-dim-20 fcn-5" />
                </Tippy>
            </div> */}
            {/* {showInfoModal && 
                <VisibleModal className="app-status__material-modal"  >
                    <div className="modal__body br-8 bcn-0 p-20">
                        {/* <AboutAppInfoModal
                            appMetaResult={result?.result}
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
                </VisibleModal>}
                */}
        </h1>

        <ul role="tablist" className="tab-list">
            <li className="tab-list__tab ellipsis-right">
                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_DETAILS}/${envDetails.envId}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'App Details Clicked',
                        });
                    }}>App Details
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_VALUES}/${envDetails.envId}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'Trigger Clicked',
                        });
                    }}>Values
                </NavLink>
            </li>
        </ul>
    </div>
    )
}

export default AppHeaderComponent
