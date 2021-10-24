import React from 'react'
import NodeTreeComponent from './NodeTree.component'

export default function K8ResourceComponent() {
    return (
        <div className="pl-20 pr-20 bcn-0">
            <div className="pt-16 pb-16">Filters</div>
            <div  className="flex left" >
                <div style={{width:"240px", height: "700px", borderRight: "1px solid #ddd"}} className="">
                    <NodeTreeComponent />
                </div>
                <div>right</div>
            </div>
        </div>
    )
}
