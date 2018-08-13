/**
	Egg Programming Language Module 
	Version 1.0
	Wrote By David Mulumeoderhwa Manegabe
	david@niverloer.me
	(C) NIVERLOER, Avril 2017
	https://niverloer.me
	Lincesing Under : MIT-License
	
	Example : Egg.autoBuild("define(x,1);print(x)");
			  To improve this language :
				- Add more environement functions;
				- Create a track error integrated module;
				- Create an Operating System Interator with CMD and Result Fetching System;
	How it's created : Egg has 3 main parts being :
			- EggDataStructure 		: 	Helps to create the syntaxTree with its constructor DataStructure;
			- EggSyntaxEvaluator 	: 	Read the syntaxTree created by EggDataStructure and run it inside
										the environnement, Egg runs its variable in a single environnement
										(global scope) it will be usefull to create let function that create
										a local scope inside the global; 
										EggEnvironement['<localScopeName>'][<local variable>];
										e.g : EggEnvironement["0"]["x"]=12 
										// that means that x is a var in the first local scope
										Now we could export local scope in global variables by the define function;
			- EggEnvironement : 	:   Contains keywords and const variables, it's also the global scope;
										That means the code run inside it. Pratically it's a Array which contains
										all resources the application needs to run.
*/ 

"use strict";
(function(exports){
//{ // Private Variables
	const __EGG_SPECIAL_WHSPC__="__EGG_SPECIAL_WHSPC__"; // whitespace
	const __EGG_SPECIAL_SMCLN__="__EGG_SPECIAL_SMCLN__"; // ;
	const __EGG_SPECIAL_CLN__="__EGG_SPECIAL_CLN__";  // ,
	var insideCode=0;
	var cleanedCode=0;
	var isCleaned=false;
//}
//{ // Global Variables
	exports.specialChars="__EGG_SPECIAL_WHSPC__\n__EGG_SPECIAL_SMCLN__\n__EGG_SPECIAL_CLN__";
	exports.isOpened=false;
	exports.codes=[];
	exports.syntaxTree=[];
	exports.env=[]
	exports.size=0;
//}
//{ // Private Functions
	function isProgram(program){
		(Object.getPrototypeOf(program)==String.prototype) && (insideCode=program,exports.isOpened=true);
		(Object.getPrototypeOf(program)!=String.prototype) && (throw new Error("Unknown program"));
		exports.codes=[];
		return exports.isOpened;
	}
	function cleanProgram(){
		// - cleanProgram
		var tmpCode=insideCode.trim(/\s/).replace(/[\r?\t?\n?]/g,""); // strip whitespaces, make inline code style;
		//---- autoIntegration of __EGG_SPECIAL_WHSPC__ and __EGG_SPECIAL_SMCLN__
		//     :seeks text between quotes and replace them whitespace with WHSPC
		if (/"(\d*\w*\W*[^"]*\s*)+?"/g.test(tmpCode)){
			tmpCode.match(/"(\d*\w*\W*[^"]*\s*)+?"/g).forEach(function(quotedString){
				var newString=quotedString.replace(/\s/g,__EGG_SPECIAL_WHSPC__);
								 newString.replace(/;/g,__EGG_SPECIAL_SMCLN__);
				tmpCode=tmpCode.replace(quotedString,newString);
			});
		}
		tmpCode=tmpCode.replace(/(\W+)\s+/g,"$1"); // strip inside useless whitespaces e.g : 1+ 1
		tmpCode=tmpCode.replace(/\s+(\W+)/g,"$1"); //                                        1 +1
		//---- Split the program in many lines by the separator ";"
		if (/;/.test(tmpCode)){
			tmpCode.split(/;/).forEach(function(line){
				// --- Decode __EGG_SPECIAL_WHSPC__ and __EGG_SPECIAL_SMCLN__ before insert into global code
				var newLine=line.replace(/__EGG_SPECIAL_WHSPC__/g," ");
						 newLine.replace(/__EGG_SPECIAL_SMCLN__/g,";");
				exports.codes.push(newLine);
			});
		}
		// --- Decode __EGG_SPECIAL_WHSPC__ and __EGG_SPECIAL_SMCLN__ before insert into cleanedCode
		tmpCode=tmpCode.replace(/__EGG_SPECIAL_WHSPC__/g," ");
		tmpCode=tmpCode.replace(/__EGG_SPECIAL_SMCLN__/g,";");
		//---- Initialized the global cleanedCode variable;
		cleanedCode=tmpCode;
		//---- Setting the size of the program
		exports.size=cleanedCode.length;
		//- cleaning is finished
		(cleanedCode) && (isCleaned=true);
	}
	function createSyntaxTree(){
		if(!isCleaned) throw new Error("{CURRENT_APP} is not cleaned");
		exports.codes.forEach(function(item){
			var DataStructure=new _EggDataStructure.DataStructure();
			DataStructure.setBasedCode(item);
			DataStructure.syncDataScheme();
			exports.syntaxTree.push(DataStructure.strictSyntaxTree[0]);
		});
	}
	function getObjectsIn(applySyntax){// Doesn't work good;
			var args=[],argsChain=[];
			var varType=Object.getPrototypeOf(applySyntax);
			switch(varType){
				case Object.prototype:
					args.push(applySyntax);
					break;
				case Array.prototype:
					applySyntax.forEach(function(subArgs){
						var _subArgs=getObjectsIn(subArgs);
						_subArgs.forEach(function(inSubArgs){
							args.push(inSubArgs);
						});
					});
			}
			return args;
	}
	function isValueType(obj){
		var _isValueType=false;
		switch(getTypeOf(obj)){
			case "number":
				_isValueType=true;
				break;
			case "string":
				_isValueType=true
				break;
			default:
			 _isValueType=false;
		}
		return _isValueType;
	}
	function isFunction(obj){
		return getTypeOf(obj)=="apply";
	}
	function isVar(obj){
		return getTypeOf(obj)=="variable";
	}
	function getVarName(obj){
		return obj.name;
	}
	function getFunctionName(obj){
		return obj.operator.name;
	}
	function getTypeOf(obj){
		return obj.type;
	}
	function getValueOf(obj){
		return obj.value;
	}
	function getArgumentsOf(obj){
		return getObjectsIn(obj.args);
	}
	function runFunction(obj,env){
		if (isFunction(obj)){
			var args=getArgumentsOf(obj);
			var funcName=getFunctionName(obj);
			return env[funcName](args);
		}
	}
