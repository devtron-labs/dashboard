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

import React, { useState } from 'react'
import { not } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Sort } from '../../../../assets/icons/misc/sort-up.svg'

interface ListInterface {
    collapsible?: boolean
    children?: any
    className?: string
}

interface ListComposition {
    Icon?: React.FC<any>
    Body?: React.FC<any>
    Detail?: React.FC<any>
}

const ListContext = React.createContext(null)

function useListContext() {
    const context = React.useContext(ListContext)
    if (!context) {
        throw new Error(`List compound components cannot be rendered outside the List component`)
    }
    return context
}

const List: React.FC<ListInterface> & ListComposition = ({ children, collapsible = false, ...props }) => {
    const [collapsed, toggleCollapsed] = useState(true)
    function handleClick(e) {
        e.stopPropagation()
        if (collapsible) {
            toggleCollapsed(not)
        }
    }
    return (
        <ListContext.Provider value={{ collapsed }}>
            <article
                {...props}
                onClick={handleClick}
                className={`${props.className || ''} ${collapsible ? 'collapsible' : 'not-collapsible'}`}
            >
                {collapsible && (
                    <Sort className="rotate" style={{ ['--rotateBy' as any]: collapsed ? '90deg' : '180deg' }} />
                )}
                {children}
            </article>
        </ListContext.Provider>
    )
}
List.Icon = ({ src = null, children = null, ...props }) => {
    return (
        <>
            {src && <img src={src} {...props} />}
            {children}
        </>
    )
}

List.Body = function ({ children = null }) {
    return children
}

const Detail = ({ children = null }) => {
    const { collapsed } = useListContext()
    return collapsed ? null : children
}

List.Detail = Detail
export default List
