import React from 'react';
import {HashRouter as Router, Route, Link, Redirect} from 'react-router-dom'

import './App.css';
import firebase from './firebaseapp';
import firebaseui from 'firebaseui'
import {Col,Label,Panel,Modal,ListGroup,ListGroupItem,PanelGroup,Navbar,Nav,NavItem,Glyphicon,Button} from 'react-bootstrap';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import AddProjectForm from './AddProjectForm'
import AddOutcomeForm from './AddOutcomeForm'
import InputField from './InputField'
import FileUploader from './FileUploader'
import AddStatus from './AddStatusForm'
import reducer from './reducer'
import {Provider,connect} from 'react-redux'
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import taglist from './taglist'
import TempSignInScreen from './TempLogin'

// Note: this API requires redux@>=3.1.0
const db = firebase.firestore();
const store = createStore(
  reducer,
  {forms:{
  },
  db:db},
  applyMiddleware(thunk)
);

function connectuser(func){
	return connect((s)=>({user:s.currentuser}))(func)
}


UserContext=React.createContext(null)
//store.subscribe(()=>{//console.log(store.getState())})
const SignInScreen=function (props) {
  const user=React.useContext(UserContext)
  const uiConfig = {
    signInFlow: 'redirect',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
	  firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => false
    }
  };

    if (user===null) {
      return (        
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
       
      );
    }
    //return <Redirect to='/'/>
	return null
  
}


function SigninAssistant (props){

  [currentuser,setUser]=React.useState(null)
  React.useEffect(()=>(firebase.auth().onAuthStateChanged((user) => setUser(user)))) //onauthstatechanged returns disconnect function
  return <UserContext.Provider value={currentuser}>{props.children}</UserContext.Provider>
  }


class DatabaseRow extends React.Component {
    constructor(props) {
        super(props);
		
        this.state = {	open: false,
						editopen:false,
						rowstatus:'...',
						proposername: '...',
						proposerinfo:[],
						peoplenames: '...',
						title:'...',
						description:'...',
						pplinfo:[]
						};
		this.stateSetter=this.stateSetter.bind(this)
		this.handleHide=this.handleHide.bind(this)

    }
	componentDidMount(){
		this.stateSetter(this.props.doc)
		this.snapshotUnloader=this.props.doc.ref.onSnapshot(this.stateSetter)
	}
	componentWillUnmount(){
		this.snapshotUnloader()
	}
	stateSetter(doc){
		this.setState({rowstatus:doc.data().status,
						proposername: (doc.data().proposer || []).map((x)=>(x.realname)).join(),
						proposerinfo: doc.data().proposer ,
						pplinfo:(doc.data().peopleinfo),
						leadername:(doc.data().leadername),
						peopleinvolved:(doc.data().peopleinvolved),
						peoplenames: (doc.data().peopleinfo || []).map((x)=>(x.realname+(x.role === 'lead' ? '(lead)':''))).join(),
						title:doc.data().title,
						description:doc.data().description,
						category:doc.data().category
						})
	}
	
	
			
	handleHide(){
		this.setState({open:false,rupert:'bear'})
		}	
		
