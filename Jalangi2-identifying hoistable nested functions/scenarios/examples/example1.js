/** Nested function delceration and call  */

function foo(){
var a = 1;

if(a === 1){
	var b = a + 2; 
}
var c =  function goo(){
		return 5;
	};
var d =  function zoo(){
		return a+5;
	};

//c();
var e = b + c() + d();
console.log(d); 
}
foo();

