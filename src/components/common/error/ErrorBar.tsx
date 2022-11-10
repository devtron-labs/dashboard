import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AppDetailsErrorType, URLS } from '../../../config'
import { ReactComponent as ErrorInfo } from '../../../assets/icons/misc/errorInfo.svg'
import { ErrorBarType } from './errorType'
import { renderErrorHeaderMessage } from './error.utils'

export default function ErrorBar({ appDetails }: ErrorBarType) {
    const [isImagePullBackOff, setIsImagePullBackOff] = useState(false)

    useEffect(() => {
        for (let index = 0; index < appDetails.resourceTree?.nodes?.length; index++) {
            const node = appDetails.resourceTree.nodes[index]
            if (node.info?.length) {
                for (let index = 0; index < node.info.length; index++) {
                    const info = node.info[index]
                    if (
                        info.value.toLowerCase() === AppDetailsErrorType.ERRIMAGEPULL ||
                        info.value.toLowerCase() === AppDetailsErrorType.IMAGEPULLBACKOFF
                    ) {
                        setIsImagePullBackOff(true)
                        break
                    }
                }
                if (isImagePullBackOff) break
            }
        }
    }, [appDetails])

    if (!appDetails || !appDetails.resourceTree || !appDetails.resourceTree.nodes || appDetails.externalCi) {
        return null
    }

    return (
        isImagePullBackOff && (
            <div className="er-2 bw-1 br-4 m-20 fs-13">
                <div className="bcr-1 pl-12 pr-12 pt-8 pb-8 dc__border-bottom-r2 flex left">
                    <ErrorInfo className="icon-dim-24 mr-8" /> <span className="mr-8">IMAGEPULLBACKOFF:</span>
                    {renderErrorHeaderMessage(appDetails, 'error-bar')}
                </div>
                {!appDetails.ipsAccessProvided ? (
                    <div className="pl-12 pr-12 pt-8 pb-8">
                        <div className="fw-6">How to resolve? </div>
                        <div className="flex left">
                            1. Allow '{appDetails.clusterName}' cluster to access credentials for ‘
                            {appDetails.dockerRegistryId}’ registry and deploy again.
                            <br />
                            <NavLink
                                to={`${URLS.GLOBAL_CONFIG_DOCKER}/${appDetails.dockerRegistryId}`}
                                className="cb-5 fs-13 anchor w-auto dc__no-decor flex ml-8"
                            >
                                Manage access&nbsp;&nbsp;
                            </NavLink>
                        </div>
                        2. Redeploy the application after allowing access
                        <span className="flex left">
                            {/* Will add document link once available */}
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
                    <>
                        <div className="pl-12 pr-12 pt-8 pb-8">
                            <div className="fw-6">Possible issues? </div>
                            1. Provided credentials may not have permission to pull image from ‘
                            {appDetails.dockerRegistryId}’ registry. <br />
                            2. Provided credentials may be invalid.
                        </div>
                        <div className="pl-12 pr-12 pt-8 pb-8" style={{ background: 'var(--N50)' }}>
                            <div className="flex left">
                                <span className="mr-8 fw-6">Already provided permission?</span>
                                Redeploy the application.
                                <NavLink
                                    to={`/app/${appDetails.appId}/${URLS.APP_TRIGGER}`}
                                    className="cb-5 fs-13 anchor w-auto dc__no-decor flex"
                                >
                                    &nbsp; Go to Deploy
                                </NavLink>
                            </div>
                            <div className="flex left">
                                <span className="mr-8 fw-6">Facing issues?</span>
                                <a
                                    href="https://discord.devtron.ai/"
                                    className="cb-5 fs-13 anchor w-auto dc__no-decor flex"
                                    target="_blank"
                                >
                                    Chat with support
                                </a>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )
    )
}
