import React, { useState } from 'react'
import { ReactComponent as DropDown } from '../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as ErrorImage } from '../../../assets/icons/errorInfo.svg';

export default function NodeGroup() {
    const [collapsed, setCollapsed] = useState(false)
    return (
        <>
            <>
                <DropDown
                    onClick={(e) => setCollapsed(!collapsed)}
                    className={`rotate icon-dim-24 pointer ${!collapsed ? 'fcn-9' : 'fcn-5'}`}
                    style={{ ['--rotateBy' as any]: collapsed ? '-90deg' : '0deg' }}
                />
                <div
                    //  onClick={(e) => setCollapsed(not)} 
                    className="fs-14 pointer w-100 fw-6 flex left pl-8">
                    <div> Workload</div>
                    {/* <ErrorImage
                            className="icon-dim-16 rotate"
                            style={{ ['--rotateBy' as any]: '180deg', marginLeft: 'auto' }}
                        /> */}
                </div>
            </>
            <>
                <DropDown
                    onClick={(e) => setCollapsed(!collapsed)}
                    className={`rotate icon-dim-24 pointer ${!collapsed ? 'fcn-9' : 'fcn-5'}`}
                    style={{ ['--rotateBy' as any]: collapsed ? '-90deg' : '0deg' }}
                />
                <div
                    //  onClick={(e) => setCollapsed(not)} 
                    className="fs-14 pointer w-100 fw-6 flex left pl-8">
                    <div> Replica Set</div>
                    {/* <ErrorImage
                            className="icon-dim-16 rotate"
                            style={{ ['--rotateBy' as any]: '180deg', marginLeft: 'auto' }}
                        /> */}
                </div>
            </>
            <>
                <DropDown
                    onClick={(e) => setCollapsed(!collapsed)}
                    className={`rotate icon-dim-24 pointer ${!collapsed ? 'fcn-9' : 'fcn-5'}`}
                    style={{ ['--rotateBy' as any]: collapsed ? '-90deg' : '0deg' }}
                />
                <div
                    //  onClick={(e) => setCollapsed(not)} 
                    className="fs-14 pointer w-100 fw-6 flex left pl-8">
                    <div> Pods</div>
                    {/* <ErrorImage
                            className="icon-dim-16 rotate"
                            style={{ ['--rotateBy' as any]: '180deg', marginLeft: 'auto' }}
                        /> */}
                </div>
            </>
        </>
    )
}
