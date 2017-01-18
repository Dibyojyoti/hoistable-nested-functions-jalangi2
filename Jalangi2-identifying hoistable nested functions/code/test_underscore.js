//Array of the Javascript files to analyse
var ownTests = ['arrays.js','chaining.js','collections.js','cross-document.js','functions.js','objects.js','utility.js'];
//The version of the analysis to execute
var analysis = 'analysisV6-b.js';
//The name of the merged outputs for all tests
var outputFile = 'result_underscore.txt';

//template of the command to execute jalangi-analysis (without file to test at the end)
var command = 'node jalangi2/src/js/commands/jalangi.js --inlineIID --inlineSource --analysis ' + analysis + ' ';

//execute analysis synchrounous to merge the outputs
var execSync = require('exec-sync');
var fs = require('fs');

//is there a built in function similar to toString() for arrays???
var Output = {
    list: [],
    push: function(s) {
        Output.list.push(s);
    },
    toString: function() {
        var result = "";
        for (i in Output.list) {
            result = result + Output.list[i];
        }
        return result;
    }
};

//sandbox for main execution
(function execute() {
    for (i in ownTests) {
        var test = ownTests[i];
        console.log("analyse " + test);
        execSync(command + "libraries/underscore-master/test/" + test);
        var result = fs.readFileSync("result.txt");
        Output.push("results for " + test + ":");
        Output.push(result + "\n\n");
        console.log("\tfinished");
        
        //remove temporary files generated by jalangi
        execSync("rm " + "libraries/underscore-master/test/" + test.split(".")[0] + "_*");
    }
    
    console.log("writing results to " + outputFile);
    fs.writeFileSync(outputFile, Output.toString());
})();