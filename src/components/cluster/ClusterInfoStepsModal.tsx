/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react'
import Tippy from '@tippyjs/react'
import { copyToClipboard, noop } from '@devtron-labs/devtron-fe-common-lib'
import 'tippy.js/themes/light.css'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import './cluster.scss'
import { ReactComponent as ClipboardIcon } from '../../assets/icons/ic-copy.svg'
import { ClusterStepModal } from './cluster.type'
import { DOCUMENTATION } from '../../config'

const ClusterInfoSteps = ({ command, clusterName }: ClusterStepModal) => {
    const [copied, setCopied] = useState(false)
    const copyClipboard = (e): void => {
        e.stopPropagation()
        copyToClipboard(command).then(() => {
            setCopied(true)
        }).catch(noop)
    }
    const infoItems = [
        {
            additionalInfo: (
                <div>
                    <span className="fw-6">Prerequisites:</span> kubectl should be installed
                </div>
            ),
        },
        {
            info: 'Run below command on terminal to get server URI & bearer token',
            additionalInfo: (
                <div className="dc__position-rel cluster-modal-container dc__align-left bcn-1 lh-20 mt-2 br-4">
                    <div
                        className="fs-13 fw-4 h-100 dc__overflow-auto mono pl-10 pt-10 pb-10 pr-36"
                        id="command-code"
                    >
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
                        interactive
                    >
                        <div className="cluster-clipboard dc__position-abs cursor" onClick={copyClipboard}>
                            <ClipboardIcon className="icon-dim-16" />
                        </div>
                    </Tippy>
                </div>
            ),
        },
        {
            info: 'Copy & paste Server URL & Bearer token from command output',
        },
        {
            info: `Replace Local IP with public IP at which ${clusterName} cluster api server is accessible`,
        },
    ]

    return (
        <div className="p-12 fs-13 fw-4">
            {infoItems.map((item, key) => (
                <div className="cluster-modal-wrapper ">
                    <div className="cluster-modal-number flex mr-16 bw-1 bg__primary en-2 icon-dim-24">{key + 1}</div>
                    <div className="cluster-inner-container flexbox-col dc__border-left pt-2 pr-44 pb-20 pl-28 lh-20 dc__align-start dc__content-start">
                        {item.info && <div>{item.info}</div>}
                        {item.additionalInfo && item.additionalInfo}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function ClusterInfoStepsModal({ subTitle, command, clusterName }: ClusterStepModal) {
    return (
        <div className="fs-13 fw-4 br-4 en-2 bg__primary cluster-modal-shadow">
            <h2 className="flex left fs-14 fw-6 p-12 m-0">
                <Help className="icon-dim-20 fcv-5 mr-12" />
                Get Server URL & Bearer token
            </h2>
            {subTitle && <p className="bcn-1 pt-8 pb-8 pl-12 pr-12 m-0">{subTitle}</p>}
            <ClusterInfoSteps subTitle={subTitle} command={command} clusterName={clusterName} />
            <div className="p-12">
                <a href={DOCUMENTATION.GLOBAL_CONFIG_CLUSTER} target="_blank" rel="noreferrer">
                    View documentation
                </a>
            </div>
        </div>
    )
}
