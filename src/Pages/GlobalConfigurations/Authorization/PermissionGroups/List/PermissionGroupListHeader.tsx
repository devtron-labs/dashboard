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

import {
    useMainContext,
    InfoIconTippy,
    SearchBar,
    ButtonComponentType,
    ComponentSizeType,
    Button,
} from '@devtron-labs/devtron-fe-common-lib'
import { useRouteMatch } from 'react-router-dom'
import { DOCUMENTATION } from '../../../../../config'
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/ic-add.svg'
import { ReactComponent as ArrowSquareOut } from '../../../../../assets/icons/ic-arrow-square-out.svg'

import { PermissionGroupListHeaderProps } from './types'
import ExportPermissionGroupsToCsv from './ExportPermissionGroupsToCsv'

const PermissionGroupListHeader = ({
    disabled,
    handleSearch,
    initialSearchText,
    getDataToExport,
}: PermissionGroupListHeaderProps) => {
    const { path } = useRouteMatch()
    const { isSuperAdmin } = useMainContext()

    return (
        <div className="flex dc__content-space pl-20 pr-20">
            <div className="flex dc__gap-8">
                <h2 className="fs-16 lh-32 cn-9 fw-6 m-0">Permission Groups</h2>
                <InfoIconTippy
                    infoText="Permission groups allow you to easily manage user permissions by assigning desired permissions to a group and assigning these groups to users to provide all underlying permissions."
                    heading="Permission Groups"
                    additionalContent={
                        <div className="pl-12 pb-12">
                            <a
                                href={DOCUMENTATION.GLOBAL_CONFIG_GROUPS}
                                target="_blank"
                                rel="noreferrer noreferrer"
                                className="anchor flexbox flex-align-center fs-13 dc__gap-4"
                            >
                                View Documentation
                                <ArrowSquareOut className="icon-dim-14 scb-5" />
                            </a>
                        </div>
                    }
                    iconClassName="mw-20 icon-dim-20 fcn-6"
                />
            </div>
            <div className="flex dc__gap-8">
                <SearchBar
                    inputProps={{
                        placeholder: 'Search group',
                    }}
                    handleEnter={handleSearch}
                    initialSearchText={initialSearchText}
                />
                <Button
                    text="Create Group"
                    startIcon={<PlusIcon />}
                    component={ButtonComponentType.link}
                    linkProps={{
                        to: `${path}/add`,
                    }}
                    size={ComponentSizeType.medium}
                    dataTestId="add-permission-group-link"
                />
                {isSuperAdmin && (
                    <>
                        <div className="dc__divider h-20" />
                        <ExportPermissionGroupsToCsv disabled={disabled} getDataToExport={getDataToExport} />
                    </>
                )}
            </div>
        </div>
    )
}

export default PermissionGroupListHeader
