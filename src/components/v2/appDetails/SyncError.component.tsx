import React, { useState } from 'react';

import { ReactComponent as DropDownIcon } from '../../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as AlertTriangle } from '../../../assets/icons/ic-alert-triangle.svg';
import { not } from '../../common';
import IndexStore from './index.store';

const SyncErrorComponent: React.FC<{ appStreamData, showApplicationDetailedModal?}> = ({ appStreamData, showApplicationDetailedModal }) => {
    const [collapsed, toggleCollapsed] = useState<boolean>(true);
    const appDetails = IndexStore.getAppDetails();
    if (
        !appStreamData?.result?.application?.status?.conditions ||
        appStreamData?.result?.application?.status?.conditions?.length === 0
    )
        return null;

    const renderConditionErrorMessage = (condition) => {
            if (condition.type.toLowerCase() === 'errimagepull' || 'imagepullbackoff') {
             return   !appDetails?.ipsAccessProvided ? (
                    <div onClick={showApplicationDetailedModal}>
                        '{appDetails?.clusterName}' cluster does not have permission to pull container image from ‘
                        {appDetails?.dockerRegistryId}’ registry. <span className='cb-5 cursor fw-6'>How to resolve?</span>
                    </div>
                ) : (
                    <div onClick={showApplicationDetailedModal}>
                        {appDetails?.clusterName} cluster could not pull container image from{' '}
                        {appDetails?.dockerRegistryId}’ registry.<span className='cb-5 cursor fw-6'>How to resolve?</span>
                    </div>
                )
            } else {
                return condition.message
            }
        }

    return (
        <div className="top flex left column w-100 bcr-1 pl-25 pr-25 mb-16">
            <div className="flex left w-100 " style={{ height: '56px' }}>
                <AlertTriangle className="icon-dim-20 mr-8" />
                <span className="cr-5 fs-14 fw-6">
                    {appStreamData?.result?.application?.status?.conditions?.length} Errors
                </span>
                {collapsed && (
                    <span className="fs-12 cn-9 ml-24 w-80 dc__ellipsis-right">
                        {appStreamData?.result?.application?.status?.conditions
                            .map((condition) => condition.type)
                            .join(', ')}
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
                        {appStreamData?.result?.application?.status?.conditions.map((condition) => (
                            <tr>
                                <td className="pb-8" style={{ minWidth: '200px' }}>
                                  {condition.type.toLowerCase() === 'errimagepull' || 'imagepullbackoff' ? 'ImagePullBackOff' : condition.type}
                                </td>
                                <td className="pl-24 pb-8">
                                  {renderConditionErrorMessage(condition)}

                                  </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
export default SyncErrorComponent;
