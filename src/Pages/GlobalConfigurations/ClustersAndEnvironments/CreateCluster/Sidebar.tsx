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

import { generatePath, NavLink, useParams, useRouteMatch } from 'react-router-dom'

import { Icon, IconName, ModalSidebarPanel, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { DOCUMENTATION } from '@Config/constants'

import { SIDEBAR_CONFIG } from './constants'
import { CreateClusterParams } from './types'

const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')

const Sidebar = () => {
    const { path } = useRouteMatch()
    const { type } = useParams<CreateClusterParams>()

    const selectedSidebarElement = SIDEBAR_CONFIG[type]

    return (
        <div className="w-250 p-20 flexbox-col dc__gap-24 dc__no-shrink dc__overflow-auto">
            <div className="flexbox-col">
                {Object.entries(SIDEBAR_CONFIG).map(([key, { title, iconName, isEnterprise }]) => {
                    const isSelected = type.toLowerCase() === key.toLowerCase()

                    return (
                        <NavLink
                            key={key}
                            className={`dc__transparent flex left dc__gap-8 py-6 px-8 br-4 ${isSelected ? 'bcb-1' : 'dc__hover-n50'}`}
                            to={generatePath(path, { type: key })}
                        >
                            <span className="dc__fill-available-space dc__no-shrink icon-dim-16">
                                <Icon name={iconName as IconName} color={isSelected ? 'B500' : 'N600'} />
                            </span>

                            <span
                                className={`fs-13 lh-20 dc__truncate flex-grow-1 ${isSelected ? 'cb-5 fw-6' : 'cn-9'}`}
                            >
                                {title}
                            </span>

                            {isEnterprise && !isFELibAvailable && (
                                <Tooltip content="This is an enterprise only feature">
                                    <Icon name="ic-enterprise-feat" color="Y700" />
                                </Tooltip>
                            )}
                        </NavLink>
                    )
                })}
            </div>

            <div className="divider__secondary--horizontal" />

            <ModalSidebarPanel
                heading={selectedSidebarElement.documentationHeader ?? selectedSidebarElement.title}
                documentationLink={DOCUMENTATION.CLUSTER_AND_ENVIRONMENT}
                rootClassName="w-100 dc__no-background-imp"
            >
                <div className="flexbox-col dc__gap-24">{selectedSidebarElement.body}</div>
            </ModalSidebarPanel>
        </div>
    )
}

export default Sidebar
