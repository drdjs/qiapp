import React,{useCallback} from 'react';
import Head from 'next/head'
import taglist from '../lib/taglist'
import Link from 'next/link'
import Router from 'next/router'
import immutable from 'immutable'
import { Grid, Segment, Table, Label, Modal, Header, Button, Menu, Icon } from 'semantic-ui-react'

/*
import {firebase} from '../lib/firebaseapp';
import { useAdminUser, useCurrentUser } from '../lib/signin'
const db = firebase.firestore();
import {useSelector,useDispatch} from 'react-redux'
*/

import {useQuery} from '../lib/apollo'
import { PROJECT_LIST,CURRENT_USER } from '../queries';



function generateLabels(doc,isAdmin) {
	return immutable.OrderedMap().withMutations((labelset) => {
		doc.category.forEach((categoryTag) => {
			labelset.set(categoryTag, [taglist[categoryTag]])
		})
		if (doc.candisplay !== 'Yes') labelset.set('isinvisible', ['Private'])
		if (doc.advertise === 'true') labelset.set('advertise', ['Looking for participants'])
		if (doc.caldicott === 'pending') labelset.set("caldicott", ['Caldicott pending', 'orange'])
		if (doc.research === 'pending') labelset.set("research", ["R+D pending", 'orange'])
		if (doc.leadername.length === 0) labelset.set('needslead', ["Needs lead", 'red'])
		if (isAdmin && doc.caldicott === 'Dontknow') labelset.set('caldicott', ["Might need Caldicott", 'red'])
		if (isAdmin && doc.research === 'Dontknow') labelset.set('research', ["Might need R+D", 'red'])
		if (doc.commit !== true) labelset.set("needsmoderated", ["Awaiting moderation", 'red'])
	})
}

function getRowColour(labelset) {
	const ranking = { red: 3, orange: 2, [undefined]: 1 }
		.reduce((r, v) => (ranking[v[1]] > ranking[r] ? v[1] : r))
}

function DatabaseRow({doc, ...props}) {
	const [modalOpen,setModalOpen]=React.useState(false)
	if (doc===null) return (
		<Table.Row key={doc.id}>
		<Table.Cell>
			<Header>Loading...</Header>
			<span><Label>Please wait...</Label> </span>
		</Table.Cell>
	</Table.Row>
	)
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
		research } = doc
	
	const handleHide = () => { setModalOpen(false) }
	const {data:currentuser} = useQuery(CURRENT_USER)
	const isAdmin = currentuser.isAdmin
	function makehref(user) {
		return <Link key={user.uid} href={"/message/" + user.uid}>{user.realname}{user.role === 'lead' ? '(lead)' : ''}</Link>
	}
	var myname = currentuser ? currentuser.displayName : null
	var iAmLeader = leadername.find((i)=>(i.id==currentuser.id)) || isAdmin
	var iAmInvolved = iAmLeader || peopleinvolved.find((i)=>(i.id==currentuser.id))
	const status = { info: 1, warning: 2, danger: 3 }
	var [labels, rowstatus] = generateLabels(doc,isAdmin)
	const projectComplete=false
	const buttons = []
	if (!iAmInvolved && !projectComplete) buttons.push({ pathname: '/enquire', icon: 'question-circle', text: 'Enquire about this' })
	if (iAmLeader && !projectComplete) {
		buttons.push({ pathname: '/edit', icon: 'pencil', text: 'Edit proposal' })
		buttons.push({ pathname: '/addoutcome', icon: 'pencil', text: 'Add outcome information' })
	} else {
		buttons.push({ pathname: '/view', icon: 'info', text: 'View proposal' })
		if (doc.outcome) buttons.push({ pathname: '/viewoutcome', icon: 'info', text: 'View outcome information' })
	}


	return (<Table.Row color={rowstatus}
		key={doc.id}
		onClick={(e) => { setModalOpen(true); e.stopPropagation() }}>
		<Table.Cell>
			<Header>{title}</Header>
			{labels.map((r) => (<span key={r.key}><Label color={r.style}>{r.value}</Label> </span>))}
			<Modal open={modalOpen} onClose={handleHide}>
				<Modal.Header>{title}</Modal.Header>
				<Modal.Content>
					{description}
					<hr />
					<b>Proposed by: </b>{proposername}<br />
					{(leadername.length === 0) ? (
						<><b>Project lead: </b>(No leader yet)</>
					) : (leadername.length ===1) ? (
						<><b>Project lead: </b>{leadername[0]['realName']}<br /></>
					) : (
						<><b>Project leads: </b>{leadername.map((i)=>(i.fullName)).join(',')}<br /></>
					)
					}
					{peopleinvolved && peopleinvolved.length > 0 ? <span><b>Others involved: </b>{peopleinvolved.map((i)=>(i.fullName)).join(',')}</span> : null}
					<hr />
					<Modal.Actions>

						{buttons.map((b, i) => (
							<Link key={i} href={{ pathname: b.pathname, query: { doc: doc.id } }}>
								<Button>
									<Icon name={b.icon} />
									{b.text}
								</Button>
							</Link>
						))}

						<Button onClick={(e) => { setModalOpen(false); e.stopPropagation() }}><Icon name="close" />Close</Button>
					</Modal.Actions>
				</Modal.Content>
			</Modal>
		</Table.Cell>
	</Table.Row>)
}


