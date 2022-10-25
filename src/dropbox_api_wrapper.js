import dotenv from 'dotenv'
import { Dropbox } from 'dropbox'

dotenv.config()

const dbx = new Dropbox({
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN
})

/*
* shares a folder with a new member via their email
*/
export async function addFolderMember(sharedfolderId, email, quiet) {
    try {
        await dbx.sharingAddFolderMember({
            members: [
                {
                    access_level: "viewer",
                    member: {
                        ".tag": "email",
                        email: email
                    }
                }
            ],
            quiet: quiet,
            shared_folder_id: sharedfolderId
        })
    } catch (error) {
        console.error(error.message);
    }
}

/*
* for folders particular tier levels should be able to access
*/
export async function coordinatePermissions(email, tierFolderId, quiet) {
    try {
        const access = await doesUserHaveAccess(tierFolderId.shared_folder_id, email)
        if (!access) {
            await addFolderMember(tierFolderId.shared_folder_id, email, quiet)
        }
    } catch (error) {
        console.error(error.message);
    }
}

/*
* for folders off-limits to particular tier levels
*/
export async function coordinateRestrictions(email, tierFolderId) {
    try {
        const access = await doesUserHaveAccess(tierFolderId.shared_folder_id, email)
        if (access) {
            await removeFolderMember(tierFolderId.shared_folder_id, email)
        }
    } catch (error) {
        console.error(error.message);
    }
}

/*
* determines whether or not a user has had this folder shared with them
*/
export async function doesUserHaveAccess(sharedfolderId, email) {
    try {
        const users = await dbx.sharingListFolderMembers({
            actions: [],
            limit: 10,
            shared_folder_id: sharedfolderId
        }).then(res => res.result.users)

        const invitees = await dbx.sharingListFolderMembers({
            actions: [],
            limit: 10,
            shared_folder_id: sharedfolderId
        }).then(res => res.result.invitees)

        for (let i = 0; i < users.length; i++) {
            if (users[i].user.email == email) {
                return true
            }
        }

        for (let i = 0; i < invitees.length; i++) {
            if (invitees[i].invitee.email == email) {
                return true
            }
        }

        return false
    } catch (error) {
        console.error(error.message);
    }
}

/*
* lists immediate child folders of a given folder
*/
export async function getChildFolders(parentFolderName) {
    try {
        var temp = []
        const fileArray = await dbx.filesListFolder({
            path: `/${parentFolderName}/`
        }).then(res => res.result.entries)
        for (let i = 0; i < fileArray.length; i++) {
            temp[i] = fileArray[i]
        }
        return temp
    } catch (error) {
        console.error(error.message);
    }
}

/*
* gets the dropbox account owner's id in order to ignore it when considering adding sharing for users
*/
async function getOwnerAccountId() {
    try {
        return await dbx.usersGetCurrentAccount().then(res => res.result.account_id)
    } catch (error) {
        console.error(error.message);
    }
}

/*
* creates a shared_folder_id for a folder
*/
export async function initializeFolderSharing(folderPath, email) {
    try {
        await dbx.sharingShareFolder({
            path: folderPath
        })
    } catch (error) {
        console.error(error.message);
    }
}

/*
* unshares a folder with a new member via their email
*/
export async function removeFolderMember(sharedfolderId, email) {
    try {
        await dbx.sharingRemoveFolderMember({
            leave_a_copy: false,
            member: {
                ".tag": "email",
                email: email
            },
            shared_folder_id: sharedfolderId
        })
    } catch (error) {
        console.error(error.message);
    }
}

/*
* removes shares with members that are no longer patrons
*/
export async function removeFormerPatrons(FOLDERS_ARRAY, EMAILS) {
    try {
        for (let i = 0; i < FOLDERS_ARRAY.length; i++) {
            const users = await dbx.sharingListFolderMembers({
                actions: [],
                limit: 10,
                shared_folder_id: FOLDERS_ARRAY[i].shared_folder_id
            }).then(res => res.result.users)

            const invitees = await dbx.sharingListFolderMembers({
                actions: [],
                limit: 10,
                shared_folder_id: FOLDERS_ARRAY[i].shared_folder_id
            }).then(res => res.result.invitees)

            const ownerAccountId = await getOwnerAccountId()

            for (let j = 0; j < users.length; j++) {
                if ((users[j].user.account_id != ownerAccountId)) {
                    if (!EMAILS.includes(users[j].user.email)) {
                        removeFolderMember(FOLDERS_ARRAY[i].shared_folder_id, users[j].user.email)
                    }
                }
            }

            for (let j = 0; j < invitees.length; j++) {
                if (!EMAILS.includes(invitees[j].invitee.email)) {
                    removeFolderMember(FOLDERS_ARRAY[i].shared_folder_id, invitees[j].invitee.email)
                }
            }
        }
    } catch (error) {
        console.error(error.message);
    }
}
