import React, { Component, PropTypes } from 'react';
import  { TextInput,NavigationExperimental, View,ScrollView, StyleSheet } from 'react-native'
import  { TouchableHighlight,TouchableWithoutFeedback,TouchableOpacity,Text,ListView,Dimensions,
LayoutAnimation,Platform,Alert} from 'react-native'
import KJUR from "jsrsasign";



var cats4 =
["Entradas", "Sopa", "Peixe", "Carne",
"V.Mad Branco", "V.Mad Tinto", "V.Verde Branco", "V.Verde Tinto", "Refrigerante",
"Complementos", "Acompanhamento", "Telefone", "Sobremesa", "Gelados",
"Aguardentes", "Whisky's", "Champagne", "Licores", "Cafés", ""
];

export function ordenaPorCategoria(arrP) {

  var arrSort = [];
  for (var i = 0; i < cats4.length; i++) {
    for (var t = 0; t < arrP.length; t++) {
      if (cats4[i].slice(0, 3) == "Caf" && //problema de encodimg
      cats4[i].slice(0, 3) == arrP[t].categoriaProduto.replace(/^\s+|\s+$/g, "").slice(0, 3)) {
        arrSort.push(arrP[t]);
      } else if (cats4[i] == arrP[t].categoriaProduto.replace(/^\s+|\s+$/g, "")) {
        arrSort.push(arrP[t]);
      }
    }
  }

  return arrSort;
}

// reduzLinhas
// centesimal


export  function objPosArr(vs,pr,arr){
  for(var i=0;i<arr.length;i++){
    if( arr[i].codProduto==vs   ){
      return {obj:arr[i],pos:i};
    }
  }
  return '';
}

// faz parsing de uma string com um "." a separar a parte inteira da decimal (se tiver)
//multiplica por cem ( 12.3 => 1230)
//e retorna o inteiro
// so pode ter duas casas decimais
export function centesimal(eA) {
  var e;

  if (typeof e == "number") e = eA.toFixed(6) + "";else e = eA + "";

  var a = e.split(".");
  var fa1, fa2, fa3;
  fa3 = 0;
  if (a.length >= 2) {

    if (a[0] === "" && a[1] === "") return 100;
    if (a[1] === "") return a[0] * 100;
    if (a[0] !== "") fa1 = parseInt(a[0], 10) * 100;else fa1 = 0;
    if (a[1].length == 1) fa2 = parseInt(a[1] + "0", 10);else {
      var aaa = a[1].substring(0, 2);
      fa2 = parseInt(aaa, 10);
      if (a[1].length > 2) {
        var aa3 = a[1].substring(2, a[1].length);
        fa3 = parseFloat("0." + aa3);
      }
    }
  }
  if (a.length == 1) {
    fa1 = parseInt(a[0] * 100);
    fa2 = 0;
  }
  return fa1 + fa2 + fa3;
}

//agrega todos os produtos com o mesmo codigo retirando as anulacoes e linha a zero
export function reduzLinhas(rows) {

  var aR = [];
  var numlinh = 0;
  for (var i = 0; i < rows.length; i++) {
    var sinal = 1;
    if (rows[i].anulacao !== undefined && rows[i].anulacao === true) sinal = -1;
    var ty = objPosArr(rows[i].codProduto, rows[i].preco.toFixed(2), aR);

    var rR1 = {};
    rR1.nomeProduto = rows[i].nomeProduto;
    rR1.codProduto = rows[i].codProduto;
    rR1.iva = rows[i].iva;
    rR1.categoriaProduto = rows[i].categoriaProduto;
    rR1.anulacao = rows[i].anulacao;
    rR1.empregado = rows[i].empregado;
    rR1.impressoraPedido = rows[i].impressoraPedido;
    rR1.orderReferences = rows[i].orderReferences;
    rR1.hora = rows[i].hora;
    rR1.preco = parseFloat(parseFloat(rows[i].preco).toFixed(2));
    rR1.precoCombo = parseFloat(parseFloat(rows[i].precoCombo).toFixed(2));
    rR1.combo = rows[i].combo;

    if (ty === "") {
      rR1.quantidadeLinha = centesimal(rows[i].quantidadeLinha) * sinal;
      rR1.precoLinha = parseFloat(rR1.quantidadeLinha * rR1.preco);

      aR.push(rR1);
    } else {
      var pr1 = ty.obj;
      rR1.quantidadeLinha = pr1.quantidadeLinha + centesimal(rows[i].quantidadeLinha) * sinal;
      rR1.precoLinha = rR1.quantidadeLinha * rR1.preco;

      aR[ty.pos] = rR1;
    }
  }

  return aR;
}

