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

import { useRouteMatch } from 'react-router-dom'

import {
    Button,
    ButtonComponentType,
    ComponentSizeType,
    FeatureTitleWithInfo,
    SearchBar,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as PlusIcon } from '../../../../../assets/icons/ic-add.svg'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { DOCUMENTATION } from '../../../../../config'
import ExportUserPermissionsToCsv from './ExportUserPermissionsToCsv'
import { UserPermissionListHeaderProps } from './types'

const StatusFilterDropdown = importComponentFromFELibrary('StatusFilterDropdown', null, 'function')

const UserPermissionListHeader = ({
    disabled,
    showStatus,
    handleSearch,
    initialSearchText,
    getDataToExport,
    handleStatusFilterChange,
    status,
}: UserPermissionListHeaderProps) => {
    const { path } = useRouteMatch()
    const { isSuperAdmin } = useMainContext()

    return (
        <div className="flex dc__content-space px-20 dc__zi-2 pt-16">
            <div className="flex dc__gap-8">
                <FeatureTitleWithInfo
                    title="User Permissions"
                    renderDescriptionContent={() =>
                        "Manage your organization's users and their permissions. You can assign users to permission groups to provide all underlying permissions."
                    }
                    docLink={DOCUMENTATION.GLOBAL_CONFIG_USER}
                    showInfoIconTippy
                />
            </div>
            <div className="flex dc__gap-8">
                <SearchBar
                    inputProps={{
                        placeholder: 'Search user',
                    }}
                    handleEnter={handleSearch}
                    initialSearchText={initialSearchText}
                />
                {showStatus && <StatusFilterDropdown value={status} onChange={handleStatusFilterChange} />}
                <div className="dc__divider h-20" />
                <Button
                    text="Add Users"
                    startIcon={<PlusIcon />}
                    component={ButtonComponentType.link}
                    linkProps={{
                        to: `${path}/add`,
                    }}
                    size={ComponentSizeType.medium}
                    dataTestId="add-users-link"
                />
                {isSuperAdmin && (
                    <>
                        <div className="dc__divider h-20" />
                        <ExportUserPermissionsToCsv disabled={disabled} getDataToExport={getDataToExport} />
                    </>
                )}
            </div>
        </div>
    )
}

export default UserPermissionListHeader
