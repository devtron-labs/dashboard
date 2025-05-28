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

import { ModalSidebarPanel } from '@devtron-labs/devtron-fe-common-lib'

import { DOCUMENTATION } from '@Config/constants'

import { CreationMethodType, SidebarProps } from './types'

const Sidebar = ({
    selectedCreationMethod,
    handleCreationMethodChange,
    createMethodConfig,
    isJobView,
}: SidebarProps) => {
    const getHandleCreationMethodChange = (creationMethod: CreationMethodType) => () => {
        handleCreationMethodChange(creationMethod)
    }

    return (
        <div className="w-250 p-20 flexbox-col dc__gap-24 dc__no-shrink dc__overflow-auto">
            <div className="flexbox-col">
                {createMethodConfig.map(({ label, value, startIcon }) => {
                    const isSelected = value === selectedCreationMethod

                    return (
                        <button
                            className={`dc__transparent flex left dc__gap-8 py-6 px-8 br-4 ${isSelected ? 'bcb-1' : 'dc__hover-n50'}`}
                            key={value}
                            aria-label={`Creation method: ${label}`}
                            type="button"
                            onClick={getHandleCreationMethodChange(value)}
                        >
                            <span className="dc__fill-available-space dc__no-shrink icon-dim-16">{startIcon}</span>
                            <span className={`fs-13 lh-20 dc__truncate ${isSelected ? 'cb-5 fw-6' : 'cn-9'}`}>
                                {label}
                            </span>
                        </button>
                    )
                })}
            </div>
            {!isJobView && (
                <>
                    <div className="divider__secondary--horizontal" />
                    <ModalSidebarPanel
                        heading={null}
                        documentationLink={DOCUMENTATION.APP_CREATE}
                        rootClassName="w-100 dc__no-background-imp"
                    >
                        <div className="flexbox-col dc__gap-24">
                            <p className="m-0">
                                In Devtron, an &quot;Application&quot; represents your software project or service.
                            </p>
                            <p className="m-0">
                                It serves as a container for your deployment configurations, environments, and other
                                settings. Define your application to start managing and monitoring its deployment
                                efficiently.
                            </p>
                            <p className="m-0">
                                Applications are not environment specific and can be deployed to multiple environments.
                            </p>
                        </div>
                    </ModalSidebarPanel>
                </>
            )}
        </div>
    )
}

export default Sidebar
