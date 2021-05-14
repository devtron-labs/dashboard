import { isVersionLessThanOrEqualToTarget } from './compareVersion';

test('version equal target', () => {
    let target = [1, 3, 9];
    let version1 = [1, 3, 9];
    expect(isVersionLessThanOrEqualToTarget(version1, target)).toBeTruthy();
})

test('version is strictly less than target', () => {    
    let target = [1, 3, 9];
    let version1 = [1, 3, 8];
    let version2 = [0, 3, 9];
    let version3 = [0, 4, 0];

    expect(isVersionLessThanOrEqualToTarget(version1, target)).toBeTruthy();
    expect(isVersionLessThanOrEqualToTarget(version2, target)).toBeTruthy();
    expect(isVersionLessThanOrEqualToTarget(version3, target)).toBeTruthy();
})    

test('version is strictly greater than target', () => {
    let target = [1, 3, 9];
    let version1 = [1, 3, 10];
    let version2 = [1, 4, 0];
    let version3 = [2, 0, 0];

    expect(isVersionLessThanOrEqualToTarget(version1, target)).toBeFalsy();
    expect(isVersionLessThanOrEqualToTarget(version2, target)).toBeFalsy();
    expect(isVersionLessThanOrEqualToTarget(version3, target)).toBeFalsy();
})    