	render() {
		var doc=this.props.doc;
		var values=Object.assign({},doc.data())
		var currentuser=this.props.user
		if (currentuser===undefined) {console.log('no user');return null}
		var {rowstatus,category,proposername,proposerinfo,leadername,title,description,peopleinvolved} = this.state;
		function makehref(user){
			return <Link key={user.uid} to={"/message/"+user.uid}>{user.realname}{user.role === 'lead' ? '(lead)':''}</Link>
		}
		rowstatus=undefined
		
		leadername= leadername||[]
		peopleinvolved = (peopleinvolved||[])
		proposername=(proposerinfo || []).map(makehref)
		
		var myname=currentuser ? currentuser.displayName:null
		var iAmLeader=leadername.includes(myname) || !currentuser.isAnonymous
		var iAmInvolved=iAmLeader||peopleinvolved.includes(myname)
		const status={info:1,warning:2,danger:3}
		var labels=Array.from(function*(){
			for (let t of (category || [])){
				yield {key:t,value:taglist[t],rowstatus:status.default}
			}
			if (values.advertise==='true') {yield {key:'advertise',style:"info",value:"Looking for participants"};rowstatus='info'}
			if (values.caldicott==='pending') {yield {key:"caldicott",style:"warning",value:"Caldicott pending"};rowstatus='warning'}
			if (values.research==='pending') {yield {key:"research",style:"warning",value:"R+D pending"};rowstatus='warning'}
			if (values.leadername.length===0) {yield {key:"needslead",style:"danger",value:"Needs lead"};rowstatus='danger'}
			if (values.caldicott==='Dontknow'||values.research==='Dontknow') {yield {key:"needsapproval",style:"danger",value:"Might need approval"};rowstatus='danger'}
		}()).map((r)=>(<span key={r.key}><Label bsStyle={r.style}>{r.value}</Label> </span>))
		if (leadername.length===0) leadername=['(No leader yet)']
		
		
return (<ListGroupItem bsStyle={rowstatus} eventKey={doc.id} onClick={()=>{console.log('clicked');this.setState({open:!this.state.open})}} header={title}>
                
				{labels}
                <Modal show={this.state.open} onHide={this.handleHide}>
				<Modal.Header closeButton>{title}</Modal.Header>
                <Modal.Body>
                    {description}
                    <hr/>
                    <b>Proposed by: </b>{proposername}<br/>
					<b>Project lead{leadername.length>1?'s':''}:</b>{leadername.join(',')}<br/>
						{peopleinvolved.length>0?<span><b>Others involved: </b>{peopleinvolved.join(',')}</span>:null}
					<hr/>
					
					{Array.from(function* (self){ 
						if (doc.data().status !== 'complete'){
							if (currentuser.isAnonymous){
									yield <Button key={1} componentClass={Link} to='/logout'> <Glyphicon glyph='log-in'/> Login to get involved</Button>
							}else{
								if(!iAmInvolved){
										yield <Button key={2} onClick={self.joinThis}><Glyphicon glyph='thumbs-up'/>Enquire about this</Button>
								}
								if (iAmLeader) {
									yield <Button key={3} componentClass={Link} to={'/edit/'+doc.id} ><Glyphicon glyph='pencil'/> Edit proposal</Button>
									yield <Button key={4} componentClass={Link} to={'/editoutcome/'+doc.id} ><Glyphicon glyph='pencil'/> Add/Edit outcome information</Button>
									
								}else{
									yield <Button key={3} componentClass={Link} to={'/view/'+doc.id} ><Glyphicon glyph='pencil'/> View proposal</Button>
									if (values.outcome) {
										yield <Button key={4} componentClass={Link} to={'/viewoutcome/'+doc.id} ><Glyphicon glyph='pencil'/> View outcome information</Button>
									}
								}
						}}
						yield <Button key={5} componentClass={Link} to={'/moreinfo/'+doc.id}><Glyphicon glyph='info-sign'/>More information</Button>
						yield <Button key={6} onClick={()=>{self.setState({open:false})}}>Close</Button>			
					}(this))}
				</Modal.Body>
                </Modal>
				
            </ListGroupItem>)
    }

}
DatabaseRow = connectuser(DatabaseRow)

class DatabaseTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {docs: [],updated:Date(),statusfilter:'all',fallback:"Loading..."};
    }
    componentDidMount() {
		
		var q =db.collection("projects")
		this.unregisterSnapshot=q.onSnapshot((querySnapshot) => {
            this.setState({docs:querySnapshot.docs,updated:Date(),fallback:"Nothing to display, sorry"})
			
        })
    }
	componentWillUnmount(){
		this.unregisterSnapshot()
	}

    render() {
		if (this.props.user===null) return <p>Loading...</p>
        var listitems=this.state.docs.filter(
				(doc)=>{
					switch (this.state.statusfilter){
						case "all":
						  return true;
						case "needslead":
						   return (doc.data().leadername.length===0)
						case "recruiting":
						   return (doc.data().leadername.length===0 || doc.data().advertise==='true')
						default:
						  return (this.state.statusfilter===doc.data().status)
				}}).map(
				(doc)=> {
					return (<DatabaseRow doc={doc} docdata={doc.data()} visible={this.props.match && this.props.match.params===doc.id} key={doc.id}/>)});
		
        return (<div className="App">
			<div>
			<Nav bsStyle="tabs" activeKey={this.state.statusfilter} onSelect={k => {this.setState({statusfilter:k})}}>
			<NavItem eventKey="all">All</NavItem>
			<NavItem eventKey="needslead">Needs lead</NavItem>
			<NavItem eventKey="recruiting">Looking for collaborators</NavItem>
			<NavItem eventKey="recentupdate">Recently Updated</NavItem>
			<NavItem eventKey="complete">Completed</NavItem>
			</Nav>
			</div>
			<ListGroup id="accordion-example">{listitems}</ListGroup>
			</div>);
    }
}
DatabaseTable= connectuser(DatabaseTable)

