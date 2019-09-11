import React from 'react';
import {Col,Label,Panel,Modal,ListGroup,ListGroupItem,PanelGroup,Navbar,Nav,NavItem,Glyphicon,Button} from 'react-bootstrap';
import {useCurrentUser,useAdminUser,SignInScreen,SigninAssistant,signout} from './signin'
import Link from 'next/link'
import {Menu,Icon} from 'semantic-ui-react'
import Router from 'next/router'

function TopNav (props){
	const [user]=useCurrentUser()
	const [isAdmin]=useAdminUser()
  const loginbutton=user.isAnonymous?(
		<Link href="/signin" passHref>
		<Menu.Item>Login 
				<Icon name='sign-in'/> 
			
		</Menu.Item>
		</Link>
							
		):(
		<Menu.Item onClick={()=>{signout()}}> 	
				<span>
					<Icon name='sign-out'/>
				Logout {user.displayName}{isAdmin?'(admin)':''}
				</span>
			
		</Menu.Item>
		)
	return 	(<Menu stackable inverted>
					
            <Link href="/" passHref><Menu.Item header>QEUH QI Portal</Menu.Item></Link>
						<Link href="/addproject"><Menu.Item> <Icon name='thumbs up'/>Propose Project </Menu.Item></Link>
						
					  
						<Link href="/projects" passHref><Menu.Item><Icon name='list'/>Projects</Menu.Item></Link>
				{loginbutton}
				</Menu>)
					
	}
			
    

export default TopNav