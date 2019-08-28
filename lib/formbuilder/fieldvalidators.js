import immutable from 'immutable'

class FieldDescriptor {
	constructor (value){
		this.value=value
	}
	isNaN() {return isNaN(this.value)}
	isFinite(){return isFinite(this.value)}
	isEmpty(){
		if (this.value === undefined) return true
		if (this.value.length !==undefined && this.value.length>0) return false
		if (Object.entries(this.value).length>0) return false
		return true
	}
	isNotEmpty(){
		return !this.isEmpty()
	}
	length(){
		if (this.value===undefined) return undefined
		return this.value && this.value.length
	}
	matches(pat){
		if (this.value === undefined) return undefined
		if (this.length()===0) return undefined
		if (typeof this.value !=='string') return false
		return this.value.match(pat)
	}
	isEmail(){
		return this.matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
	}
	isDate(){
		if (this.value === undefined) return undefined
		if (this.length()===0) return undefined
		return !isNaN(Date.parse(this.value))
	}
}

FieldDescriptor.prototype.valueOf=function(){return this.value}


class FieldValues {
	constructor(fieldValues){
		this.fieldValues=fieldValues
		this.errors={}
		this.display={}
	}
	setField(fieldName){
		this.defaultName=fieldName
	}
	setVisible(visibility){
		this.display[this.defaultName]=visibility
	}
	field(fieldName){
		return new FieldDescriptor(this.fieldValues[fieldName || this.defaultName])
	}
	expect(exp,message){
		if (exp!==false) {
			if (typeof message=='string'){
				if (!this.errors[this.defaultname]) this.errors[this.defaultname]=[]
				this.errors[this.defaultName].push(message)
			}
			else{
				for (let key in message){
					if (!this.errors[key]) this.errors[key]=[]
					this.errors[key].push(message[key])
				}
			}
		}
	}
}

export function buildValidator(formdef){
	const fxn=formdef.map(
		({name,validfunc,displayfunc})=>(
		`setField('${name}');
		if(${displayfunc || "true"} {
			${validfunc || "//"};
			setVisible(true)
		}
		else{
			setVisible(false)
		}
		`))
	const valfunc=Function('fieldvalues','setField','field','expect','setVisible',fxn.join(';\n'))
	return function(fieldval){
		const fieldvalues=new FieldValues(fieldval)
		const setField=fieldvalues.setField.bind(fieldvalues),
			field=fieldvalues.field.bind(fieldvalues),
			expect=fieldvalues.expect.bind(fieldvalues),
			setVisible=fieldvalues.setVisible.bind(fieldvalues)
		valfunc(fieldvalues,setField,field,expect,setVisible)
		const errors={}
		for (let f in fieldvalues.errors){
			if (fieldvalues.errors[f].length>0) errors[f]=fieldvalues.errors[f]
		}
		return immutable.fromJS({errors,display:fieldvalues.display})
	}
}

function testValidator(){

	const formdef=[]
	const val=buildValidator(formdef)
	errors=val({category:[],email:'l@p.com',startdate:Date.parse('9/9/19'),finishdate:Date.parse('1/1/18')})
	console.log(errors)
}