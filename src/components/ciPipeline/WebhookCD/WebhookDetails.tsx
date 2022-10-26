import React, { useEffect, useRef } from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ButtonWithLoader, Drawer, VisibleModal } from '../../common'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as CopyIcon } from '../../../assets/icons/ic-copy.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as BotIcon } from '../../../assets/icons/ic-bot.svg'
import { ReactComponent as PersonIcon } from '../../../assets/icons/ic-person.svg'
import InfoColourBar from '../../common/infocolourBar/InfoColourbar'
import { CIPipelineType } from '../types'
import './webhookDetails.scss'

export function WebhookDetails({ appName, connectCDPipelines, getWorkflows, close, deleteWorkflow }: CIPipelineType) {
    const appStatusDetailRef = useRef<HTMLDivElement>(null)
    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof close === 'function') {
            evt.preventDefault()
            close()
        }
    }
    const outsideClickHandler = (evt): void => {
        if (
            appStatusDetailRef.current &&
            !appStatusDetailRef.current.contains(evt.target) &&
            typeof close === 'function'
        ) {
            close()
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', escKeyPressHandler)
        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
        }
    }, [escKeyPressHandler])

    // useEffect(() => {
    //     document.addEventListener('click', outsideClickHandler)
    //     return (): void => {
    //         document.removeEventListener('click', outsideClickHandler)
    //     }
    // }, [outsideClickHandler])
    return (
        <Drawer position="right" width="1000px">
            <div className="dc__window-bg h-100 webhook-details-container" ref={appStatusDetailRef}>
                <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pr-20">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Deploy image from external source</h2>
                    <button
                        type="button"
                        className="dc__transparent flex icon-dim-24"
                        onClick={() => {
                            close()
                        }}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div className="p-20">
                    <div className="bcn-0 p-16 mb-16 br-4 bw-1 en-2">
                        <InfoColourBar
                            message="Authentication via API token is required to allow requests from an external service."
                            classname="info_bar mb-16"
                            Icon={InfoIcon}
                            iconClass="h-20"
                        />
                        <div className="fw-6 fs-13 cn-9 pb-16">
                            Use API token with below permissions in the cURL request
                        </div>
                        <div className="permission-row dc__border-bottom">
                          <span>Project</span>
                          <span>Environment</span>
                          <span>Application</span>
                          <span>Role</span>
                        </div>
                        <div className="permission-row">
                          <span>demo</span>
                          <span>demo-devtroncd</span>
                          <span>first-app</span>
                          <span>Build and deploy</span>
                        </div>
                    </div>
                    <div className="bcn-0 p-16 mb-16 br-4 bw-1 en-2">
                        <InfoColourBar
                            message="Authentication via API token is required to allow requests from an external service."
                            classname="info_bar mb-16"
                            Icon={InfoIcon}
                            iconClass="h-20"
                        />
                        <div className="fw-6 fs-13 cn-9 pb-16">
                            Use API token with below permissions in the cURL request
                        </div>
                    </div>
                    <div className="bcn-0 p-16 mb-16 br-4 bw-1 en-2">
                        <InfoColourBar
                            message="Authentication via API token is required to allow requests from an external service."
                            classname="info_bar mb-16"
                            Icon={InfoIcon}
                            iconClass="h-20"
                        />
                        <div className="fw-6 fs-13 cn-9 pb-16">
                            Use API token with below permissions in the cURL request
                        </div>
                    </div>
                </div>
                <div
                    className="dc__border-top flex flex-align-center flex-justify bcn-0 pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0"
                    style={{ width: '1000px' }}
                >
                    <div className="flexbox pt-8 pb-8">
                        <Help className="icon-dim-20 fcv-5 mr-8" />
                        <span>
                            Only super admin users can generate API tokens. Share the webhook details with a super admin
                            user.
                        </span>
                    </div>
                    <button className="cta flex h-36">
                        <CopyIcon className="icon-dim-20 mr-8" />
                        Copy shareable link
                    </button>
                </div>
            </div>
        </Drawer>
    )
}
