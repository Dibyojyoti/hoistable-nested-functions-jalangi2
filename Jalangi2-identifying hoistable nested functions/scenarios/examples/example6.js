/** more that one nested function decleration in different level and calls in corresponds with the level*/
var x = 23;

function f(a) {
   var y = 25;
   var b = 1;
   z = 27; // z is a global variable as var is not used , but not able to intercept in analysis
 function g(step) {
   var c = 12;
   function h(step) {
      return y + z + step;
   }

   h(step);
   return x + step;
 }

 g(a);

}

f(1);

