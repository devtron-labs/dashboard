import React, { useState } from 'react'

import { ReactComponent as DropDownIcon } from '../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as AlertTriangle } from '../../../assets/icons/ic-alert-triangle.svg'
import { not } from '../../common'
import IndexStore from './index.store'
import { ConditionContainer } from '../../CIPipelineN/ConditionContainer'

const SyncErrorComponent: React.FC<{ appStreamData; showApplicationDetailedModal? }> = ({
    appStreamData,
    showApplicationDetailedModal,
}) => {
    const [collapsed, toggleCollapsed] = useState<boolean>(true)
    const appDetails = IndexStore.getAppDetails()
    const conditions = appStreamData?.result?.application?.status?.conditions || []

    let isImagePullBackOff
    for (let index = 0; index < appDetails.resourceTree.nodes.length; index++) {
        const node = appDetails.resourceTree.nodes[index]
        if (node.info?.length) {
            for (let index = 0; index < node.info.length; index++) {
                const info = node.info[index]
                if (info.value.toLowerCase() === 'errimagepull' || info.value.toLowerCase() === 'imagepullbackoff') {
                    isImagePullBackOff = true
                    break
                }
            }
            if (isImagePullBackOff) break
        }
    }

    if (conditions.length === 0 && !isImagePullBackOff) return null

    const renderConditionErrorMessage = () => {
        return !appDetails?.ipsAccessProvided ? (
            <div onClick={showApplicationDetailedModal}>
                '{appDetails?.clusterName}' cluster does not have permission to pull container image from ‘
                {appDetails?.dockerRegistryId}’ registry. <span className="cb-5 cursor fw-6">How to resolve?</span>
            </div>
        ) : (
            <div onClick={showApplicationDetailedModal}>
                {appDetails?.clusterName} cluster could not pull container image from
                {appDetails?.dockerRegistryId}’ registry.<span className="cb-5 cursor fw-6">How to resolve?</span>
            </div>
        )
    }

    return (
        <div className="top flex left column w-100 bcr-1 pl-25 pr-25 mb-16">
            <div className="flex left w-100 " style={{ height: '56px' }}>
                <AlertTriangle className="icon-dim-20 mr-8" />
                <span className="cr-5 fs-14 fw-6">{conditions.length + (isImagePullBackOff && !appDetails?.externalCi ? 1 : 0)} Errors</span>
                {collapsed && (
                    <span className="fs-12 cn-9 ml-24 w-80 dc__ellipsis-right">
                        {isImagePullBackOff && !appDetails?.externalCi && 'IMAGEPULLBACKOFF'}
                        {conditions.length > 0 && ', '}
                        {conditions.map((condition) => condition.type).join(', ')}
                    </span>
                )}
                <DropDownIcon
                    style={{ marginLeft: 'auto', ['--rotateBy' as any]: `${180 * Number(!collapsed)}deg` }}
                    className="icon-dim-24 rotate pointer"
                    onClick={(e) => toggleCollapsed(not)}
                />
            </div>
            {!collapsed && (
                <table className="mb-8">
                    <tbody>
                        {conditions.map((condition) => (
                            <tr>
                                <td className="pb-8" style={{ minWidth: '200px' }}>
                                    {condition.type}
                                </td>
                                <td className="pl-24 pb-8">{condition.message}</td>
                            </tr>
                        ))}
                        {isImagePullBackOff && !appDetails?.externalCi && (
                            <tr>
                                <td className="pb-8" style={{ minWidth: '200px' }}>
                                    ImagePullBackOff
                                </td>
                                <td className="pl-24 pb-8">{renderConditionErrorMessage()}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    )
}
export default SyncErrorComponent
