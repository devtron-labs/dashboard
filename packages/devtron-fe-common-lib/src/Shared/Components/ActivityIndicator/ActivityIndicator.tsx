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

import { ActivityIndicatorProps } from './types'

const ActivityIndicator = ({
    rootClassName = '',
    backgroundColorClass = 'bcr-5',
    iconSizeClass = 'icon-dim-6',
}: ActivityIndicatorProps) => (
    <div className={`dc__border-radius-50-per ${backgroundColorClass} ${iconSizeClass} ${rootClassName}`} />
)

export default ActivityIndicator
