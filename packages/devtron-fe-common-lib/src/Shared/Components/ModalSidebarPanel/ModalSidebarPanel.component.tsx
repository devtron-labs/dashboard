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

import { ReactComponent as ArrowOut } from '../../../Assets/Icon/ic-arrow-square-out.svg'
import { ModalSidebarPanelProps } from './types'

const ModalSidebarPanel = ({
    rootClassName = '',
    heading,
    icon,
    children,
    documentationLink,
}: ModalSidebarPanelProps) => (
    <div className={`flexbox-col w-250 dc__gap-24 dc__modal-gradient ${rootClassName}`}>
        <div className="flexbox-col dc__gap-12">
            <div className="flexbox-col dc__gap-4">
                {icon && icon}
                <h3 className="fs-18 fw-6 cn-9 lh-1-5 m-0">{heading}</h3>
            </div>
            {children && <div className="fs-13 fw-4 lh-1-5 cn-7">{children}</div>}
        </div>
        <div className="flexbox-col dc__gap-4">
            <span className="fs-13 fw-6 lh-20 cn-9">📙 Need help?</span>
            <a
                href={documentationLink}
                target="_blank"
                className="dc__no-decor flexbox dc__align-items-center dc__gap-4"
                rel="noreferrer"
            >
                <span className="fs-13 fw-6 lh-20 cb-5">View documentation</span>
                <ArrowOut className="scb-5 icon-dim-14" />
            </a>
        </div>
    </div>
)

export default ModalSidebarPanel
