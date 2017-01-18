function add(a, b) {
    function addB(x) {
        return x + b;
    }
    function add5(x) {
        return x + 5;
    }
    if (b === 5) {
        return add5(a);
    } else {
        return addB(a);
    }
}


//case1 - both brach executes
//add(3,4);
//add(3,5);

//case2 - only addB executes
//add(3,4);

//case3 - only add5 executes
add(3,5);


