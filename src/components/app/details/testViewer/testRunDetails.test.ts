import { getBinWiseArr } from './testRunDetails.util';

test('Create Bin Wise Array', () => {
    expect(getBinWiseArr([0.1, 15, 15, 15], 10, 1.5)).toStrictEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 3]);
})