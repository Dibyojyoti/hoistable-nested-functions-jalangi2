
(function(){
  //Stack to store the functions as their decelerations are encountered
  var funcNameStack = [];
  // array of {function name, variable} pairs, to store variables declared in functions
  var funcVarMap = [];
  //main array to store all data about all the functions
  //Properties: 
  //    id -        every function array has unique id
  //    funcName -  function name
  //	hoistable - flag which denotes if the function is hoistable, possible values, 
  //			false -  denotes function can not be hoisted
  //			true -   denotes function can be hoisted
  //			undefined - denotes dynamic analysis was not able to indentify hoistablility (path did not execute)
  //    parentFunc - parent function under which this function is declared, possible values,
  //                    NoParent - for outermost functions
  //   			<function name> - parent function name
  //    parentVar  - parent variable due to which function is not hoistable, possible values
  //    		<variable name> - in case such a variable exists
  //         		undefined -  otherwise
  //    respAnscestor - function who's declared variable is being used (might not be immediate parent)
  //   			<function name> - ancestor function name
  //			blank - otherwise		
  var funcHoistbleMap = [];
  //constants for AST-type comparison;
  var PROG = "Program";
  var FUNDECL = "FunctionDeclaration";
  
  //var esprima = require("esprima");

  //Function to extract function name from AST
  /*function getFunctionName(f) {
    var ast = esprima.parse(f);
    //standard wrapper should be "Program";
    //first object of body array should be the FunctionDeclaration
    if (ast.type !== PROG || ast.body[0].type !== FUNDECL) {
      return null;
    }
    return ast.body[0].id.name;
  }*/
  //Function to print all function details after analysis
  function checkHoistableFunc(){
	var output = '';
	var hostable = 0;
	var total_analyzed =0;
	
	//Loop through the array
	for(var i = 0; i<funcHoistbleMap.length;i++){
	    //If hoistable is true and not a outer most function
	    if(funcHoistbleMap[i].hoistable === "true" && funcHoistbleMap[i].parentFunc !== "NoParent")
		output +="\n Function ---> "+funcHoistbleMap[i].funcName +" at Line number: " +funcHoistbleMap[i].location+" under "+funcHoistbleMap[i].parentFunc+" can be hoisted";
	    //If hoistable is false and not a outer most function	
	    else if(funcHoistbleMap[i].hoistable === "false" && funcHoistbleMap[i].parentFunc !== "NoParent" ){
		//But there is no parentVar and Ancestor - non hoistable because of inner functions
		if(funcHoistbleMap[i].parentVar === undefined && funcHoistbleMap[i].respAnscestor === ""){
		   output +="\n Function ---> "+funcHoistbleMap[i].funcName +" under "+funcHoistbleMap[i].parentFunc+" can not be hoisted"+
			    " because one of its child is non hoistable";
		}
		else{
		   output +="\n Function ---> "+funcHoistbleMap[i].funcName +"under "+funcHoistbleMap[i].parentFunc+" can not be hoisted"+
			    " Due to the variable "+funcHoistbleMap[i].parentVar+" decleared under ansestor "+funcHoistbleMap[i].respAnscestor;
		}
	    }
	    //If the branch does not run where the function is called, cannot decide
	    else if (funcHoistbleMap[i].hoistable === "undefined" && funcHoistbleMap[i].parentFunc !== "NoParent")
		output +="\n Function ---> "+funcHoistbleMap[i].funcName +" under "+funcHoistbleMap[i].parentFunc+" can not decide if hoistable";
	    //Else its a outer most function
	    else
		output +="\n Function ---> "+funcHoistbleMap[i].funcName +" is the outer most function";
	}

	// Write the result to a file.
	var fs = require('fs');
	fs.writeFileSync("result.txt", output);
	/*var stream = fs.createWriteStream("result.txt");
		stream.once('open', function(fd) {
		stream.write(output);
		stream.end();
		});*/
  }
  //Functin which checks nested non hoistability
  //If any inner function is non hoistable make the outer function also non hoistabel, if the outer function is deleared inside respAnscestor
  // respAnscestor is the function whose variable has been used to the inner function
  function checkNestedHoistablityFunc(){
	for(var i = 0; i<funcHoistbleMap.length;i++){
	    //If a non hoistable function is found make its parent also non hoistable recursively, if its parent is not the outer most or until its the
	    //respAncestor for which the inner function became non hoistable
	    if(funcHoistbleMap[i].hoistable === "false" && funcHoistbleMap[i].parentFunc !== "NoParent"){
		var getRespAncestor = funcHoistbleMap[i].respAnscestor;
		var getParent = funcHoistbleMap[i].parentFunc;
		//console.log("going in while" + getRespAncestor + getParent + funcHoistbleMap[i].funcName);
		while(getParent !== getRespAncestor){
		   for(var j = 0; j<funcHoistbleMap.length;j++){
		   	if(funcHoistbleMap[j].funcName === getParent && funcHoistbleMap[j].hoistable !== "false"){
			   funcHoistbleMap[j].hoistable = "false";
			   getParent = funcHoistbleMap[j].parentFunc;
			   break;
		   	}
		   }
		   break;
		}
	    }
	}
  }

  J$.analysis = {
    functionEnter : function(iid, f, dis, args) {
      //On function Enter - get the function name and store in a stack
     // var funcName = getFunctionName(f);
	  //f is a "function object" and should have the property "name", so no esprima is needed.
      var funcName = f.name;
      //console.log('function Enter intercepted : ' +'iid-> ' +J$.iidToLocation(iid) +" for function-> "+funcName);
      funcNameStack.push(funcName);
    },

    functionExit : function(iid, returnVal, wrappedExceptionVal){
	    //console.log('function Exit intercepted : ' +'iid-> '+ J$.iidToLocation(iid) +" for function-> "+funcNameStack[funcNameStack.length-1] );
	    //on exit from function delete the {func,var} pairs from funcVarMap and func from funcNameStack
		
		if (funcNameStack.length === 0) {
            return;
        }
		
	    for (var x=0 ; x<funcVarMap.length ;x++) {
		    
		    if((funcVarMap[x] !== undefined) && (funcVarMap[x].func === funcNameStack[funcNameStack.length-1])){
			//console.log("deleting map entry for "+funcVarMap[x].func);
			delete funcVarMap[x];
				
		    }		
	    }
	    //removing deleted entries - so that there are no 'undefined' fields
	    var b = funcVarMap.filter(Boolean);
	    funcVarMap = b;

	    //updating hoistable property, make the hoistable flag true if its not set as false inside read callback
            for (var i=0; i<funcHoistbleMap.length;i++){
		//skip for outer function
	        if(funcHoistbleMap[i].parentFunc === "NoParent" ) continue; 
		//else make the function which matches the top entry of stack with 2nd top entry as its parent, true
		else if(funcHoistbleMap[i].funcName === funcNameStack[funcNameStack.length-1] ){
		   if(funcHoistbleMap[i].hoistable !== "false"){
		   	funcHoistbleMap[i].hoistable = "true";
			//console.log("In exit ,"+funcHoistbleMap[i].funcName + " made  hoistable, parent " + funcHoistbleMap[i].parentFunc);
			break;
		   }
		}
	    }

            //remove from stack
	    funcNameStack.pop();
    },
    declare : function(iid, name, val, isArgument, argumentIndex, isCatchParam){
      // On declearation of any function or variable	
      // for every function decleration add the function to main map, but dont add more than once - unique ness determind using 
      //{function_name, parent} pair
	//console.log("In declare, name-> "+name /*+",val-> "+ val*/);
      if(val instanceof Function){
		var id = J$.getGlobalIID(iid)
	  //to avoid 2nd entry for "v = function foo(){}" case which is already handled in write callback
	  if(funcNameStack[funcNameStack.length-1] !== name){
		var alreadyExist = false;
		for(var i=0;i<funcHoistbleMap.length;i++){
			if(funcHoistbleMap[i].funcName === name && funcHoistbleMap[i].parentFunc ===funcNameStack[funcNameStack.length-1]){
				alreadyExist = true;
				break;
			}
		}
		if(alreadyExist === false){
		//If this is the first entry of stack set parentFunc as Noparent
			if(funcNameStack.length === 0)
				funcHoistbleMap.push(
					{id: funcHoistbleMap.length, funcName: name, hoistable: "undefined", parentFunc: "NoParent", parentvar:"",respAnscestor: "", location: J$.iids[iid][0]});
			else
				funcHoistbleMap.push(
					{id: funcHoistbleMap.length,funcName: name,hoistable: "undefined",parentFunc: 
					    funcNameStack[funcNameStack.length-1],parentvar: "",respAnscestor: "", location: J$.iids[iid][0]});
		}
	   }
	}

	  // if its a variable
	  if(/*!isArgument &&*/ !isCatchParam && !(val instanceof Function) /*&& ! window[name]*/){
	      //console.log('Variable intercepted : ' +'iid-> ' +J$.iidToLocation(iid) +",name-> " +name /*+",val-> " +val*/);
	      //associate the variable with the function at the top of the stack, if there is any function in stack,
	      //otherwise its a global avriable, no need to store
	      if(funcNameStack.length !== 0){
		      fname = funcNameStack[funcNameStack.length-1];
		//console.log("going to push in funcVarMap "+fname +" "+name);
      		funcVarMap.push({id:funcVarMap.length,func:fname, variable: name});
	      }
      }
      if(funcNameStack.length !== 0 && val instanceof Function){
        //console.log('In delare nested function declare intercepted : ' +'iid->' +J$.iidToLocation(iid) +", for function name-> " +name);

      }
      //console.log("print funcVarMap array");
        for (var x=0 ; x<funcVarMap.length ;x++) {
          //console.log(x +" "+ funcVarMap[x].func+" " + funcVarMap[x].variable);
        }
      //console.log("print funcNameStack array");
        for(var y=0; y<funcNameStack.length;y++){
          //console.log(y +" "+ funcNameStack[y]);
        }
      
    },
    read : function(iid, name, val, isGlobal, isScriptLocal){

	//On read of a variable - which is not a function and global or scriptLocal variable      
    	if(!isGlobal && !isScriptLocal){
	      //console.log('Reading Variable :' + name);
	      //check if the variable is declared in same function, then even if its declared in parent its the local scope, so ignore
	      for (var x=0 ; x<funcVarMap.length ;x++) {
		      if(funcVarMap[x].variable === name && funcVarMap[x].func === funcNameStack[funcNameStack.length-1]){
			 return;
		      }
	      }

	      //check if the variable is declared in any parent function, other than this function
	      //this can be checked if we found the variable in the funcVarMap, which is not associated with current function 
	      //and not deleted already in Exit callback, 2nd top entry in stack should be its parent.
	      //If found make is non hoistable and set its parentVar and respAnscestor
	      for (var x=0 ; x<funcVarMap.length ;x++) {
		      if((funcVarMap[x].func !== funcNameStack[funcNameStack.length-1]) && (funcVarMap[x].variable === name)){
			      //console.log("Found use of outer variables, function cannot be hoisted, " +"function-> "
				      //  +funcNameStack[funcNameStack.length-1] +", variable-> "+name +" asncestor func "+funcVarMap[x].func);
			      
			      for(var i=0;i<funcHoistbleMap.length;i++){
	   			 if(funcHoistbleMap[i].funcName === funcNameStack[funcNameStack.length-1] && 
					funcHoistbleMap[i].parentFunc === funcNameStack[funcNameStack.length-2] ){
				   funcHoistbleMap[i].hoistable = "false";
				   funcHoistbleMap[i].parentVar = name;
				   funcHoistbleMap[i].respAnscestor = funcVarMap[x].func;
				   //console.log("In read, "+funcHoistbleMap[i].funcName + " made non hoistable, parent "+ funcHoistbleMap[i].parentFunc);
				   break;
	   		         }
			      }
		      }		
              }
        }

    },
    write: function(iid, name, val, lhs, isGlobal, isScriptLocal){
	
        // On declearation of any function using var v = function foo(){}	style
        // for every function decleration add the function to main map, but dont add more than once - unique ness determind using {function_name,
       // parent}    pair
      if(val instanceof Function){
	   var id = J$.getGlobalIID(iid)
		//console.log("In write, " +"variable-> "+name+", value->"+val );
		//var fNameDec = getFunctionName(val);
		var fNameDec = val.name;
		//console.log("In write, " +"fNameDec-> "+fNameDec);
		var fAlreadyExist = false;
		for(var i=0;i<funcHoistbleMap.length;i++){
			if(funcHoistbleMap[i].funcName === fNameDec && funcHoistbleMap[i].parentFunc ===funcNameStack[funcNameStack.length-1]){
				fAlreadyExist = true;
				break;
			}
		}
		if(fAlreadyExist === false){
		//If this is the first entry of stack set parentFunc as Noparent
			if(funcNameStack.length === 0)
				funcHoistbleMap.push(
					{id: funcHoistbleMap.length,funcName: fNameDec,hoistable: "undefined",parentFunc: "NoParent",parentvar:
 					     "",respAnscestor: "", location: J$.iids[iid][0]});
			else
				funcHoistbleMap.push(
					{id: funcHoistbleMap.length,funcName: fNameDec,hoistable: "undefined",parentFunc: 
					     funcNameStack[funcNameStack.length-1],parentvar: "",respAnscestor: "",location: J$.iids[iid][0]});
		}
	}
      if(funcNameStack.length !== 0 && val instanceof Function){
        //console.log('In write nested function declare intercepted : ' +'iid->' +J$.iidToLocation(iid) +", for function name-> " +fNameDec);

      }
      //console.log("print funcVarMap array");
        for (var x=0 ; x<funcVarMap.length ;x++) {
          //console.log(x +" "+ funcVarMap[x].func+" " + funcVarMap[x].variable);
        }
      //console.log("print funcNameStack array");
        for(var y=0; y<funcNameStack.length;y++){
          //console.log(y +" "+ funcNameStack[y]);
        }

    },
    endExecution : function(){
	//At the end of execution call below functions
	checkNestedHoistablityFunc();
	checkHoistableFunc();
    }
  };


}());

//hduser@ubuntu:~/jalangi2/learnJalangi$ node ../src/js/commands/jalangi.js --inlineIID --inlineSource --analysis analysis.js example.js
