import React, { useState, useEffect } from 'react'
import { ReactComponent as DropDownIcon } from '../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as AlertTriangle } from '../../../assets/icons/ic-alert-triangle.svg'
import IndexStore from './index.store'
import { renderErrorHeaderMessage } from '../../common/error/error.utils'
import { AppType, SyncErrorType } from './appDetails.type'
import { AppDetailsErrorType } from '../../../config'
import { not } from '@devtron-labs/devtron-fe-common-lib'

const SyncErrorComponent: React.FC<SyncErrorType> = ({ appStreamData, showApplicationDetailedModal }) => {
    const [collapsed, toggleCollapsed] = useState<boolean>(true)
    const [isImagePullBackOff, setIsImagePullBackOff] = useState(false)
    const appDetails = IndexStore.getAppDetails()
    const conditions = appStreamData?.result?.application?.status?.conditions || []

    useEffect(() => {
        if (appDetails.appType === AppType.DEVTRON_APP && appDetails.resourceTree?.nodes?.length) {
            for (let index = 0; index < appDetails.resourceTree.nodes.length; index++) {
                const node = appDetails.resourceTree.nodes[index]
                let _isImagePullBackOff = false
                if (node.info?.length) {
                    for (let index = 0; index < node.info.length; index++) {
                        const info = node.info[index]
                        if (
                            info.value &&
                            (info.value.toLowerCase() === AppDetailsErrorType.ERRIMAGEPULL ||
                                info.value.toLowerCase() === AppDetailsErrorType.IMAGEPULLBACKOFF)
                        ) {
                            _isImagePullBackOff = true
                            break
                        }
                    }

                    if (_isImagePullBackOff) {
                        setIsImagePullBackOff(true)
                        break
                    }
                }
            }
        }
    }, [appDetails])

    if (!appDetails || (conditions.length === 0 && !isImagePullBackOff)) {
        return null
    }

    const toggleErrorHeader = () => {
        toggleCollapsed(not)
    }

    return (
        <div className="top flex left column w-100 bcr-1 pl-20 pr-20 fs-13">
            <div className="flex left w-100 cursor h-56" onClick={toggleErrorHeader}>
                <AlertTriangle className="icon-dim-20 mr-8" />
                <span className="cr-5 fs-14 fw-6">
                    {conditions.length + (isImagePullBackOff && !appDetails.externalCi ? 1 : 0)} Errors
                </span>
                {collapsed && (
                    <span className="cn-9 ml-24 w-80 dc__ellipsis-right">
                        {isImagePullBackOff &&
                            !appDetails.externalCi &&
                            `IMAGEPULLBACKOFF${conditions.length > 0 && ', '}`}
                        {conditions.map((condition) => condition.type).join(', ')}
                    </span>
                )}
                <DropDownIcon
                    style={{ marginLeft: 'auto', ['--rotateBy' as any]: `${180 * Number(!collapsed)}deg` }}
                    className="icon-dim-20 rotate"
                />
            </div>
            {!collapsed && (
                <table className="mb-8">
                    <tbody>
                        {conditions.map((condition) => (
                            <tr>
                                <td className="pb-8 min-width">{condition.type}</td>
                                <td className="pl-24 pb-8">{condition.message}</td>
                            </tr>
                        ))}
                        {isImagePullBackOff && !appDetails.externalCi && (
                            <tr>
                                <td className="pb-8 min-width">ImagePullBackOff</td>
                                <td className="pl-24 pb-8">
                                    {renderErrorHeaderMessage(appDetails, 'sync-error', showApplicationDetailedModal)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    )
}
export default SyncErrorComponent
