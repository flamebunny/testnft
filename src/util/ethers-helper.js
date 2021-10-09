/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-undef
import { ethers } from 'ethers'
import { SetSigner, SetProvider, SetKaijuContract, SetRWasteContract, SetWalletConnection, SetUserInfo } from '../redux/actions/ethers-actions/ethers-actions';
import { RWASTE_ADDRESS, RWASTE_ABI, KAIJU_ADDRESS, KAIJU_ABI, MINT_PRICE } from './constants';
import store from '../redux/store';

export async function getProviderAndSigner() {
  const xprovider = await new ethers.providers.Web3Provider(window.ethereum);   //get provider from mm
  const xsigner = await xprovider.getSigner();                                  // get signer from provider
  store.dispatch(SetSigner(xsigner));                                           // set Signer in store
  store.dispatch(SetProvider(xprovider));                                       // set Provider in store
}

export async function connectSignerToContract() {
  const signer = store.getState().signer;                                       // get signer from store - we need signer to connect to contract next line
  const kaijuContract = await new ethers.Contract(KAIJU_ADDRESS, KAIJU_ABI, signer); // this contract instance can write, because signer is an abstraction of account wallet id
  const rwasteContract = await new ethers.Contract(RWASTE_ADDRESS, RWASTE_ABI, signer); 
  store.dispatch(SetKaijuContract(kaijuContract));                            // dispatch that contract connection to store
  store.dispatch(SetRWasteContract(rwasteContract));                            // dispatch that contract connection to store
}

export async function requestAccounts() {
  window.ethereum.request({ method: 'eth_requestAccounts' })                // requests accounts from user
    .then(accounts => {                                                     //response from that is handled in this .then().catch(err=>)
      handleAccountsChanged(accounts)                                       //on account connection success run handleAccountsChanged with response as param
    })        
    .catch((err) => {                                                       // if connecting is not successfull, .catach will catch the error
      if (err.code === 4001) {                                              //this code means that user rejected connection - throw error
        alert("User rejected the request.");                                // this is throwing alert for the error
        localStorage.setItem('autoConnect', false)                          // setting the autoConnect to false since they dont want to be connected
      } else {
        alert(err);                                                         // throw unexpected edge cases into an alert with error on the alert
      }
    });

  window.ethereum.on("accountsChanged", accounts => handleAccountsChanged(accounts))  // listen for this event and if event happens, throw the response into handleAccountsChanged
}

const handleAccountsChanged = async (accounts) => {
  if (accounts.length === 0) {                      //accounts is the response, if response.length is 0, user disconnected
    localStorage.setItem('autoConnect', false)      //set autoconnect to false
    store.dispatch(SetWalletConnection(false));     // dispatch connection to false - to update navbar
    alert("Please connect to MetaMask");
  } else {
    localStorage.setItem('autoConnect', true)
    store.dispatch(SetWalletConnection(true));      // dispatch connection to true - to update navbar
    await getProviderAndSigner();
    await connectSignerToContract();
    await getUserInfo();
  }
};

export async function getUserInfo() {
  const signer = await store.getState().signer;
  const kaijuContract = await store.getState().kaijuContract;
  const walletAddress = await signer.getAddress();
  try {
    const userTokens = await kaijuContract.walletOfOwner(walletAddress);
    store.dispatch(SetUserInfo(walletAddress, userTokens));
  } catch (err) {
    console.error(err)
  }
}

//minting function moved into mintpage

export async function getTotalSupply() {
  const kaijuContract = store.getState().kaijuContract;
  const x = await kaijuContract.totalSupply();
  return x;
}

export async function breed(sire, matron) {
  //IMPORTANT check that the breeder owns the tokens being bred
  //ALSO check that sire and matron not the same (done)
  const kaijuContract = store.getState().kaijuContract;
  const usersTokens = await store.getState().usersTokens;
  if (usersTokens.includes(sire) && usersTokens.includes(matron) && sire !== matron) {
    console.log('Authorized to fuck');
    const breedResponse = await kaijuContract.breed(sire, matron);
    console.log(breedResponse)
  } else {
    throw 'Not Authorized to fuck!'
  }
}

export async function fuseKaijus(sire, matron){
  const kaijuContract = await store.getState().kaijuContract;
  const userInfo = await store.getState().userInfo;
  let userOwnsSire = false;
  let userOwnsMatron = false;
  for(let token of userInfo.userTokens){
    if(userOwnsSire && userOwnsMatron){
      break // if both are already checked as owned, break out
    } else if(parseInt(token._hex, 16) === sire){
      userOwnsSire = true;
    } else if(parseInt(token._hex, 16) === matron){
      userOwnsMatron = true;
    }
  }
  if(kaijuContract && userOwnsSire && userOwnsMatron){
    try{
      let tx = await kaijuContract.fusion(sire,matron)
      console.log(tx)
      return tx
    } catch (err) {
      console.error(err)
      return err
    }
  }
}

export function owner(index) {
  const kaijuContract = store.getState().kaijuContract;
  const owner = kaijuContract.ownerOf(index);
  return owner;
}

export async function getTotalRWaste() {
  try {
    const xprovider = await new ethers.providers.Web3Provider(window.ethereum);
    const kaijuContract = await new ethers.Contract(RWASTE_ADDRESS, RWASTE_ABI, xprovider);
    const totalRWaste = await kaijuContract.totalSupply();
    return totalRWaste;
  } catch (err) {
    console.error(err)
  }
}

// export async function unPause() {
//   const contract = store.getState().contract;
//   try {
//     const x = await contract.pause(false)
//     console.log(`unpaused sale`, x)
//   } catch (err) {
//     console.log("Error: ", err)
//   }
// }

// export async function retBal(signer) {
//   //this can get the balance if signer exists
//   let bal = await signer.getBalance();
//   console.log('balance of acc: ', ethers.utils.formatEther(bal));
// }

// export async function logSigner() {
//   //there is a bug where user has to click this button twice to actually get a hold of signer
//   console.log('signer from redux: ', store.getState().signer);
// }
