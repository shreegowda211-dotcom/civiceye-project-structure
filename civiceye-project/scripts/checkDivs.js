const fs=require('fs');
const path='d:/Shree/civiceye-project-structure/civiceye-project/src/pages/Register.jsx';
const lines=fs.readFileSync(path,'utf8').split('\n');
let stack=[];
for(let i=0;i<lines.length;i++){
  const line=lines[i];
  const regexOpen=/\<div[^>]*\>/g;
  let m;
  while((m=regexOpen.exec(line))!==null){
    stack.push({line:i+1,tag:m[0]});
  }
  const regexClose=/\<\/div\>/g;
  while((m=regexClose.exec(line))!==null){
    if(stack.length>0) stack.pop(); else console.log('unexpected close',i+1);
  }
}
console.log('unclosed count',stack.length);
console.log(stack);
