import immutable from 'immutable';
import { buildValidator } from './fieldvalidators';
import { validationSaga } from './saga';
import {
    INITIALISE_FORM, SET_FORM_VALUE, FORM_VALUE__SHOULD_INCLUDE,
    FORM_VALUE__SHOULD_NOT_INCLUDE, FORM_VALUE__SHOULD_BE,
    SET_ALL_DIRTY, SET_MULTIPLE_VALIDATION
} from './actions'
export { makeArrayValueSetter, makeSingleValueSetter, mapStateToProps } from './redux-connectors';
export { useSetSingleValue, useSetArrayValue, useSubmitForm} from './redux-connectors';


function validationError(message, sender) {
    this.name = "ValidationError"
    this.message = message
    this.sender = sender
}

function makeInitialState(formdef) {
    state = immutable.fromJS({ values: {}, dirty: {}, errors: {}, display: {} })
    return state.withMutations((state) => {
        for (let field in formdef) {
            state.setIn(['values', field.name], field.defaultvalue)
        }
        state.merge(buildValidator(formdef)(state.get('values')))
    })

}

export function getFormModule(formname, formdef) {
    function formreducer(state, action) {
        if (state === undefined) {
            state= makeInitialState(formdef)
            state.serializer=(state)=>(state.toJS())
            state.deserializer=((state)=>immutable.fromJS(state)).toString()
        }
        if (action.formname !== formname) return state
        switch (action.type) {
            case INITIALISE_FORM:
                return makeInitialState(action.formdef)
            case SET_FORM_VALUE:
                switch (action.valueType) {
                    case FORM_VALUE__SHOULD_INCLUDE:
                        if (state.getIn(['values', action.name], []).includes(action.value)) return state
                        return state.updateIn(['values', action.name], (oldValue) => ((oldValue || []).concat([action.value])))

                    case FORM_VALUE__SHOULD_NOT_INCLUDE:
                        if (!immutable.getIn(state, ['values', action.name], []).includes(action.value)) return state
                        return state.updateIn(['values', action.name], (oldValue) => ((oldValue || []).filter((f) => (f !== action.value))))

                    case FORM_VALUE__SHOULD_BE:
                        return state.setIn(['values', action.name], action.value)
                    default:
                        //eslint-disable-next-line no-console
                        console.warn('unexpected valueType for setFormValue action:' + action.valueType)
                        return state
                }
            case SET_ALL_DIRTY:
                return state.updateIn(['dirty'], (dirtyMap) => dirtyMap.map(() => true))
            case 'setFieldValid':
                return immutable.setIn(state, ['valid', action.name], { valid: true, message: undefined })
            case 'setFieldInvalid':
                return immutable.setIn(state, ['valid', action.name], { valid: false, message: action.validmessage })
            case 'setFieldVisible':
                return immutable.setIn(state, ['display', action.name], true)
            case 'setFieldInvisible':
                return immutable.setIn(state, ['display', action.name], false)
            case SET_MULTIPLE_VALIDATION:
                return state.merge(action.validation);
            default:
                return state
        }
    }
    return {
        id: formname,
        reducerMap: { [formname]: formreducer },
        sagas: [
            {
                saga: validationSaga,
                argument: [formdef]
            }
        ]
    }
}
