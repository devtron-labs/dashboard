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

import { useEffect, useRef } from 'react'
import { useIntersection } from '../../Helpers'
import { GenericSectionErrorState } from '../GenericSectionErrorState'

interface DetectBottomProps {
    callback: () => void
    hasError?: boolean
}

const DetectBottom = ({ callback, hasError }: DetectBottomProps) => {
    const target = useRef<HTMLSpanElement>(null)
    const intersected = useIntersection(target, {
        rootMargin: '0px',
        once: false,
    })

    useEffect(() => {
        if (intersected) {
            callback()
        }
    }, [intersected])

    if (hasError) {
        return (
            <div className="p-24 flex">
                <GenericSectionErrorState reload={callback} />
            </div>
        )
    }

    return <span className="pb-5" ref={target} />
}

export default DetectBottom
