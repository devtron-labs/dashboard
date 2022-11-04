import React from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { URLS } from '../../../config'
import { ReactComponent as ErrorInfo } from '../../../assets/icons/misc/errorInfo.svg'
import { AppDetails } from '../../v2/appDetails/appDetails.type'

function ErrorBar({ appDetails }: { appDetails: AppDetails }) {
    let isImagePullBackOff = false
    for (let index = 0; index < appDetails.resourceTree.nodes.length; index++) {
        const node = appDetails.resourceTree.nodes[index]
        if (node.info?.length) {
            for (let index = 0; index < node.info.length; index++) {
                const info = node.info[index]
                if (info.value.toLowerCase() === 'errimagepull' || info.value.toLowerCase() === 'imagepullbackoff') {
                    isImagePullBackOff = true
                    break
                }
            }
            if (isImagePullBackOff) break
        }
    }

    return (
        appDetails && isImagePullBackOff && !appDetails?.externalCi && (
            <div className="er-2 bw-1 br-4 m-20 fs-13">
                <div className="bcr-1 pl-12 pr-12 pt-8 pb-8 dc__border-bottom-r2 flex left">
                    <ErrorInfo className="icon-dim-24 mr-8" /> <span className="mr-8">IMAGEPULLBACKOFF:</span>
                    {!appDetails.ipsAccessProvided ? (
                        <div>
                            '{appDetails.clusterName}' cluster does not have permission to pull container image from ‘
                            {appDetails.dockerRegistryId}’ registry.
                        </div>
                    ) : (
                        <div>
                            {appDetails.clusterName} cluster could not pull container image from
                            {appDetails.dockerRegistryId}’ registry.
                        </div>
                    )}
                </div>
                {!appDetails.ipsAccessProvided ? (
                    <div className="pl-12 pr-12 pt-8 pb-8">
                        <div className="fw-6">How to resolve? </div>
                        1. Allow '{appDetails.clusterName}' cluster to access credentials for ‘
                        {appDetails.dockerRegistryId}’ registry and deploy again. <br />
                        2. Redeploy the application after allowing access
                        <span className="flex left">
                            <NavLink
                                to={`${URLS.GLOBAL_CONFIG_DOCKER}/${appDetails.dockerRegistryId}`}
                                className="cb-5 fs-13 anchor w-auto dc__no-decor flex"
                            >
                                Manage access&nbsp;&nbsp;
                            </NavLink>
                            {/* <NavLink
                                to={`${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}`}
                                className="cb-5 fs-13 anchor w-auto dc__no-decor flex ml-8"
                                target="_blank"
                            >
                                View Documentation&nbsp;
                            </NavLink> */}
                        </span>
                    </div>
                ) : (
                    <div className="pl-12 pr-12 pt-8 pb-8">
                        <div className="fw-6">How to resolve? </div>
                        1. Provided credentials may not have permission to pull image from ‘
                        {appDetails.dockerRegistryId}’ registry. <br />
                        2. Provided credentials may be invalid.
                        <div className="mt-16 flex left">
                            <span className="mr-8 fw-6">Already provided permission?</span>
                            Redeploy the application
                            <a
                                className="cb-5 fs-13 anchor w-auto dc__no-decor flex"
                                target="_blank"
                                href={`app/${appDetails.appId}/edit/workflow`}
                            >
                                Go to Deploy&nbsp;&nbsp;
                            </a>
                        </div>
                        <div className="flex left">
                            <span className="mr-8 fw-6">Facing issues??</span>
                            <NavLink
                                to={`${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}`}
                                className="cb-5 fs-13 anchor w-auto dc__no-decor flex ml-8"
                                target="_blank"
                            >
                                Chat with support&nbsp;
                            </NavLink>
                        </div>
                    </div>
                )}
            </div>
        )
    )
}

export default ErrorBar
