/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import IndexStore from '../index.store'
import { StatusFilterButtonComponent } from './StatusFilterButton.component'
import { Node } from '../appDetails.type'

export default function FilterResource({ nodes }: { nodes: Array<Node> }) {
    {
        /* ---for  later purpose---- */
    }
    // const handleFileterChange = (sName: string) => {
    //     IndexStore.updateFilterSearch(sName)
    // }

    return (
        <div className="flexbox pr-20 w-100">
            {/* ---for  later purpose---- */}
            {/* <div className="search" style={{ width: '100%' }}>
                <Search className="search__icon icon-dim-18" />
                <input onChange={(e) => {
                    handleFileterChange(e.target.value)
                }} className="w-100 en-2 bw-1 pt-6 pb-6 br-4 pl-32 pr-8 " placeholder="Search objects" type="text" />
            </div> */}
            <div>
                <StatusFilterButtonComponent nodes={nodes} />
            </div>
        </div>
    )
}
