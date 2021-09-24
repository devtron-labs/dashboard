import React, {useState} from 'react';
import { ReactComponent as DropDown } from '../../../assets/icons/ic-dropdown-filled.svg';
import { NavLink } from 'react-router-dom'

export default function GenericRowsInfo() {
    return (
        <div>
             
            <div className={`generic-info-container flex left column top w-100`}>
                <div className="flex left column w-100 generic-info-header" >
                    <div style={{ height: '64px' }} className="pl-16 pr-16 flex column left">
                        <div className="fs-14 fw-6 cn-9">Workloads</div>
                        <div className="flex left">testing  </div>
                    </div>
                </div>
            <NestedTable
            />
        </div>
        </div>
    )
}

export const NestedTable = () => {
    // const tableColumns = getGenricRowFields(type)
    return (
        <table className={`resource-tree`}
          style={{ width: 'calc( 100% - 10px )' }}>
            <thead>
                <tr>
                    <th></th>
                    {/* for dropdown */}
                    {/* {tableColumns.map((field) => ( */}
                        <th >headin one</th>
                    {/* ))} */}
                </tr>
            </thead>
            <tbody>
                    {/* <GenericRow /> */}
                    {/* <tr>
                        <td colSpan={tableColumns.length + 1}>
                            <div className="w-100 flex" style={{ height: '400px' }}>
                                <NoPod selectMessage="No Available Pods" />
                            </div>
                        </td>
                    </tr> */}
            </tbody>
        </table>
    );
}

export const GenericRow = () => {
    const [collapsed, setCollapsed] = useState<boolean>(true);
    return (
        <React.Fragment>
            <tr className={`data-row `}>
                <td>
                        <DropDown
                            data-testid="collapse-icon"
                            className="icon-dim-24 rotate"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // setCollapsed(not);
                            }}
                            style={{ ['--rotateBy' as any]: collapsed ? '-90deg' : '0deg' }}
                        />
                    
                </td>
                {/* {tableColumns.map((column) => {
                    if (column === 'url') return <URL key={column} url={nodeDetails.url} />;
                    else if (column === 'name') {
                        return <Name key={column} nodeDetails={nodeDetails} describeNode={describeNode} />;
                    }
                    else if (column === '') {
                        return (
                            <Menu nodeDetails={nodeDetails}
                                describeNode={describeNode}
                                appName={appName}
                                environmentName={environmentName}
                                key={column}
                                appId={appId}
                            />
                        );
                    } else return <td key={column}>td</td>;
                })} */}
            </tr>
                <tr style={{ height: '100%' }}>
                    <td className="indent-line"></td>
                    <td colSpan={2} style={{ padding: '0' }}>
                                <NestedTable
                                />
                            <NestedTable
                              
                            />
                        {/* {nodeDetails.kind === Nodes.Pod && nodeDetails?.initContainers?.length ?
                            <NestedTable
                                type={Nodes.InitContainers}
                                describeNode={(containerName) => describeNode(nodeDetails?.name, containerName)}
                                level={level + 1}
                                Data={nodeDetails.initContainers.reduce((agg, containerName) => {
                                    agg.set(containerName, { name: containerName, kind: Nodes.Containers })
                                    return agg;
                                }, new Map)}
                                nodes={nodes}
                                appName={appName}
                                environmentName={environmentName}
                                appId={appId}
                            /> : ''} */}
                    </td>
                </tr>
        </React.Fragment>
    );
}