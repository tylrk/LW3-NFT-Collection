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
      console.log(err);
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
      console.log(err);
    }
  };

  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in this case is Metamask
      // Prompts the user to connect wallet upon first use
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.log(err);
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
      console.log(err);
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
      // Call presaleStarted from the contract
      const _presaleStarted = await nftContract.presaleStarted();
      if(!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.log(err);
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
      console.log(err);
      return false;
    }
  };


  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
