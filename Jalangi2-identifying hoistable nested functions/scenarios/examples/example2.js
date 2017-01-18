/** nested function call but not decleration*/
var x = 23;
function g(step) {
   return x + step;
}

function f(a) {
 g(a);
}

f(1);

