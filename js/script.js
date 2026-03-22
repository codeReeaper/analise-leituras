// ================================
// VARIÁVEIS GLOBAIS
// ================================

// guarda dados do excel
let dadosGlobais=[]

// mapa
let mapa

// marcadores
let marcadores=[]

// ================================
// INICIAR MAPA
// ================================

function iniciarMapa(){

mapa = L.map('mapa').setView([-22.9,-43.2],10)

// camada do mapa (OpenStreetMap)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{

maxZoom:19

}).addTo(mapa)

}

// inicia mapa ao abrir site
iniciarMapa()

// ================================
// UPLOAD EXCEL
// ================================

document.getElementById("excelFile").addEventListener("change",lerExcel)

function lerExcel(e){

// mostra loader
document.getElementById("loader").style.display="flex"

const file=e.target.files[0]

const reader=new FileReader()

reader.onload=function(event){

// converte arquivo
const data=new Uint8Array(event.target.result)

const workbook=XLSX.read(data,{type:"array"})

// pega primeira planilha
const sheet=workbook.Sheets[workbook.SheetNames[0]]

// transforma em JSON
const json=XLSX.utils.sheet_to_json(sheet)

dadosGlobais=json

processar(json)

// esconde loader
document.getElementById("loader").style.display="none"

}

reader.readAsArrayBuffer(file)

}

// ================================
// PROCESSAR DADOS
// ================================

function processar(dados){

montarTabela(dados)

montarDashboard(dados)

popularFiltro(dados)

montarGaleria(dados)

montarMapa(dados)

}

// ================================
// TABELA
// ================================

function montarTabela(dados){

const tbody=document.querySelector("#tabela tbody")

tbody.innerHTML=""

dados.forEach(d=>{

let ocorr=d.OCORREN || ""

let foto=d["TEM_FOTO?"] || ""

let link=d.LINK_FOT || ""

let classe=""

if(!ocorr){

classe="verde"

}

else if(ocorr && foto==="NÃO"){

classe="vermelho"

}

else{

classe="laranja"

}

let botao=""

if(foto==="SIM"){

let url=extrairURL(link)

botao=`<button onclick="abrirFoto('${url}')">Foto</button>`

}

tbody.innerHTML+=`

<tr class="${classe}">

<td>${d.MATRICUL}</td>
<td>${d.LEITURA}</td>
<td>${ocorr}</td>
<td>${botao}</td>

</tr>

`

})

}

// ================================
// DASHBOARD
// ================================

function montarDashboard(dados){

let total=dados.length

let semOc=0
let semFoto=0
let comFoto=0

dados.forEach(d=>{

if(!d.OCORREN){

semOc++

}

else if(d["TEM_FOTO?"]==="NÃO"){

semFoto++

}

else{

comFoto++

}

})

document.getElementById("totalLeituras").innerText=total
document.getElementById("semOcorrencia").innerText=semOc
document.getElementById("semFoto").innerText=semFoto
document.getElementById("comFoto").innerText=comFoto

}

// ================================
// MAPA
// ================================

function montarMapa(dados){

// remove marcadores antigos
marcadores.forEach(m=>mapa.removeLayer(m))

marcadores=[]

dados.forEach(d=>{

let lat=d.LATITUDE
let lon=d.LONGITUDE

if(lat && lon){

let marker=L.marker([lat,lon]).addTo(mapa)

marker.bindPopup(

`Matricula: ${d.MATRICUL}`

)

marcadores.push(marker)

}

})

}

// ================================
// GALERIA
// ================================

function montarGaleria(dados){

const galeria=document.getElementById("galeriaFotos")

galeria.innerHTML=""

dados.forEach(d=>{

if(d["TEM_FOTO?"]==="SIM"){

let url=extrairURL(d.LINK_FOT)

let img=document.createElement("img")

img.src=url

img.onclick=()=>abrirFoto(url)

galeria.appendChild(img)

}

})

}

// ================================
// EXTRAIR URL DA FOTO
// ================================

function extrairURL(texto){

if(!texto) return ""

let r=texto.match(/https.*?jpg/)

return r?r[0]:""

}

// ================================
// ABRIR FOTO
// ================================

function abrirFoto(url){

document.getElementById("modal").style.display="flex"

document.getElementById("fotoModal").src=url

}

document.getElementById("modal").onclick=function(){

this.style.display="none"

}