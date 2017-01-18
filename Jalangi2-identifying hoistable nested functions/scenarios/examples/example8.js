/*scenarion 1*/
function add1(a, b) {
    function add1B(x) {
        return x + 5;
    }
    function add15(x) {
        return x + b;
    }

    return add15(a) + add1B(a);

}
add1(3,4);

/*scenarion 2*/
function add2(a, b) {
    function add2B(x) {
        return x + b;
    }
    function add25(x) {
        return x + 5;
    }

    return add2B(a) + add25(a);
}


add2(3,4);

