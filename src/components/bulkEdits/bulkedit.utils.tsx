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

import { OutputTabType } from "./bulkEdits.type"

export const multiSelectStyles = {
    control: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
        border: 'none',
        boxShadow: 'none',
    }),
    option: (base, state) => {
        return {
            ...base,
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
            color: 'var(--N900)',
        }
    },
    container: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
    }),
}

export const OutputTabs: React.FC<OutputTabType> = ({ handleOutputTabs, outputName, value, name }) => {
    return (
        <label className="dc__tertiary-tab__radio flex fs-13">
            <input type="radio" name="status" checked={outputName === value} value={value} onClick={handleOutputTabs} />
            <div className="tertiary-output-tab cursor mr-12 pb-6" data-testid={`${name}-link`}>
                {name}
            </div>
        </label>
    )
}
