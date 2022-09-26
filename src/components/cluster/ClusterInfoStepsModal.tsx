import React, { useState } from 'react'
import Tippy from '@tippyjs/react'
import { copyToClipboard } from '../common'
import 'tippy.js/themes/light.css'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import './cluster.scss'
import { ReactComponent as ClipboardIcon } from '../../assets/icons/ic-copy.svg'

export default function ClusterInfoStepsModal({
    subTitle,
    command,
    clusterName,
}: {
    subTitle: string
    command: string
    clusterName: string
}) {
    const [copied, setCopied] = useState(false)
    const copyClipboard = (e): void => {
        e.stopPropagation()
        setCopied(true)
        copyToClipboard(command)
    }

    return (
        <div>
            <div className="flex left fs-14 fw-6 p-12">
                <Help className="icon-dim-20 fcv-5 mr-12" />
                Get Server URL & Bearer token
            </div>
            <div className="fs-13 fw-4 bcn-1 pt-8 pb-8 pl-12 pr-12">{subTitle}</div>
            <div className="popup-body">
                <div className="p-12">
                    <div className="cluster-modal-wrapper ">
                        <div className="cluster-modal-number">1</div>
                        <div className="cluster-inner-container">
                            <div>
                                <span className="fw-6">Prerequisites:</span> kubectl and Jq should be installed
                            </div>
                        </div>
                    </div>
                    <div className="cluster-modal-wrapper ">
                        <div className="cluster-modal-number">2</div>
                        <div className="cluster-inner-container">
                            <div>Run below command on terminal to get server URI & bearer token</div>
                            <div className="dc__position-rel cluster-modal-container p-10 lh-20 mt-2 br-4">
                                <div className="fs-13 fw-4 h-100 dc__overflow-scroll" id="command-code">
                                    {command}
                                </div>
                                <Tippy
                                    className="default-tt p-4"
                                    arrow={false}
                                    placement="bottom"
                                    content={copied ? 'Copied!' : 'Copy'}
                                    trigger="mouseenter click"
                                    onShow={(_tippy) => {
                                        setTimeout(() => {
                                            _tippy.hide()
                                            setCopied(false)
                                        }, 5000)
                                    }}
                                    interactive={true}
                                >
                                    <div className="cluster-clipboard dc__position-abs cursor" onClick={copyClipboard}>
                                        <ClipboardIcon className="icon-dim-20" />
                                    </div>
                                </Tippy>
                            </div>
                        </div>
                    </div>
                    <div className="cluster-modal-wrapper ">
                        <div className="cluster-modal-number">3</div>
                        <div className="cluster-inner-container">
                            Copy & paste Server URL & Bearer token from command output
                        </div>
                    </div>
                    <div className="cluster-modal-wrapper ">
                        <div className="cluster-modal-number">4</div>
                        <div className="cluster-inner-container cluster-last-item">
                            Replace Local IP with public IP at which {clusterName} cluster api server is accessible
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-12 fs-13 fw-4">
                <a
                    href="https://docs.devtron.ai/getting-started/global-configurations/cluster-and-environments"
                    target="_blank"
                >
                    View documentation
                </a>
            </div>
        </div>
    )
}
