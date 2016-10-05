/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,ScrollView,Image,
  Text,Dimensions,BackAndroid,
  View,  Alert,TextInput,
  TouchableOpacity,
  TouchableHighlight,TouchableWithoutFeedback,
} from 'react-native';

import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import appReducers from "./reducers/index"
import mySaga from './sagas/sagas.js'
import {imprimeTalaoEcran,certificado,FooterTalao,fraseCHK,doSign,totalLin,reduzLinhas,ordenaPorCategoria} from './aux';



const sagaMiddleware = createSagaMiddleware({})//{sagaMonitor});
  //Store
const store = createStore(
    appReducers
    ,applyMiddleware(sagaMiddleware)
  );
sagaMiddleware.run(mySaga)

class testV extends Component {
  constructor(props) {
    super(props);
    this.state = {mesas: [] ,contadorConta:0,dataComeco:0};

  }

  componentDidMount() {
    this.unsubscribe =
              store.subscribe(() =>{
                    this.forceUpdate()}
              );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }




  blocoInserir() {
    if (!store.getState().inputExperiencia.inserido){
      let  stateListLastIndex=store.getState().paginaActual.length-1;
      let cnt=(store.getState().paginaActual[stateListLastIndex].contador )
      let cnt2= this.state.contadorConta;

      return (
        <View style={{ backgroundColor:"lightgray"}} >
          <Text style={{ padding:20}} >
            {cnt2}Preencha os dados da factura sff    v1.0b
          </Text>
          <View style={{ flex: 1,flexDirection: 'row',justifyContent: 'center'}}>
              <TextInput
                  style={{flex:0.8, borderColor: 'gray', borderWidth: 1,
                          backgroundColor: 'white',height :40,left:10,right:10}}
                  onChangeText={(text) => {
                          store.dispatch({
                            type:"NEW_INPUT",payload:{id:"cxNome",
                            input:text
                          }})
                        }}
                  placeholder="Insira Nome"
                  maxLength = {33}
                  value={store.getState().inputExperiencia.cxNome}
              />
              <View style={{flex:0.05}}></View>
          </View>
          <View style={{height:10}}></View>
          <View style={{ flex: 1,flexDirection: 'row',justifyContent: 'center'}}>
              <TextInput
                style={{flex:0.5, borderColor: 'gray', borderWidth: 1,
                  backgroundColor: 'white', height :40,left:10,right:30}}
                onChangeText={(text) => {/*this.setState({text}) */}}
                placeholder="Insira Num. Contribuinte"
                onChangeText={(text) => {
                  store.dispatch({
                          type:"NEW_INPUT",payload:{id:"cxNumContribuinte",input:text}
                        })
                }}
                maxLength = {13}
                value={store.getState().inputExperiencia.cxNumContribuinte}
              />
              <View style={{flex:0.1}}></View>
              <TouchableOpacity style={{flex:0.2}}
                  onPress={() =>{
                      let  stateListLastIndex=store.getState().paginaActual.length-1;
                      let doc=(store.getState().paginaActual[stateListLastIndex].documento )
                      store.dispatch({
                        type:"SHOW_PAGINA",
                        payload:{
                          pagina:"CONTA",
                          insere:true,
                          nome:store.getState().inputExperiencia.cxNome,
                          contribuinte:store.getState().inputExperiencia.cxNumContribuinte,
                          documento:doc }})
                    }}
              >
                  <View style={{flex:0.3, borderColor: 'gray', borderWidth: 2,
                        borderRadius: 5,justifyContent: 'center',
                        backgroundColor: 'lightsteelblue', height :40,}}>
                      <Text style={{fontWeight: 'bold',
                           fontSize: 19,padding:10, borderRadius:10}} >Inserir</Text>
                  </View>
              </TouchableOpacity>
              <View style={{flex:0.05}}></View>
          </View>
          <View style={{height:10}}></View>
        </View>)
    }
    else {
      return (
        <View style={{ backgroundColor:"lightgray"}} >
          <Text style={{ padding:20}} >Dados Inseridos</Text>
          <View style={{ flex: 1,flexDirection: 'row',justifyContent: 'center'}}>
            <Text
              style={{flex:0.8, borderColor: 'gray',height :40,left:10,right:10}}
            >
            Nome:{store.getState().inputExperiencia.cxNome}
            </Text>
            <View style={{flex:0.05}}/>
          </View>
          <View style={{height:10}}></View>
          <View style={{ flex: 1,flexDirection: 'row',justifyContent: 'center'}}>
            <Text
              style={{flex:0.5, borderColor: 'gray', height :40,left:10,right:30}}
            >Num.Contribuinte :{store.getState().inputExperiencia.cxNumContribuinte}
            </Text>
            <View style={{flex:0.1}}/>
            <View style={{flex:0.2}}></View>
            <View style={{flex:0.05}}/>
          </View>
          <View style={{height:10}}/>
        </View>)

    }
  }
  desenhaMesasMenu(lastP){
    let mesasEmpregado=lastP.mesas;
    let permissoesEmpregado= lastP.permissoes;

    let butA=(a,i)=>
        {
          var cor="#2EBF1B"//Green
          var total="";
          if(a.total===undefined) {
            cor="#93B5BC"
          }
          else{
            //TODO deve estar aqui a validacao das permissoes?
            //Mas trata-se de validacao?
            total=a.total;
            if(!a.aberta) cor="red"
            if(!(a.empregado==a.empregadoAtual || permissoesEmpregado )   )
            {cor="gray"}
          }
          let primeButao=()=> console.log("nada");
          if(cor=="#2EBF1B" || cor=="red" ){
                      primeButao=() =>{
                          store.dispatch({type:"SHOW_PAGINA",
                                        payload:{
                                          pagina:"CONTA",
                                          mesa:a.mesa,
                                          empregado:a.empregadoAtual,
                                          documento: a.doc,
                                        }
                                      })
                        }
          }
          return(
            <TouchableOpacity key={i}
              onPress={primeButao}
              style={[styles.bAzul,
                      {backgroundColor:cor,borderColor: 'gray',
                        borderWidth: 2,
                        borderRadius: 5}
                ]}>
                <Text style={{fontSize:27}}>{a.mesa} </Text>
                <Text style={{fontSize:19}}>{total} </Text>
            </TouchableOpacity>
          )
        }

        let f=[];
         mesasEmpregado.map(
          (a,index,i)=>{
            let las= lastP;
            // a= {mesa: 8, total: 36.55, doc: Object}
            // a= numMesa
            if(typeof(a) !== 'object'){
              f.push(butA({mesa:a},index))
            }
            else {
              var empA=las.empregadoAtual.split(":")[1]
              f.push(
                butA({
                    mesa:a.mesa,
                     total:a.total,
                      empregado:a.doc.empregado,
                      aberta:a.doc.aberta,
                      doc:a.doc,
                      permissoes:las.permissoes,
                      empregadoAtual:empA },index))
            }
        })
        return (

              <ScrollView>
                <View style={{flexWrap: "wrap", flex: 1,
                              flexDirection: 'row',}}>
                    {f}
                </View>
              </ScrollView>
        )

  }

desenhaConta(doc) {

  let  stateListLastIndex=store.getState().paginaActual.length-1;
  let cnt=(store.getState().paginaActual[stateListLastIndex].contador )
  let cnt2= this.state.contadorConta;

 if(Object.keys(doc).length === 0)
  return (
    <View>
      <Text>   SEM DOCUMENTO </Text>
       <Text>------------------------------</Text>

        <View style={{ flex: 1,flexDirection: 'row',justifyContent:"space-between",
                        backgroundColor:'antiquewhite', bottom:0,
                         height:170,maxHeight:180,alignSelf: 'stretch'}}>

        </View>





    </View>)

  let sds=imprimeTalaoEcran(doc);
  var {height, width} = Dimensions.get('window');
  let larg=width*9/10

  return (<View style={styles.container}>
        <ScrollView style={{height:300}}  >
          <Image
            style={{width:width}}
            source={require('./images/6.jpg')}/>
          <Text style={styles.welcome}>
            Consulta de Mesa {doc.mesa}
          </Text>
          <Text></Text>
          <View style={{
              flexWrap: "nowrap",width:larg ,flex: 1,
              flexDirection: 'column'}}
          >
            {sds}
          </View>
          <View style={{height:100}}></View>
          {this.blocoInserir()}
          {certificado(doc)}
          <View style={{height:100}}></View>

        </ScrollView>
        <TouchableOpacity
          onPress={()=>{
            let d0= new Date();
            var intervalo = d0 - this.state.dataComeco;
            if (intervalo > 1220)
            {
              var dataCo= new Date();
              this.setState({contadorConta:0,dataComeco:dataCo})
            }
            else {
              if ( this.state.contadorConta == 3) {
                  this.setState({contadorConta:0,dataComeco:0})
                store.dispatch({
                              type:"GOTO_HOME",payload:{}})
              }
              else
               {
                 var conta =this.state.contadorConta+1
                 this.setState({contadorConta: conta,
                                dataComeco:this.state.dataComeco})
             }
            }
            // store.dispatch({
            //               type:"GOTO_HOME",payload:{}})
            //
            }
          }

        >
            {FooterTalao(doc)}
        </TouchableOpacity>
      </View>)
}




//-----------


