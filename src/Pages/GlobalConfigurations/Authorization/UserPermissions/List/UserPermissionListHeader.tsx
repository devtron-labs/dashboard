import React from 'react'
import {
    SearchBar,
    TippyCustomized,
    TippyTheme,
    TippyCustomizedProps,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link, useRouteMatch } from 'react-router-dom'
import { DOCUMENTATION } from '../../../../../config'
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/ic-add.svg'
import { ReactComponent as HelpOutlineIcon } from '../../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as HelpIcon } from '../../../../../assets/icons/ic-help.svg'
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
                <TippyCustomized
                    theme={TippyTheme.white}
                    className="w-300 h-100 dc__align-left"
                    placement="right"
                    Icon={HelpIcon as TippyCustomizedProps['Icon']}
                    iconClass="fcv-5"
                    infoText="Manage your organization's users and their permissions."
                    heading="User Permissions"
                    showCloseButton
                    trigger="click"
                    interactive
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
                >
                    <div className="flex">
                        <HelpOutlineIcon className="mw-20 icon-dim-20 fcn-6 cursor" />
                    </div>
                </TippyCustomized>
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
