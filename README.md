# Patreon to Dropbox
PATREON_TO_DROPBOX is a multi-API wrapper that provides a simple way to automate managing Patron access to Dropbox folders and files.

[Patreon API docs](https://docs.patreon.com/#introduction)

[Dropbox API docs](https://www.dropbox.com/developers/documentation/http/overview)

# Quick Start
(For local execution, use `.env_temp` to add environment variables using the parameters you gather below. Change filename to `.env` to use the environment variables)
## Patreon API Setup
[Create/Get Patreon API Variable](https://www.patreon.com/portal/registration/register-clients)
Filling out the fields in "Create Client" will result in creating; 
- `PATREON_ACCESS_TOKEN`

## Dropbox API Setup
[Create/Get Dropbox API Variables](https://www.dropbox.com/developers/reference/getting-started#app%20console)
Following all steps provided in the link will result in creating; 
- `DROPBOX_APP_KEY`
- `DROPBOX_APP_SECRET`
- `DROPBOX_ACCESS_TOKEN`

[This is an excellent video guide](https://www.youtube.com/watch?v=AzCQrjWQJs4&ab_channel=freeCodeCamp.org)

## Dropbox Refresh Token
[Dropbox Oauth Docs](https://developers.dropbox.com/oauth-guide)

[Solution I used](https://stackoverflow.com/questions/70641660/how-do-you-get-and-use-a-refresh-token-for-the-dropbox-api-python-3-x) (uses Postman and sends a POST to Dropbox to get the refresh token)

Following this will result in creating;
- `DROPBOX_REFRESH_TOKEN`
  
## Dropbox Patreon folder Setup
Create two folders and assign their names to the following environment variables;
- `DROPBOX_REWARDS_FOLDER_NAME`
- `DROPBOX_TIERS_FOLDER_NAME`

Add various reward folders to the `DROPBOX_REWARDS_FOLDER_NAME` folder. Add tier folders to `DROPBOX_TIERS_FOLDER_NAME` matching the tier names defined in your Patreon page. Finally, create shorcuts (Create -> More -> Shortcut) of your reward folders by using the folder's URL, and the folder's name (EXACTLY), and place them in the tier folder they belong to (the same shortcut in multiple tiers is expected). These shortcuts will have a `.web` extension. 

```
ex.

DROPBOX_REWARDS_FOLDER_NAME=Rewards | ex. path -> Dropbox/Rewards/reward[n]_name/{files}

DROPBOX_TIERS_FOLDER_NAME=Tiers | ex. path -> Dropbox/Tiers/tier[n]_name/{reward[n]_name_shorcut(s)}
``` 
##### note: these folders don't have to be placed in your Dropbox's root folder
```
ex. (parent folder named 'PATREON' and the two folders are named PATREON_TIERS and DROPBOX_REWARDS)

DROPBOX_REWARDS_FOLDER_NAME=PATREON/DROPBOX_REWARDS

DROPBOX_TIERS_FOLDER_NAME=PATREON/PATREON_TIERS
``` 

## Usage
```
node ./main.js
```
# Troubleshooting
- Verify the names match EXACTLY between Patreon tiers and the Dropbox tier folders. Case-sensitive
- Verify the names match EXACTLY between the reward folders and the reward shortcuts you create. Case-sensitive
- If you see an `invalid_grant` error, that could be related to a bad refresh token, you may need to regenerate the token

# FAQ
- What happens if a patron doesn't have a Dropbox associated email account?
  
  They'll be able to view and download any files shared even without a Dropbox account.

#
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
