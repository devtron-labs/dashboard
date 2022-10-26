import React from 'react'
import { NavLink } from 'react-router-dom'
import { URLS } from '../../../config'
import { ReactComponent as ErrorInfo } from '../../../assets/icons/misc/errorInfo.svg';

function ErrorBar() {
    return (
        <div className="er-2 bw-1 br-4 m-20 fs-13">
            <div className="bcr-1 pl-12 pr-12 pt-8 pb-8 dc__border-bottom-r2 flex left">
              <ErrorInfo className='icon-dim-24 mr-8'/>  IMAGEPULLBACKOFF: ‘demo’ cluster does not have permission to pull container image from ‘devtron-quay’
                registry.
            </div>
            <div className="pl-12 pr-12 pt-8 pb-8">
                <span className="fw-6">How to resolve? </span> Allow ‘demo’ cluster to access credentials for
                ‘devtron-quay’ registry and deploy again.

            <span className='flex left'>
                <NavLink
                    to={`${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}`}
                    className="cb-5 fs-13 anchor w-auto dc__no-decor flex dc__border-right"
                    target="_blank"
                >
                    Manage access&nbsp;&nbsp;
                </NavLink>
                <NavLink
                    to={`${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}`}
                    className="cb-5 fs-13 anchor w-auto dc__no-decor flex ml-8"
                    target="_blank"
                >
                    View Documentation&nbsp;
                </NavLink>
            </span>
            </div>
        </div>
    )
}

export default ErrorBar
