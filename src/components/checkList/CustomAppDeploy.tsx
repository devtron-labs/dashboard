import React from 'react';
import { NavLink } from 'react-router-dom';
import { URLS, AppListConstants } from '../../config';
import Deploy from '../../assets/img/ic-checklist-app@2x.png';
import { DEPLOY_CHART_MESSAGING } from './constants';

interface CustomAppDeployType {
    parentClassName?: string;
    imageClassName?: string;
}

export default function CustomAppDeploy({ parentClassName, imageClassName }: CustomAppDeployType) {
    return (
        <div className={`bcn-0 mb-8 br-4 ${parentClassName}`}>
            <img className={`img-width pt-12 pl-16 ${imageClassName}`} src={Deploy} />
            <div className="pl-16 pr-16 pt-12 pb-12 fs-13">
                <div className="cn-9"> {DEPLOY_CHART_MESSAGING.CREATE_BUILT_DEPLOY}</div>
                <NavLink
                    to={`${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}/${AppListConstants.CREATE_DEVTRON_APP_URL}`}
                    className="dc__no-decor cb-5 fw-6"
                >
                    {DEPLOY_CHART_MESSAGING.CREATE_CUSTOM_APP}
                </NavLink>
            </div>
        </div>
    );
}