class MessageTable extends  React.Component {
    constructor(props) {
        super(props);
        this.state = {msgs: [],updated:Date()};
    }
    componentDidMount() {
		var q = db.collection("messages").where("to","array-contains",this.props.user.uid)
		this.unregisterSnapshot=q.onSnapshot((querySnapshot) => {
            this.setState({docs:querySnapshot.docs,updated:Date()})
			
        })
    }
	componentWillUnmount(){
		this.unregisterSnapshot()
	}

    render() {
		
        var listitems=this.state.msgs.map((doc)=> {
            return (<MessageRow doc={doc} docdata={doc.data()} key={doc.id}/>)});
        return (<div>Messaging functionality still under construction<PanelGroup accordion id="accordion-example">{listitems}</PanelGroup></div>);
    }
}

class MessageRow extends React.Component {
    constructor(props) {
        super(props);
		//var docdata=this.props.doc.data();
        this.state = {	open: false,
						editopen:false,
						to:[],
						sendername: '...',
						senderid:'...',
						proposerinfo:[],
						peoplenames: '...',
						title:'...',
						message:'...',
						sent: new Date(),
						pplinfo:[]
						};
		this.leadThis = this.changeRole.bind(this,'lead');
		this.leaveThis = this.changeRole.bind(this,null);
		this.joinThis = this.changeRole.bind(this,'worker');
		this.markread=this.markRead.bind(this);
		this.stateSetter=this.stateSetter.bind(this)

    }
	componentDidMount(){
		this.stateSetter(this.props.doc)
		this.snapshotUnloader=this.props.doc.ref.onSnapshot(this.stateSetter)
	}
	componentWillUnmount(){
		this.snapshotUnloader()
	}
	stateSetter(doc){
		this.setState({rowstatus:doc.data().status,
						sendername: doc.data().sendername,
						senderinfo: doc.data().sender ,
						pplinfo:(doc.data().peopleinfo),
						peoplenames: (doc.data().peopleinfo || []).map((x)=>(x.realname)).join(),
						title:doc.data().title,
						message:doc.data().description,
						sent:doc.data().sent,
						read:!(doc.data().unreadby || []).contains(this.props.user.uid)
						})
	}
	
	markRead(e){
		var docref=this.props.doc.ref
		var currentuser=this.props.user
		//var checked=e.target.checked
		async function trans(txn){
			var doc = await txn.get(docref)
			try{
				var unreadby = (doc.data().unreadby || []).filter((user)=>(user !== currentuser.uid))
				await txn.update(docref,{unreadby:unreadby})
				
				this.setState({read:true})
			}catch(e){
				//console.log('transaction failed: '+e)
			}
		}
		db.runTransaction(trans.bind(this))
	}
		
		
					
	render() {
        var doc=this.props.doc;
		var currentuser=this.props.user
		var {sendername,senderinfo,pplinfo,peoplenames,title,message} = this.state;
		function makehref(user){
			return <Link key={user.uid} to={"/message/"+user.uid}>{user.realname}{user.role === 'lead' ? '(lead)':''}</Link>
		}
		peoplenames=(pplinfo || []).map(makehref)
		sendername=(senderinfo || []).map(makehref)
		
		
		
		var buttons= [	<Button key={3} componentClass={Link} to={'/reply/'+doc.id}> <Glyphicon glyph='share-alt'/> Reply</Button>,
						<Button key={3} componentClass={Link} to={'/replyall/'+doc.id}> <Glyphicon glyph='share-alt'/> Reply all</Button>
					]
		//console.log(this.state)
        return(
            <Panel eventKey={doc.id}>
                <Panel.Heading>
                    <Panel.Title toggle>{title} </Panel.Title>
                </Panel.Heading>
                <Panel.Body collapsible>
                    {message}
                    <hr/>
                    <b>From:</b>{sendername}<br/>
                    <b>To: </b>{peoplenames}<hr/>{buttons}
                </Panel.Body>
            </Panel>)

    }

}

