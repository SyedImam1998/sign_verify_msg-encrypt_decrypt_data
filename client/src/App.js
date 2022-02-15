import React,{useState,useEffect} from 'react';
import Web3 from 'web3';
import {
  encrypt
} from '@metamask/eth-sig-util';





const App=()=>{
  var ciphertext;

const [account,setAccount]=useState("");
const[msg,setMsg]=useState("");
const[name,setName]=useState("");
const[sign,setSign]=useState("");
// const[encryptedMessage,setEncryptedMessage]=useState("")

const loadFunction=async()=>{
  if(typeof window.ethereum!=='undefined'){
    const web3= new Web3(window.ethereum);
    window.ethereum.enable().catch(error=>{
      console.log(error);
      alert("please login with MetaMask");
    })
    const netId= await web3.eth.net.getId();
    const accounts= await web3.eth.getAccounts();
    // const accountBalance= await web3.eth.getBalance(accounts[0]);
    // const etherAmount= web3.utils.fromWei(accountBalance,'ether');
    setAccount(accounts[0]);
  }else{
    alert("MetaMask Not Found!!!")
  }
}
useEffect(()=>{
loadFunction();
},[])


useEffect(()=>{
  if(window.ethereum) {
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    })
    window.ethereum.on('accountsChanged', () => {
      window.location.reload();
    })}
},);

const signFun=async()=>{
  var msg=document.getElementById("msg").value;
  const web3= new Web3(window.ethereum);
  var hash= web3.utils.sha3(msg);
  var signature= await web3.eth.personal.sign(hash, account)
  console.log("signature generated:",signature);
  setSign(signature);
}

const seeSender=async()=>{
  const web3= new Web3(window.ethereum);
  var msg= document.getElementById("rMsg").value;
  var hash = web3.utils.sha3(msg)
  var signR =sign;
  var sender=await web3.eth.personal.ecRecover(hash,signR);
  // var sender=await web3.eth.accounts.recover(signR);;
  
  console.log("sender",sender);
}

const secretMessage=async()=>{
  const web3= new Web3(window.ethereum);
  var msg=document.getElementById("SecretMessage").value;
  var rAccount=document.getElementById("account").value;

  
  var hash= web3.utils.sha3(msg);
  var signature= await web3.eth.sign(hash,rAccount);
  console.log("scret msg:",signature);

}

const encryptionFun=async()=>{
  const web3= new Web3(window.ethereum);
  let encryptionPublicKey;
const aa=await window.ethereum.request({
  method:'eth_getEncryptionPublicKey',
  params:[account],
}).then((result)=>{
  encryptionPublicKey=result
}).catch((error) => {
  if (error.code === 4001) {
    // EIP-1193 userRejectedRequest error
    console.log("We can't encrypt anything without the key.");
  } else {
    console.error(error);
  }
});

console.log("public key",encryptionPublicKey)
//  ciphertext = CryptoJS.AES.encrypt('hello world', encryptionPublicKey ).toString();
var text = stringifiableToHex(encrypt({
  publicKey: encryptionPublicKey,
  data: 'hello world!',
  version: 'x25519-xsalsa20-poly1305',
}))
ciphertext=text;
console.log("encrypted text:",text);

}

const stringifiableToHex=(value)=>{
  const web3= new Web3(window.ethereum);

  return web3.utils.toHex(Buffer.from(JSON.stringify(value)),'utf8');
}

const decrypt=async()=>{/////////////
  var text= document.getElementById("metatext").value;
  await window.ethereum
  .request({
    method: 'eth_decrypt',
    params: [text,account],
  })
  .then((decryptedMessage) =>
    console.log('The decrypted message is:', decryptedMessage)
  )
  .catch((error) => console.log(error.message));
}
  return(
    <div>
      Hello world!!{account}
      <br></br>
      Message: <input type="text" id="msg"></input><br></br>
      <button onClick={signFun}>Sign Message</button>
      <br>
      </br>
      <input type="text" id="rMsg" placeholder='Recived Message'></input>

      <br></br>
      <input type="text" id="rSign" placeholder='Recived Sign'></input>
    <br></br>
      <button onClick={seeSender}>Show Sender</button>

      <h3>Checking..........</h3>
      <br></br>
      <input type="text" id="SecretMessage" placeholder='SecretMessage'></input>
      <br></br>
      <input type="text" id="account" placeholder='account name'></input>
      <br></br>
      <button onClick={secretMessage}>Send SecretMessage</button>

      <h2>Checking encryption and decryption with metamask</h2>
      <br></br>
      <input type="text" placeholder='encrypted text' id="metatext"></input>
      <button onClick={encryptionFun}>Encrypt</button><button onClick={decrypt}>decrypt</button>
      
    </div>
  )
}
export default App;