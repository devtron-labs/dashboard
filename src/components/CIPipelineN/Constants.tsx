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

import { GroupHeading, groupStyle } from '../v2/common/ReactSelect.utils'

export const groupHeading = (props) => <GroupHeading {...props} />

export const buildStageStyles = {
    ...groupStyle(),
    control: (base) => ({
        ...base,
        border: '1px solid var(--N200)',
        minHeight: '20px',
        height: '30px',
        marginTop: '4px',
    }),
    valueContainer: (base) => ({ ...base, height: '28px', padding: '0px 8px' }),
    indicatorsContainer: (base) => ({ ...base, height: '28px' }),
    menu: (base) => ({ ...base, width: '240px' }),
}

export const triggerStageStyles = {
    ...groupStyle(),
    container: (base) => ({ ...base }),
    control: (base) => ({
        ...base,
        border: 'none',
        borderRadius: '0px',
        minHeight: '20px',
        height: '32px',
        width: '199px',
    }),
    valueContainer: (base) => ({ ...base, height: '28px', padding: '0px 8px' }),
    indicatorsContainer: (base) => ({ ...base, height: '30px' }),
    singleValue: (base) => ({
        ...base,
        fontWeight: 600,
        color: 'var(--B500)',
    }),
}

export const TIPPY_VAR_MSG = 'This is a variable. It will be replaced with the value during execution.'

export const excludeVariables = ['DOCKER_IMAGE_TAG', 'DOCKER_IMAGE']

export const INLINE_PLUGIN_TEXT = {
    TITLE: 'Execute custom task',
    DESCRIPTION: 'Write a script to perform custom task or create custom plugin',
}