function MyProjects(props){
	return (<div>
		<h3>My Projects</h3>
			<DatabaseTable onlyme />
		
		</div>)
}

function Logout(props){
	firebase.auth().signOut();
	return <Redirect to="/"/>
}

function MessageNav(props){
	return <NavItem eventKey={2.1} componentClass={Link} to="/messages" href="/messages"><Glyphicon glyph="envelope"/> Messages </NavItem>
}

const TopNav=connectuser(
function (props){
	var buttons= (props.user || {isAnonymous:true}).isAnonymous?(
					<Nav>
					<NavItem eventKey={1} componentClass={Link} to="/logout" href="/logout">Login 
					<Glyphicon glyph='log-in'/>
					</NavItem>
                    <NavItem eventKey={3.2} componentClass={Link} to="/logout" href="/logout"><Glyphicon glyph='flash'/>Login to propose Project </NavItem>
					</Nav>
					):(
					<Nav>
					<NavItem eventKey={1} componentClass={Link} to="/logout" href="/logout">Logout {props.user.displayName}
					<Glyphicon glyph='log-out'/>
					</NavItem>
                    <NavItem eventKey={3.2} componentClass={Link} to="/addproject" href="/addproject"><Glyphicon glyph='flash'/>Propose Project </NavItem>
                    <NavItem eventKey={3.3} componentClass={Link} to="/" href="/"><Glyphicon glyph='inbox'/>Projects</NavItem>
				<MessageNav/>
				</Nav>
					)
   
			
    return(<Navbar inverse collapseOnSelect>
        <Navbar.Header>
            <Navbar.Brand>
                <a href="/">WoSTRAQ Local (development)</a>
				
            </Navbar.Brand>
            <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
		{buttons}
        </Navbar.Collapse>
    </Navbar>)}
)

function MessageTo (props) {
	db.collection('projects').doc(props.match.params.recipient).get().then()
}

class SendMessage extends React.Component{
	constructor(props){
		super(props)
		this.handleSubmit=this.handleSubmit.bind(this)
		this.state={title:props.title || '',message: props.message || '',show:false,pplinfo:props.pplinfo}
		
		this.handleTitleChange=this.handleChange.bind(this,'title')
		this.handleDescChange=this.handleChange.bind(this,'message')
		this.handleClose=this.handleClose.bind(this)
	}
	componentDidMount(){
		this.setState({show:this.props.show})
	}
	handleChange(param,e) {
		var newstate={}
		newstate[param]=e.target.value
		this.setState(newstate);
	}
	handleClose(){
		this.props.history.goBack()
	}
		
	handleSubmit(evt){
		var currentuser=this.props.user
		if (Math.min(this.state.title.length,this.state.description.length)>0){
			//console.log(currentuser)
			var newrecord={ 
				message:this.state.message, 
				title: this.state.title,
				senderid: [currentuser.uid],
				peopleinfo: this.state.pplinfo,
				unreadby: this.state.pplinfo.map((p)=>(p.uid)),
				sent: new Date(),
				sender: [{uid:currentuser.uid,realname:currentuser.displayName}]}
			db.collection('messages').add(newrecord).then(()=>(this.handleClose()));
			
		}
		if (evt){evt.preventDefault()}
	}
	
	
	render(){
	return (<div>
          <h2 className="App-logo">
            Send Message
          </h2>
          <div>
            
			<form onSubmit={this.handleSubmit}>
        <InputField
          controlId="formTitle"
          label="Project Title"
          componentClass="input"
          placeholder="Message Title"
		  value={this.state.title}
		  validator={()=>(null)}
		  onChange={this.handleTitleChange}
          />
		  
		<InputField
          controlId="formDescription"
          label="Short description"
          componentClass="textarea"
          placeholder="Enter message here"
		  value={this.state.message}
		  validator={()=>(null)}
		  onChange={this.handleDescChange}
          />
          
		
      </form>
            
          </div>
		  <hr/>
          
            <Button onClick={this.handleSubmit}><Glyphicon glyph="ok"/>Send</Button>
			<Button onClick={this.handleClose}><Glyphicon glyph="remove"/>Cancel</Button>
			
          
        </div>

	)}
}



