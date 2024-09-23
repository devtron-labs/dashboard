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

import { SelectPicker, SelectPickerVariantType } from '@devtron-labs/devtron-fe-common-lib'

export default function UserNameDropDownList({ clusterDetail, selectedUserNameOptions, onChangeUserName }) {
    const handleUserChange = (selectedOption) => {
        onChangeUserName(selectedOption, clusterDetail)
    }

    if (clusterDetail.userInfos.length === 1) {
        return <span className="dc__ellipsis-right">{clusterDetail.userInfos[0].userName}</span>
    }
    const userNameOptions = clusterDetail.userInfos.map((user) => {
        return {
            label: user.userName,
            value: user.userName,
            errorInConnecting: user.errorInConnecting,
            config: user.config,
        }
    })

    return (
        <SelectPicker
            inputId="user_name_dropdown_list"
            classNamePrefix="user_name_dropdown_list"
            options={userNameOptions}
            value={selectedUserNameOptions[clusterDetail.cluster_name]}
            isSearchable={false}
            menuPosition="fixed"
            onChange={handleUserChange}
            variant={SelectPickerVariantType.BORDER_LESS}
        />
    )
}
