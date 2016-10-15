import { takeEvery, takeLatest } from 'redux-saga'
import { call, put ,fork} from 'redux-saga/effects'
import { Map ,List,fromJS} from "immutable";
import {doSign,constroiMensagem,daSerieTalao,pad2,zeroFill} from "../aux";
import Alert  from 'react-native';
let serverUrl='http://192.168.2.1:5984';
 // let serverUrl='http://192.168.1.218:5984'
 let db= 's08'


 // let serverUrl='http://192.168.1.104:5984';
//let serverUrl='http://192.168.10.25:5984'

//let serverUrl='http://192.168.1.218:5984';



export function  makeRequest (method, url) {

  return new Promise(function (resolve, reject) {
      var FETCH_TIMEOUT = 2080;
      var timeout = setTimeout(function() {
          reject(new Error('Request timed out'));
      }, FETCH_TIMEOUT);
      var xhr = new XMLHttpRequest();

      xhr.open(method, url);
      xhr.onload = function () {
          clearTimeout(timeout);
          if (this.status >= 200 && this.status < 300) {
             setTimeout(() => null, 0);
             resolve(JSON.parse(xhr.response));
          } else {
            reject({
            status: this.status,
            statusText: xhr.statusText
            });
          }
      };
      xhr.onerror = function () {
        clearTimeout(timeout);
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
      xhr.ontimeout = function (e) {
         clearTimeout(timeout);
         reject({
           status: e,
           statusText: e
         });
       };
    });
  }

function saveDoc(doc,id) {
  // --grava documento
  return new Promise(function (resolve, reject) {
    let htpMode='PUT'
    if(!doc._id==null) { //TODO remover esta
      id=doc._id;
      htpMode='PUT';
    }
    else{
      if(id==null) id="";
      htpMode='POST';
    }
    if( (id!=null)&&(id!=undefined)&&(id.trim()!="")   ) {
      id=id;
      htpMode='PUT';
    }
    var xhrCreate = new XMLHttpRequest();

    xhrCreate.open(htpMode,serverUrl+'/'+db+'/'+id, true);
    xhrCreate.setRequestHeader("Content-type", "application/json");

    xhrCreate.onerror = function () {
      reject({
        status:"erro a guardar na BD",
        statusText: "erro a guardar na BD"
      });
    };
    xhrCreate.onload = function () {
     if (this.status >= 200 && this.status < 300) {
        let jsResp=JSON.parse(xhrCreate.response)
        doc._id=jsResp.id;
        doc._rev=jsResp.rev;
        resolve(
          {response:JSON.parse(xhrCreate.response),
            doc:doc,
            id:jsResp.id,
            rev:jsResp.rev
            }
        );

      } else {
        reject({
          status: this.status,
          statusText: xhrCreate.statusText
        });
      }
    };
    xhrCreate.send(JSON.stringify(doc));

  })
}


//
//  docMesa_atualiza - constroi documento a gravar com numT e serie
//
function docMesa_atualiza(docMesa) {

  return new Promise(function (resolve, reject) {

    let serieTalao=1;
    if(docMesa.taloes==null ){
       serieTalao=daSerieTalao(docMesa);
    }
    else {
      if(docMesa.taloes[0].serieTalao==null ){
         serieTalao=daSerieTalao(docMesa);
      }
      else
      serieTalao=docMesa.taloes[0].serieTalao;
    }
    //docMesa.type -> "mesa"
    if(docMesa.aberta == true) {
                  // --> tem de criar novo talao e gerar hash e fechar a mesa
                  // else nao faz nada so mostra talao
                  makeRequest('GET', serverUrl+'/'+db+'/_design/myViews/_view/exp2?startkey=[' +
                                                       (serieTalao + 1).toString() + ']' +
                                                       '&endkey=[' +
                                                       serieTalao + ']&descending=true&limit=1')
                  .then(function (s) {
                    let hashAnterior="";
                    let idAnterior = "";
                    let numTalao=1;
                    if (s.rows[0].value._id !== undefined)
                            {idAnterior = s.rows[0].value._id}
                    if (s.rows[0].value.hash !== undefined)
                            {hashAnterior = s.rows[0].value.hash};
                    if (s.rows[0].value.numTalao !== undefined)
                            numTalao=s.rows[0].value.numTalao
                    docMesa.numTalao=numTalao+1;
                    docMesa.serieTalao = serieTalao;

                    resolve({doc: docMesa, hashAnterior: hashAnterior})

                  }).catch(function (err) {
                    reject(err.statusText)
                      throw Error("errrrr docMesa_atualiza");
                      console.error('Augh, there was an error!', err.statusText);
                    });

    }
    else{
       console.log("nao faz nada kk");
       resolve(null)
            //fica igual
    }
   })
}

function saveMesa(arrM) {
  let docMesa=arrM.docMesa;
  let docTalao=arrM.docTalao;
  let idTalao =arrM.idTalao;

  for (var i = 0; i < docMesa.linhaConta.length; i++) {
        if (docMesa.linhaConta[i].orderReferences === undefined)
                docMesa.linhaConta[i].orderReferences = [docTalao.serieTalao + "/" + docTalao.numTalao];
        else docMesa.linhaConta[i].orderReferences.push(docTalao.serieTalao + "/" + docTalao.numTalao);
      }
      docMesa.aberta=false;
      docMesa.ultimaHashReference=docTalao.hash;
      docMesa.ultimaOrderReference= docTalao.serieTalao + "/" + docTalao.numTalao;

      if (docMesa.taloes == undefined) {
            docMesa.taloes = [{ "serieTalao": docTalao.serieTalao, "numTalao": docTalao.numTalao, "id": idTalao }];
      } else {
            docMesa.taloes.push({ "serieTalao": docTalao.serieTalao, "numTalao": docTalao.numTalao, "id": idTalao });
      }
  return saveDoc(docMesa);
}



function criaTalaoInsere(docHashAnt) {
  let document=    docHashAnt.doc  ;
  let hashAnterior=    docHashAnt.hashAnterior;
  var d = new Date();
  var h = zeroFill(d.getHours(), 2);
  var m = zeroFill(d.getMinutes(), 2);
  var sc = zeroFill(d.getSeconds(), 2);

  var ka = h.toString() + ':' + m.toString() + ':' + sc.toString();
  //hora criacao hash
  var mensagemAssin = constroiMensagem(document, d, hashAnterior);
  delete document['_id'];
  delete document['_rev'];

  document.hash = doSign(mensagemAssin);
  document.mensagem = mensagemAssin;
  document.hora = ka;
  document.data = [d.getFullYear(), 1 + d.getMonth(), d.getDate()];
  document.type = "talao";
  return saveDoc(document);//promessa

}



function* fazGravacao(action) {

  if (action.payload.document!= undefined)
  {
    try {
        let docMesa=action.payload.document;
        const docHashAnt = yield call(docMesa_atualiza,
                                      JSON.parse(JSON.stringify(docMesa)) );

        //TODO por aqui if aberta chama docMesa_atualiza

        if(docHashAnt!=null){
              const preSave = yield call(saveDoc,
                                          {type:"lixo"},
                                          ("lixA"+docHashAnt.doc.serieTalao +"-"+
                                          docHashAnt.doc.numTalao
                                            ) );


              const inserido= yield call(criaTalaoInsere,docHashAnt);
              const talaoIn = yield call(saveMesa,{docMesa: docMesa,
                                                    docTalao: inserido.doc,
                                                    idTalao: inserido.response.id
                                                      });
              yield put({type:  "GOTO_PAGINA",
                        pagina:{pagina:"CONTA",
                                empregado:action.payload.empregado,
                                mesa:talaoIn.doc.mesa,
                                documento:talaoIn.doc,
                                contador:0,
                              }});
        }

   } catch (e) {


     var menErr="Sem mensagem de erro"
     if (!(e==null)) {menErr=e.toString()  }
     yield put({type: "ADD_LOG", log: "erro fazGravacao"+menErr  });
      //yield put({type: "GOTO_PAGINA_FAILED", message: e.message});
   }}
}



function all_users(){
  return makeRequest('GET',serverUrl+'/_users/_all_docs')
}

function fetchMesaDoc(num){
  let zz=makeRequest('GET',serverUrl+'/'+db+'/_design/appV/_view/mesasAbertas?key='+num)
  return zz;
}

function* fetchEmpregados(action) {
  yield put({type: "ADD_LOG", log: "vai fazer fetch dos empregados" });

    try {

        const lista = yield call(all_users, action);
        yield put({type: "ADD_LOG", log: "ja fez fetch dos empregados" });
        var filt=(lista.rows.filter(a=>{if (a.id!="_design/_auth" && a.id!="org.couchdb.user:nuno") {return a.id}}  ));

        yield put({type:"ADD_EMPREGADOS",lista:filt })
     }
     catch (e) {
         var menErr="Sem mensagem de erro"
         if (!(e==null)) {menErr=e.toString()  }
         yield put({type: "ADD_LOG", log: "erro pedido f empregados"+menErr });
         yield put({type: "GOTO_PAGINA_FAILED", message: menErr});
     }
}

function fetchEmpregadoDoc(empregado) {
  return makeRequest('GET',serverUrl+'/_users/'+empregado)
}

function fetchMesasAbertasIntersect(mesas){
  return new Promise(function (resolve, reject) {
      makeRequest('GET', serverUrl+'/'+db+'/_design/appV/_view/mesasAbertas')
      .then( (datums)=> {
            var memp=(mesas);
            //Intersecçao
            datums.rows.map(a=> {
               if (memp.includes(a.key)) {
                 memp[memp.indexOf(a.key)]=
                      {mesa:a.key,total:a.value.total,doc:a.value}
               }
              return a;
            });
          resolve(memp);
      }).catch(function (err) {
                console.log(err);
                reject(err.statusText)
                throw Error(err);
        });
  })
}

function* fetchMesa(action) {
    try {
        const resul = yield call(fetchEmpregadoDoc, action.empregado);
        yield put({type:"ADD_EMPREGADOS",lista:resul.mesas  })
        const resul2 = yield call(fetchMesasAbertasIntersect, resul.mesas );
        yield put({type:"ADD_EMPREGADOS",lista:resul2  })

     }
     catch (e) {
         console.log("erro");

         var menErr="Sem mensagem de erro"
         if (!(e==null)) {menErr=e.toString()  }

         yield put({type: "ADD_LOG", log: "erro pedido fetchMesa"+ menErr });
         yield put({type: "GOTO_PAGINA_FAILED", message: menErr});
     }
}

function* showPagina(action) {
  if(action.payload.pagina=="MESAS"){
    try {
      const resul = yield call(fetchEmpregadoDoc, action.payload.empregado);
      const resul2 = yield call(fetchMesasAbertasIntersect, resul.mesas );

      yield put({type:  "GOTO_PAGINA", pagina:{pagina:"MESAS",
                                               contador:0,
                                               mesas:resul2,
                                               empregadoAtual:action.payload.empregado,
                                               permissoes:resul.permissoes,
                                               document:{},
                                             }});
     }
     catch (e) {
         var menErr="Sem mensagem de erro"
         if (!(e==null)) {menErr=e.toString()  }
         yield put({type: "ADD_LOG", log: "erro showpagina pedido empregados"+menErr });
         yield put({type: "GOTO_PAGINA_FAILED", message: menErr });
     }
  }
  if (action.payload.pagina=="EMPREGADOS") {
    try {
        yield put({type: "ADD_LOG", log: "faz pedido empregados" });
        const lista = yield call(all_users, action);
        yield put({type: "ADD_LOG", log: "retorna empregados" });
        var filt=(lista.rows.filter(a=>{if (a.id!="_design/_auth" && a.id!="org.couchdb.user:nuno") {return a.id}}  ));
        yield put({type:  "GOTO_PAGINA",
                   pagina:{pagina:"EMPREGADOS",
                            contador:0,
                            listaEmpregados:filt,
                            }
        });
     }
     catch (e) {
         var menErr="Sem mensagem de erro"
         if (!(e==null)) { menErr=e.toString() }
         console.log("erro pag EMPREGADOS "+menErr);
         yield put({type: "ADD_LOG", log: "erro showpagina pedido empregados"+menErr  });
         yield put({type: "GOTO_PAGINA_FAILED", message: menErr });
     }
   }
   if (action.payload.pagina=="CONTA") {
     try {
       if (action.payload.insere)
       {
         let docMesa=action.payload.documento;
         docMesa.nomeCliente=action.payload.nome;
         docMesa.numContribuinte=action.payload.contribuinte;
         const inserido= yield call(saveDoc,docMesa);
         yield put({type: "INSERE_NUM_CONT" })
       }
       else{
         if(Object.keys(action.payload.documento).length !== 0)
         {

           yield put({type: "GOTO_PAGINA",
                     pagina:{pagina:"CONTA",
                            empregado:action.payload.empregado,
                            mesa:action.payload.mesa,
                            documento:action.payload.documento,
                            contador:0,
                          }
           });
           yield put({type: "ADD_LOG", log: "GOTO_PAGINA CONTA" });
           yield put({type: "NEW_INPUT",
                            payload:{id:"limpa",
                              cxNome:action.payload.documento.nomeCliente ,
                              cxNumContribuinte:action.payload.documento.numContribuinte}
           });



           if(action.payload.documento.aberta){
             //PARA garantir que grava ultima versao => mostra a ultima versao
              const mesaDocAct = yield call(fetchMesaDoc, action.payload.mesa);
              let nm=action.payload.documento;
              if (mesaDocAct.rows.length>0)nm=mesaDocAct.rows[0].value
              yield put({type:"GRAVA_CONTA",
                      payload:{ document:nm,
                                empregado:action.payload.empregado,
                                numContribuinte: "" ,
                                nomeCliente: "" } })
          }
          //save Documento
        }

      }}
      catch (e) {
          var menErr="Sem mensagem de erro"
          if (!(e==null)) {menErr=e.toString()  }
          yield put({type: "ADD_LOG", log:"GOTO CONTA "+ menErr });
          yield put({type: "GOTO_PAGINA_FAILED", message: menErr});
      }
    }
    if ((action.payload.pagina)=="LOG") {
      try {
        yield put({type:  "GOTO_PAGINA",
                   pagina:{pagina:"LOG",
                           contador:0,
                         }});
       }
       catch (e) {
           var menErr="Sem mensagem de erro"
           if (!(e==null)) {menErr=e.toString()  }
           yield put({type: "ADD_LOG", log:"GOTO LOG "+ menErr });
           yield put({type: "GOTO_PAGINA_FAILED", message: menErr});
       }
     }

}
/*
  Starts fetchUser on each dispatched `USER_FETCH_REQUESTED` action.
  Allows concurrent fetches of user.
*/
// function* mySaga() {
//   yield* takeEvery("FETCH_MESAS", fetchMesa);
// }
function* mySaga() {
  yield* takeEvery("GRAVA_CONTA", fazGravacao);
}

function* mySaga2() {
  yield* takeEvery("SHOW_PAGINA", showPagina);
}

// function* mySaga3() {
//   yield* takeEvery("FETCH_EMPREGADOS", fetchEmpregados);
// }


export default function* root() {
  yield [
    fork(mySaga),
    fork(mySaga2),
    //fork(mySaga3),
    // fork(watchCheckout)
  ]
}
