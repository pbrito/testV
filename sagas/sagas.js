import { takeEvery, takeLatest } from 'redux-saga'
import { call, put ,fork} from 'redux-saga/effects'
import { Map ,List,fromJS} from "immutable";
import {doSign,constroiMensagem,daSerieTalao,pad2,zeroFill} from "../aux";
import Alert  from 'react-native';
// let serverUrl='http://192.168.2.1:5984';
 // let serverUrl='http://192.168.1.218:5984'
 let db= 's08ou'

let serverUrl='http://192.168.1.104:5984';
//let serverUrl='http://192.168.10.25:5984'

//let serverUrl='http://192.168.1.218:5984';

//let serverUrl='http://pbrito.no-ip.info:2030'


export function  makeRequest (method, url) {

  var FETCH_TIMEOUT = 1200;
  return   new Promise(function(resolve, reject) {
      let timeSim=false;
      var timeout = setTimeout(function() {
          reject(new Error('Request timed out'));
      }, FETCH_TIMEOUT);
      fetch(url, {  method: method,})
      .then(function(response) {
          clearTimeout(timeout);
          if(timeSim) return;
          if (response && response.status == 200) {
            resolve(response.json());
          }
          else reject(new Error('Response error'));
      })
      .catch(function(err) {
          reject(err);
      });
  })



return new Promise(function (resolve, reject) {
  console.log(url);
  console.log(method);

   fetch(url, {
           method: method,
       }).then(resp=>
         {
           console.log("####EEE#");
           setTimeout(() => null, 0);
           return resp.json()
         }
       ).then(
         json=> {console.log("ZZZZZ");resolve(json)}
       ).catch(
         er=> {
           console.log("PPPPPPPP");
           reject(er);}
       )

     })
return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    console.log("dfghjk111");

    xhr.open(method, url);
    xhr.onload = function () {
        console.log("onload______d_");
     if (this.status >= 200 && this.status < 300) {
       console.log("xhr.response------------------");
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
      console.log("dfghjkqwerty22222");
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
    // return new Promise(function (resolve, reject) {
    //   var xhr = new XMLHttpRequest();
    //   xhr.open(method, url,true);
    //   xhr.onload = function () {
    //     console.log("onload_______");
    //    if (this.status >= 200 && this.status < 300) {
    //      console.log("xhr.response");
    //      console.log(xhr.response);
    //      resolve(JSON.parse(xhr.response));
    //     } else {
    //       reject({
    //         status: this.status,
    //         statusText: "xhr.statusText .... meu"
    //       });
    //     }
    //   };
    //   xhr.onerror = function () {
    //     console.log(xhr);
    //           // Alert.alert(
    //           //           'Erro',
    //           //           xhr._response,
    //           //           [
    //           //             {text: 'OK', onPress: () => console.log('OK Pressed!')},
    //           //           ]
    //           //         );
    //     reject({
    //       message: "xhr._response",
    //       statusText: xhr
    //     });
    //   };
    //
    //   xhr.timeout = 930; // time in milliseconds
    //
    //   xhr.ontimeout = function (e) {
    //     console.log("trime out");
    //     console.log(e);
    //     reject({
    //       status: e,
    //       statusText: e
    //     });
    //   };
    //
    //   xhr.send();
    // });
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


// export function fetchMesasEmpregado(userId) {
//
//   return  makeRequest('GET', serverUrl+'/_users/'+userId)
//   .then(function (datums) {
//     return({mesas:datums.mesas ,
//           permissoes: datums.permissoes });
//   })
//   .catch(function (err) {
//      throw Error("errrrr fetchMesasEmpregado");
//   console.error('Augh, there was an error!', err.statusText);
//   });
//
//           //  return fetch('http://192.168.1.104:5984/_users/'+userId)
//           //     .then((response) => {
//           //       setTimeout(() => null, 0);
//           //       // console.log(response)
//           //       if (!response.ok) {
//           //            throw Error(response.statusText);
//           //        }
//           //       return response.json()
//           //     }
//           //     )
//           //     .then((responseJson) => {
//           //       return {mesas:responseJson.mesas ,
//           //               permissoes: responseJson.permissoes }
//           //     })
//           //     .catch((error) => {
//           //        throw Error(error);
//           //     });
// }

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
// function* fetchUser(action) {
//   let mapMesasAbertas = new Map();
//   try {
//       // const user ={mesas: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
//       //                                               permissoes:false}
//       // const user = yield call(fetchMesasEmpregado, action.payload.empregado);
//       // yield put({type: "USER_FETCH_SUCCEEDED", user:{mesas: user.mesas,
//       //                                               permissoes:user.permissoes}});
//
//       if(!action.payload.permissoes ||  action.payload.modal ){
//             const mesas = yield call(fetchMesasAbertas, action.payload.empregado);
//             mesas.forEach(function(a){
//               mapMesasAbertas=mapMesasAbertas.set(a.key,a.value)
//             })
//             yield put({type: "MESAS_FETCH_SUCCEEDED", mesas: mesas});
//             yield put({type:  "GOTO_PAGINA", pagina:{pagina:"MESAS",
//                                                      empregado:action.payload.empregado,
//                                                      mesasAbertas:mapMesasAbertas,
//                                                      permissoes:true}});
//       }
//       else {
//           yield put({type:"GOTO_HOME",payload:{ modal:true,
//                                                 empregado:action.payload.empregado,}});
//       }
//
//    } catch (e) {
//       yield put({type: "USER_FETCH_FAILED", message: e.toString()});
//    }
// }




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
                  makeRequest('GET', serverUrl+'/'+db+'/_design/myViews/_view/exp2?startkey=[' +
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
                    console.log("numnum");
                    console.log(docMesa.numTalao);
                    docMesa.numTalao=numTalao+1;
                    docMesa.serieTalao = serieTalao;
                    console.log(docMesa.numTalao);

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
  console.log("##saveM#");
console.log(docMesa.linhaConta);
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
console.log("cria Talao e insere na BD");
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
  console.log(document);
  return saveDoc(document);//promessa

}



function* fazGravacao(action) {

  console.log("Vai gravar");
  console.log(action);
  // if(action.payload.insere)
  // {
  //     let docMesa=action.payload.document;
  //     docMesa.nomeCliente=action.payload.nome;
  //     docMesa.numContribuinte=action.payload.contribuinte
  //     const inserido= yield call(saveDoc,docMesa);
  //     yield put({type:"INSERE_NUM_CONT"})
  // }
  // else
  if (action.payload.document!= undefined)
  {
    try {
        let docMesa=action.payload.document;
        const docHashAnt = yield call(saveDDD,
            JSON.parse(JSON.stringify(docMesa)) );

        //TODO por aqui if aberta chama saveDDD
        //TODO mudar o nome saveDDD porque nao faz nenhum save o que faz é
        //            constroi documento a gravar com numT e serie

        if(docHashAnt!=null){

            console.log(("lixx"+docHashAnt.doc.numTalao+"-"+docHashAnt.doc.serieTalao) );
              // if(!(docHashAnt.doc.hash==null))
              //           docHashAnt.doc.hash.slice(0,5)
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
        let numContribuinte="";
        let nomeCliente="";
        if(docMesa.numContribuinte!==null)
            numContribuinte = docMesa.numContribuinte
        if(docMesa.nomeCliente!==null)
            nomeCliente = docMesa.nomeCliente

        // yield put({type:"CLEAR_INPUT",payload:{
        //                         numContribuinte: numContribuinte ,
        //                         nomeCliente: nomeCliente } })
            // ?????? É preciso?Já esta na pagina....
        // yield put({type:  "GOTO_PAGINA", pagina:{pagina:"CONTA",
        //                                         contador:0,
        //                                          empregadoAtual:action.payload.empregadoAtual,
        //                                          document:action.payload.document,
        //                                          }});
   } catch (e) {
     console.log("error fazGrava "+e.message);
     console.log(e);
      //yield put({type: "GOTO_PAGINA_FAILED", message: e.message});
   }}
}



function all_users(){
  console.log("All_users makeRequest");
  return makeRequest('GET',serverUrl+'/_users/_all_docs')
}

function* fetchEmpregados(action) {
  console.log("gigi");
  yield put({type: "ADD_LOG", log: "vai fazer fetch dos empregados" });

    try {

        const lista = yield call(all_users, action);
        yield put({type: "ADD_LOG", log: "ja fez fetch dos empregados" });

        var filt=(lista.rows.filter(a=>{if (a.id!="_design/_auth") {return a.id}}  ));

        yield put({type:"ADD_EMPREGADOS",lista:filt })
     }
     catch (e) {
         console.log("eeeee1");
         console.log(e);
         yield put({type: "ADD_LOG", log: "erro pedido f empregados"+e.toString()  });
         yield put({type: "GOTO_PAGINA_FAILED", message: e});
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
           if ( memp.includes(a.key) ) {
             memp[memp.indexOf(a.key)]=
                  {mesa:a.key,total:a.value.total,doc:a.value}
           }
          return a;
        });
      resolve(memp)

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
         console.log(e);
         yield put({type: "GOTO_PAGINA_FAILED", message: e.toString()});
     }
}

function* showPagina(action) {
  console.log(action);
  if(action.payload.pagina=="MESAS"){

    const resul = yield call(fetchEmpregadoDoc, action.payload.empregado);
    console.log("r1");
    console.log(resul);
    const resul2 = yield call(fetchMesasAbertasIntersect, resul.mesas );
    console.log("r2");
    console.log(resul2);

    yield put({type:  "GOTO_PAGINA", pagina:{pagina:"MESAS",
                                             contador:0,
                                             mesas:resul2,
                                             empregadoAtual:action.payload.empregado,
                                             permissoes:resul.permissoes,
                                             document:{},
                                           }});
  }
  if (action.payload.pagina=="EMPREGADOS") {
    console.log("-----");
    try {
        console.log("222");
        yield put({type: "ADD_LOG", log: "faz pedido empregados" });
        const lista = yield call(all_users, action);
        yield put({type: "ADD_LOG", log: "retorna empregados" });

        console.log(lista);
        var filt=(lista.rows.filter(a=>{if (a.id!="_design/_auth") {return a.id}}  ));
        console.log(filt);
        yield put({type:  "GOTO_PAGINA", pagina:{pagina:"EMPREGADOS",
                                                contador:0,
                                                listaEmpregados:filt,
                                               }});
     }
     catch (e) {
         console.log("erro w672");
         console.log(e);
         yield put({type: "ADD_LOG", log: "erro pedido empregados"+e.toString()  });
         yield put({type: "GOTO_PAGINA_FAILED", message: e.toString() });
     }
   }
   if (action.payload.pagina=="CONTA") {
     try {
       console.log("CONTA");
       console.log(action.payload);
       if(Object.keys(action.payload.documento).length !== 0)
        {
          yield put({type: "ADD_LOG", log: "GOTO CONTA" });
          yield put({type:  "GOTO_PAGINA",
                    pagina:{pagina:"CONTA",
                            empregado:action.payload.empregado,
                            mesa:action.payload.mesa,
                            documento:action.payload.documento,
                            contador:0,
                          }});

          if(action.payload.documento.aberta)
          yield put({type:"GRAVA_CONTA",
                      payload:{ document:action.payload.documento,
                                empregado:action.payload.empregado,
                                                    numContribuinte: "" ,
                                                    nomeCliente: "" } })
          //save Documento
        }
      }
      catch (e) {
          console.log("eeeee3");
          console.log(e);
          yield put({type: "ADD_LOG", log:"GOTO CONTA "+ e.toString() });
          yield put({type: "GOTO_PAGINA_FAILED", message: e.toString()});
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
           console.log("eeeee3");
           console.log(e);
           yield put({type: "ADD_LOG", log:"GOTO LOG "+ e.toString() });
           yield put({type: "GOTO_PAGINA_FAILED", message: e.toString()});
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

function* mySaga3() {
  yield* takeEvery("FETCH_EMPREGADOS", fetchEmpregados);
}


export default function* root() {
  yield [
    fork(mySaga),
    fork(mySaga2),
    //fork(mySaga3),
    // fork(watchCheckout)
  ]
}
