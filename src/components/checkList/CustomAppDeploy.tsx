import React from 'react';
import { NavLink } from 'react-router-dom';
import { URLS, AppListConstants } from '../../config';
import Deploy from '../../assets/img/ic-checklist-app@2x.png';

interface CustomAppDeployType {
    parentClassName?: string;
}

export default function CustomAppDeploy({ parentClassName }: CustomAppDeployType) {
    return (
        <div className={`bcn-0 mb-8 br-4 ${parentClassName}`}>
            <img className="img-width pt-12 pb-12 pl-16" src={Deploy} />
            <div className="pl-20 fs-13">
                <div className="pt-16 cn-9"> Create, build and deploy a custom application.</div>
                <NavLink
                    to={`${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}/${AppListConstants.CREATE_DEVTRON_APP_URL}`}
                    className="no-decor cb-5 fw-6"
                >
                    Create Custom App
                </NavLink>
            </div>
        </div>
    );
}
