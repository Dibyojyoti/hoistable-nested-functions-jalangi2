/** nested function decleration and call*/
var x = 23;

function f(a) {

 function g(step) {
   return x + step;
 }
 g(a);
}

f(1);





