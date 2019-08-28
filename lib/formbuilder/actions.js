export const SET_FORM_VALUE = 'setFormValue'
export const FORM_VALUE__SHOULD_BE='shouldBe'
export function valueShouldBe(dispatch, formname, name, value) {
    return dispatch({
        type: SET_FORM_VALUE,
        valueType: FORM_VALUE__SHOULD_BE,
        formname, name, value
    });
}
export const SET_DIRTY = 'setDirty'
export function setDirty(dispatch, formname, name) {
    dispatch({
        type: SET_DIRTY,
        formname,
        name
    });
}
export const FORM_VALUE__SHOULD_INCLUDE = 'shouldInclude'
export function shouldInclude(dispatch, formname, name, value) {
    dispatch({
        type: SET_FORM_VALUE,
        valueType: FORM_VALUE__SHOULD_INCLUDE,
        formname, name, value
    });
}
export const FORM_VALUE__SHOULD_NOT_INCLUDE = 'shouldNotInclude'
export function shouldNotInclude(dispatch, formname, name, value) {
    dispatch({
        type: SET_FORM_VALUE,
        valueType: FORM_VALUE__SHOULD_NOT_INCLUDE,
        formname, name, value
    });
}

export const SET_MULTIPLE_VALIDATION='setMultipleValidation'
export function setMultipleValidation(dispatch,formname,validation){
    return dispatch({type:SET_MULTIPLE_VALIDATION,formname,validation})
}

export const SET_ALL_DIRTY='setAllDirty'
export function setAllDirty(dispatch, formname) { 
    dispatch({ type: SET_ALL_DIRTY, formname }); 
}

export const SUBMIT_FORM='submitForm'
export function submitForm(dispatch, formname,onSubmit,onSubmitted,onSubmitError) { 
    dispatch({ type: SUBMIT_FORM, formname,onSubmit,onSubmitted,onSubmitError }); 
}
