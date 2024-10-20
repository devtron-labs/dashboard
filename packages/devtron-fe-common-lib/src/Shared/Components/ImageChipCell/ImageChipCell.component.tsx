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

import { useState } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as DockerIcon } from '../../../Assets/Icon/ic-docker.svg'
import { ImageChipCellProps } from './types'
import './imageChipCell.scss'

const ImageChipCell = ({
    imagePath,
    registryType,
    handleClick,
    isExpanded: isExpandedProp,
    placement = 'auto',
}: ImageChipCellProps) => {
    const [isExpandedState, setIsExpandedState] = useState<boolean>(false)

    const handleToggleExpand = () => {
        setIsExpandedState((prev) => !prev)
    }

    const isExpanded = isExpandedProp ?? isExpandedState

    return (
        <div className="cn-7 fs-14 lh-20 flexbox">
            <Tippy content={imagePath} className="default-tt" placement={placement} arrow={false}>
                <button
                    type="button"
                    className={`display-grid dc__align-items-center dc__select-text image-chip-cell__container ${isExpanded ? 'image-chip-cell__container--expanded' : ''} bcn-1 br-6 dc__transparent py-0 px-6 cursor max-w-100`}
                    onClick={handleClick || handleToggleExpand}
                >
                    {registryType ? (
                        <div className={`h-14 w-14 dc__registry-icon ${registryType} br-8 dc__no-shrink`} />
                    ) : (
                        <DockerIcon className="icon-dim-14 mw-14" />
                    )}
                    {isExpanded ? (
                        <div className="mono dc__ellipsis-left direction-left">{imagePath}</div>
                    ) : (
                        <>
                            <div>…</div>
                            <div className="mono dc__ellipsis-left direction-left text-overflow-clip">
                                {imagePath.split(':').slice(-1)[0] ?? ''}
                            </div>
                        </>
                    )}
                </button>
            </Tippy>
        </div>
    )
}

export default ImageChipCell
