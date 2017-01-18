var x = 23;

function f1(a) {
 var y= 24;
 function g(step) {
   return x+ y + step;
 }
 g(a);
 function h1(step) {
   return x + step;
 }
 h1(a);
 
}

function f2(a) {
 var y= 25;
 function g(step) {
   return x+ y + step;
 }
 function h(step) {
   var y = 1;
   return x+ y + step;
 }

 g(a);
 h(a);

}

f1(1);
f2(1);

