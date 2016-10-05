import { combineReducers } from 'redux';
//import  navigationState from "./navigation";
import { Map ,List,fromJS} from "immutable";


const empregadosLista = (state = [], action) => {  // default state is empty List()}
  switch (action.type) {
  case  "GOTO_PAGINA_FAILED":
    return ([{id:"erro",key:"erro"}]);
    break;
  case "ADD_EMPREGADOS":
    return (action.lista);
    break;
  case "USER_FETCH_SUCCEEDED":
    return state;
    break;
  case "REM_EMPREGADOS":
    return [];
    break;
  case "USER_FETCH_FAILED":
    return state;
    break;
  case "MESAS_FETCH_SUCCEEDED":
    return state;
    break;
  default:
    return state;

}}


const logActions = (state = [], action) => {  // default state is empty List()}
  switch (action.type) {
  case  "ADD_LOG":
    state.push(action.log)
    if(state.length>50)
    return state.slice(state.length-5,state.length)
    else {
    return state;
    }
    break;
  default:
    return state;

}}

const paginaActual = (state =  ([{pagina:"HOME"}]), action) => {
    switch (action.type) {
        case "GOTO_PAGINA":
          if(action.pagina.pagina=="EMPREGADOS" && state.length>2)
          {
            return state.slice(0,2);
          }
          else {
            state.push( (action.pagina))
            return state;
          }
          break;
        case "GOTO_PAGINA_FAILED":
            return [{pagina:action.message}];
            break;
        case "GOTO_PRIMEIRO":
            return state.slice(0,1).push( (action.pagina));
            break;
        case "GOTO_HOME":

          // return fromJS([{pagina:"HOME"}]);

          let  stateListLastIndex=state.length-1;
          if(state[stateListLastIndex].pagina=="HOME" && action.payload.modal)
          {
              state[stateListLastIndex]= {
                ...(state[stateListLastIndex]),
                modal:true,
                empregado: action.payload.empregado
              }
              return state;
              break;

          }

        //  if(state[stateListLastIndex].pagina=="CONTA")
        //     {
        //      if( state[stateListLastIndex].dataComeco==null) {
        //        let d0= new Date();
        //        state[stateListLastIndex]= {
        //          ...(state[stateListLastIndex]),
        //          contador:1,
        //          dataComeco:d0
        //        }
         //
        //          return state;
        //          break;
        //      }
        //      else
        //      {
        //        let d0= new Date();
        //        var intervalo = d0 - state[stateListLastIndex].dataComeco;
        //         if (intervalo > 1220)
        //         {
        //           state[stateListLastIndex].contador = 0;
        //           state[stateListLastIndex].dataComeco= new Date();
        //           return state;
        //         }
         //
         //
        //         else {
        //            if ( state[stateListLastIndex].contador  == 2) {
        //                 return state.slice(0,2);
        //                break;
        //            }
        //            else
        //             {
        //               state[stateListLastIndex].contador=state[stateListLastIndex].contador+1
        //               return   state;
        //               break;
        //           }
        //         }
        //    }
        //  }
          //  else {
              return ([{pagina:"HOME"}]);
          //  }
           break;
        default:
          return state;
}}

const inputExperiencia = (state =  {cxNome:"",cxNumContribuinte:"",inserido:false}, action) => {

    switch (action.type) {
        case "NEW_INPUT":
          if(action.payload.id=="limpa"){
            let numCont="";
            let nmCl=""

            if (!(action.payload.cxNome==null))
              nmCl=action.payload.cxNome;
            if (!(action.payload.cxNumContribuinte==null))
              numCont=action.payload.cxNumContribuinte;

              return {cxNome:nmCl ,
                cxNumContribuinte:numCont,
                inserido:false
                };
              }
          if(action.payload.id=="cxNome"){
                return {cxNome:action.payload.input ,
                  cxNumContribuinte:state.cxNumContribuinte,
                  inserido:state.inserido
                  };
                }
          if(action.payload.id=="cxNumContribuinte"){
                return {cxNome:state.cxNome ,
                        cxNumContribuinte:action.payload.input,
                        inserido:state.inserido} ;
          }

          break;
        case "INSERE_NUM_CONT":
            return {cxNome:state.cxNome ,
              cxNumContribuinte:state.cxNumContribuinte,
              inserido:true};
            break;
        case "CLEAR_INPUT":
          return {cxNome : action.payload.nomeCliente,
                  cxNumContribuinte : action.payload.numContribuinte,
                  inserido : false};
          break;
        default:
          return state;

}}



const appReducers = combineReducers({
  paginaActual,
  inputExperiencia,
  logActions,
  //navigationState,
  //empregadosLista
})

export default appReducers
