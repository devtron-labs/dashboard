import React from 'react'
import { InfoIconTippy, SearchBar } from '@devtron-labs/devtron-fe-common-lib'
import { Link, useRouteMatch } from 'react-router-dom'
import { DOCUMENTATION } from '../../../../../config'
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/ic-add.svg'
import { ReactComponent as ArrowSquareOut } from '../../../../../assets/icons/ic-arrow-square-out.svg'

import { PermissionGroupListHeaderProps } from './types'
import { useMainContext } from '../../../../../components/common/navigation/NavigationRoutes'
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
                    iconClass="fcv-5"
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
                    className="mw-20 icon-dim-20 fcn-6"
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
                <Link to={`${path}/add`} type="button" className="cta anchor flex dc__gap-6 h-32">
                    <PlusIcon className="icon-dim-14 mw-14" />
                    Create Group
                </Link>
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
