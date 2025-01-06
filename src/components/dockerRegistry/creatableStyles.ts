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

import { getCommonSelectStyle } from '@devtron-labs/devtron-fe-common-lib'

const baseStyles = getCommonSelectStyle()

export const creatableSelectStyles = {
    ...baseStyles,
    multiValue: (base) => ({
        ...base,
        border: '1px solid var(--N200)',
        borderRadius: '4px',
        background: 'var(--N0)',
        height: '28px',
        margin: 0,
    }),
    control: (base, state) => ({
        ...baseStyles.control(base, state),
        minHeight: '36px',
        height: 'auto',
    }),
    indicatorsContainer: (base) => ({
        ...base,
        height: '34px',
    }),
    valueContainer: (base) => ({
        ...baseStyles.valueContainer(base),
        maxHeight: '100%',
        gap: '4px',
        paddingBlock: '4px',
    }),
}
