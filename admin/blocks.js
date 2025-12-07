function createTitleBlock(text="") {
const div=document.createElement('div');
div.className='block';
div.dataset.type='title';
div.innerHTML=`<input class="title-input" value="${text}">`;
return div;
}
function createParagraphBlock(text=""){
const div=document.createElement('div');
div.className='block';
div.dataset.type='paragraph';
div.innerHTML=`<textarea>${text}</textarea>`;
return div;
}
function parseTexToBlocks(tex){
const blocks=[];
const lines=tex.split(/\n\n+/);
lines.forEach(l=>{
if(l.startsWith('# ')) blocks.push(createTitleBlock(l.replace('# ','')));
else blocks.push(createParagraphBlock(l));
});
return blocks;
}
function blocksToTex(){
const ed=document.querySelector('#editor');
let out="";
[...ed.children].forEach(b=>{
if(b.dataset.type==='title') out+=`# ${b.querySelector('input').value}\n\n`;
else out+=b.querySelector('textarea').value+"\n\n";
});
return out.trim();
}
