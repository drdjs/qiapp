import {DateInput} from 'semantic-ui-calendar-react'
import {Form,Message,Table,Grid,Dropdown} from 'semantic-ui-react'


function RadioComponent(props){
        return(<BaseCheckboxComponent
                    Component={Form.Radio}
                    setValue={(val,isSet)=>(isSet?props.setValue(val):null)}
                    numCols={1}
                    disabled={props.disabled}
                    label={props.label}
                    name={props.name}
                    required={props.required}
                    helptext={props.helptext}
                    options={props.options}
                    value={[props.value]}
                    valid={props.valid}
                    errors={props.errors}
                    display={props.display}
        />)
    }
    
function CheckboxComponent(props){
        return(<BaseCheckboxComponent
            Component={Form.Checkbox}
            setValue={props.setValue}
            numCols={2}
            disabled={props.disabled}
            label={props.label}
            name={props.name}
            required={props.required}
            helptext={props.helptext}
            options={props.options}
            value={props.value}
            valid={props.valid}
            errors={props.errors}
            display={props.display}
        />)
    }
    
function BaseCheckboxComponent({Component,setValue,numCols,disabled,label,name,required,helptext,options,optionsfrom,value=[],valid,errors,display}){
        options=(optionsfrom?optionsfrom():options)
        options=(options.map?options:Object.entries(options))
        console.log(options)
        var buttons=options.map((i)=>{
            var val=i[0],label=i[1]
            return ( 
                <Component 
                    disabled={disabled}
                    label={label}
                    id={name+'_'+val}
                    name={name}
                    value={val} 
                    key={val}
                    checked={value.includes(val)}
                    error={valid===false}
                    onChange={(e,v)=>setValue(val,v.checked)} 
                    onClick={(e,v)=>setValue(val,v.checked)} 
                    
                    />) 
        })
    
        const colLength=Math.ceil(buttons.length/numCols)
            var cols=Array(numCols).fill().map((ignoreMe,colIndex)=>{
                const startPos=colIndex*colLength
                return(
                    <Grid.Column>
                        {buttons.slice(startPos,startPos+colLength)}
                    </Grid.Column>
                )
            })
        return (
            <FormRow {...{valid,errors,required,display,label,helptext}}>	
                <Grid stackable columns={numCols}>
                {cols}
                </Grid>
            </FormRow>
            )
        
    }
    
function DropdownComponent({setValue,value=[],search,disabled,optionsfrom,label,placeholder,formname,name,required,helptext,options,multiple,allowNew,valid,errors,display}){
        //console.log(`refreshing ${name} as ${value} (display:${display})`)
        return(
            <FormRow {...{valid,errors,display,label,helptext,required}}>
    
                <Dropdown
                placeholder={placeholder}
                fluid
                multiple={multiple}
                search={search}
                selection
                options={optionsfrom?optionsfrom():options}
                disabled={disabled}
                name={name}
                error={valid===false}
                allowAdditions={allowNew||false}
                onChange={(evt,selected) => {
                            setValue(selected.value)
                            }}
                value={value}
                        />
                {((typeof value==='string'?[value]:value)||[]).map((v)=><input name={name} type='hidden' value={v}/>)}
            </FormRow>
        )
    }

function DatePickerComponent({label,disabled,name,required,helptext,value="",dispatch,valid,errors,display,setValue}){
            //value= value===undefined ? undefined : value.toISOString ? value.toISOString():value.seconds ? new Date(value.seconds*1000).toISOString():undefined
            return (
                <FormRow {...{valid,display,label,helptext,required}}>
                    <DateInput
                            name={name}
                            placeholder="Date"
                            error={valid===false}
                            value={value || ""}
                            iconPosition="left"
                            onChange={(e,{value})=>{setValue(value)}}
                        />
                </FormRow>
            )
        }
            
function InputComponent({componentClass,disabled,label,required,name,type,placeholder,helptext="",value="",setValue,valid,errors,display}){
        return (
            <FormRow {...{valid,errors,display,label,helptext,required}}>
                <Form.Input
                    name={name}
                    error={valid===false}
                    placeholder={placeholder}
                    value={value||''}
                    onChange={(e,{value})=>setValue(value)}
                />
            </FormRow>
            
            )
        }
        
function TextAreaComponent({componentClass,disabled,label,name,type,required,placeholder,helptext="",value="",setValue,valid,errors,display}){
        //console.log(`refreshing ${name} as ${value} (display:${display})`)
        return (
            <FormRow {...{valid,errors,display,label,helptext,required}}>
                <Form.TextArea
                name={name}
                    placeholder={placeholder}
                    value={value||''}
                    error={valid===false}
                    onChange={(e,{value})=>setValue(value)}
                />
            </FormRow>
            
        )}

function FormRow({valid,errors,display,label,helptext,required,children}){
            console.log(`valid state:${label} ${errors}`)
            return (
                <Table.Row style={display?{}:{display:'none'}}>
                <Table.Cell width={8}><Form.Field required={required} error={valid===false}>
                    <label>{label}</label></Form.Field>
                    {helptext?(<Message info>{helptext}</Message>):null}
                    {valid ? null:(<Message error visible>{errors}</Message>)}
                    </Table.Cell>
                <Table.Cell width={8}>
                
                {children}
        
                
                </Table.Cell>
                </Table.Row>
            )
        }

export default { CheckboxComponent,RadioComponent,DropdownComponent,DatePickerComponent,InputComponent,TextAreaComponent }