export function FooterTalao(doc){
   return(
    <View style={{ flex: 1,flexDirection: 'row',justifyContent:"space-between",
                    backgroundColor:'antiquewhite', bottom:0,
                    width: Dimensions.get('window').width,
                     height:70,maxHeight:80,alignSelf: 'stretch'}}>
          <View style={{ flex:1,flexDirection: 'row',flexWrap:"nowrap",marginLeft:35}}>
                <Text style={{fontWeight: 'bold',
                              fontSize: 42,marginTop:20}}>TOTAL
                </Text>
                <View style={{width: 15,}}></View>
                <Text style={{fontSize: 18,marginTop:40}}>
                                         (IVA incluido)
                </Text>
          </View>
          <View style={{ alignItems:"flex-end",}}>
                  <Text style={{fontSize: 42,fontWeight: 'bold',
                      flexWrap:"nowrap",marginTop:20,marginRight:55}}>
                    {totalLin (doc).toFixed(2)} €
                  </Text>
          </View>
    </View>
  )
}
function totalIvas(document) {
       var impT = [];
       var tf = reduzLinhas(document.linhaConta);
       var tf2 = ordenaPorCategoria(tf);
       var b1 = 0.0;
       var iva13 = 0.0;
       var iva23 = 0.0;

       tf2.map(function (a) {
         var pr1 = parseFloat(a.preco * a.quantidadeLinha / 100).toFixed(2);
         var prc = 0.0;
         if (a.preco !== undefined) {
           prc = a.preco;
         }
         if (a.combo) {
           prc = a.precoCombo;
         }
         if (a.iva !== undefined) {
           b1 = b1 + parseFloat(prc * a.quantidadeLinha / 100) / (1 + a.iva);
         }
         if (a.iva == 0.13) {
           iva13 = iva13 + parseFloat(prc * a.quantidadeLinha / 100) - parseFloat(prc * a.quantidadeLinha / 100) / (1 + a.iva);
         }
         if (a.iva == 0.23) {
           iva23 = iva23 + parseFloat(prc * a.quantidadeLinha / 100) - parseFloat(prc * a.quantidadeLinha / 100) / (1 + a.iva);
         }
       });

       var final = [parseFloat(iva23).toFixed(2), parseFloat(iva13).toFixed(2)];

       return final;
     }

export function certificado(doc){
    let ivas =totalIvas(doc)
    var ultimaHash='';
    if (doc.ultimaHashReference!==undefined) {
      ultimaHash=doc.ultimaHashReference[0]+
            doc.ultimaHashReference[10]+
            doc.ultimaHashReference[20]+
            doc.ultimaHashReference[30]
    }
    return(
      <View style={{top:100}}>
        <View  style={{flex: 1, flexDirection: 'column',
                      paddingTop:10,
                      alignItems:'center',
                      justifyContent:'center',}} >
                      <Text style={{textAlign: 'center',
                                  width: Dimensions.get('window').width
                      }}>
                        {fraseCHK(doc.ultimaOrderReference )}
                      </Text>

          <View style={{
                    borderColor: 'gray', borderWidth: 1,

                    paddingLeft:20,
                    paddingRight:20,}}>
              <View style={{flex: 1}}>
                <Text style={{paddingBottom:10, textAlign: 'center'}}>
                   IVA
                </Text>
              </View>
              <View style={{flex: 1,flexDirection: 'row',}}>
                <Text style={{textAlign: 'center'}}>
                 * 13%   ......    {ivas[1]}     + 23%   ......    {ivas[0]}    - Comb
                </Text>
              </View>

          </View>
          <Text >
            {ultimaHash}
            -Processado por programa certificado nº 2280/AT
          </Text>
          <View style={{height:150}}>

          </View>

        </View>


      </View>
    )


  }

