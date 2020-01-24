import React from 'react';
import firebase from '../lib/firebaseapp';
import Head from 'next/head'
//import {Col,Label,Panel,Modal,ListGroup,ListGroupItem,PanelGroup,Navbar,Nav,NavItem,Glyphicon,Button} from 'react-bootstrap';
import {UserContext,AdminContext,SignInScreen,SigninAssistant,useAdminUser,useCurrentUser} from '../lib/signin'
const db = firebase.firestore();
import taglist from '../lib/taglist'
import Link from 'next/link'
import Router from 'next/router'
import {Grid,Segment,Table,Label,Modal,Header,Button,Menu,Icon} from 'semantic-ui-react'

function DatabaseRow (props) {
    		
	const [modalOpen,setModalOpen]=React.useState(false)
	const [proposername,setproposername] = React.useState('...')
	const [title,settitle]= React.useState('...')
	const [description,setdescription] = React.useState('...')
	const [leadername,setleadername] =React.useState([])
	const [peopleinvolved,setpeopleinvolved]= React.useState([])
	const [category,setcategory]=React.useState([])
	const [isAdmin]=useAdminUser()
	
    React.useEffect(()=>{
		stateSetter(props.doc)
		return props.doc.ref.onSnapshot(stateSetter)
	},[])
	
	const stateSetter = (doc)=>{
		setproposername((doc.data().proposername || []).join(','))
		setleadername((doc.data().leadername || []))
		setpeopleinvolved((doc.data().peopleinvolved || []))
		settitle(doc.data().title)
		setdescription(doc.data().description)
		setcategory(doc.data().category)	
	}
			
	const handleHide = ()=>{setModalOpen(false)}
			
	var doc=props.doc;
	var values=Object.assign({},doc.data())
	const [currentuser]=useCurrentUser()
		
	function makehref(user){
		return <Link key={user.uid} href={"/message/"+user.uid}>{user.realname}{user.role === 'lead' ? '(lead)':''}</Link>
	}
	var rowstatus	
	var myname=currentuser ? currentuser.displayName:null
	var iAmLeader=leadername.includes(myname) || isAdmin
	var iAmInvolved=iAmLeader||peopleinvolved.includes(myname)
	const status={info:1,warning:2,danger:3}
	var labels=Array.from(function*(){
		for (let t of (category || [])){
			yield {key:t,value:taglist[t],rowstatus:status.default}
		}
		if (values.candisplay!=='Yes') {yield {key:"isinvisible",style:"",value:"Private"};rowstatus=''}
		if (values.advertise==='true') {yield {key:'advertise',style:"",value:"Looking for participants"};rowstatus=''}
		if (values.caldicott==='pending') {yield {key:"caldicott",style:"orange",value:"Caldicott pending"};rowstatus='orange'}
		if (values.research==='pending') {yield {key:"research",style:"orange",value:"R+D pending"};rowstatus='orange'}
		if (values.leadername.length===0) {yield {key:"needslead",style:"red",value:"Needs lead"};rowstatus='red'}
		if (isAdmin && (values.caldicott==='Dontknow'||values.research==='Dontknow')) {yield {key:"needsapproval",style:"red",value:"Might need approval"};rowstatus='danger'}
		if (values.commit!==true) {yield {key:"needsmoderated",style:"red",value:"Awaiting moderation"};rowstatus='red'}
		
	}()).map((r)=>(<span key={r.key}><Label color={r.style}>{r.value}</Label> </span>))
		
		
	return (<Table.Row 	color={rowstatus} 
						key={doc.id} 
						onClick={(e)=>{setModalOpen(true);e.stopPropagation()}}>
				<Table.Cell>
					<Header>{title}</Header>
					{labels}
                	<Modal open={modalOpen} onClose={handleHide}>
						<Modal.Header>{title}</Modal.Header>
                		<Modal.Content>
                    		{description}
                    		<hr/>
                    		<b>Proposed by: </b>{proposername}<br/>
							{(leadername===undefined || leadername.length===0)? (
								<><b>Project lead: </b>(No leader yet)</>
							):(
								<><b>Project lead{leadername.length>1?'s':''}:</b>{leadername.join(',')}<br/></>
							)}
							{peopleinvolved && peopleinvolved.length>0?<span><b>Others involved: </b>{peopleinvolved.join(',')}</span>:null}
							<hr/>
					<Modal.Actions>
					{Array.from(function* (self){ 
						if (doc.data().status !== 'complete'){
							if (!currentuser.isAnonymous){
								if(!iAmInvolved){
									yield <Button key={2} onClick={()=>{}}><Icon name='question-circle'/>Enquire about this</Button>
								}
								if (iAmLeader) {
									yield <Button key={3} onClick={()=>Router.push('/edit?doc='+doc.id)} ><span><Icon name='pencil'/> Edit proposal</span></Button>
									yield <Button key={4} onClick={()=>Router.push('/addoutcome?doc='+doc.id)} ><span><Icon name='pencil'/> Add outcome information</span></Button>
									
								}else{
									yield <Button
									  key={3} onClick={()=>Router.push('/view?doc='+doc.id)} ><span><Icon name='info'/> View proposal</span></Button>
									if (values.outcome) {
										yield <Button key={4} onClick={()=>Router.push('/viewoutcome?doc='+doc.id)} ><span><Icon name='info'/> View outcome information</span></Button>
									}
								}
						}}
						yield <Button key={5} onClick={()=>Router.push('/moreinfo/'+doc.id)}><Icon name='info'/>More information</Button>
						yield <Button key={6} onClick={(e)=>{setModalOpen(false);e.stopPropagation()}}><Icon name="close"/>Close</Button>			
					}(this))}
				</Modal.Actions>
				</Modal.Content>
                </Modal>
				</Table.Cell>	
            </Table.Row>)
    }

