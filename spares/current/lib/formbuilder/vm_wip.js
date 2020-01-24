 const es=require('esprima')

function getMember(exp,vars){
    var obj=evalExpression(exp.object,vars)
    var key=(exp.computed===false && exp.property.type=='Identifier')?exp.property.name:evalExpression(exp.property,vars)
    return {obj,key}        
}
function getScopeForIdentifier(id,vars){
    console.log(vars)
    for(let i=vars.length;i--;){
        if (vars[i][0].hasOwnProperty(id)){
            return vars[i][0]
        }
    }
    return vars[0][0]
}
class Scope {
    constructor(parent,type,description){
        this.lookup=parent?Object.assign({},parent.lookup):{}
        this.parent=parent
        this.description=description
        this.type=type
        this.locals={}
        this.functions={}
        this.varscope=(type==='block')?parent.varscope:this
        this.global=parent?parent.global:this
    }
    get (identifier){
        if (this.lookup.hasOwnProperty(identifier)){
            let {value,isdef,kind}=this.lookup[identifier].locals[identifier]
            if (kind==='var' || isdef) return value
        }
        throw "ReferenceError:"+identifier
    }
    set (identifier,value){
        if (this.lookup.hasOwnProperty(identifier)){
            let {isdef,kind}=this.lookup[identifier].locals[identifier]
            if (kind!=='var' && !isdef) throw "NotDefined:"+identifier
            this.lookup[identifier].locals[identifier].value=value
            return value
        }
    }


}
function defineOneVariable(scope,name,kind,norecurse=false){
    let existingdef=scope.locals[name]
    if (existingdef && existingdef.kind !== kind) throw `${name} already defined as ${existingdef.kind}`
    scope.locals[name]={kind,value:undefined,isdef:(kind==='var' || kind==='function')?true:false}
    if ((kind==='var' || kind==='function') && norecurse===false) defineOneVariable(scope.varscope,name,kind,true)
}

function defineVariable(scope,dec){
    switch (dec.id.type){
        case 'ObjectPattern':
            dec.id.properties.forEach((p)=>defineOneVariable(scope,p.key.name,dec.kind))
            break
        case 'ArrayPattern':
            dec.id.elements.forEach((e)=>defineOneVariable(scope,e.name,dec.kind))
            break
        case 'Identifier':
            defineOneVariable(scope,dec.id.name,dec.kind)
    }
}
function initScopes(ast,parentscope=null){
    switch(ast.type){
        case 'Program':
            ast.scope=new Scope(null,'global','global scope')
            ast.body.forEach((s)=>initScopes(s,ast.scope))
            break
        case 'FunctionExpression':
            ast.scope=new Scope(null,'function','function scope')
            initScopes(ast.body,ast.scope)
            break
        case 'FunctionDeclaration':
            defineOneVariable(parentscope,ast.id.name,'function')
            parentscope.varscope.functions[ast.id.name]=ast
            ast.scope=new Scope(parentscope.varscope,'function','function scope')
            initScopes(ast.body,ast.scope)
            break
        case 'BlockStatement':
            ast.scope=new Scope(parentscope,'block','Block scope')
            ast.body.forEach((s)=>initScopes(s,ast.scope))
            break
        case 'VariableDeclaration':
            ast.declarations.forEach(defineVariable.bind(null,parentscope))
            break
        case 'ClassBody':
        case 'ClassDeclaration':
        case 'ClassExpression':
        case 'DoWhileStatement':
        case 'IfStatement':
        case 'MethodDefinition':
        case 'SwitchCase':
        case 'SwitchStatement':
        case 'TryStatement':
        case 'WhileStatement':
        case 'WithStatement':
            initScopes(ast.body,parentscope)
            break
        case 'ForStatement':
        case 'ForOfStatement':
        case 'ForInStatement':
            initScopes(ast.body,parentscope)
            if (ast.init.type==="VariableDeclaration"){
                ast.declarations.forEach(defineVariable.bind(null,parentscope))
            break
            }    
            }
        return ast
}
function evalExpression(exp,vars){
    switch (exp.type){
        case "Program":
        case "BlockStatement":
            vars.push([{},"block"])
            var lineno,latestresult
            for (lineno=0;lineno<exp.body.length;lineno++){
                try{
                latestresult=evalExpression(exp.body[lineno],vars)
                }catch(e){
                    vars.pop()
                    if (e.name==='StopIteration') return latestresult
                    throw e
                }
            }
            vars.pop()
            return latestresult
        case "FunctionDeclaration":
        case "ArrowFunctionDeclaration":
            if (exp.id!==null){
                return evalExpression({
                    type:"AssignmentExpression",
                    left:exp.id,
                    right:Object.assign({},exp,{id:null})
                },vars)}
            
            return function(){
                vars.push([{},'fxn'])
                var latestresult,returnval
                if (exp.params.length>0 && exp.params[exp.params.length-1].type=="RestElement"){
                    evalExpression({
                        type:'VariableDeclaration',
                        kind:'var',
                        id:exp.params.pop().argument,
                        init:{type:'Literal',value:arguments.slice(exp.params.length,)}
                    },vars)
                }
                for (var i=0;i<exp.params.length;i++){
                    evalExpression({
                        type:'VariableDeclaration',
                        kind:'var',
                        id:exp.params[i].argument,
                        init:{type:'Literal',value:arguments[i]}
                    },vars)
                }
                {
                    latestresult=evalExpression(exp.body,vars)

                }
            
            }
        case "ObjectExpression":
            return exp.properties.reduce(
                (obj,prop)=>{
                    var key,val
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
                           var scope=getScopeForIdentifier(exp.left.name,vars)
                            return scope[exp.left.name]=value
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
            var left=evalExpression(exp.left,vars)
            var right=evalExpression(exp.right,vars)

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
                    console.warn(`Unknown operator: ${exp.operator}`)
            }
            break
        case "Identifier":
            return getScopeForIdentifier(exp.name,vars)[exp.name]
            
        case "Literal":
            return exp.value
        case "MemberExpression":
            var member=getMember(exp,vars)
            var obj=member.obj, key=member.key
            if (obj!==undefined && obj.hasOwnProperty(key)) return obj[key]
            return undefined
        case "ConditionalExpression":
        case "IfStatement":
            return evalExpression(exp.test,vars)?evalExpression(exp.consequent,vars):evalExpression(exp.alternate,vars)
        case "CallExpression":
            var callee=evalExpression(exp.callee,vars)
            if (callee) callee.apply(null,exp.arguments.map((e)=>(evalExpression(e,vars))))
            console.warn('Unknown function')
            break
        case "VariableDeclaration":
            for (let dec of exp.declarations){
                if (dec.kind==='var'){
                    for (let v=vars.length;v--;){
                        if (v[1]==='fxn') {scope=v[0];break}
                    }
                    scope=vars[0][0]
                }else{
                    scope=vars[vars.length-1][0]
                }
                switch (dec.id.type){
                    case "Identifier":
                        scope[dec.id.name]=dec.init?evalExpression(dec.init,vars):undefined
                        break
                    default:
                        console.warn(`${dec.id.type} declaration not supported yet`)
                }
            }
            return
        default:
            console.warn('Unknown clause:',exp)
            }
    }

function newEvalContainer(){
    const vars=[]
    function newEval(fxn){
        var ast=initScopes(es.parseScript(fxn))
        console.log(ast)
    return evalExpression(ast,vars)

}

throw "paused"
}

newEvalContainer()

