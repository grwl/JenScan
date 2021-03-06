var scanner_targets=[];
var scanner_result=[];
var scanner_worklist=0;
var scanner_starttime;

function _scan(classc_subnet,scanurls){
	scanner_starttime = _getTimeSecs();
	
	var item=0;
	for (var x=0; x<= 255; x++){
		scanner_targets.push(new target(item,classc_subnet + x,scanlist_loadurls(),target_callback));
		scanner_targets[scanner_targets.length-1].Scan();
		scanner_worklist=scanner_worklist+1;
		item=item+1;
	}
	
	scanner_log();
}

function target_callback(id,lsip,liresult,lstype,loScanlistItem,stats){
	if (scanner_targets[id]==null){return false;}
	var newbatch=[];
	
	switch(lstype){	
		case "DEAD":
			killtarget(id);
			break;
		case "HIT":
			overwriteresult(lsip + '|' + loScanlistItem["LABEL"] + '|' + stats);
			if (loScanlistItem["DEPTRIGGER"]!=1){killtarget(id);}
			break;
		case "UNKNOWN":
			overwriteresult(lsip + '|UNKNOWN|' + stats );
			break;
		case "DONE":
			overwriteresult(lsip + '|UNKNOWN|' + stats);
			killtarget(id);
			break;
	}
}


function prepnewbatch(id, newbatch){
	scanner_targets[id].append(newbatch);
}

function killtarget(id){
	scanner_targets[id]=null;
	scanner_worklist=scanner_worklist-1;
}

function scanner_log(){
	var runtime =  _getTimeSecs() - scanner_starttime;

	if (document.forms[0].scanoutput){
		document.forms[0].scanoutput.value="Running for " + runtime + " seconds. Scanning " + scanner_worklist + " items.\n";
	
		if (scanner_result.length>0){
			for (var x=0; x < scanner_result.length; x++){
				document.forms[0].scanoutput.value += scanner_result[x] + '\n';
			}
		}
		if (scanner_worklist>0){
			setTimeout(scanner_log,3000);
		}else{
			document.forms[0].scanoutput.value += "--DONE--";
		}

	
/*	}else{
		console.clear();
	

	
		console.log("Running for " + runtime + " seconds. Scanning " + scanner_worklist + " items.");
	
		if (scanner_result.length>0){
			for (var x=0; x < scanner_result.length; x++){
				console.log(scanner_result[x]);
			}
		}
		if (scanner_worklist>0){
			setTimeout(scanner_log,3000);
		}else{
			console.log("--DONE--");
		}
*/
	}
	
}


function overwriteresult(newresult){
	//checks if entry already exists in result table
	//if so will only upddate if the new result is not an UNKNOWN as it is the least informative option
	//if not, will add to result lis
	var exists=false;
	for (var x=0;x < scanner_result.length ; x++){
		if (scanner_result[x].split('|')[0] == newresult.split('|')[0]){
			exists=true;
			if(newresult.split('|')[1] != "UNKNOWN"){scanner_result[x]=newresult}
			scanner_result[x]= scanner_result[x].split('|')[0] + "|" + scanner_result[x].split('|')[1] + "|" + newresult.split('|')[2]
		}
	}
	
	if (exists==false){scanner_result.push(newresult);}
}

function _getTimeSecs(){
	var d = new Date();
	var t_hour = d.getHours();     // Returns hours
	var t_min = d.getMinutes();    // Returns minutes
	var t_sec = d.getSeconds();    // Returns seocnds
	var result = ((t_hour*60)+t_min)*60 + t_sec;
	return result;
}

//mark file as loaded
main_filesloaded=main_filesloaded+1;

