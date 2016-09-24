import { takeEvery, takeLatest } from 'redux-saga'
import { call, put ,fork} from 'redux-saga/effects'
import { Map ,List,fromJS} from "immutable";
import {doSign,constroiMensagem,daSerieTalao,pad2,zeroFill} from "../aux";



let serverUrl='http://192.168.2.1:5984';
//let serverUrl='http://192.168.1.104:5984';
//let serverUrl='http://192.168.10.25:5984';
//let serverUrl='http://pbrito.no-ip.info:2030'


export function makeRequest (method, url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
     if (this.status >= 200 && this.status < 300) {
       resolve(JSON.parse(xhr.response));
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
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

    xhrCreate.open(htpMode,serverUrl+'/s08/'+id, true);
    xhrCreate.setRequestHeader("Content-type", "application/json");

    xhrCreate.onerror = function () {
      console.log("erro a guardar na BD");
    };
    xhrCreate.onload = function () {
     if (this.status >= 200 && this.status < 300) {
       console.log("response-----");
        console.log(xhrCreate.response);
        resolve(
          {response:JSON.parse(xhrCreate.response),
            doc:doc
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

export function fetchMesasAbertas(userId) {

  return  makeRequest('GET', serverUrl+'/s08/_design/appV/_view/mesasAbertas')
  .then(function (datums) {
  //  console.log("dddd");
    return(datums.rows);
  })
  .catch(function (err) {
    throw Error("errrrr fetchMesasAbertas");
    console.error('Augh, there was an error!', err.statusText);
  });

          //  return fetch('http://192.168.1.104:5984/s08/_design/appV/_view/mesasAbertas')
          //     .then((response) => {
          //       setTimeout(() => null, 0);
          //       if (!response.ok) {
          //            throw Error(response.statusText);
          //        }
          //       return response.json()
          //     })
          //     .then((responseJson) => {
          //       return responseJson.rows
          //       //rows -> key,value  value->doc {mesa,empregado,total ...}
          //     })
          //     .catch((error) => {
          //        throw Error(error);
          //       // console.error(error);
          //     });
}

export function fetchMesasEmpregado(userId) {


  return  makeRequest('GET', serverUrl+'/_users/'+userId)
  .then(function (datums) {
  return({mesas:datums.mesas ,
          permissoes: datums.permissoes });
  })
  .catch(function (err) {
     throw Error("errrrr fetchMesasEmpregado");
  console.error('Augh, there was an error!', err.statusText);
  });

          //  return fetch('http://192.168.1.104:5984/_users/'+userId)
          //     .then((response) => {
          //       setTimeout(() => null, 0);
          //       // console.log(response)
          //       if (!response.ok) {
          //            throw Error(response.statusText);
          //        }
          //       return response.json()
          //     }
          //     )
          //     .then((responseJson) => {
          //       return {mesas:responseJson.mesas ,
          //               permissoes: responseJson.permissoes }
          //     })
          //     .catch((error) => {
          //        throw Error(error);
          //     });
}

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* fetchUser(action) {
  let mapMesasAbertas = new Map();
  try {
      // const user ={mesas: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
      //                                               permissoes:false}
      // const user = yield call(fetchMesasEmpregado, action.payload.empregado);
      // yield put({type: "USER_FETCH_SUCCEEDED", user:{mesas: user.mesas,
      //                                               permissoes:user.permissoes}});

      if(!action.payload.permissoes ||  action.payload.modal ){
            const mesas = yield call(fetchMesasAbertas, action.payload.empregado);
            mesas.forEach(function(a){
              mapMesasAbertas=mapMesasAbertas.set(a.key,a.value)
            })
            yield put({type: "MESAS_FETCH_SUCCEEDED", mesas: mesas});
            yield put({type:  "GOTO_PAGINA", pagina:{pagina:"MESAS",
                                                     empregado:action.payload.empregado,
                                                     mesasAbertas:mapMesasAbertas,
                                                     permissoes:true}});
      }
      else {
          yield put({type:"GOTO_HOME",payload:{ modal:true,
                                                empregado:action.payload.empregado,}});
      }

   } catch (e) {
      yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}




function saveDDD(docMesa) {
  return new Promise(function (resolve, reject) {

    let serieTalao=1;
    // console.log(docMesa);
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
                  makeRequest('GET', serverUrl+'/s08/_design/myViews/_view/exp2?startkey=[' +
                                                       (serieTalao + 1).toString() + ']' +
                                                       '&endkey=[' +
                                                       serieTalao + ']&descending=true&limit=1')
                  .then(function (s) {
                    console.log("ultimo Document");
                    console.log(s);
                    let hashAnterior="";
                    let idAnterior = "";
                    let numTalao=1;
                    if (s.rows[0].value._id !== undefined)
                            {idAnterior = s.rows[0].value._id}
                    if (s.rows[0].value.hash !== undefined)
                            {hashAnterior = s.rows[0].value.hash};
                    if (s.rows[0].value.numTalao !== undefined)
                            numTalao=s.rows[0].value.numTalao
                    // docMesa.type="mesa"
                    docMesa.numTalao=numTalao+1;
                    docMesa.serieTalao = serieTalao;
                    resolve({doc: docMesa, hashAnterior: hashAnterior})

                  }).catch(function (err) {
                    console.log(err);
                    reject(err.statusText)
                      throw Error("errrrr saveDDD");
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
  let hashAnterior=    docHashAnt.hashAnterior
  //cria Talao e insere na BD
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



function* showPagina(action) {
  if(action.payload.insere)
  {
      let docMesa=action.payload.document;
      docMesa.nomeCliente=action.payload.nome;
      docMesa.numContribuinte=action.payload.contribuinte
      const inserido= yield call(saveDoc,docMesa);
      yield put({type:"INSERE_NUM_CONT"})
  }
  else
  if (action.payload.document!= undefined)
  {try {
    let docMesa=action.payload.document;
    const docHashAnt = yield call(saveDDD,JSON.parse(JSON.stringify(docMesa)) );

    //TODO por aqui if aberta chama saveDDD
    //TODO mudar o nome saveDDD porque nao faz nenhum save o que faz é
    //            constroi documento a gravar com numT e serie


    if(docHashAnt!=null){
          const preSave = yield call(saveDoc,{type:"lixo"},("lix"+
          docHashAnt.doc.numTalao  +"-"+docHashAnt.doc.serieTalao) );

          const inserido= yield call(criaTalaoInsere,docHashAnt);
          const talaoIn = yield call(saveMesa,{docMesa:docMesa,
                                                docTalao:inserido.doc,
                                                idTalao:inserido.response.id
                                                  });
    }
    let numContribuinte="";
    let nomeCliente="";
    if(docMesa.numContribuinte!==null)
        numContribuinte = docMesa.numContribuinte
    if(docMesa.nomeCliente!==null)
        nomeCliente = docMesa.nomeCliente
    yield put({type:"CLEAR_INPUT",payload:{
                            numContribuinte: numContribuinte ,
                            nomeCliente: nomeCliente } })
    yield put({type:  "GOTO_PAGINA", pagina:{pagina:"CONTA",
                                            contador:0,
                                             empregadoAtual:action.payload.empregadoAtual,
                                             document:action.payload.document,
                                             }});
   } catch (e) {
     console.log("FGHJKLKJHGFD");
     console.log(e);
      //yield put({type: "GOTO_PAGINA_FAILED", message: e.message});
   }}
}

function fetchMenu() {

   return new Promise(function (resolve, reject) {
    makeRequest('GET',serverUrl+'/_users/_all_docs')
    .then(response => {
      console.log(response);
      var filt=(response.rows.filter(a=>{if (a.id!="_design/_auth") {return a.id}}  ));
      var fn = function asyncMesasEmp(empregado){
         return   makeRequest('GET',serverUrl+'/_users/'+empregado.id)
         //fetch(serverUrl+'/_users/'+empregado.id)
      };

      let actions = filt.map( fn  );
      // console.log(actions);
      var results = Promise.all(actions).then(
         a=>
         {
           Promise.all(actions).then (a=>
             {
               a=a.map(function(a){
                              return {id:a._id,mesas:a.mesas,permissoes:a.permissoes}
                      })
               resolve(a)
           })
         }
        )
    })
   })
}




function* showMenu(action) {
    const lista = yield call(fetchMenu, action);
    try {
      yield put({type:"ADD_EMPREGADOS",lista:lista  })
     }
     catch (e) {
       console.log(e.message);
        //yield put({type: "GOTO_PAGINA_FAILED", message: e.message});
     }
}
/*
  Starts fetchUser on each dispatched `USER_FETCH_REQUESTED` action.
  Allows concurrent fetches of user.
*/
function* mySaga() {
  yield* takeEvery("USER_FETCH_REQUESTED", fetchUser);
}

function* mySaga2() {
  yield* takeEvery("SHOW_PAGINA", showPagina);
}

function* mySaga3() {
  yield* takeEvery("SHOW_MENU", showMenu);
}
/*
  Alternatively you may use takeLatest.

  Does not allow concurrent fetches of user. If "USER_FETCH_REQUESTED" gets
  dispatched while a fetch is already pending, that pending fetch is cancelled
  and only the latest one will be run.
*/
// function* mySaga() {
//   yield* takeLatest("USER_FETCH_REQUESTED", fetchUser);
// }

//export default mySaga;

export default function* root() {
  yield [
    fork(mySaga),
    fork(mySaga2),
    fork(mySaga3),
    // fork(watchCheckout)
  ]
}
