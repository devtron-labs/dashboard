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
import './table.scss'

const TableUtil = ({ table, bodyFont = '' }) => {
    return (
        <div className="node-container-fluid generic-table" style={{ minHeight: '600px' }}>
            <div className="row dc__border-bottom">
                {table.tHead.map((cell, index) => {
                    return (
                        <div key={`th_${index}`} className={`${cell.className} fw-6 cn-9 col pt-8 pb-8`}>
                            {cell.value}
                        </div>
                    )
                })}
            </div>
            <div className="generic-body fs-13 cn-9" style={{ fontFamily: bodyFont }}>
                {table.tBody.map((tRow, index) => {
                    return (
                        <div className="row" key={`tr_${index}`}>
                            {tRow.map((cell, index) => {
                                return (
                                    <div key={`tr_cell_${index}`} className={`${cell.className} col pt-8 pb-8`}>
                                        {' '}
                                        {cell.value}{' '}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default TableUtil
