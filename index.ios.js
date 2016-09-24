/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,  Alert,
  TouchableHighlight,
} from 'react-native';

import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import appReducers from "./reducers/index"
import mySaga from './sagas/sagas.js'


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
    this.state = {mesas: [] };
  }

  componentDidMount() {
    this.unsubscribe =
              store.subscribe(() =>
                    this.forceUpdate()
              );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }


  makeRequest (method, url) {
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
              Alert.alert(
                        'Erro',
                        xhr._response,
                        [
                          {text: 'OK', onPress: () => console.log('OK Pressed!')},
                        ]
                      );

        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }

  render() {
    //let serverUrl='http://pbrito.no-ip.info:2030'
    //let serverUrl='http://192.168.10.25:5984'
    //let serverUrl='http://192.168.2.1:5984'
    let usersPath = "_users/_all_docs"
    let serverUrl='http://192.168.1.104:5984'

    var f3=()=>
      this.makeRequest('GET',serverUrl+'/_users/_all_docs')
        .then(response => {
          var df=response.rows.filter(a=>{if (a.id!="_design/_auth")
                                                {return a.id}
                                              })
          console.log(df);

          this.setState({mesas:df})
        }).catch(a=>console.log("dfghjk")
      );

    var f5=(mesas)=>
          this.makeRequest('GET', serverUrl+'/s08/_design/appV/_view/mesasAbertas')
          .then( (datums)=> {
            var memp=(mesas);
            datums.rows.map(a=> {
               if ( memp.includes(a.key) ) {
                 memp[memp.indexOf(a.key)]={mesa:a.key,total:a.value.total}
               }
              return a;
            }
          );
           this.setState({mesas:memp})
          })

    var f4=(empregado) =>
            this.makeRequest('GET',serverUrl+'/_users/'+empregado)
              .then(response => {
                this.setState({mesas:response.mesas})
                return response.mesas;
              }).then(mesas=>
                f5(mesas)
              )



    var ff= ()=>
      fetch(`${serverUrl}/${usersPath}`, {
            method: 'GET',
        })
        .then((response) =>{
          return response.json() })
        .then((response) => {

                        console.log(response.rows);
                        this.setState({mesas:response.rows})
                      })
        .catch(e => console.log(e))

     var dMesas=(mesas)=> mesas.map((a)=> {
       var txt=a
       if(!(a.id==null)) txt=a.id;
       if(!(a.mesa==null)) txt=a.mesa+"  "+a.total;

       // console.log(a);
       return(<View   style={{backgroundColor:"blue",width:85}} key={txt} >
         <TouchableHighlight style={styles.wrapper}
            onPress={() =>{
              console.log(a.id);
              if(!(a.id==null)) //Possible Unhandled Promise Rejection (id: 2):
               f4(a.id)
             }
          }>
            <View style={styles.button}>

             <Text>{txt}</Text>
            </View>
          </TouchableHighlight>
       </View>)
     })

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <View style={{flex:1,backgroundColor:"cyan",flexDirection:"row",
          alignItems: "flex-start",flexWrap: 'wrap',
        width:300}}>
        {dMesas(this.state.mesas)}
      </View>
        <Text style={styles.instructions}>
          To get started, edit index.android.js
        </Text>
        <Text style={styles.instructions}>

          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
        </Text>

        <TouchableHighlight style={styles.wrapper}
           onPress={() =>{
             f3()
         }
         }>
           <View style={styles.button}>
             <Text>xmlhttp</Text>
           </View>
         </TouchableHighlight>
         <TouchableHighlight style={styles.wrapper}
            onPress={() =>{
              ff()
          }
          }>
            <View style={styles.button}>
              <Text>fetch</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight style={styles.wrapper}
             onPress={() =>{
               this.setState({mesas:[]})
           }
           }>
             <View style={styles.button}>
               <Text>clear</Text>
             </View>
           </TouchableHighlight>
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
});

AppRegistry.registerComponent('testV', () => testV);
