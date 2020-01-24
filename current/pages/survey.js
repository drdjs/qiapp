import * as Survey from "survey-react";
import "survey-react/survey.css";

function App (props){
 //Define Survey JSON
 //Here is the simplest Survey with one text question
 var json = {
  completedHtml: "This is the end of the survey",
  elements: [
   { type: "text", name: "customerName", title: "What is your name?", isRequired: true},
   { type: "file",name: "question1",maxSize: 0 }
  ]
 };

 //Define a callback methods on survey complete
 function onComplete(survey, options) {
  //Write survey results into database
  console.log("Survey results: " + JSON.stringify(survey.data));
 }
 
  //Create the model and pass it into react Survey component
  //You may create survey model outside the render function and use it in your App or component
  //The most model properties are reactive, on their change the component will change UI when needed.
  var model = new Survey.Model(json);
  return (<Survey.Survey model={model} onComplete={onComplete}/>);
  /*
  //The alternative way. react Survey component will create survey model internally
  return (<Survey.Survey json={this.json} onComplete={this.onComplete}/>);
  */
  //You may pass model properties directly into component or set it into model
  // <Survey.Survey model={model} mode="display"/>
  //or 
  // model.mode="display"
  // <Survey.Survey model={model}/>
  // You may change model properties outside render function. 
  //If needed react Survey Component will change its behavior and change UI.
 }
 

export default App