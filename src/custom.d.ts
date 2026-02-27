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

declare module '*.svg' {
    import * as React from 'react'

    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>

    const src: string
    export default src
}

declare module '*.png' {
    const src: string
    export default src
}

declare module '*.gif' {
    const src: string
    export default src
}

// react-select's PublicBaseSelectProps (used transitively by devtron-fe-common-lib's
// SelectPicker) is defined as JSX.LibraryManagedAttributes<typeof Select, Props<...>>,
// which requires a global namespace JSX with LibraryManagedAttributes.
// Without this, SelectPickerProps resolves to Pick<any, ...> with all props required.
declare namespace JSX {
    type LibraryManagedAttributes<C, P> = import('react').JSX.LibraryManagedAttributes<C, P>
}
