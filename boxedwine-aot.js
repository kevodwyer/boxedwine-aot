

	function extractLastPartOfPath(str){
        return str.substring(str.lastIndexOf("/")+1,str.length);
    }
    function extractFirstPartOfPath(str){
        return str.substring(0,str.lastIndexOf("/"));
    }
	function loadBoxedWine(proxy, callback) {
		fetch('boxedwine-src.zip', { method: 'GET' }).then(function(response) {
			response.arrayBuffer().then(function(buffer) {
			    let zip = new JSZip(buffer);
			    let entries = [];
                for(var entry in zip.files) {
					entries.push(entry);
                }
                function loadShellfile() {
                	let shelllFile = "shellfs.html";
					fetch(shelllFile, { method: 'GET' }).then(function(response) {
						response.arrayBuffer().then(function(buffer) {    
							let dir = '/working';
							createFile(proxy, dir, shelllFile, buffer, () => loadExamplefile());    
						});
					});
                }
                function loadExamplefile() {
                	let shelllFile = "main2.cpp";
					fetch(shelllFile, { method: 'GET' }).then(function(response) {
						response.arrayBuffer().then(function(buffer) {    
							let dir = '/working/source';
							createFile(proxy, dir, shelllFile, buffer, () => callback());    
						});
					});
                }
                recursiveLoad(proxy, '/working', zip, 0, entries, () => loadShellfile());
			});
		});
	}
	function recursiveLoad(proxy, dirPrefix, zip, index, entries, callback) {
		if (index >= entries.length) {
			callback();
			return;
		}
		let entry = entries[index];
	    let data = zip.file(entry);
        if(data != null){
            if (! entry.endsWith('.DS_Store')) {
                let buf = data.asUint8Array();
                let parent = dirPrefix + "/" + extractFirstPartOfPath(entry) ;
                let filename = extractLastPartOfPath(entry);
                createFile(proxy, parent, filename, buf, () => recursiveLoad(proxy, dirPrefix, zip, index + 1, entries, callback));
            } else {
                recursiveLoad(proxy, dirPrefix, zip, index + 1, entries, callback);
            }
    	}else{ //directory
            let fullPath = entry.substring(0,entry.length-1);
            let parent = extractFirstPartOfPath(fullPath);
            let dir = extractLastPartOfPath(fullPath);
            if(parent.length == 0){
                 parent = dirPrefix;
            }else{
                parent = dirPrefix + "/" + parent;
            }
            createFolder(proxy, parent, dir, () => recursiveLoad(proxy, dirPrefix, zip, index + 1, entries, callback));
        }
	}
	function createFile(proxy, dir, name, buf, cb) {
		let dirWithoutSlash = dir.endsWith('/') ? dir.substring(0, dir.length - 1) : dir;
		//let text = new TextDecoder().decode(buf);
		proxy.fileSystem.writeFile(dirWithoutSlash + "/" + name, Buffer.from(buf)).then(() => {
    	    console.log("File created :" + dir + "/" + name);
    		cb();
    	});
    	// Buffer.from(buf)
    	/*
    	FS.createDataFile(dir, name, buf, true, true);
    	cb();
*/
	}
	function createFolder(proxy, parent, dir, cb) {
    	proxy.fileSystem.mkdirTree(parent + "/" +  dir).then(() => {
        	console.log("Directory created :" + parent + "/" +  dir);
    		cb();
    	});
	}
	function boxedwineSave(proxy) {
		console.log("generating zip file");
		/*
		proxy.fileSystem.readFile("/working/boxedwine.html").then(html => {
			proxy.fileSystem.readFile("/working/boxedwine.wasm").then(wasm => {
				proxy.fileSystem.readFile("/working/boxedwine.js").then(js => {
					proxy.fileSystem.readFile("/emscripten/cache/sanity.txt").then(sanity => {
    			    	console.log("finished generating zip file");
    		    		var zip = new JSZip();
						zip.file("main.html", html);
						zip.file("main.wasm", wasm);
						zip.file("main.js", js);
						zip.file("sanity.txt", sanity);
						let zipFile = zip.generate({type:"blob", compression:"DEFLATE"});
						url = window.URL.createObjectURL(zipFile);
						var ae = document.createElement("a");
						document.body.appendChild(ae);
						ae.style = "display: none";
						ae.href = url;
						ae.download = "output.zip";
						ae.click();
		    		});
	    		});
	    	});
    	});*/
	}