function DatabaseRow2 ({doc}) {
    console.log('rendering row')	
		const [modalOpen,setModalOpen]=React.useState(false)
		const stateSetter = (doc)=>(Object.assign({},doc,{
			proposername:(doc.proposername||[]).join(','),
			leadername:(doc.leadername || []),
			peopleinvolved:(doc.peopleinvolved || []),
			category:(doc.category||[])}))
		const [docData,setDocData]=React.useState(()=>(stateSetter(doc.data())))

		const [isAdmin]=useAdminUser()

		React.useEffect(()=>{
			return doc.ref.onSnapshot((doc)=>{stateSetter(doc.data())})
		},[])
		
		
		const handleHide = ()=>{setModalOpen(false)}
		const [currentuser]=useCurrentUser()
			
		function makehref(user){
			return <Link key={user.uid} href={"/message/"+user.uid}>{user.realname}{user.role === 'lead' ? '(lead)':''}</Link>
		}
		var rowstatus	
		var myname=currentuser ? currentuser.name:null
		var iAmLeader=docData.leadername.includes(myname) || isAdmin
		var iAmInvolved=iAmLeader||docData.peopleinvolved.includes(myname)
		const status={info:1,warning:2,danger:3}
		const mapfunc=(r)=>(<span key={r.key}><Label color={r.style}>{r.value}</Label> </span>)
		var labels=Array.from(function*(){
			for (let t of (docData.category || [])){
				yield mapfunc({key:t,value:taglist[t],rowstatus:status.default})
			}
			if (docData.candisplay!=='Yes') {yield mapfunc({key:"isinvisible",style:"",value:"Private"});rowstatus=''}
			if (docData.advertise==='true') {yield mapfunc({key:'advertise',style:"",value:"Looking for participants"});rowstatus=''}
			if (docData.caldicott==='pending') {yield mapfunc({key:"caldicott",style:"orange",value:"Caldicott pending"});rowstatus='orange'}
			if (docData.research==='pending') {yield mapfunc({key:"research",style:"orange",value:"R+D pending"});rowstatus='orange'}
			if (docData.leadername.length===0) {yield mapfunc({key:"needslead",style:"red",value:"Needs lead"});rowstatus='red'}
			if (isAdmin && (docData.caldicott==='Dontknow'||docData.research==='Dontknow')) {yield mapfunc({key:"needsapproval",style:"red",value:"Might need approval"});rowstatus='danger'}
			if (docData.commit!==true) {yield mapfunc({key:"needsmoderated",style:"red",value:"Awaiting moderation"});rowstatus='red'}
			
		}())
			
			
		return (<Table.Row 	color={rowstatus} 
							key={doc.id} 
							onClick={(e)=>{setModalOpen(true);e.stopPropagation()}}>
					<Table.Cell>
						<Header>{docData.title}</Header>
						{labels}
						<Modal open={modalOpen} onClose={handleHide}>
							<Modal.Header>{docData.title}</Modal.Header>
							<Modal.Content>
								{docData.description}
								<hr/>
								<b>Proposed by: </b>{docData.proposername}<br/>
								{(docData.leadername===undefined || docData.leadername.length===0)? (
									<><b>Project lead: </b>(No leader yet)</>
								):(
									<><b>Project lead{docData.leadername.length>1?'s':''}:</b>{docData.leadername.join(',')}<br/></>
								)}
								{docData.peopleinvolved && docData.peopleinvolved.length>0?<span><b>Others involved: </b>{docData.peopleinvolved.join(',')}</span>:null}
								<hr/>
						<Modal.Actions>
						{Array.from(function* (self){ 
							if (docData.status !== 'complete'){
								if (!currentuser.isAnonymous){
									if(!iAmInvolved){
										yield <Button key={2} onClick={()=>{}}><Icon name='question-circle'/>Enquire about this</Button>
									}
									if (iAmLeader) {
										yield <Link href={{pathname:'/edit',query:{doc:doc.id}}} passHref><Button key={3} ><span><Icon name='pencil'/> Edit proposal</span></Button></Link>
										yield <Link href={{pathname:'/addoutcome',query:{doc:doc.id}}} passHref><Button key={4}  ><span><Icon name='pencil'/> Add outcome information</span></Button></Link>
										
									}
							}}
							yield <Link href={{pathname:'/moreinfo',query:{doc:doc.id}}} passHref><Button key={5} ><Icon name='info-sign'/>More information</Button></Link>
							yield <Button key={6} onClick={(e)=>{setModalOpen(false);e.stopPropagation()}}><Icon name="close"/>Close</Button>			
						}(this))}
					</Modal.Actions>
					</Modal.Content>
					</Modal>
					</Table.Cell>	
				</Table.Row>)
		}
	

