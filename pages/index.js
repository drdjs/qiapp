import React from 'react';
import firebase from 'variable/firebaseapp';
import Head from 'next/head'
import {useAdminUser,useCurrentUser} from '../lib/signin'
const db = firebase.firestore();
import taglist from '../lib/taglist'
import Link from 'next/link'
import Router from 'next/router'
import immutable from 'immutable'
import {Grid,Segment,Table,Label,Modal,Header,Button,Menu,Icon} from 'semantic-ui-react'

const projectInfoTemplate=immutable.Map({
	title:'',
	proposername:immutable.List(),
	description:'',
	propdate:'',
	methodology:'',	
	category:immutable.Set(),
	othertags:immutable.Set(),
	leadername:immutable.Set(),
	email:'',
	peopleinvolved:immutable.Set(),
	advertise:undefined,   //['yes','no']
	mm_or_ci:undefined,    //['yes','no']
	caldicott:undefined,   //['yes','no','pending','dontknow']
	research:undefined,	   //  "
	datepicker:'',
	finishdate:'',
	candisplay:'',
	}
	]

function generateLabels(docdata){
	return immutable.OrderedMap().withMutations((labelset)=>{
		docdata.category.forEach((categoryTag)=>{
			labelset.set(categoryTag,[taglist[categoryTag]])
		})
		if (docdata.candisplay!=='Yes') labelset.set('isinvisible',['Private'])
		if (docdata.advertise==='true') labelset.set('advertise',['Looking for participants'])
		if (docdata.caldicott==='pending') labelset.set("caldicott",['Caldicott pending','orange'])
		if (docdata.research==='pending') labelset.set("research",["R+D pending",'orange'])
		if (docdata.leadername.length===0) labelset.set('needslead',["Needs lead",'red'])
		if (isAdmin && docdata.caldicott==='Dontknow') labelset.set('caldicott',["Might need Caldicott",'red'])
		if (isAdmin && docdata.research==='Dontknow') labelset.set('research',["Might need R+D",'red'])
		if (docdata.commit!==true) labelset.set("needsmoderated",["Awaiting moderation",'red'])
	})
}

function getRowColour(labelset){
	const ranking={red:3,orange:2,[undefined]:1}
	.reduce((r,v)=>(ranking[v[1]]>ranking[r]?v[1]:r))
}

function useMemoisedSelector(docid){
	return useSelector(useCallback(()=>((state)=>(state.getIn(['projects',docid])),[docid]))
}
	
function DatabaseRow (props) {    		
	const modalOpen=,setModalOpen]=React.useState(false)
	const {
		proposername,
		title,
		description,
		leadername,
		peopleinvolved,
		category,
		candisplay,
		advertise,
		caldicott,
		research}=useMemoisedSelector(props.docid).toObject()
	const modalOpen=useSelector((state)=>(state.getIn(['projects','openModal'])===props.docid))
	const setModalOpen=(isOpen)=>{useDispatch()({type:'projectView',docid:isOpen?props.docid:null})}
	const [isAdmin]=useAdminUser()
		
	const handleHide = ()=>{setModalOpen(false)}
			
	const [currentuser]=useCurrentUser()
		
	function makehref(user){
		return <Link key={user.uid} href={"/message/"+user.uid}>{user.realname}{user.role === 'lead' ? '(lead)':''}</Link>
	}
	var rowstatus	
	var myname=currentuser ? currentuser.displayName:null
	var iAmLeader=leadername.includes(myname) || isAdmin
	var iAmInvolved=iAmLeader||peopleinvolved.includes(myname)
	const status={info:1,warning:2,danger:3}
	var [labels,rowstatus]=generateLabels(doc.data())
	const buttons=[]
	if(!iAmInvolved && !projectComplete) buttons.push({pathname:'/enquire',icon:'question-circle',text:'Enquire about this'})
	if (iAmLeader && !projectComplete) {
		buttons.push({pathname:'/edit',icon:'pencil',text:'Edit proposal'})
		buttons.push({pathname:'/addoutcome',icon:'pencil',text:'Add outcome information'})
	}else{
		buttons.push({pathname:'/view',icon:'info',text:'View proposal'})
		if (values.outcome) buttons.push({pathname:'/viewoutcome',icon:'info',text:'View outcome information'})
	}
		
		
	return (<Table.Row 	color={rowstatus} 
						key={doc.id} 
						onClick={(e)=>{setModalOpen(true);e.stopPropagation()}}>
				<Table.Cell>
					<Header>{title}</Header>
					{labels.map((r)=>(<span key={r.key}><Label color={r.style}>{r.value}</Label> </span>))}
                	<Modal open={modalOpen} onClose={handleHide}>
						<Modal.Header>{title}</Modal.Header>
                		<Modal.Content>
                    		{description}
                    		<hr/>
                    		<b>Proposed by: </b>{proposername}<br/>
							{(leadername.length===0)? (
								<><b>Project lead: </b>(No leader yet)</>
							):(
								<><b>Project lead{leadername.length>1?'s':''}:</b>{leadername.join(',')}<br/></>
							)}
							{peopleinvolved && peopleinvolved.length>0?<span><b>Others involved: </b>{peopleinvolved.join(',')}</span>:null}
							<hr/>
					<Modal.Actions>
										
					{buttons.map((b,i)=>(
						<Link key={i} href={{pathname:b.pathname,query:{doc:doc.id}}}>
						<Button>
						<Icon name={b.icon}/>
						{b.text}
						</Button>
						</Link>
					)}
					
				<Button onClick={(e)=>{setModalOpen(false);e.stopPropagation()}}><Icon name="close"/>Close</Button>
				</Modal.Actions>
				</Modal.Content>
                </Modal>
				</Table.Cell>	
            </Table.Row>)
    }


function* getFirebaseEvents(isAdmin){	
	const firebaseChannel=eventChannel((emit){
		var query=isAdmin?db.collection("privprojects"):db.collection("pubprojects")
		if (!isAdmin){
			query=query.where('candisplay','==','Yes').where('commit','==',true)
		}
		return query.onSnapshot((querySnapshot) => {
			for (docChange of querySnapshot.docChanges()){
				switch(docChange.type){
					case 'added':
						emit({type:'addDocument',doc:docChange.doc})
						break
					case 'modified':
						emit({type:'modifyDocument',doc:docChange.doc})
						break
					case 'removed':
						emit({type:'deleteDocument',docid:docChange.doc.id})
						break
				}
			}
		}
    })
	try{
		while (true){
			var evt=yield take(firebaseChannel)
			yield put(evt)
		}
	}
	finally{
		firebaseChannel.close()
	}	
}


	
function DatabaseTable (props) {
  console.log ('rendering table')
    const [docs,setDocs]=React.useState([])
	const [statusfilter,setstatusfilter]=React.useState('all')
	const [fallback,setfallback]=React.useState("Loading...");
    const isAdmin=useAdminUser()
    
		
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