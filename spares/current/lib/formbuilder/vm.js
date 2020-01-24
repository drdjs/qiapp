 const es=require('esprima')

function getMember(exp,vars){
    var obj=evalExpression(exp.object,vars)
    var key=(exp.computed===false && exp.property.type=='Identifier')?exp.property.name:evalExpression(exp.property,vars)
    return {obj,key}        
}

function evalExpression(exp,vars){
    switch (exp.type){
        case "Program":
        case "BlockStatement":
            var lineno,latestresult
            for (lineno=0;lineno<exp.body.length;lineno++){
                try{
                latestresult=evalExpression(exp.body[lineno],vars)
                }catch(e){
                    if (e.name==='ContinueStatement') return latestresult
                    throw e
                }
            }
            return latestresult
        case "FunctionDeclaration":
        case "ArrowFunctionDeclaration":
            throw "function declarations are not supported"
        case "ObjectExpression":
            return exp.properties.reduce(
                (obj,prop)=>{
                    var key
                    key=(prop.computed===false && prop.key.type=='Identifier')?prop.key.name:evalExpression(prop.key,vars)
                    obj[key]=evalExpression(prop.value,vars)
                    return obj
                },{})        
        case "AssignmentExpression":
            switch(exp.operator){
                case '=':
                    var value=evalExpression(exp.right,vars)
                    switch(exp.left.type){
                        case "Identifier":
                           return vars[exp.left.name]=value
                        case "MemberExpression":
                            var {obj,key}=getMember(exp.left,vars)
                            return obj[key]=value
                        default:
                            console.warn(`${exp.left.type} assignment not yet supported (${JSON.stringify(exp)})`)
                            return
                    }
                default:
                    console.warn(`${exp.operator} not yet supported `)
                    return
            }
        case "ExpressionStatement":
            return evalExpression(exp.expression,vars)
        case "BinaryExpression":
            {
            let left=evalExpression(exp.left,vars)
            let right=evalExpression(exp.right,vars)

            switch (exp.operator){
                case "<": 
                    return left<right
                case ">": 
                    return left>right
                case "==": 
                    return left==right
                case "===": 
                    return left===right
                case "+": 
                    return left+right
                case "-": 
                    return left-right
                case "*":
                    return left*right
                case "/":
                    return left/right
                case "&&":
                    return left&&right
                case "||":
                    return left||right
                default:
                    throw `Unknown operator: ${exp.operator}`
            }}

        case "Identifier":
            return vars.hasOwnProperty(exp.name) && vars[exp.name]
            
        case "Literal":
            return exp.value
        case "MemberExpression":
            {
            let member=getMember(exp,vars)
            let obj=member.obj, key=member.key
            if (obj!==undefined && obj.hasOwnProperty(key)) return obj[key]
            return undefined
            }
            
        case "ConditionalExpression":
        case "IfStatement":
            return evalExpression(exp.test,vars)?evalExpression(exp.consequent,vars):evalExpression(exp.alternate,vars)
        case "CallExpression":
            var callee=evalExpression(exp.callee,vars)
            if (callee) return callee.apply(null,exp.arguments.map((e)=>(evalExpression(e,vars))))
            console.warn('Unknown function')
            break
        case "VariableDeclaration":
            throw "variable declarations are not supported - all variables are global"
        case "SwitchStatement":
            try {
                let discriminant=evalExpression(exp.discriminant,vars)
                let isExecuting=false
                for (let i=0;i<exp.cases.length;i++){
                    if (isExecuting || exp.cases[i].test===null || discriminant===evalExpression(exp.cases[i].test,vars)) isExecuting=true
                    if (isExecuting){
                        evalExpression({type:'BlockStatement',body:exp.cases[i].consequent})
                    }
                }
            }
            catch(e){
                if (e.name==="BreakStatement") return
                throw e
            }
            return
        case "BreakStatement":
            throw {name:"BreakStatement"}
        case "ContinueStatement":
            throw {name:"ContinueStatement"}
        default:
            console.warn('Unknown clause:',exp)
            }
    }

function newEvalContainer(){
    const vars={}
    function newEval(fxn){
        ast=es.parseScript(fxn)
        console.log(ast)
    return evalExpression(ast,vars)
}

throw "paused"
}

newEvalContainer()

