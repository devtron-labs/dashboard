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

import { SearchBar, InfoIconTippy, useMainContext } from '@devtron-labs/devtron-fe-common-lib'
import { Link, useRouteMatch } from 'react-router-dom'
import { DOCUMENTATION } from '../../../../../config'
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/ic-add.svg'
import { ReactComponent as ArrowSquareOut } from '../../../../../assets/icons/ic-arrow-square-out.svg'

import { UserPermissionListHeaderProps } from './types'
import ExportUserPermissionsToCsv from './ExportUserPermissionsToCsv'
import { importComponentFromFELibrary } from '../../../../../components/common'

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
        <div className="flex dc__content-space pl-20 pr-20">
            <div className="flex dc__gap-8">
                <h2 className="fs-16 lh-32 cn-9 fw-6 m-0">User Permissions</h2>
                <InfoIconTippy
                    infoText="Manage your organization's users and their permissions."
                    heading="User Permissions"
                    additionalContent={
                        <div className="pl-12 pb-12">
                            <a
                                href={DOCUMENTATION.GLOBAL_CONFIG_USER}
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
                        placeholder: 'Search user',
                    }}
                    handleEnter={handleSearch}
                    initialSearchText={initialSearchText}
                />
                {showStatus && <StatusFilterDropdown value={status} onChange={handleStatusFilterChange} />}
                <div className="dc__divider h-20" />
                <Link to={`${path}/add`} type="button" className="cta anchor flex dc__gap-6 h-32">
                    <PlusIcon className="icon-dim-14 mw-14" />
                    Add Users
                </Link>
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
