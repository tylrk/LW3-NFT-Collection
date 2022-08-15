import { Contract, providers, utils } from "ethers";
import Head from 'next/head'
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from '../styles/Home.module.css';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // Checks if the currently connected wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState('0');
  // Reference to the Web3 Modal used for connecting to Metamask, which persists as long as the page is open
  const web3ModalRef = useRef();

  const presaleMint = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the contract with a Signer, which allows updating methods
      const whitelistContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // Call presaleMint from the contract (only whitelisted addresses can mint)
      const tx = await whitelistContract.presaleMint({
        // Value signifies the cost of one NFT, which is 0.01 eth
        // We are parsing the `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
      });
      setLoading(true);
      // Wait for transaction to be mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a CryptoDev!");
    }
     catch (err) {
      console.error(err);
     }
  };

  const publicMint = async () => {
    try {
      // Write transaction
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await whitelistContract.mint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a CryptoDev!");
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in this case is Metamask
      // Prompts the user to connect wallet upon first use
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const startPresale = async () => {
    try {
    // Write transaction
    const signer = await getProviderOrSigner(true);
    const whitelistContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      abi,
      signer
    );
    // Call startPresale from the contract
    const tx = await whitelistContract.startPresale();
    setLoading(true);
    await tx.wait();
    setLoading(false);
    await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      // Only reading from blockchain; No need for signer
      // Get provider from web3Modal
      const provider = await getProviderOrSigner();
      // Connecting to contract using a provider; read-only access to the contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // Call presaleStarted (a boolean) from the contract
      const _presaleStarted = await nftContract.presaleStarted();
      if(!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const checkIfPresaleEnded = async () => {
    try {
      // Read-only; Get Provider
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // Call presaleEnded from the contract
      const _presaleEnded = await nftContract.presaleEnded();
      // _presaleEnded is a Big Number, so the lt(less than function) is used over `<`
      // Date.now()/1000 returns the current time in seconds
      // We compare if the _presaleEnded timestamp is less than the current time, 
      // which means presale has ended
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getOwner = async () => {
    try {
      // Read-only; Get Provider
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // Call owner function from contract
      const _owner = await nftContract.owner();
      // Get signer to extract the address of the currently connected wallet
      const signer = await getProviderOrSigner(true);
      // Get address
      const address = await signer.getAddress();
      if(address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const getTokenIdsMinted = async () => {
    try {
      // Read-only; Get Provider
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // Call tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      // _tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since `web3Modal` was stored as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If the user is NOT connected to Goerli, tell them to switch
    const { chainId } = await web3Provider.getNetwork();
    if(chainId != 5) {
      window.alert("Change network to Goerli");
      throw new Error("Incorrect network");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  useEffect(() => {
    if(!walletConnected) {
      // Assign the web3Modal class to the reference object by setting it's `current` value
      // The `current` value is the same throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      // Check if presale has started and ended
      const _presaleStarted = checkIfPresaleStarted();
      if (_presaleStarted) {
        checkIfPresaleEnded();
      }
      getTokenIdsMinted();

      // Set an interval which gets called every 5 seconds to check if the presale has ended
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if(_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if(_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      // Set an interval to get the number of tokenIds minted every 5 seconds
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  /**
   * renderButton returns as button based on the state of the app
   */
  const renderButton = () => {
    if(!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    if(loading) {
      return <button className={styles.button}>Loading...</button>
    }

    if(isOwner && !presaleStarted) {
      return (
        <button onClick={startPresale} className={styles.button}>
          Start Presale!
        </button>
      );
    }

    if(!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale has not started yet!</div>
        </div>
      );
    }

    if(presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has begun! If your address is whitelisted, you can mint a CryptoDev 🤙
          </div>
          <button onClick={presaleMint} className={styles.button}>
            Presale Mint 👀
          </button>
        </div>
      );
    }

    if(presaleStarted && presaleEnded) {
      return (
        <button onClick={publicMint} className={styles.button}>
          Mint 😤
        </button>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>CryptoDevs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDevs!</h1>
          <div className={styles.description}>
            It's an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by CryptoDevs
      </footer>
    </div>
  );
}
