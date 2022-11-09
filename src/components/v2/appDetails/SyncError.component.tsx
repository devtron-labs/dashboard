import React, { useState, useRef,  useEffect } from 'react'

import { ReactComponent as DropDownIcon } from '../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as AlertTriangle } from '../../../assets/icons/ic-alert-triangle.svg'
import { not } from '../../common'
import IndexStore from './index.store'
import { renderErrorHeaderMessage } from '../../common/error/error.utils'
import { ErrorType } from '../../common/error/errorType'

const SyncErrorComponent: React.FC<{ appStreamData; showApplicationDetailedModal? }> = ({
    appStreamData,
    showApplicationDetailedModal,
}) => {

    const [collapsed, toggleCollapsed] = useState<boolean>(true)
    const appDetails = useRef(IndexStore.getAppDetails());
    const conditions = appStreamData?.result?.application?.status?.conditions || []

    if (!appDetails) return null

    let isImagePullBackOff
    for (let index = 0; index < appDetails.current?.resourceTree?.nodes?.length; index++) {
        const node = appDetails.current.resourceTree.nodes[index]
        if (node.info?.length) {
            for (let index = 0; index < node.info.length; index++) {
                const info = node.info[index]
                if (
                    info.value.toLowerCase() === ErrorType.ERRIMAGEPULL ||
                    info.value.toLowerCase() === ErrorType.IMAGEPULLBACKOFF
                ) {
                    isImagePullBackOff = true
                    break
                }
            }
            if (isImagePullBackOff) break
        }
    }

    if (conditions.length === 0 && !isImagePullBackOff) return null

    const toggleErrorHeader = () => {
        toggleCollapsed(not)
    }

    return (
        <div className="top flex left column w-100 bcr-1 pl-20 pr-20 fs-13">
            <div className="flex left w-100 cursor h-56" onClick={toggleErrorHeader}>
                <AlertTriangle className="icon-dim-20 mr-8" />
                <span className="cr-5 fs-14 fw-6">
                    {conditions.length + (isImagePullBackOff && !appDetails.current.externalCi ? 1 : 0)} Errors
                </span>
                {collapsed && (
                    <span className="cn-9 ml-24 w-80 dc__ellipsis-right">
                        {isImagePullBackOff && !appDetails.current.externalCi && 'IMAGEPULLBACKOFF'}
                        {conditions.length > 0 && ', '}
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
                        {isImagePullBackOff && !appDetails.current.externalCi && (
                            <tr>
                                <td className="pb-8 min-width">ImagePullBackOff</td>
                                <td className="pl-24 pb-8">
                                    {renderErrorHeaderMessage(appDetails.current, 'sync-error', showApplicationDetailedModal)}
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
