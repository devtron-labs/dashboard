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

import { noop } from '@Common/Helper'
import { ReactComponent as CommitIcon } from '../../../Assets/Icon/ic-code-commit.svg'
import { CommitChipCellProps } from './types'

const CommitChipCell = ({ handleClick = noop, commits }: CommitChipCellProps) =>
    commits?.length > 0 ? (
        <div className="flexbox">
            <button
                type="button"
                className="dc__transparent p-0 flexbox dc__gap-4 fs-14 lh-20 cb-5 dc__truncate mono cursor"
                onClick={handleClick}
            >
                <span className="flex dc__gap-4 br-4 pl-6 pr-6 bcb-1">
                    <CommitIcon className="icon-dim-14 dc__no-shrink fcb-5" />
                    <span>{commits[0].substring(0, 7)}</span>
                </span>
                {commits.length > 1 && <span className="flex br-4 pl-6 pr-6 bcb-1">…</span>}
            </button>
        </div>
    ) : (
        <span />
    )

export default CommitChipCell