function DatabaseTable (props) {
  console.log ('rendering table')
    const [docs,setDocs]=React.useState([])
	const [statusfilter,setstatusfilter]=React.useState('all')
	const [fallback,setfallback]=React.useState("Loading...");
    const isAdmin=React.useContext(AdminContext)
    React.useEffect(()=>{
		var query=isAdmin?db.collection("privprojects"):db.collection("pubprojects")
		if (!isAdmin){
			query=query.where('candisplay','==','Yes').where('commit','==',true)
		}
		return query.onSnapshot(
			(querySnapshot) => {
				setDocs(querySnapshot.docs)
				setfallback("Nothing to display, sorry")	
        })
    },[])
		
	if (props.user===null) return "Waiting for user"
    var listitems=docs.filter(
		(doc)=>{
			switch (statusfilter){
			case "all":
				return true;
			case "needslead":
				return (doc.data().leadername.length===0)
			case "recruiting":
				return (doc.data().leadername.length===0 || doc.data().advertise==='true')
			default:
				return (statusfilter===doc.data().status)
			}}).map(
				(doc)=> {
					return (<DatabaseRow doc={doc} docdata={doc.data()} visible={props.match && props.match.params===doc.id} key={doc.id}/>)});
		
        return (<div className="App">
			<Head>
	  <title>People Make QI</title>    
	  </Head>
			
			<Menu tabular>
			<Menu.Item active={statusfilter==="all"} onClick={()=>setstatusfilter('all')}>All</Menu.Item>
			<Menu.Item active={statusfilter==="needslead"} onClick={()=>setstatusfilter('needslead')}>Needs lead</Menu.Item>
			<Menu.Item active={statusfilter==="recruiting"} onClick={()=>setstatusfilter('recruiting')}>Looking for collaborators</Menu.Item>
			<Menu.Item active={statusfilter==="recentupdate"} onClick={()=>setstatusfilter('recentupdate')}>Recently Updated</Menu.Item>
			<Menu.Item active={statusfilter==="complete"} onClick={()=>setstatusfilter('complete')}>Completed</Menu.Item>
			</Menu>
			
			<Table celled selectable id="accordion-example"><Table.Body>{listitems}</Table.Body></Table>
			</div>)
    }

	export default DatabaseTable