//}
//{ // EggDataStructure
	var _EggDataStructure=Object.create(null);
	_EggDataStructure.DataStructure=function(){
		var dataScheme=[];
		var haveBasedCode=false;
		var errorDoneOnline=0
		// Define Get : this.basedCode=null;
		// Define Get : this.length=null;
		function schemeArgs(arg){
			var match, expr=[];
			if (arg!==undefined) {
				console.log("Try Parsing Arg : ", arg);
				if(!(isNaN(Number(arg)))){
					console.log("Parses as number : ", arg);
					expr.push({type:"number", value:Number(arg)})
					return expr;
				}else if(/'(\d*\w*\W*[^']*\s*)+?'/.test(arg)){
				  if (arg.match(/'(\d*\w*\W*[^"]*\s*)+?'/)[0]==arg){
					  console.log("Parses as string : ", arg);
					  expr.push({type:"string", value:arg.toString()})
					  return expr;
				  }
				}else if(/"(\d*\w*\W*[^"]*\s*)+?"/.test(arg)){
				  if (arg.match(/"(\d*\w*\W*[^"]*\s*)+?"/)[0]==arg){
					  console.log("Parses as string : ", arg);
					  expr.push({type:"string", value:arg.toString()})
					  return expr;
				  }
				}else if (/^\w*$/.test(arg)){
					console.log("Parses as variable : ", arg);
					expr.push({type:"variable", name:arg.toString()})
					return expr;
				}else if(/^[^(),\W]\w*\d*|^[^()]\W?/.test(arg)){
					console.log("Expression Argument : ", arg);
					schemeArray(arg,expr);
					return expr;
				}
				try{
					var tmpExp;
					expMatch=arg;
					expMatch=expMatch.replace(/^\(/,"");
					if (/\),$/.test(expMatch))
						expMatch=expMatch.replace(/\),$/,"");
					else
						expMatch=expMatch.replace(/\)$/,"");
					tmpExp=expMatch;
					//--- Replace , inside of quoted string
					var tmpExpMatch=tmpExp.replace(/"(\d*\w*\W*[^"]*\s*)+?"/g,function(item){
						item=item.replace(/,/,__EGG_SPECIAL_CLN__);
						return item;
					});
					//--- See if there is others , instead of those in quotedstring, So we create new Array by them
					if (tmpExpMatch.split(/,/).length>0) {
						tmpExpMatch.split(/,/).forEach(function(_arg){
							if (!(_arg===undefined)) {
								expr.push(schemeArgs([_arg.replace(/__EGG_SPECIAL_CLN__/g,",")]));
								return expr;
							}
						});
					}else if(arg!==tmpExpMatch){
						return schemeArgs(tmpExpMatch);
					}
				}catch(e){
					console.log("Error in line :",arg);
					console.log(e);
				}
			}else{
				console.log("Undefined Argument in :",arg);
			}
			return expr;
		}
		function schemeArray(codes_,dataScheme){
			var match, matched=[false,""], _args=[], expMatch, expMatch2;
			var codes=(Object.getPrototypeOf(codes_)==String.prototype) ? [codes_] : codes_;
			for(var i=0;i<=codes.length;i++){
					var line=codes[i];
					var index=i;
					if (line===undefined) {
						console.log("Undefined parsing at",line,"in :",codes);
						return null;
					}
					console.log("Start parsing :",line);
					if(!(isNaN(Number(line)))){
						console.log("Parses as number : ", line);
						dataScheme.push({type:"number", value:Number(line)});
						return dataScheme;
					}else if(/'(\d*\w*\W*[^']*\s*)+?'/.test(line)){
					  if (line.match(/'(\d*\w*\W*[^']*\s*)+?'/)[0]==line){
						console.log("Parses as string : ", line);
						dataScheme.push({type:"string", value:line.toString()});
						return dataScheme;
					  }
					}else if(/"(\d*\w*\W*[^"]*\s*)+?"/.test(line)){
					  if (line.match(/"(\d*\w*\W*[^"]*\s*)+?"/)[0]==line){
						console.log("Parses as string : ", line);
						dataScheme.push({type:"string", value:line.toString()});
						return dataScheme;
					  }
					}else if (/^\w*$/.test(line)){
						console.log("Parses as variable : ", line);
						dataScheme.push({type:"variable", name:line.toString()});
						return dataScheme;
					}
					match=line.match(/^[^(),\W]\w*\d*|^[^()]\W?/);
					if (match!==undefined) {
						console.log("Expression matched :",match);
						matched[0]=true;
						matched[1]=match[0];
					}
					// Match expression
					try{
						if (/^\((\w*\W*\d*)*\)$/.test(line.slice(match[0].length))){
							if ((line.slice(match[0].length).match(/^\((\w*\W*\d*)*\)$/).index==0)){ // Match /(.)/
								expMatch=line.slice(match[0].length);
								expMatch2=line.slice(match[0].length);
								if (!(isNaN(Number(match[0])))) {
									throw new SyntaxError("Invalid function name");
									return;
								}
								console.log("expMatch before :",expMatch);
								if(/^\(/.test(expMatch) && /\)$/.test(expMatch)){
									if(expMatch.match(/\)/g).length==expMatch.match(/\(/g).length){
										if (/^\((\w*?\W*?\d*?)*?\),/.test(expMatch)==false){
											expMatch=expMatch.replace(/^\(/,"").replace(/\)$/,"");
											console.log("expMatch after :",expMatch);
											matched=[false,""];
											console.log("--Begin Expression "+match[0].toString());
											schemeArray([expMatch],_args);
											console.log("Save Expression",match[0]);
											dataScheme.push({type:"apply",
												operator:{type:"word",name:match[0]},
												args:_args
											});
											console.log("--End Expression "+match[0].toString());
											return dataScheme;
										}else{
											var t=/^\((\w*?\W*?\d*?)*?\),/.exec(expMatch)[0];
											if (!(t.match(/\)/g).length==t.match(/\(/g).length)){
												expMatch=expMatch.replace(/^\(/,"").replace(/\)$/,"");
												console.log("expMatch after :",expMatch);
												matched=[false,""];
												console.log("--Begin Expression "+match[0].toString());
												schemeArray([expMatch],_args);
												console.log("Save Expression",match[0]);
												dataScheme.push({type:"apply",
													operator:{type:"word",name:match[0]},
													args:_args
												});
												console.log("--End Expression "+match[0].toString());
												return dataScheme;
											}else if((t.match(/\)/g).length==t.match(/\(/g).length)){
												expMatch=expMatch.match(/\((\w*?\W*?\d*?)*?\),/)[0];
												console.log("expMatch after(inElse) :",expMatch);
												var forNxtExp=expMatch2.slice(expMatch.length);
												var suiteArgs=[];
												if (matched[0]){
													var tmpMatched=matched[1];
													matched=[false,""];
													console.log("--Begin Expression "+tmpMatched.toString());
													suiteArgs=schemeArgs(expMatch);
													console.log("Save Expression",tmpMatched);
													dataScheme.push({type:"apply",
														operator:{type:"word",name:tmpMatched},
														args:suiteArgs
													});
													console.log("--End Expression "+tmpMatched.toString());
												}else{
													suiteArgs=schemeArgs(expMatch);
													if (!(suiteArgs==null || suiteArgs==[])) dataScheme.push(suiteArgs);
												}
												console.log("DataScheme Status : ",dataScheme);
												console.log("Warning forNxtExp",[forNxtExp]);
												schemeArray([forNxtExp],dataScheme);
												return dataScheme;
											}
										}
									}
								}else{
									
								}
							}else if((line.match(/\)/g).length==line.match(/\(/g).length)){
								expMatch=line.match(/\((\w*?\W*?\d*?)*?\),/)[0];
								expMatch2=expMatch;
								var forNxtExp=expMatch2.slice(expMatch.length);
								var suiteArgs=[];
								if (matched[0]){
									var tmpMatched=matched[1];
									matched=[false,""];
									console.log("--Begin Expression "+tmpMatched.toString());
									suiteArgs=schemeArgs(expMatch);
									console.log("Save Expression",tmpMatched);
									dataScheme.push({type:"apply",
										operator:{type:"word",name:tmpMatched},
										args:suiteArgs
									});
									console.log("--End Expression "+tmpMatched.toString());
								}else{
									suiteArgs=schemeArgs(expMatch);
									if (!(suiteArgs==null || suiteArgs==[])) dataScheme.push(suiteArgs);
								}
								console.log("DataScheme Status : ",dataScheme);
								console.log("Warning forNxtExp",[forNxtExp]);
								schemeArray([forNxtExp],dataScheme);
								return dataScheme;
							}
						}else{
							console.log("Force to try to be parsed as Argument : ",line)
							var tmpExp=line;
							var _expr=[];
							//--- Replace , inside of quoted string
							var tmpExpMatch=tmpExp.replace(/"(\d*\w*\W*[^"]*\s*)+?"/g,function(item){
								item=item.replace(/,/,__EGG_SPECIAL_CLN__);
								return item;
							});
							if (tmpExpMatch.split(/,/).length>0) {
								tmpExpMatch.split(/,/).forEach(function(_arg){
									if (!(_arg===undefined)) {
										_expr.push(schemeArgs([_arg.replace(/__EGG_SPECIAL_CLN__/g,",")]));
									}
								});
							}
							if (!(_expr==null || _expr==[])) dataScheme.push(_expr);
							return dataScheme;
						}
					}catch(e){
						console.log("Error when line :",line);
						console.log("Unexpected Error : ",e);
						errorDoneOnline++;
					}
			}
			//return dataScheme;
		}
		return {
			setBasedCode:function(code){
				haveBasedCode=true;
				Object.defineProperty(this,"basedCode",{get:function(){
					if (code instanceof Array.prototype) 
						return code;
					else 
						return [code];
				}});
				Object.defineProperty(this,"haveBasedCode",{get:function(){
					return haveBasedCode;
				}});
				Object.defineProperty(this,"syncDataScheme",{value:function(){
					var _strictSyntaxTree=[];
					var _SyntaxTree=schemeArray(code,_strictSyntaxTree);
					Object.defineProperty(this,"SyntaxTree",{get:function(){
						return _SyntaxTree;
					}});
					Object.defineProperty(this,"strictSyntaxTree",{get:function(){
						return _strictSyntaxTree;
					}});
				}});
			}
		}
	}
	exports.EggDataStructure={};
	exports.EggDataStructure.DataStructure=function(){
		return _EggDataStructure.DataStructure();
	}
