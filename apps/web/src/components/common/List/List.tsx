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

import React from 'react'
import { Toggle } from '@devtron-labs/devtron-fe-common-lib'
import arrowTriangle from '../../../assets/icons/appstatus/ic-chevron-down.svg'
import './list.scss'

const Logo = ({ src = '', style = {}, className = '', children = null }) => {
    return (
        <>
            {src && <img src={src} alt="" className={`list__logo ${className}`} style={style} />}
            {children}
        </>
    )
}

const Title = ({ title = '', subtitle = '', style = {}, className = '', tag = '', ...props }) => {
    return (
        <div className="flex column left">
            <div className={`list__title ${className}`}>
                {title} {tag && <span className="tag">{tag}</span>}
            </div>
            {subtitle && <div className={`list__subtitle ${className}`}>{subtitle}</div>}
        </div>
    )
}

const ListToggle = ({ onSelect, enabled = false }) => {
    return <Toggle onSelect={onSelect} selected={enabled} />
}

const DropDown = ({ className = '', style = {}, src = null, ...props }) => {
    if (React.isValidElement(src)) {
        return src
    }
    return <img {...props} src={src || arrowTriangle} alt="" className={`list__arrow ${className}`} style={style} />
}

List.Logo = Logo
List.Title = Title
List.Toggle = ListToggle
List.DropDown = DropDown

export default function List({ children = null, className = '', ...props }) {
    return (
        <div className={`compound-list ${className}`} {...props}>
            {children}
        </div>
    )
}
