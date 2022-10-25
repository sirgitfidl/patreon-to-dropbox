import { getChildFolders, coordinatePermissions, coordinateRestrictions } from './dropbox_api_wrapper.js';

/*
* Gives either permission or restriction to tiers based on list of folders
*/
export async function tierAccessCoordination(tier_num, email, TIER_FOLDERS_ARRAY, quiet) {
    try {
        await coordinatePermissions(email, TIER_FOLDERS_ARRAY[tier_num - 1], quiet)
        var grantedFolders = TIER_FOLDERS_ARRAY[tier_num - 1].name

        for (let i = 0; i < TIER_FOLDERS_ARRAY.length; i++) {
            if (!grantedFolders.includes(TIER_FOLDERS_ARRAY[i].name)) {
                await coordinateRestrictions(email, TIER_FOLDERS_ARRAY[i])
            }
        }
    } catch (error) {
        console.error(error.message);
    }
}

/*
* gives permission to list of reward folders
*/
export async function rewardAccessCoordination(email, ACCESSIBLE_FOLDERS, REWARD_FOLDERS_ARRAY, quiet) {
    try {
        var grantedFolders = []
        for (let i = 0; i < ACCESSIBLE_FOLDERS.length; i++) {
            await coordinatePermissions(email, ACCESSIBLE_FOLDERS[i], quiet)
            grantedFolders[i] = ACCESSIBLE_FOLDERS[i].name
        }

        for (let i = 0; i < REWARD_FOLDERS_ARRAY.length; i++) {
            if (!grantedFolders.includes(REWARD_FOLDERS_ARRAY[i].name)) {
                await coordinateRestrictions(email, REWARD_FOLDERS_ARRAY[i])
            }
        }
    } catch (error) {
        console.error(error.message);
    }
}

/*
* sets dropbox permissions for a particular user at a particular tier
*/
export async function setRewardFolderAccess(TIER_NUM, TIER_FOLDERS_ARRAY, REWARD_FOLDERS_ARRAY) {
    try {
        const TIER_CHILDREN = await getChildFolders(TIER_FOLDERS_ARRAY[TIER_NUM - 1].path_display)
        var tierChildrenNames = []
        for (let i = 0; i < TIER_CHILDREN.length; i++) {
            tierChildrenNames[i] = TIER_CHILDREN[i].name.slice(0, -4)
        }

        var accessibleFolders = []
        var count = 0
        for (let i = 0; i < REWARD_FOLDERS_ARRAY.length; i++) {
            if (tierChildrenNames.includes(REWARD_FOLDERS_ARRAY[i].name)) {
                accessibleFolders[count] = REWARD_FOLDERS_ARRAY[i]
                count++
            }
        }
        return accessibleFolders
    } catch (error) {
        console.error(error.message);
    }
}
