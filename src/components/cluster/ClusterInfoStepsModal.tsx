import React, { useState } from 'react'
import Tippy from '@tippyjs/react'
import { copyToClipboard } from '../common'
import 'tippy.js/themes/light.css'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import './cluster.scss'
import { ReactComponent as ClipboardIcon } from '../../assets/icons/ic-copy.svg'
import { ClusterStepModal } from './cluster.type'

export default function ClusterInfoStepsModal({ subTitle, command, clusterName }: ClusterStepModal) {
    const [copied, setCopied] = useState(false)
    const copyClipboard = (e): void => {
        e.stopPropagation()
        setCopied(true)
        copyToClipboard(command)
    }

    const infoItems = [
        {
            value: (
                <div>
                    <span className="fw-6">Prerequisites:</span> kubectl and Jq should be installed
                </div>
            ),
        },
        {
            value: (
                <>
                    <div>Run below command on terminal to get server URI & bearer token</div>
                    <div className="dc__position-rel cluster-modal-container dc__align-left bcn-1 p-10 lh-20 mt-2 br-4">
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
                </>
            ),
        },
        {
            value: 'Copy & paste Server URL & Bearer token from command output',
        },
        {
            value: `Replace Local IP with public IP at which ${clusterName} cluster api server is accessible`,
        },
    ]

    return (
        <div className='fs-13 fw-4'>
            <h2 className="flex left fs-14 fw-6 p-12 m-0">
                <Help className="icon-dim-20 fcv-5 mr-12" />
                Get Server URL & Bearer token
            </h2>
            <p className="bcn-1 pt-8 pb-8 pl-12 pr-12 m-0">{subTitle}</p>
            <p className="m-0">
                <div className="p-12 fs-13 fw-4">
                    {infoItems.map((item, key) => (
                        <div className="cluster-modal-wrapper ">
                            <div className="cluster-modal-number flex mr-16 bw-1 bcn-0 en-2 icon-dim-24">{key + 1}</div>
                            <div
                                className={`cluster-inner-container flexbox-col dc__border-left pt-2 pr-44 pb-20 pl-28 lh-20 dc__align-start dc__content-start ${
                                    infoItems.length === key + 1 ? 'cluster-last-item' : ''
                                }`}
                            >
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </p>
            <div className="p-12">
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