export function imprimeTalaoEcran(document) {
    //doSign("mensagem")
    var impT = [];
    var tf  = (reduzLinhas(document.linhaConta));
    var tf2 = ordenaPorCategoria(tf);
    var b1 = 0.0;
    var iva13 = 0.0;
    var iva23 = 0.0;
    //
    var final=[];
    var l = 8 - tf2.length;
    var nl=0
    if (l > 0) {
      nl = (l * 40);
    }
     tf2.map(function (a,ind) {
       var pr1 = parseFloat(a.preco * a.quantidadeLinha / 100).toFixed(2);

       var prc = 0.0;
       if (a.preco !== undefined) {
         prc = a.preco;
       }

        if (a.combo) {
          prc = a.precoCombo;
        }
        if (a.iva !== undefined) {
          b1 = b1 + parseFloat(prc * a.quantidadeLinha) / (1 + a.iva);
        }
        if (a.iva == 0.13) {
          iva13 = iva13 + parseFloat(prc * a.quantidadeLinha) - parseFloat(prc * a.quantidadeLinha) / (1 + a.iva);
        }
        if (a.iva == 0.23) {
          iva23 = iva23 + parseFloat(prc * a.quantidadeLinha) - parseFloat(prc * a.quantidadeLinha) / (1 + a.iva);
        }
      if(a!=undefined &&  pr1>0 )
      {
        var si= (a.nomeProduto  +"                                 ").slice(0,22);
        var pi=  ("\n   "+pr1);
        var pii= pi.slice(pi.length-6,pi.length );
        var qi=(a.quantidadeLinha/100).toFixed(2)+"    ";
        var qii= qi.slice(0,6);
        var si = (a.nomeProduto + "                                 ").slice(0, 22);
        var pi = "\n   " + pr1;
        var pii = pi.slice(pi.length - 6, pi.length);
        var qi = (a.quantidadeLinha / 100).toFixed(2) + "    ";
        var qii = qi.slice(0, 6);
        var tipoIva = "*";
        if (a.iva == 0.23) tipoIva = "+";
        if (a.combo) tipoIva = "-";
        var {height, width} = Dimensions.get('window');
        let larg=width*5/10
        let larg2=width*2/10

        final.push(
                  <View style={{flexWrap: "nowrap",flex: 1,
                     flexDirection: 'row'}} key={ind}>
                     <View style={{ flex: 1,/*backgroundColor:'red',*/width:width*14/100,
                       minWidth:width*14/100}}>
                       <Text  style={{ fontSize: 20,
                           alignSelf:"flex-end",
                           paddingTop:10,
                         justifyContent:"flex-end"
                       }}>
                         {qii}</Text>
                     </View>
                     <View style={{
                       minWidth:width*1/100}}/>
                     <Text  style={{ justifyContent:"flex-start",
                        width:larg,fontSize: 31,fontWeight: 'bold'}}>{si}</Text>
                     <View style={{ alignItems:"flex-end",
                         width:larg,
                      width:larg2}}>
                        <Text  style={{fontSize: 28,fontWeight: 'bold',}}>{pii + tipoIva} </Text>
                     </View>
                    </View>)

          }
        });

        final.push(<View style={{height:nl}} key="talaoEcran"></View>);
        return (final);
     }



export function     totalLin(document)  {
        var f3 = function (a1){return a1.precoLinha;};
        var t1 = 0.0;

        if (document.linhaConta.length>0)
        t1=document.linhaConta.map(f3).reduce(function  (a,b){return (a+b);}) ;
        return t1
}

export function   fraseCHK(ultimaOrderReference ){
        if(ultimaOrderReference ){
          return "No. CHK" +(ultimaOrderReference).toString();
        }
        else {
          return "";
        }
}



//-------------------- rsa
export function zeroFill(number, width) {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return number;
}
export function pad2(number) {
  return (number < 10 ? '0' : '') + number;
}

