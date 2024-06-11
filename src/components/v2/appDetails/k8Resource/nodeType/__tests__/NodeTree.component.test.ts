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

import { generateSelectedNodes } from '../NodeTree.component'
import { testData1, testData2, testData3 } from '../__mocks__/NodeTree.component.mock'
test('base test with no click data', () => {
    expect(
        generateSelectedNodes(
            testData1.arguments.clickedNodes,
            testData1.arguments._treeNodes,
            testData1.arguments._node,
            testData1.arguments.parents,
        ),
    ).toStrictEqual(testData1.response.clickedNodes)
})

test('base test with click data and new click not leaf', () => {
    expect(
        generateSelectedNodes(
            testData2.arguments.clickedNodes,
            testData2.arguments._treeNodes,
            testData2.arguments._node,
            testData2.arguments.parents,
        ),
    ).toStrictEqual(testData2.response.clickedNodes)
})

test('base test with click data and new click on leaf', () => {
    expect(
        generateSelectedNodes(
            testData3.arguments.clickedNodes,
            testData3.arguments._treeNodes,
            testData3.arguments._node,
            testData3.arguments.parents,
        ),
    ).toStrictEqual(testData3.response.clickedNodes)
})
