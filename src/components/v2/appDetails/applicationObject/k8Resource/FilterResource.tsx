import React from 'react'
import { StatusFilterButtonComponent } from './StatusFilterButton.component'

export default function FilterResource() {
    return (
        <div className="flex wrap flex-justify pr-20 pl-20">
            <div style={{width:'700px'}}>
                <input className="w-100" placeholder="Search objects" type="text" />
            </div>
            <div>
                <StatusFilterButtonComponent />
            </div>
        </div>
    )
}
