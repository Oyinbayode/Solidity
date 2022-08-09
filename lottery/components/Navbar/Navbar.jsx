import Web3Modal from "web3modal";
import { ethers } from "ethers";

const providerOptions = {};

const Navbar = () => {
  async function connectWallet() {
    try {
      let web3Modal = new Web3Modal({
        opts: {
          cacheProvider: false,
          providerOptions,
        },
      });
      const web3ModalInstance = await web3Modal.connect();
      const web3ModalProvider = new ethers.providers.Web3Provider(
        web3ModalInstance
      );
      console.log(web3ModalProvider);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <button onClick={connectWallet}>Connect Wallet</button>
    </div>
  );
};

export default Navbar;
