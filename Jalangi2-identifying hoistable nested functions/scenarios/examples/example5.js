/** more that one nested function decleration in same level and calls are different level*/
var x = 23;

function f(a) {

 function g(step) {
    h(step);
   return x + step;
 }
 function h(step) {
   return x + step;
 }

 g(a);

}

f(1);