export function doSign(mensagem) {

  var pem =  '-----BEGIN RSA PRIVATE KEY-----\n' + 'MIICWwIBAAKBgQDjoooGnBDacwbmdqfTpm+WKtdcdsgrufwRdEJd0TQOa4iAt5Nn\n' + 'tCj8I/452XEgBmqKE/3LuZETy/1cnmEAtlqxiZL9C63hg8OJ5qyw1j78C7wgoYtC\n' + 'zquXfRW4/D9zmmZxcLXtJXbn/S/LxhNP40aPZaOW+Q02j9y0qtTxf3lsoQIDAQAB\n' + 'AoGBANTSKel0D+2sjU76sH2Ypcrn0uGHzC3VfG11HHdKGDlDICP3fcD/FzJlFFJR\n' + 'kQo39XOSrT3DCHhRx1bIXDimRLLjssR/AN1slgPd2WXPQJ5UmjLqOhuOwCgEmonb\n' + 'VdC+EEzJZQZmnpbL0Wp/QlQ1nDI0Om3y8Csz9IUbT4ix/rgBAkEA/wWtkl7mLxZ2\n' + 'opHcv/HD8Ww9kilTVWm055uzH9au+TCsBBsS51MjXFeLH0kd4hOrnJiF+Qiy/jjF\n' + 'XXlU2MhgcQJBAOSB+ojDA5Bbt7MWGay4MDnlbmOoo1QbYowbZ2c5OJjqlknNW651\n' + 'mkTkdakK5CAU4Ao8SrxOl0WzVtG728Ap5zECP2+SDF39JrdzHHQDXJCdNRxqPoWz\n' + 'jsHPfVXWyIclZWef46HoNlz+Anpj0nndgzVlZa8dC3/oTmbqb251pqkxAQJAT7PS\n' +
                             'eh9jP9ft5CZCQE9iat9OuK4agfynS+1HDOcViajRUN6zKs/URlFVhOfKmDIPzyIm\n' +
                              'gzX6Z5JdJvyacpVrEQJATNk0t4CV8253Vf7Gh+lwYmeFRmLSbRO2EqZ5pj90NkyB\n' +
                              'tof3/Xxcq1o3IaZutFt5gLg6KsZ6SxOKmTA98MCNqQ==\n' +
                              '-----END RSA PRIVATE KEY-----';

  //mensagem ='2015-03-19;2015-03-19T13:27:04;FT 0011/2876;8.00;WSSvenqD7bqzwTZKDkG1DFGR+nOiH6yN9V3Dq4uHxFBsqrshBbawDBPY0QqK+efjCVgIKAmIExPdSY7PwpOcMuRbzsKx1dQoQNB0vshaNRO0sV2KDVdovXMiEoGqqckD3+01Q3rYbPCAamzWrF9OwOTZpoADCuBLHjWniat/TJQ='
  //var resultado='Kq9Z5mOdSHZUD5jmklYh7Mr6kXT8X2/A7LjxS1F0+Hw/NTDbzN7AC0wFANWnGF+L1SlUnwCK7h9ShpPWiHcNEqj3wvqtmKYzxYosmVhNuGOIVXysQtVC8sfVnYGs3EQBZeHAdOMI0FdZfvSYOOppfgaAE5L4PG0WG3Nve995xOo='
  var sig = new KJUR.Signature({alg: 'SHA1withRSA'});
  sig.init(pem);
  sig.updateString(mensagem);
  var sigVal = KJUR.hex2b64(sig.sign());

  return sigVal;
}


export function constroiMensagem(document, d2, hashAnterior) {

  var h2 = zeroFill(d2.getHours(), 2);
  var m2 = zeroFill(d2.getMinutes(), 2);
  var sc2 = zeroFill(d2.getSeconds(), 2);
  var agoraDia = "" + d2.getFullYear() + "-" + pad2(d2.getMonth() + 1) + "-" + pad2(d2.getDate()) + "";
  var ka2 = h2.toString() + ':' + m2.toString() + ':' + sc2.toString();
  var diaEnt1 = "" + document.diaSessao[0];
  var diaEnt2 = "";
  if (document.diaSessao[1] < 10) diaEnt2 = "0" + document.diaSessao[1];else diaEnt2 = "" + document.diaSessao[1];

  var diaEnt3 = "";
  if (document.diaSessao[2] < 10) {
    diaEnt3 = "0" + document.diaSessao[2];
  } else {
    diaEnt3 = "" + document.diaSessao[2];
  }
  var diaEnt = diaEnt1 + "-" + diaEnt2 + "-" + diaEnt3;

  var f3 = function f3(a1) {
    return a1.precoLinha;
  };
  var t1 = 0.0;
  if (document.linhaConta.length > 0) t1 = document.linhaConta.map(f3).reduce(function (a, b) {
    return a + b;
  });
  var mensagemAssin = agoraDia + ";" + agoraDia + "T" + ka2 + ";" + "CHK " + document.serieTalao + "/" + document.numTalao + ";" + t1.toFixed(2) + ";" + hashAnterior; // hash da fact anterior
  return mensagemAssin;
}

export function daSerieTalao(document) {
  var serT = 1;
  //se ja tiver saido um talao fica na mesma serie
  if (document.taloes !== undefined)
    {
      if(!docMesa.taloes[0].serieTalao==null)  {serT = document.taloes[0].serieTalao;
      }
      else {
        //entre 1 e 4
        serT = Math.floor(Math.random() * (5 - 1) + 1) + 8;
      }
    }
  else {
    //entre 1 e 4
    serT = Math.floor(Math.random() * (5 - 1) + 1) + 8;
  }
  return serT;
}
