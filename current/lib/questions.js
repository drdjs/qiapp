export default {

projecttitle:	{	name:'title',
				type:'text',
				label:"Project Title",
				placeholder:"Project Title",
				validators:['mandatory']
			},
proposername:	{
				name:'proposername',
				type:'typeahead',
				multiple:true,
				label:'Name of proposer(s)',
				options:staffnames,
				validators:['mandatory']
			},
description:	{			
				name:'description',
				type:'textarea',
				label:"What are you trying to improve?",
				placeholder:"Enter description of project here",
				validators:['mandatory']
			},
continuous:		{
				name:'continuous',
				type:'radio',
				options:{Yes:'Yes',No:'No'},
				validators:['mandatory']
			},
whichproject:	{
				name:'whichproject',
				type:'textarea',
				label:"Which project?",
				displayif:(s)=>(s.continuous==='Yes'),
				validators:['mandatory'],
				placeholder:"Enter description of project here"
			},
propdate:	{
				name:'propdate',
				type:'datepicker',
				label:"When was this project proposed?",
				validators:['mandatory']
			},
methodology:	{
				name:'methodology',	
				type:'textarea',
				label:"How do you plan to conduct your project?",
				placeholder:"Brief description of methodology eg notes review,survey etc",
				validators:['mandatory']
			},
category:	{
				name:'category',
				type:'checkbox',
				options:taglist,
				label:'Areas covered',
				validators:[{type:'minlength',length:1}]
			},
othertags:	{
				name:'othertags',
				type:'text',
				displayif:(s)=>(s.category_other===true),
				label:"Other areas covered",
				placeholder:"Other areas covered",
				validators:['mandatory']
			},
leadername:	{
				name:'leadername',
				type:'typeahead',
				multiple:true,
				label:'Who will lead this project?',
				options:staffnames,
				helptext:"Leave blank if you want somebody to volunteer to lead"
			},
email:		{
				name:"email",
				type:"email",
				label:"Contact email address for team:",
				placeholder:"Contact address",
				validators:['emailvalidator']
			},
peopleinvolved:{
				name:'peopleinvolved',
				type:'typeahead',
				label:'Other people involved',
				multiple:true,
				options:staffnames,
			},
advertise:	{
				type:'radio',	
				options:{"Yes":'Yes',"No":'No'},
				name:'advertise',
				label:'Would you like us to advertise your project to get more people involved?',
				validators:['mandatory']
			},
mm_or_ci:	{
				type:'radio',
				options:{'Yes':'Yes', 'No':'No'},
				name:'mm_or_ci',
				label:'Is this project a result of a Morbidity and Mortality or Critical Incident event?',
				validators:['mandatory']
			},
caldicott:	{
				type:'radio',
				options:{	
						'Yes':'Yes - it has been approved',
						'No':'No - Caldicott approval is not required',
						'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
						'pending':'Caldicott approval is pending'		
						},
				name:'caldicott',
				label:'Does this project have Caldicott approval?',
				helptext:'Caldicott approval is required if patient identifiable information is being collected',
				validators:['mandatory']
			},
research:	{
				type:'radio',
				options:{
					'Yes':'Yes - it has been approved',
					'No':'No - R+D approval is not required',
					'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
					'pending':'R+D approval is pending'
					},
				name:'research',
				label:'Does this project have R+D approval?',
				help:(<span>(Required if your project is research. <a href="https://www.nhsggc.org.uk/about-us/professional-support-sites/research-development/for-researchers/is-your-project-research/" target="_blank" rel="noopener noreferrer">Is my project research?</a>)</span>),
				validators:['mandatory']
			},
startdate:	{
				type:'datepicker',
				name:'startdate',
				label:"When do you propose to start?",
				validators:['mandatory']
			},
finishdate:	{
				type:'datepicker',
				name:'finishdate',
				label:"When do you plan to finish or report on this project?",
				validators:['mandatory']
			},
candisplay:	{
				name:'candisplay',
				type:'radio',
				options:{'Yes':'Yes',
						 'No':'No',
						 'NotYet':'Not at this time - maybe later'
						},
				label:'Are you happy for this project to be displayed on the QI whiteboard and on this website?',
				validators:['mandatory']
			},
commit:		{
				type:'radio',
				options:{
					'Yes':'Approve proposal',
					'No':'Do not approve',
					},
				name:'commit',
				label:'Moderator',
				displayif:()=>(isAdmin),
				validators:['mandatory']
			},
	
outcome:	{
			type:'radio',
			options:{	completed:"Project completed",
						interim:"Project continuing (make an interim report)",
						changemethod:"We need to change our project methodology or protocol",
						moretime:"More time required",
						abandoned:"Project abandoned",
						passedon:"Project to be passed on to someone else",
						anothercycle:"Project requires another cycle"
					},
			name:'outcome',
			label:'What was the outcome of your project?',
			validators:['mandatory'],
		},
whyabandoned:	{  
			type:'textarea',
			label:"Why was your project abandoned?",
			name:'whyabandoned',
			placeholder:"Enter description here",
			displayif:(s)=>(s.outcome==='abandoned'),
			validators:['mandatory'],
		},
redodate:	{
			type:'datepicker',
			name:'redodate',
			label:"When should the project be repeated?",
			displayif:(s)=>(s.outcome==='anothercycle'),
			validators:['mandatory'],
		},
nextcyclelead:{
			type:'typeahead',		
			name:'nextcyclelead',
			multiple:true,
			label:'Who will lead the next cycle?',
			displayif:(s)=>(s.outcome==='anothercycle'),
			options:staffnames,
			helptext:"Leave blank if you want somebody to volunteer to lead",
		},
nextcyclechanges:		{
			type:'radio',		
			name:'nextcyclechanges',
			label:'Will any changes be made to the methodology of your project?',
			displayif:(s)=>(s.outcome==='anothercycle'),
			options:{Yes:'Yes',No:'No'}
		},
methodchange:		{
			type:'textarea',
			label:"What changes will be made to the methodology of your project?",
			name:'methodology',
			placeholder:"Enter description here (eg. change in protocol, data collection method etc)",
			displayif:(s)=>(s.outcome==='changemethod' ||(s.outcome==='anothercycle' && s.nextcyclechanges==='Yes')),
			validators:['mandatory']
		},
caldicott:		{
			type:'radio',
			options:{	
					'Yes':'Yes - it has been approved',
					'No':'No - Caldicott approval is not required',
					'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
					'pending':'Caldicott approval is pending'		
					},
			name:'caldicott',
			label:'Does this project have Caldicott approval?',
			helptext:'Caldicott approval is required if patient identifiable information is being collected',
			displayif:(s)=>(s.outcome==='changemethod' ||(s.outcome==='anothercycle' && s.nextcyclechanges==='Yes')),
			validators:['mandatory']
		},
research:		{
			type:'radio',
			options:{
				'Yes':'Yes - it has been approved',
				'No':'No - R+D approval is not required',
				'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
				'pending':'R+D approval is pending'
				},
			name:'research',
			label:'Does this project have R+D approval?',
			displayif:(s)=>(s.outcome==='changemethod' ||(s.outcome==='anothercycle' && s.nextcyclechanges==='Yes')),
			help:(<span>(Required if your project is research. <a href="https://www.nhsggc.org.uk/about-us/professional-support-sites/research-development/for-researchers/is-your-project-research/" target="_blank" rel="noopener noreferrer">Is my project research?</a>)</span>),
			validators:['mandatory']
		},
finishdate:		{			
			type:'datepicker',
			name:'finishdate',
			label:"When do you anticipate finishing this project?",
			displayif:(s)=>(s.outcome==='moretime'),
			validators:['mandatory'],
		},
newstaff:		{
			type:'typeahead',
			name:'newstaff',
			multiple:true,
			label:'Will anyone else be involved?',
			displayif:(s)=>(s.outcome==='anothercycle'),
			options:staffnames,
			helptext:"Leave blank if you want somebody to volunteer to lead",
		},
leadername:		{			
			type:'typeahead',
			name:'leadername',
			multiple:true,
			label:'Who will be the new project leader(s)',
			displayif:(s)=>(s.outcome==='passedon'),
			options:staffnames,
			helptext:"Leave blank if you want somebody to volunteer to lead",
		},
peopleinvolved:		{
			type:'typeahead',
			name:'peopleinvolved',
			displayif:(s)=>(s.outcome==='passedon'),
			label:'Other people involved',
			multiple:true,
			options:staffnames,
		},
changesmade:		{
			type:'textarea',
			label:"What changes were made as a result of your project? ",
			name:'changesmade',
			placeholder:"Enter description here (eg. guideline developed/evidence of improved patient care/etc)",
			displayif:(s)=>(s.outcome==='completed' || s.outcome==='interim' || s.outcome==='anothercycle'),
			validators:['mandatory']
		},
presented:		{
			type:'checkbox',
			options:{	dept:'Departmental presentation',
						regposter:'Poster presentation at regional conference',
						natposter:'Poster presentation at national conference',
						intlposter:'Poster presentation at international conference',
						regoral:'Oral presentation at regional conference',
						natoral:'Oral presentation at national conference',
						intloral:'Oral presentation at international conference',
						published:'Publication'	
					},
			name:'presented',
			label:'Has this project been presented or published?',
			displayif:(s)=>(s.outcome==='completed'|| s.outcome==='interim'|| s.outcome==='anothercycle'),
		},
pubdetails:		{
			type:'textarea',
			label:"Please give details of publications or presentations ",
			displayif:(s)=>((s.outcome==='completed'|| s.outcome==='interim'|| s.outcome==='anothercycle')&&(s.presented||[]).length>0),
			name:'pubdetails',
			placeholder:"Enter description here",
			validators:['mandatory'],
		},
displayresults:		{
			type:'radio',
			options:{	'Yes':'Yes',
						'No':'No',
						'Dontknow':"Maybe"
					},
			name:'displayresults',
			label:'Can we display your work in the department?',
			displayif:(s)=>(s.outcome==='completed'|| s.outcome==='interim'|| s.outcome==='anothercycle'),
			validators:['mandatory'],
		}
		}