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

import { DeleteComponentsName } from '@Config/constantMessaging'
import { DeleteConfirmationModal, ERROR_STATUS_CODE, DC_DELETE_SUBTITLES } from '@devtron-labs/devtron-fe-common-lib'
import { EnvironmentDeleteComponentProps } from './ClusterEnvironmentDrawer/types'

export const EnvironmentDeleteComponent = ({
    environmentName,
    onDelete,
    closeConfirmationModal,
}: EnvironmentDeleteComponentProps) => (
    <DeleteConfirmationModal
        title={environmentName}
        component={DeleteComponentsName.Environment}
        subtitle={DC_DELETE_SUBTITLES.DELETE_ENVIRONMENT_SUBTITLE}
        onDelete={onDelete}
        closeConfirmationModal={closeConfirmationModal}
        errorCodeToShowCannotDeleteDialog={ERROR_STATUS_CODE.BAD_REQUEST}
    />
)