class MoreInfo extends React.Component{
	constructor(props){
		super(props)
		this.state={statuses:[],files:[]}
	}
	componentDidMount(){
		var docref=this.props.match.params.doc
		firebase.firestore().collection('projects').doc(docref).get().then(
			(doc)=>{
				//console.log(doc);
				
				this.setState({statuses:doc.data().statuses || [],
							   files:doc.data().files || [],
							   title:doc.data().title,
							   description:doc.data().description,
							   people:doc.data().people
				})
	})}
	
	render(){ 
		var statuses=this.state.statuses.map((status)=>{
			return (
				<div>
				<h4>{status.title}</h4>
				<i>{Date(status.posted.seconds*1000)}</i>
				<br/>
				{status.description}
				<hr/>
				</div>
				)
		})
		var files=this.state.files.map((f)=>{
			return (
				<Panel eventKey={f.blob}>
                <Panel.Heading>
                    <Panel.Title toggle>{f.filename} </Panel.Title>
                </Panel.Heading>
                <Panel.Body collapsible>
                    {f.description}
                    <hr/>
                    <Button key={5} href={f.url}><Glyphicon glyph='download'/>Download</Button>
					

                </Panel.Body>
				
            </Panel>)
		}
				)
		
		
		return(<div>
		<h3>{this.state.title}</h3>
			{this.state.description}
		{statuses}
			{files.length>0 ? <h4>Files</h4> : null }
		<PanelGroup accordion id="accordion-example">{files}</PanelGroup>
			{(this.state.people || []).includes(this.props.user.uid)?(
				<div>
				<Button componentClass={Link} to={'/addstatus/'+this.props.match.params.doc}> <Glyphicon glyph='pencil'/> Add status update</Button>
				<Button componentClass={Link} to={'/uploadfile/'+this.props.match.params.doc}> <Glyphicon glyph='upload'/> Upload file</Button>
			</div>):null}
			</div>)
}
}	


function ViewProjectForm(props){
	const newprops = Object.assign({},props,{readonly:true})
	return <AddProjectForm {...newprops}/>
}

function ViewOutcomeForm(props){
	const newprops = Object.assign({},props,{readonly:true})
	return <AddOutcomeForm {...newprops}/>
}

class App extends React.Component {
	
    render() {
		
			return (
				<div>
					<Provider store={store}>
					<SigninAssistant>
					
					
					
					<Router>
					<div>
                    <TopNav showbuttons={true}/>
					
					<Col sm={1}/>
					<Col sm={10}>
					<SignInScreen/>
					{null && <SignInScreen/>}
                    <Route exact path="/" component={DatabaseTable}/>
					<Route path="/showpopup/:doc" component={DatabaseTable}/>
					<Route path="/addproject" component={AddProjectForm}/>
					<Route path="/edit/:doc" component={AddProjectForm}/>
					<Route path="/view/:doc" component={ViewProjectForm}/>
					<Route path="/editoutcome/:doc" component={AddOutcomeForm}/>
					<Route path="/viewoutcome/:doc" component={ViewOutcomeForm}/>
					<Route path="/myprojects" component={MyProjects}/>
					<Route path="/logout" component={Logout}/>
					<Route path="/login" component={SignInScreen}/>
					<Route path="/messages" component={MessageTable}/>
					<Route path="/message/:recipient" component={MessageTo}/>
					<Route path="/moreinfo/:doc" component={MoreInfo}/>
					<Route path="/addstatus/:doc" component={AddStatus}/>
					<Route path="/uploadfile/:doc" component={FileUploader}/>
					</Col>
					<Col sm={1}/>
					
					
					</div>
					</Router>
					</SigninAssistant>
					</Provider>
				</div>
			);
		}
		
	
}

export default App;
