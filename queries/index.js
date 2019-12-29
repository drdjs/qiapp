import {gql} from '@apollo/client'
export const CURRENT_USER=gql`
    query currentuser{
        getLoggedInUser{
            userinfo{
                username
                realName
                email
            }
            isAdmin
        }
    }`
export const PROJECT_LIST=gql`
    query getProjects{
        projectlist{
            title
            description
            leadername{
                id
                realName
                username
            }
            peopleinvolved{
                id
                realName
                username
            }
            category
            candisplay
            advertise
            caldicott
            research
        }
    }`
