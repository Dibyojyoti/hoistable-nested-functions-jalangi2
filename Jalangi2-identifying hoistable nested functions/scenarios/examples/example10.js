var x = 23;

function fLevel1(a) {
	var y= 24;
  	function fLevel2(step2) {
     		var z=25;
     		function fLevel3(step3) {
        		var zz=26;
			function fLevel4(step4) {
	   			return x +z+ step4;   	
			}
			fLevel4(zz);
        		return x + step3;
     		}
     		fLevel3(z);
     		return x+ step2;
  	}
  	fLevel2(a);
}

fLevel1(1);


