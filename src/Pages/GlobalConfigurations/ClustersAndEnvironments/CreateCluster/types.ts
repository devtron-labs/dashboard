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

export enum CreateClusterTypeEnum {
    CONNECT_USING_SERVER_URL = 'connect-using-server-url',
    CONNECT_USING_KUBECONFIG = 'connect-using-kubeconfig',
    CREATE_CLUSTER = 'create-cluster',
    ADD_ISOLATED_CLUSTER = 'add-isolated-cluster',
}

export interface CreateClusterParams {
    type: CreateClusterTypeEnum
}

export interface CreateClusterProps {
    handleReloadClusterList: () => void
    handleRedirectOnModalClose?: () => void
}

export interface EnterpriseTrialDialogProps {
    featureTitle: string
    featureDescription: string
    showBorder?: boolean
}
