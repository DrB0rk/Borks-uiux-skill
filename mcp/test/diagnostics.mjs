import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {auditContrast, compositeColor} from "../src/tools/contrast.js";
import {auditTargetSize} from "../src/tools/target.js";
import {auditTokens} from "../src/tools/tokens-lint.js";
import {readProjectFile, MARKUP_EXTENSIONS} from "../src/tools/path-guard.js";

assert.equal(Math.round(auditContrast("#00000000","#ffffff").ratioNumeric*100)/100,1,"transparent foreground should inherit white background");
assert.equal(auditContrast("#000000","#ffffff").ratioNumeric,21);
assert.equal(Math.round(compositeColor({r:0,g:0,b:0,a:.5},{r:255,g:255,b:255,a:1}).r),128);
assert.equal(auditTargetSize({width:12,height:12,spacing:20}).standards.wcag_2_2_AA_2_5_8.pass,false,"scalar spacing alone cannot prove geometry");
assert.equal(auditTokens({color:{$type:"color",primary:{$value:"#fff"}}}).issues.some(i=>i.id==="missing-token-type"),false);
const root=fs.mkdtempSync(path.join(os.tmpdir(),"b0x-audit-"));
try{
fs.mkdirSync(path.join(root,".git"));
fs.writeFileSync(path.join(root,"view.html"),"<button>Ok</button>");
assert.match(readProjectFile(root,"view.html",MARKUP_EXTENSIONS),/button/);
assert.throws(()=>readProjectFile(root,"../escape.html",MARKUP_EXTENSIONS));
assert.throws(()=>readProjectFile(root,".git/config",MARKUP_EXTENSIONS));
const external=fs.mkdtempSync(path.join(os.tmpdir(),"b0x-external-"));
try{fs.writeFileSync(path.join(external,"out.html"),"secret");fs.symlinkSync(path.join(external,"out.html"),path.join(root,"linked.html"));assert.throws(()=>readProjectFile(root,"linked.html",MARKUP_EXTENSIONS));}finally{fs.rmSync(external,{recursive:true,force:true});}
}finally{fs.rmSync(root,{recursive:true,force:true});}
console.log("Diagnostic regression checks passed");
