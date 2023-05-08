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
            partFour: '!/folder/subfolder/*',
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
        lineOne: 'If used ‘in between’ or ‘last’ of the path, matches any number of directories.',
    }
}

export const INFO_BAR = {
    infoMessage: 'Remaining files/folders in the Git Repo will be',
}

export const INCLUDE_EXCLUDE_PLACEHOLDER = 'Enter paths separated by line breaks: \nto include type /foldername \nto exclude type !/foldername'

export const MATERIAL_EXCLUDE_TIPPY_TEXT = 'Not available for build as this commit contains changes in excluded files or folders'