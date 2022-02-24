import { generateSelectedNodes } from './NodeTree.component';
import { testData1, testData2, testData3 } from './NodeTree.component.data.test';
test('base test with no click data', () => {
    expect(generateSelectedNodes(testData1.arguments.clickedNodes, testData1.arguments._treeNodes, testData1.arguments._node, testData1.arguments.parents)).toStrictEqual(testData1.response.clickedNodes)
})

test('base test with click data and new click not leaf', () => {
    expect(generateSelectedNodes(testData2.arguments.clickedNodes, testData2.arguments._treeNodes, testData2.arguments._node, testData2.arguments.parents)).toStrictEqual(testData2.response.clickedNodes)
})

test('base test with click data and new click on leaf', () => {
    expect(generateSelectedNodes(testData3.arguments.clickedNodes, testData3.arguments._treeNodes, testData3.arguments._node, testData3.arguments.parents)).toStrictEqual(testData3.response.clickedNodes)
})