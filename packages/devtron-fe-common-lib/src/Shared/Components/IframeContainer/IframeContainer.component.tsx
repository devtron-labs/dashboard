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

import IframeElement from './IframeElement'
import { IframeContainerProps } from './types'

const IframeContainer = ({ iframeList, maxHeight = 300, maxWidth = 300 }: IframeContainerProps) => {
    const sortedIframeList = iframeList.sort((a, b) => (a?.order || 0) - (b?.order || 0))

    return (
        <div className="flexbox dc__gap-16 flex-wrap w-100">
            {sortedIframeList.map((iframeData, index) => (
                <IframeElement
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    URL={iframeData.URL}
                    width={iframeData.width}
                    height={iframeData.height}
                    title={iframeData.title}
                    maxHeight={maxHeight}
                    maxWidth={maxWidth}
                />
            ))}
        </div>
    )
}

export default IframeContainer
