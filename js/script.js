let dadosGlobais=[]
document.getElementById("excelFile").addEventListener("change",lerExcel)
function lerExcel(e){
const file=e.target.files[0]
const reader=new FileReader()
reader.onload=function(event){
const data=new Uint8Array(event.target.result)
const workbook=XLSX.read(data,{type:"array"})
const sheet=workbook.Sheets[workbook.SheetNames[0]]
const json=XLSX.utils.sheet_to_json(sheet)
dadosGlobais=json
montarTabela(json)
montarDashboard(json)
popularFiltro(json)
}
reader.readAsArrayBuffer(file)
}
function montarTabela(dados){
const tbody=document.querySelector("#tabela tbody")
tbody.innerHTML=""
dados.forEach(item=>{
let ocorr=item.OCORREN || ""
let foto=item["TEM_FOTO?"] || ""
let link=item.LINK_FOT || ""
let classe=""
if(!ocorr){
classe="verde"
}
else if(ocorr && foto==="NÃO"){
classe="vermelho"
}
else if(ocorr && foto==="SIM"){
classe="laranja"
}
let botao=""
if(foto==="SIM"){
let url=extrairURL(link)
botao=`<button onclick="abrirFoto('${url}')">Foto</button>`
}
tbody.innerHTML+=`
<tr class="${classe}">
<td>${item.MATRICUL}</td>
<td>${item.LEITURA}</td>
<td>${ocorr}</td>
<td>${botao}</td>
</tr>
`
})
}
function montarDashboard(dados){
let total=dados.length
let semOcorrencia=0
let semFoto=0
let comFoto=0
dados.forEach(d=>{
if(!d.OCORREN){
semOcorrencia++
}
else if(d["TEM_FOTO?"]==="NÃO"){
semFoto++
}
else{
comFoto++
}
})
document.getElementById("totalLeituras").innerText=total
document.getElementById("semOcorrencia").innerText=semOcorrencia
document.getElementById("semFoto").innerText=semFoto
document.getElementById("comFoto").innerText=comFoto
criarGrafico(semOcorrencia,semFoto,comFoto)
}
function criarGrafico(v1,v2,v3){
new Chart(document.getElementById("graficoOcorrencias"),{
type:"pie",
data:{
labels:["Sem Ocorrência","Ocorrência sem foto","Ocorrência com foto"],
datasets:[{
data:[v1,v2,v3]
}]
}
})
}
function extrairURL(texto){
if(!texto) return ""
let r=texto.match(/https.*?jpg/)
return r?r[0]:""
}
function abrirFoto(url){
document.getElementById("modal").style.display="flex"
document.getElementById("fotoModal").src=url
}
document.getElementById("modal").onclick=function(){
this.style.display="none"
}
function popularFiltro(dados){
let ocorrencias=[...new Set(dados.map(d=>d.OCORREN).filter(Boolean))]
let select=document.getElementById("filtroOcorrencia")
ocorrencias.forEach(o=>{
let opt=document.createElement("option")
opt.value=o
opt.textContent=o
select.appendChild(opt)
})
}
document.getElementById("filtroMatricula").addEventListener("input",filtrar)
document.getElementById("filtroOcorrencia").addEventListener("change",filtrar)
function filtrar(){
let mat=document.getElementById("filtroMatricula").value
let ocorr=document.getElementById("filtroOcorrencia").value
let filtrados=dadosGlobais.filter(d=>{
return (!mat || d.MATRICUL.toString().includes(mat)) &&
(!ocorr || d.OCORREN===ocorr)
})
montarTabela(filtrados)

}