  render() {

    var butao=(txt,id,fn)=> {
      let pagina=(store.getState().paginaActual[stateListLastIndex].pagina )
      let lar=85;
      if (pagina=="EMPREGADOS") {
        lar=300;
      }
      return(
             <TouchableHighlight style={{height:91,backgroundColor:"coral",
               borderWidth:2,flexWrap: 'wrap',
                         width:80}}
                         key={txt}
               onPress={() =>{
                 store.dispatch(fn)
                }
             }>

                <Text>{txt}</Text>

             </TouchableHighlight>
        )
      }

      var butaoEmpregado=(txt,id,fn)=> {
        let pagina=(store.getState().paginaActual[stateListLastIndex].pagina )
        let lar=30
          return(
               <TouchableHighlight


                        style={{
                                      height:Dimensions.get('window').height*0.1,
                                       backgroundColor:"cyan",alignItems:"center",
                                       borderWidth: 2,justifyContent:"center",
                                       width:Dimensions.get('window').width*0.8
                                     }}
                         key={id}
                         onPress={() =>{
                           store.dispatch(fn)
                          }
               }>
                  <Text style={{fontSize:28}}>{txt}</Text>
               </TouchableHighlight>
          )
        }


    let  stateListLastIndex=store.getState().paginaActual.length-1;
    let pagina=(store.getState().paginaActual[stateListLastIndex].pagina )
    let paginaLength=(store.getState().paginaActual.length )
    let lastP= store.getState().paginaActual[stateListLastIndex];




    var conteudoEmpregados=()=>
        {
          if (pagina=="EMPREGADOS") {
              return store.getState().paginaActual[stateListLastIndex].listaEmpregados.map(
                (a)=> {
                   var txt=a.id.split(":")[1];
                   var emp=a.id ;
                   return(
                     butaoEmpregado(txt,a.id,
                             {type:"SHOW_PAGINA",
                                           payload:{
                                             pagina:"MESAS",
                                             empregado:emp,
                                           }
                                         }
                      )
                    )
              })
          }

      }

      if (pagina=="CONTA"){
        var pag=store.getState().paginaActual[stateListLastIndex];
        return this.desenhaConta(pag.documento)
      }
      else
      if (pagina=="EMPREGADOS") {
        let wi=   Dimensions.get('window').width
        return(
          <View style={[styles.container]}>
            <Text style={styles.welcome}>
                {pagina}  {emp}  {paginaLength}
            </Text>
            <View style={{flex:1,height:100,
              backgroundColor:"white",flexDirection:"column",
              width:Dimensions.get('window').width*0.8,justifyContent:"space-around"
            }}>
              {conteudoEmpregados()}

            </View>
            <View style={{flex:0.1,flexDirection:"row"}}>
                 {butao("xmlhttp","xmlhttp",
                                  {type:"SHOW_PAGINA",
                                                   payload:{
                                                     pagina:"EMPREGADOS",
                                                   }
                                                 }
                        )}

                 {butao("log","log",
                                  {type:"SHOW_PAGINA",
                                                   payload:{
                                                     pagina:"LOG",
                                                   }
                                                 }
                        )}
                  <Text>v1.0b</Text>
            </View>
        </View>
        )

      }
      if(pagina=="MESAS") {
        emp=(store.getState().paginaActual[stateListLastIndex].empregadoAtual).split(":")[1]
        let widD= Dimensions.get('window').width;
        return (<View style={styles.container}>
          <Text style={styles.welcome}>
              {pagina}  {emp}  {paginaLength}
          </Text>
          <View style={{flex:1,backgroundColor:"cyan",flexDirection:"row",
            alignItems: "stretch",flexWrap: 'wrap',
          width:widD}}>

               {this.desenhaMesasMenu(lastP)}
          </View>
          <View style={{flex:0.1,flexDirection:"row"}}>
               {butao("xmlhttp","xmlhttp",
                                {type:"SHOW_PAGINA",
                                                 payload:{
                                                   pagina:"EMPREGADOS",
                                                 }
                                               }
                      )}
          </View>
        </View>)
      }
      if (pagina=="LOG") {
        var emp=""
        let logs=store.getState().logActions.map((a,i)=>
          <Text style={{flex:1,}} key={i}>{i}{a}</Text>
        )
        return (
          <View style={styles.container}>
            <Text style={styles.welcome}>
                {pagina}  {emp}  {paginaLength}
            </Text>
              <View style={{flex:1,backgroundColor:"cyan",flexDirection:"column",
                                    alignItems: "stretch",flexWrap: 'wrap',
                                    width:300
                            }}>
                            {logs}

                </View>
            <View style={{flex:0.1,flexDirection:"row"}}>
                 {butao("xmlhttp","xmlhttp",
                                  {type:"SHOW_PAGINA",
                                                   payload:{
                                                     pagina:"EMPREGADOS",
                                                   }

                                                 }
                        )}


            </View>
            <View style={{flex:0.1,flexDirection:"row"}}>

              <TouchableHighlight style={{height:91,backgroundColor:"green",
                borderWidth:2,flexWrap: 'wrap',
                          width:80}}
                          key="rfei"
                onPress={() =>{
                  BackAndroid.exitApp();
                 }
              }>

                 <Text>exit</Text>

              </TouchableHighlight>



            </View>
          </View>
        );

      }
        var emp=""
        return (
          <View style={styles.container}>
            <Text style={styles.welcome}>
                {pagina}  {emp}  {paginaLength}
            </Text>
              <View style={{flex:1,backgroundColor:"cyan",flexDirection:"row",
                                    alignItems: "stretch",flexWrap: 'wrap',
                            width:600}}>
                          <View style={{flex:1,alignItems: "center"}}>
                            <Text>Sem PAGINA para mostrar</Text>
                          </View>

                </View>
            <View style={{flex:0.1,flexDirection:"row"}}>
                 {butao("xmlhttp","xmlhttp",
                                  {type:"SHOW_PAGINA",
                                                   payload:{
                                                     pagina:"EMPREGADOS",
                                                   }

                                                 }
                        )}
                {butao("log","log",
                                 {type:"SHOW_PAGINA",
                                                  payload:{
                                                    pagina:"LOG",
                                                  }
                                                }
                       )}
                 {/*butao("fetch","fetch",ff)*/}

            </View>
          </View>
        );

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
nome: {
  fontSize: 30,
  fontWeight: "bold",
  textAlign: 'center',
  margin: 10,
},
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  wrapper: {
  borderRadius: 5,
  marginBottom: 5,
},
button: {
  backgroundColor: '#eeeeee',
  padding: 10,
},
bAzul:{
  width: 110,
  margin:5,
  height: 100,
  backgroundColor: 'powderblue',
  justifyContent: 'center',
  alignItems: 'center',
},
});

AppRegistry.registerComponent('testV', () => testV);