/* function* getFirebaseEvents(isAdmin) {
	const firebaseChannel = eventChannel((emit) => {
		var query = isAdmin ? db.collection("privprojects") : db.collection("pubprojects")
		if (!isAdmin) {
			query = query.where('candisplay', '==', 'Yes').where('commit', '==', true)
		}
		return query.onSnapshot((querySnapshot) => {
			for (let docChange of querySnapshot.docChanges()) {
				switch (docChange.type) {
					case 'added':
						emit({ type: 'addDocument', doc: docChange.doc })
						break
					case 'modified':
						emit({ type: 'modifyDocument', doc: docChange.doc })
						break
					case 'removed':
						emit({ type: 'deleteDocument', docid: docChange.doc.id })
						break
				}
			}
		})
    })
	try {
		while (true) {
			var evt = yield take(firebaseChannel)
			yield put(evt)
		}
	}
	finally {
		firebaseChannel.close()
	}
}
 */


function DatabaseTable(props) {
	const {loading:docsloading,data:projects}=useQuery(PROJECT_LIST)
	const {loading:userloading,data:currentuser}=useQuery(CURRENT_USER)
	
	const [statusfilter, setstatusfilter] = React.useState('all')
	const isAdmin = currentuser?currentuser.isAdmin:false


	if (!currentuser) return "Waiting for user"
	
	var listitems = projects.projectList.filter(
		(doc) => {
			switch (statusfilter) {
				case "all":
					return true;
				case "needslead":
					return (doc.leader.length === 0)
				case "recruiting":
					return (doc.leader.length === 0 || doc.advertise === 'true')
				default:
					return (statusfilter === doc.status)
			}
		}).map(
			(doc) => {
				return (<DatabaseRow doc={doc} visible={props.match && props.match.params === doc.id} key={doc.id} />)
			});

	return (<div className="App">
		<Head>
			<title>People Make QI</title>
		</Head>

		<Menu tabular>
			<Menu.Item active={statusfilter === "all"} onClick={() => setstatusfilter('all')}>All</Menu.Item>
			<Menu.Item active={statusfilter === "needslead"} onClick={() => setstatusfilter('needslead')}>Needs lead</Menu.Item>
			<Menu.Item active={statusfilter === "recruiting"} onClick={() => setstatusfilter('recruiting')}>Looking for collaborators</Menu.Item>
			<Menu.Item active={statusfilter === "recentupdate"} onClick={() => setstatusfilter('recentupdate')}>Recently Updated</Menu.Item>
			<Menu.Item active={statusfilter === "complete"} onClick={() => setstatusfilter('complete')}>Completed</Menu.Item>
		</Menu>

		<Table celled selectable id="accordion-example"><Table.Body>{listitems}</Table.Body></Table>
	</div>)
}

import  withData  from '../lib/next-apollo'
import { HttpLink } from '@apollo/client'


// can also be a function that accepts a `context` object (SSR only) and returns a config
const config = {
  link: new HttpLink({
    credentials: 'same-origin', // Additional fetch() options like `credentials` or `headers`
    uri: '/api/graphql', // Server URL
  })
}

export default withData(config)(DatabaseTable)
