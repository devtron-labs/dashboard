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
import { ReactComponent as ICDrag } from '../../Assets/Icon/ic-drag.svg'
import { DraggableButtonProps } from './types'

export default function DraggableButton({ dragClassName }: DraggableButtonProps) {
    return (
        <button
            type="button"
            className={`${dragClassName} dc__outline-none-imp dc__no-border p-0 dc__transparent h-20`}
        >
            <ICDrag className="dc__grabbable icon-dim-20 fcn-6" />
        </button>
    )
}
