/*

Web interface events and listeners

*/
// handle file "uploads"
function handleFiles(files) {
	const fileList = this.files || files;
	const promises = []
	for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
		promises.push(new Promise((resolve, reject) => {
			const file = fileList[i];
			const reader = new FileReader();
			reader.onload = (result) => {
				decryptHat(result.target.result).then((r) => resolve(r))
			}
			reader.readAsArrayBuffer(file);
		}))
	}
	Promise.all(promises).then((hatList)=>{
		hats.concat(hatList)
		createZip()
	})
}
const inputElement = document.getElementById("upload");
inputElement.addEventListener("change", handleFiles, false);

let dropbox = document.getElementById("uploadbox");
function dragenter(e) {
	dropbox.classList.add("drop");
	e.stopPropagation();
	e.preventDefault();
}
function dragover(e) {
	dropbox.classList.add("drop");
	e.stopPropagation();
	e.preventDefault();
}
function dragend(e) {
	dropbox.classList.remove("drop");
}
function drop(e) {
	dropbox.classList.remove("drop");
	e.stopPropagation();
	e.preventDefault();
	const dt = e.dataTransfer;
	const files = dt.files;
	handleFiles(files);
}
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);
dropbox.addEventListener("dragleave", dragend, false);
dropbox.addEventListener("dragend", dragend, false);

/*

Hat decoder

*/
const hats = []
const dlAllLink = document.getElementById("downloadZip")
let unnamedCounter = 0

// https://github.com/penguinscode/Quackhead/blob/2681ee7b71a57ab235742a24399babfe323b3ac5/quackhead.js#L14
const keyb64 = "8xaYIAH0em9hKg0CEw8t5g==";
const keyBytes = Uint8Array.from(atob(keyb64), c => c.charCodeAt(0))
let key;
crypto.subtle.importKey(
	"raw",
	keyBytes,
	{ name: "AES-CBC" },
	false,
	["decrypt"]
).then(r => key = r);

function decryptHat(hatByteArray){
	const ivLength = new DataView(hatByteArray.slice(0, 4)).getUint8()
	const iv = hatByteArray.slice(4, 4+ivLength)
	return window.crypto.subtle.decrypt(
		{
		  name: "AES-CBC",
		  iv: iv
		},
		key,
		hatByteArray.slice(20)
	).then((r) => parseMetadata(r))
}

function parseMetadata(hatByteArray) {
	return new Promise((resolve, reject) => {
		try{
			const hatNameLength = new DataView(hatByteArray.slice(8, 9)).getUint8()
			const hatName = hatByteArray.slice(9, 9+hatNameLength)
			let t = new TextDecoder()
			let nameDecoded = t.decode(hatName)
	
			const blob = new Blob([hatByteArray.slice(9+hatNameLength+4)], {
				type: "image/png"
			})
			
			let name = nameDecoded
			if(!name) {
				name = `unnamed hat ${unnamedCounter}`
				unnamedCounter++
			}
			createOutputElem(name, blob)
			hats.push({ name: name, blob: blob })
			resolve({ name: name, blob: blob })
		} catch(e) {
			reject(e)
		}
	})
}

function createOutputElem(name, blob){
	const cont = document.createElement("div")
	const img = document.createElement("img")
	const title = document.createElement("div")
	const a = document.createElement("a")
	
	cont.className = "duck-out"
	
	title.className = "title"
	title.innerText = name
	title.title = name
	
	img.src = URL.createObjectURL(blob)
	img.alt = `Image for ${name}`
	
	a.href = img.src
	a.download = `${name}.png`
	a.appendChild(img)
	
	cont.appendChild(title)
	cont.appendChild(a)
	document.getElementById("out").appendChild(cont)
}

function createZip(){
	var zip = new JSZip();

	hats.forEach(hat => {
		let fn = hat.name
		while(zip.file(`${fn}.png`)){
			fn = `${fn}_`
		}
		zip.file(`${fn}.png`, hat.blob)
	})

	zip.generateAsync({type:"blob"})
	.then(function(content) {
		dlAllLink.href = URL.createObjectURL(content)
		dlAllLink.download = "hats.zip"
	});
}
