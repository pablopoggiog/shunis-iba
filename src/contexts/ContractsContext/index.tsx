import {
  FunctionComponent,
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ethers, Contract } from "ethers";
import { IContractsContext } from "src/types";
import Token from "src/artifacts/contracts/Token.sol/Token.json";

const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS!;

export const ContractsContext = createContext<IContractsContext>({
  sendCoins: () => {
    return;
  },
});

export const ContractsProvider: FunctionComponent = ({ children }) => {
  const [userAccount, setUserAccount] = useState<string>();
  const [amountToSend, setAmountToSend] = useState<number>();
  const [balance, setBalance] = useState<number>();
  const [contractWithProvider, setContractWithProvider] = useState<Contract>();
  const [contractWithSigner, setContractWithSigner] = useState<Contract>();

  const requestAccount = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  const getContractAndSigner = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractWithProvider = new ethers.Contract(
          tokenAddress,
          Token.abi,
          provider
        );
        const contractWithSigner = new ethers.Contract(
          tokenAddress,
          Token.abi,
          signer
        );

        setContractWithProvider(contractWithProvider);
        setContractWithSigner(contractWithSigner);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getBalance = useCallback(async () => {
    if (window.ethereum && contractWithProvider) {
      try {
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const balance = await contractWithProvider.balanceOf(account);

        setBalance(Number(balance.toString()) / 10 ** 18);
      } catch (error) {
        console.error(error);
      }
    }
  }, [contractWithProvider]);

  const sendCoins = async () => {
    if (window.ethereum && contractWithSigner) {
      try {
        await requestAccount();
        const transaction = await contractWithSigner.transfer(
          userAccount,
          amountToSend
        );
        await transaction.wait();
        console.log(
          `${amountToSend} Coins successfully sent to ${userAccount}`
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    getContractAndSigner();
  }, []);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  useEffect(() => {
    console.log({ balance });
  }, [balance]);

  return (
    <ContractsContext.Provider value={{ sendCoins }}>
      {children}
    </ContractsContext.Provider>
  );
};
