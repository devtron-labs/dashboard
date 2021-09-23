import React from 'react'
import GenericRowsInfo from './GenericRowsInfo';
import NodeGroup from './NodeGroup';

export default function ResourceTreeNode() {
    return (
        <div>
            <div className="bcn-0 mt-16 pl-24 pt-16 "
                style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '270px 1fr',
                    height: '700px',
                    maxHeight: '700px',
                    overflow: 'hidden',
                    gridTemplateRows: '72px 1fr',
                }}>
                <div>
                    <input className="en-2 bw-1 w-100 pt-4 pb-4 pl-8 pr-8 br-4" type="search" placeholder="Search Objects" />
                </div>
                <div
                    style={{
                        height: '100%',
                        gridColumn: '1 / span 1',
                        gridRow: '2',
                        overflowY: 'auto',
                        borderRight: '1px solid var(--N200)',
                    }}>
                    <div
                        style={{
                            display: 'grid',
                            gridColumnGap: '8px',
                            gridTemplateColumns: '24px 1fr',
                            gridAutoRows: '36px',
                            placeItems: 'center',
                        }}
                        className="p-8"
                    >
                        <NodeGroup />
                    </div>

                </div>
                <div style={{ gridColumn: '2', gridRow: '2', overflowY: 'auto' }} className="bcn-0">
                <GenericRowsInfo />
            </div>

            </div>
        </div>
    )
}
