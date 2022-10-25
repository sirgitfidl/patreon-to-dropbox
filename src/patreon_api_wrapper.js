import dotenv from 'dotenv'
import { patreon } from 'patreon'

dotenv.config()

console.log = function () { }

const PATREON_ACCESS_TOKEN = process.env.PATREON_ACCESS_TOKEN

/*
*  Gets patron email for a given id
*/
export async function getPatronEmail(memberIds, PATREON_CAMPAIGN_ID) {
    try {
        var patronEmailArray = [];
        for (let i = 0; i < memberIds.length; i++) {
            patronEmailArray[i] = await getPatronEmailById(memberIds[i], PATREON_CAMPAIGN_ID)
        }
        return patronEmailArray
    } catch (error) {
        console.error(error.message);
    }
}

/*
*  Gets patron email for a given id
*/
async function getPatronEmailById(patronId, PATREON_CAMPAIGN_ID) {
    try {
        const patreonAPIClient = patreon(PATREON_ACCESS_TOKEN)
        return patreonAPIClient(`/campaigns/${PATREON_CAMPAIGN_ID}/pledges`)
            .then(({ store }) => {
                var patrons = store.findAll('user').map(user => user.serialize().data.attributes)
                for (let i = 0; i < patrons.length; i++) {
                    if (patrons[i].image_url.includes(patronId)) {
                        return patrons[i].email.toLowerCase()
                    }
                }
            })
    } catch (error) {
        console.error(error.message);
    }
}

/*
*  Gets patron ids for a given tier
*/
export async function getPatronIdsByTier(tierNameID, PATREON_CAMPAIGN_ID) {
    try {
        var membersArray = []
        const patreonAPIClient = patreon(PATREON_ACCESS_TOKEN)
        return patreonAPIClient(`/campaigns/${PATREON_CAMPAIGN_ID}/pledges`)
            .then(({ store }) => {
                var pledges = store.findAll('pledge').map(pledge => pledge.serialize().data.relationships)
                for (let i = 0; i < pledges.length; i++) {
                    if (pledges[i].reward.data.id == tierNameID) {
                        membersArray[i] = pledges[i].patron.data.id
                    }
                }
                return membersArray
            })
    } catch (error) {
        console.error(error.message);
    }
}

/*
* Gets list of all tiers
*/
export async function getCampaignId() {
    try {
        const patreonAPIClient = patreon(PATREON_ACCESS_TOKEN)
        return patreonAPIClient(`/current_user`)
            .then(({ store }) => {
                return store.findAll('campaign').map(campaign => campaign.serialize().data.id)[0]
            })
    } catch (error) {
        console.error(error.message);
    }
}

/*
* Gets list of all tiers
*/
export async function setTiers(TIERS) {
    try {
        const TierMap = new Map()
        const patreonAPIClient = patreon(PATREON_ACCESS_TOKEN)

        var tierNames = []
        for (let i = 0; i < TIERS.length; i++) {
            tierNames[i] = TIERS[i].name
        }

        return patreonAPIClient(`/current_user/campaigns`)
            .then(({ store }) => {
                var tiers = store.findAll('reward').map(reward => reward.serialize().data.attributes).filter(reward => reward.title)
                for (let i = 0; i < tierNames.length; i++) {
                    for (let j = 0; j < tiers.length; j++) {
                        if (tierNames[i] == tiers[j].title) {
                            TierMap.set(i, { title: (i + 1), id: tiers[j].image_url.split('reward/').pop().split('/')[0] })
                            break;
                        }
                        else if (!tierNames.some(tName => tiers[j].title.includes(tName))) {
                            console.error(`Unaccounted tier title -> ${tiers[j].title} | check environment variables`)
                            return;
                        }
                    }
                }
                return TierMap
            })
    } catch (error) {
        console.error(error.message);
    }
}
