// ===============================
// VARIÁVEIS GLOBAIS
// ===============================

let dadosGlobais=[]

let mapa
let marcadores=[]


// ===============================
// INICIAR MAPA
// ===============================

function iniciarMapa(){

mapa = L.map('mapa').setView([-22.9,-43.2],10)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(mapa)

}

iniciarMapa()


// ===============================
// UPLOAD DO EXCEL
// ===============================

document.getElementById("excelFile").addEventListener("change", lerExcel);

function lerExcel(e){

  // Mostra o loader
  document.getElementById("loader").style.display = "flex";

  const file = e.target.files[0];

  if(!file){
    alert("Nenhum arquivo selecionado.");
    document.getElementById("loader").style.display = "none";
    return;
  }

const reader = new FileReader();

reader.onload = function(event){

    try{

    const data = new Uint8Array(event.target.result);

    const workbook = XLSX.read(data, {type:"array"});

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // Pula as 3 linhas de título do relatório
    const json = XLSX.utils.sheet_to_json(sheet, {range:3});

console.log("Dados carregados:", json);
if(!json || json.length === 0){
        alert("O Excel foi carregado mas não possui dados válidos.");
}

    dadosGlobais = json;

      // Executa o processamento
    processar(json);

    }catch(err){

    console.error("Erro ao ler o Excel:", err);
    alert("Erro ao processar o arquivo Excel.");

    }finally{

      // Sempre esconder o loader
    document.getElementById("loader").style.display = "none";

}

};

reader.onerror = function(){
    alert("Erro ao ler o arquivo.");
    document.getElementById("loader").style.display = "none";
};
reader.readAsArrayBuffer(file);
}


// ===============================
// PROCESSAR DADOS
// ===============================

function processar(dados){

let total = dados.length
let processados = 0

function atualizarBarra(){

let porcentagem = Math.floor((processados/total)*100)

document.getElementById("progressFill").style.width = porcentagem + "%"
document.getElementById("progressText").innerText = porcentagem + "%"

}

// processamento em loop
dados.forEach((d,i)=>{

setTimeout(()=>{

processados++

atualizarBarra()

if(processados === total){

montarDashboard(dados)
montarTabela(dados)
montarMapa(dados)
montarGaleria(dados)

// esconder loader
document.getElementById("loader").style.display="none"

}

}, i*2)

})

}


// ===============================
// DASHBOARD
// ===============================

function montarDashboard(dados){

let total=dados.length

let semOc=0
let semFoto=0
let comFoto=0

dados.forEach(d=>{

if(!d.OCORRENCIA){

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


// ===============================
// PEGAR FOTO
// ===============================

function pegarFoto(d){

return d.LINK_FOTO_1 ||
d.LINK_FOTO_2 ||
d.LINK_FOTO_3 ||
d.LINK_FOTO_4 ||
d.LINK_FOTO_5 ||
""

}


// ===============================
// EXTRAIR URL
// ===============================

function extrairURL(texto){

if(!texto) return ""

let match=texto.toString().match(/https?:\/\/[^"]+/)

return match?match[0]:""

}


// ===============================
// TABELA
// ===============================

function montarTabela(dados){

const tbody=document.querySelector("#tabela tbody")

tbody.innerHTML=""

dados.forEach((d,i)=>{

let url=extrairURL(pegarFoto(d))

let botao=""

if(url){

botao=`<button onclick="abrirFoto('${url}')">Foto</button>`

}

tbody.innerHTML+=`

<tr>

<td>${d.MATRICULA}</td>
<td>${d.LEITURA}</td>
<td>${d.OCORRENCIA||""}</td>
<td>${d.DSC_COLABORADOR||""}</td>
<td>${botao}</td>

</tr>

`

})

}


// ===============================
// MAPA
// ===============================

function montarMapa(dados){

marcadores.forEach(m=>mapa.removeLayer(m))
marcadores=[]

dados.forEach(d=>{

let lat=d.LATITUDE
let lon=d.LONGITUDE

if(lat && lon){

let marker=L.marker([lat,lon]).addTo(mapa)

marker.bindPopup(`Matricula: ${d.MATRICULA}`)

marcadores.push(marker)

}

})

}


// ===============================
// GALERIA
// ===============================

function montarGaleria(dados){

const galeria=document.getElementById("galeriaFotos")

galeria.innerHTML=""

dados.forEach(d=>{

let url=extrairURL(pegarFoto(d))

if(url){

let img=document.createElement("img")

img.src=url

img.onclick=()=>abrirFoto(url)

galeria.appendChild(img)

}

})

}


// ===============================
// MODAL FOTO
// ===============================

function abrirFoto(url){

document.getElementById("modal").style.display="flex"

document.getElementById("fotoModal").src=url

}

document.getElementById("modal").onclick=function(){

this.style.display="none"

}