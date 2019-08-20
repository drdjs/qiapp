import React from 'react';

import {Col,HelpBlock,FormGroup,ControlLabel,FormControl,Checkbox} from 'react-bootstrap';

class InputField extends React.Component{
	constructor(props){
		super(props)
		this.state={value:'',show:false}
	}
	getValidationState() {
		const length = this.state.value.length;
		if (length > 0) return 'success';
		return null;
	}
	render(){
		var label=<ControlLabel>{this.props.label}</ControlLabel>
		var formctrl=(<><FormControl
            componentClass={this.props.componentClass || "input"}
            value={this.props.value}
			type={this.props.type || 'text'}
            placeholder={this.props.placeholder}
            onChange={this.props.onChange}
          />
		  <FormControl.Feedback />
          <HelpBlock>{this.props.helptext}</HelpBlock></>)
		 
			
	return(<FormGroup
          controlId={this.props.controlId}
          validationState={this.props.validator()}
        >
		{this.props.horizontal?(<>
			<Col sm={1}/>
			<Col sm={4}>{label}</Col>
			<Col sm={6}>{formctrl}</Col>
			<Col sm={1}/>
			</>
			):(
			<>{label}{formctrl}</>
			)}
        </FormGroup>
	)}
}

export default InputField