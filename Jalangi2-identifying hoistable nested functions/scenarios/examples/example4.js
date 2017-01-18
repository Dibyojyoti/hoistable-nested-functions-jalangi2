/** more that one nested function decleration in same level and calls are also same level*/
var x = 23;

function f(a) {

 function g(step) {
   return x + step;
 }
 function h(step) {
   return x + step;
 }

 g(a);
 h(a);
}

f(1);

