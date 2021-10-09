/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { MINT_PRICE } from '../../util/constants';
import mintButtonRegular from '../../assets/MintPresale-Regular.png';
import hovered from '../../assets/MintPresale-Hover.png';
import clicked from '../../assets/MintPresale-Clicked.png';
import chatbox from '../../assets/TextBoxAnimation.gif';

import { useSelector } from 'react-redux'
import { ethers } from 'ethers'

const mintValidator = (event, setVal) => {
  if (event.target.value > 10) {
      setVal(10)
  } else if (event.target.value < 0) {
      setVal(1)
  } else {
      setVal(event.target.value)
  }
}

const presalemintValidator = (event, setVal, allowedPresale) => {
  if (event.target.value > allowedPresale) {
      setVal(allowedPresale)
  } else if (event.target.value < 0) {
      setVal(1)
  } else {
      setVal(event.target.value)
  }
}

function useOnScreen(options) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
          setVisible(entry.isIntersecting);
      }, options)

      if (ref.current) {
          observer.observe(ref.current);
      }

      return () => {
          if (ref.current) {
              observer.unobserve(ref.current);
          }
      }
  }, [ref, options])

  return [ref, visible];
}

let showMintContainer = false;

const MintPage = () => {
  function handleMouseHover() {
    setMintButtonSrcImg(hovered)
  }
  function handleMouseUnhover() {
    setMintButtonSrcImg(mintButtonRegular)
  }
  function handleClick() {
    setMintButtonSrcImg(clicked)
    setTimeout(() => {
      setMintButtonSrcImg(mintButtonRegular)
    }, 100);
  }

  const kaijuContract = useSelector(state => state.kaijuContract)
  const userInfo = useSelector(state => state.userInfo)
  const signer = useSelector(state => state.signer)
  const [ref, visible] = useOnScreen({ rootMargin: "0px" })
  const [val, setVal] = useState(1);

  const [allowedPresale, setAllowedPresale] = useState(undefined);

  useEffect(async () => {
    console.log('ran')
    if (!!kaijuContract && !!signer) {
      let address = await signer.getAddress()
      let allowedPresale = await kaijuContract.presaleWhitelist(address)
      setAllowedPresale(parseInt(allowedPresale._hex, 16))
    }
  }, [kaijuContract, signer])


  const updatedPrice = val * MINT_PRICE;
  const [mintButtonSrcImg, setMintButtonSrcImg] = useState(mintButtonRegular)

  if (visible) {
    showMintContainer = true;
  }

  const handleMintClick = async (event, val) => {
    if (!kaijuContract) {
      console.log('YO ' + '\xa0' + ' THIS ' + '\xa0' + ' YA ' + '\xa0' + ' PROBLEM ' + '\xa0' + ' HOMIE!!')
      console.log('Wallet not connected. Please connect your wallet.')
    } else {
      try {
        const estimation = await kaijuContract.estimateGas.mintPresale(val, { value: ethers.utils.parseEther((val * MINT_PRICE).toString()) });
        const safeGasLimit = Math.floor(parseInt(estimation) * 1.2)
        console.log('PENDING...')
        console.log(`TRANSACTION IS PENDING, CLOSING THIS MODAL WILL NOT CANCEL THE TRANSACTION`)
        const tx = await kaijuContract.mintPresale(val, { value: ethers.utils.parseEther((val * MINT_PRICE).toString()), gasLimit: safeGasLimit });
        console.log('YO ' + '\xa0' + ' TRANSACTION ' + '\xa0' + ' WAS ' + '\xa0' + ' A ' + '\xa0' + ' SUCCESS ' + '\xa0' + ' HOMIE!!')
        console.log(`Transaction was sent out successfully! Here is the transaction hash for the TX: ${tx.hash}`)
      } catch (err) {
        console.error("Error: ", err)
        console.log('YO ' + '\xa0' + ' THIS ' + '\xa0' + ' YA ' + '\xa0' + ' PROBLEM ' + '\xa0' + ' HOMIE!!')
        if (err.code === 4001) {
          console.log('User denied the transaction')
 
        } else if (err.code === 'INSUFFICIENT_FUNDS') {
          console.log('Wallet does not have the sufficient funds.')
        } else if (err.message.includes('Presale must be active')) {
          console.log('Presale is not active')
        } else if (err.message.includes('No tokens reserved for this address')) {
          console.log('No tokens reserved for this address')
        } else if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
          console.log('Unable to calculate gas limit, please try again.')
        } else if (err.message.includes('underlying network changed')) {
          console.log('Connected to the wrong network, please connect to Mainnet')
        } else if(err.code === 'INVALID_ARGUMENT'){
          console.log('What are you doing?? Please enter a value...')
        } else {
          console.log(err.message)
        }
      }
    }
  }

  return (
    <section id='mint' ref={ref}>
      <div className="mint-main">
        {visible || showMintContainer ? (
          <div className="mint-container">
            <img className="chat-box" src={chatbox} />
            <div className="mint-box col-md-12 col-sm-12 col-12">
              <div className="col-md-6 col-sm-6 col-6"> </div>
              <div className="mint-info col-md-6 col-sm-6 col-6">
                <div className="mint-button" onClick={(event) => handleMintClick(event, val)} style={{ cursor: 'pointer' }} >
                  <img className="regular" src={mintButtonSrcImg} onClick={handleClick} onMouseEnter={handleMouseHover} onMouseLeave={handleMouseUnhover} />
                </div>
                <div className="mint-info-top">
                  <p className="mint-text-dark">quantity</p>
                  <input type="number" onChange={(event) => presalemintValidator(event, setVal, allowedPresale)} value={val} className="amount-select">

                  </input>
                  {/* <p className="mint-text">2</p>
                  <p className="mint-text-dark">max</p> */}
                </div>
                <div className="mint-info-bot">
                  <p className="mint-text">&gt; &gt; {updatedPrice.toFixed(5)} ETH &lt; &lt;</p>
                </div>
              </div>
            </div>
          </div>
        ) : (<div></div>)}
        <div>
          {(allowedPresale === undefined) ? <div></div> : <div>
            {(allowedPresale === 0) ? <div className="presale-text">You &nbsp; do &nbsp; not &nbsp; have &nbsp; any &nbsp; reserved &nbsp; presale &nbsp; mints</div> :
              <div className="presale-text">You &nbsp; have &nbsp; <span>{allowedPresale}</span> &nbsp; reserved &nbsp; mints &nbsp; for &nbsp; presale</div>
            }
          </div>}
        </div>
      </div>

    </section >

  )
}

export default MintPage;

