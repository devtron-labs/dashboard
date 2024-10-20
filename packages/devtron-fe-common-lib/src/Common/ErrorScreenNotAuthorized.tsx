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

import unauthorized from '../Assets/Img/ic-not-authorized.svg'
import { ERROR_EMPTY_SCREEN } from './Constants'
import GenericEmptyState from './EmptyState/GenericEmptyState'
import { ErrorScreenNotAuthorizedProps } from './Types'

const ErrorScreenNotAuthorized = ({ subtitle, title }: ErrorScreenNotAuthorizedProps) => (
    <GenericEmptyState
        image={unauthorized}
        title={title ?? ERROR_EMPTY_SCREEN.NOT_AUTHORIZED}
        subTitle={subtitle ?? ERROR_EMPTY_SCREEN.ONLY_FOR_SUPERADMIN}
    />
)

export default ErrorScreenNotAuthorized
