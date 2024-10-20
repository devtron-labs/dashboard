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

export const INCLUDE_EXCLUDE_COMMIT_TIPPY = {
    lineOne:
        'Assign exclude rules to prevent builds from commits having changes only in certain files of your repository.',
    lineTwo: 'Commits having changes only in excluded files or folders, will not be eligible for build.',
    lineThree:
        'For example, an exclude rule could be set to ignore changes made to README.md or other documentation files.',
    lineFour:
        'If building a service from a monorepo, path exclude rules could be set to ignore changes to folders other than a specific folder.',
}

export const INCLUDE_EXCLUDE_COMMIT_INFO = {
    infoList: {
        lineOne: {
            partOne: 'Use',
            partTwo: '!',
            partThree: 'before a path to exclude Eg.',
            partFour: '!folder/subfolder/*',
        },
        lineTwo: {
            partOne: 'Supported regex to write paths',
            partTwo: '/*',
            partThree: '/**',
            partFour: '*',
            partFive: 'How to use',
        },
        lineThree:
            'In case of any conflict, the path defined later will hold more importance. In the below example ‘docs/**’ folder will be included.',
    },
    example: {
        lineOne: '!sub-project/docs/**',
        lineTwo: 'sub-project/**',
    },
}

export const USE_REGEX_TIPPY_CONTENT = {
    insructionsList: {
        heading: 'Using regex to write paths',
        regexInfo: [
            {
                regex: '/**',
                info: 'If used ‘in between’ or ‘last’ of the path, matches any number of directories.',
            },
            {
                regex: '/*',
                info: 'If used ‘in between’ of the path, matches single directory. \nIf used at ‘last’ of the path, matches any number of directories.',
            },
            {
                regex: '*',
                info: 'Used to match any file type',
            },
        ],
        regexPathInfo: {
            headingRegex: 'REGEX',
            headingPath: 'PATHS',
            regexPathExample: {
                regexExample1: 'Project/**/Client',
                regexPathExample1: {
                    regexPath1: {
                        partOne: 'Project',
                        partTwo: '/folderA/folderB/',
                        partThree: 'Client',
                    },
                    regexPath2: {
                        partOne: 'Project',
                        partTwo: '/folderC/',
                        partThree: 'Client',
                    },
                    regexPath3: {
                        partOne: 'Project',
                        partTwo: '/folderC/',
                        partThree: 'token',
                    },
                },
                regexExample2: 'Project/*/Client',
                regexPathExample2: {
                    regexPath1: {
                        partOne: 'Project',
                        partTwo: '/folderA/folderB/',
                        partThree: 'Client',
                    },
                    regexPath2: {
                        partOne: 'Project',
                        partTwo: '/folderC/',
                        partThree: 'Client',
                    },
                    regexPath3: {
                        partOne: 'Project',
                        partTwo: '/folderC/',
                        partThree: 'token',
                    },
                },
                regexExample3: {
                    partOne: 'Project/**',
                    partTwo: 'or',
                    partThree: 'Project/*',
                },
                regexPathExample3: {
                    regexPath1: {
                        partOne: 'Project',
                        partTwo: '/folderA/folderB/Client.txt',
                    },
                    regexPath2: {
                        partOne: 'Project',
                        partTwo: '/folderC/Client.txt',
                    },
                    regexPath3: {
                        partOne: 'Project',
                        partTwo: '/folderC/token.txt',
                    },
                },
                regexExample4: 'Project/Client*',
                regexPathExample4: {
                    regexPath1: {
                        partOne: 'Project/client',
                        partTwo: '.txt',
                    },
                    regexPath2: {
                        partOne: 'Project/client',
                        partTwo: '.js',
                    },
                    regexPath3: {
                        partOne: 'Project/token',
                        partTwo: '.txt',
                    },
                },
                regexExample5: {
                    partOne: 'Only',
                    partTwo: '/*',
                    partThree: 'or',
                    partFour: '/**',
                },
                regexPathExample5: {
                    regexPath1: {
                        partOne: 'All folders at root',
                    },
                    regexPath2: {
                        partOne: 'All files at root',
                    },
                },
                regexExample6: {
                    partOne: 'Only',
                    partTwo: '*',
                },
                regexPathExample6: {
                    regexPath1: {
                        partOne: 'All files & folders at root',
                    },
                },
            },
        },
    },
}

export const INFO_BAR = {
    infoMessage: 'Remaining files/folders in the Git Repo will be',
}

export const INCLUDE_EXCLUDE_PLACEHOLDER =
    'Enter paths separated by line breaks: \nto include type foldername \nto exclude type !foldername'

export const MATERIAL_EXCLUDE_TIPPY_TEXT =
    'Not available for build as this commit contains changes in excluded files or folders'