//}
//{ // EggSyntaxEvaluator
	var _EggSyntaxEvaluator={
		syntaxTree:exports.syntaxTree,
	};
	_EggSyntaxEvaluator.evaluate=function(){
		if(!(this.syntaxTree instanceof (Array && Object))) throw new Error("Unkown application");
		for(var i=0;i<this.syntaxTree.length;i++){
			if (isFunction(this.syntaxTree[i])) runFunction(this.syntaxTree[i],exports.env);
		}
		return exports.env;
	}
//}
//{ // EggEnvironement Functions
	var defined=[];
	var getvarbyname=function(varname){
		return _EggEnvironement[varname];
	}
	var getvarbyobj=function(obj){
		return _EggEnvironement[getVarName(obj)];
	}
	var isdefined=function(varname){
		return defined.indexOf(varname)!=-1;
	}
	var define=function(args){
		if (args.length==0) throw new SyntaxError("cannot define nothing");
		if (args.length==1) {
			_EggEnvironement[getVarName(args[0])]=null;
			defined.push(getVarName(args[0]));
		}
		if (args.length==2) {
			_EggEnvironement[getVarName(args[0])]=getValueOf(args[1]);
			defined.push(getVarName(args[0]));
		}
		if (args.length>2) {
			var seek=0;
			var tmpArgs=args;
			args.reduce(function(a,b){
				if (tmpArgs.length>1){
					if (seek==0) {
						define([a,b]);
					}else if (!(seek%2==0)){
						define([b,a])
					}
					seek++;
					tmpArgs=tmpArgs.slice(1);
					return tmpArgs[2];
				}
			});
		}
		if(args.length%2!=0) define([args[args.length-1]]);
	}
	var print=function(args){
		var line="";
		args.forEach(function(arg){
			switch(getTypeOf(arg)){
				case "variable":
					line+=getvarbyobj(arg);
					break;
				case "number":
					line+=getValueOf(arg);
					break;
				case "string":
					line+=getValueOf(arg);
					break;
				default:
					line+="undefined type"
			}
		});
		console.log(line);
	}
//}
//{ // EggEnvironement
	var _EggEnvironement={};
	_EggEnvironement["false"]=false;
	_EggEnvironement["true"]=true;
	_EggEnvironement["not"]=false;
	_EggEnvironement["yes"]=true;
	_EggEnvironement["null"]=null;
	_EggEnvironement["undefined"]=undefined;
	_EggEnvironement["empty"]=null;
	_EggEnvironement["define"]=define;
	_EggEnvironement["print"]=print;
	exports.env=_EggEnvironement;
//}
//{ // Main
	exports.newApp=function(code){
		isProgram(code);(exports.isOpened) && (cleanProgram());
	};
	exports.readApp=function(){
		createSyntaxTree();
	}
	exports.runApp=function(){
		new _EggSyntaxEvaluator.evaluate();
	}
	exports.autoBuild=function(code){
		isProgram(code);
		if (exports.isOpened) { 
			cleanProgram();
			createSyntaxTree();
			console.clear();
			_EggSyntaxEvaluator.evaluate();
		}
	}
//}
	return exports;
})(this.Egg={});
