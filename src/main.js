import dotenv from 'dotenv'
import { setTiers, getPatronIdsByTier, getPatronEmail, getCampaignId } from './patreon_api_wrapper.js'
import { rewardAccessCoordination, setRewardFolderAccess, tierAccessCoordination } from './tier_based_access.js'
import { getChildFolders, initializeFolderShare, removeFormerPatrons } from './dropbox_api_wrapper.js'

dotenv.config()

/*
* sets dropbox permissions for a particular user at a particular tier
*/
async function coordinateDropboxPermissions(TIER_NUM, EMAILS, TIER_FOLDERS_ARRAY, REWARD_FOLDERS_ARRAY) {
    try {
        // set reward folders for this tier
        const TIER_REWARD_FOLDERS = await setRewardFolderAccess(TIER_NUM, TIER_FOLDERS_ARRAY, REWARD_FOLDERS_ARRAY)

        // set dropbox permissions for each patron belonging to this tier
        for (let i = 0; i < EMAILS.length; i++) {
            tierAccessCoordination(TIER_NUM, EMAILS[i], TIER_FOLDERS_ARRAY, false)
            rewardAccessCoordination(EMAILS[i], TIER_REWARD_FOLDERS, REWARD_FOLDERS_ARRAY, true)
        }

        // remove access for former Patrons
        if (EMAILS.length > 0) {
            await removeFormerPatrons(TIER_FOLDERS_ARRAY, EMAILS)
            await removeFormerPatrons(REWARD_FOLDERS_ARRAY, EMAILS)
        }
    } catch (error) {
        console.error(error.message);
    }
}

async function patreonToDropbox() {
    try {
        // get tier and reward folder info
        const TIER_FOLDERS_ARRAY = await getChildFolders(process.env.DROPBOX_TIERS_DIR_NAME, 'id')
        const REWARD_FOLDERS_ARRAY = await getChildFolders(process.env.DROPBOX_REWARDS_DIR_NAME, 'id')

        // set share parameters on folder if none exist
        await initializeFolderShare(TIER_FOLDERS_ARRAY)
        await initializeFolderShare(REWARD_FOLDERS_ARRAY)

        // set patreon tiers and get campaign id
        const PATREON_TIER_MAP = await setTiers(TIER_FOLDERS_ARRAY)
        const PATREON_CAMPAIGN_ID = await getCampaignId()

        // set dropbox permissions for each tier
        for (let i = 0; i < PATREON_TIER_MAP.size; i++) {
            const TIER_MEMBER_IDS = await getPatronIdsByTier(PATREON_TIER_MAP.get(i).id, PATREON_CAMPAIGN_ID)
            const EMAIL_ADDRESSES = await getPatronEmail(TIER_MEMBER_IDS, PATREON_CAMPAIGN_ID)
            await coordinateDropboxPermissions(PATREON_TIER_MAP.get(i).title, EMAIL_ADDRESSES, TIER_FOLDERS_ARRAY, REWARD_FOLDERS_ARRAY)
        }
    } catch (error) {
        console.error(error.message);
    }
}

await patreonToDropbox()