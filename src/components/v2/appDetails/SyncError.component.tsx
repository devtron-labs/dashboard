import React, { useState } from 'react';

import { ReactComponent as DropDownIcon } from '../../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as AlertTriangle } from '../../../assets/icons/ic-alert-triangle.svg';
import { not } from '../../common';

const SyncErrorComponent: React.FC<{ appStreamData }> = ({ appStreamData }) => {
    const [collapsed, toggleCollapsed] = useState<boolean>(true);
    if (
        !appStreamData?.result?.application?.status?.conditions ||
        appStreamData?.result?.application?.status?.conditions?.length === 0
    )
        return null;
    return (
        <div className="top flex left column w-100 bcr-1 pl-25 pr-25 mb-16">
            <div className="flex left w-100 " style={{ height: '56px' }}>
                <AlertTriangle className="icon-dim-20 mr-8" />
                <span className="cr-5 fs-14 fw-6">
                    {appStreamData?.result?.application?.status?.conditions?.length} Errors
                </span>
                {collapsed && (
                    <span className="fs-12 cn-9 ml-24 w-80 ellipsis-right">
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
                                    {condition.type}
                                </td>
                                <td className="pl-24 pb-8">{condition.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
export default SyncErrorComponent;
