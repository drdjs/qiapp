import {useState,useRef,useEffect} from 'react'
export default function (props){
  const [val1,setval1]=useState(undefined)
  const [val2,setval2]=useState(undefined)
  const change1=(e)=>{console.log(e.target.value);setval1(e.target.value)}
  const change2=(e)=>{console.log(e);setval2(e.target.value)}
  const ref1=useRef()
  const ref2=useRef()
  useEffect(()=>{console.log(ref1.current.value)})
  return(
      <div>
          <form>
          <input ref={ref1} type='text' autoComplete="email" value={val1} name="email" onChange={change1}/>
          <br/>
          <input ref={ref2} type='text' autoComplete="street-address" value={val2} name="address" onChange={change2}/>
          </form>
      </div>
  )
}