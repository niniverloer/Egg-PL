# Egg Programming Language
Programming Language based on Javascript
Version : 1.0.0
Author : David Niverloer

# Platform
- NodeJS
- Browser Console
You can also run it by your own EggPL-UI

# What's Egg ?

Egg is an example of creating a basic programming language with javascript.
Egg is not to include in the application for production, but simply to develop your understanding of javascript objects. As mentioned    earlier, this is an example

The three main parts of a programming language
- Structure of data (information / syntax / task)
- Syntax analyzer (process)
- Environment (memory)

# How to use it
 - Import Egg-PL
    You can open a browser console or NodeJS and just copy/paste in the codesource of Egg-PL (Egg-PL.js)! Everything is done!
test it by running : Egg.autoBuild("define(x,1);print(x)");

# 3 ways to improve this language *(Make it your own PL)   : 
- Add more environement functions (All Egg-PL functionality depends on this)
- Create a built-in Error Tracking Module;
- Create a bridge integration for NodeJS and Result Fetching Module;
    
# How is Egg-PL built ?
1. EggDataStructure	: Helps to create the syntax tree with its constructor data structure;
2. EggSyntaxEvaluator	: Read the syntaxTree created by EggDataStructure and run it inside the environnement, Egg-PL runs its variable in a single environnement (global scope) it will be  usefull to create your own let function that create a local scope inside the global;
>Note: Egg-PL works only with functions!
>Example : define(variable,value) instead of var variable=value;
 
EggEnvironement['localScopeName']['localVariable']
>e.g : EggEnvironement["0"]["x"]=12 
>This means that x is a var in the first local scope (first memory range) and equals to 12;
>Now we could export local scope in global variables by the define function;
>e.g : You can create an environnemnt function define_in(scope,variable,value) (Pretty simple by the way)

3. EggEnvironement : Contains keywords and const variables, it's also a global scope;
The whole program works in his memory. Practically, it is a table that contains all the resources that the 
application must run. Are you going to improve the Egg-PL. (Write functions)

# You would like to learn more ?
  Keep in touch with me www.niverloer.me
