import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
//@ts-ignore
import { ethers } from "hardhat";

const deployToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  log("Deploying Token...");

  const token = await deploy("Token", {
    from: deployer,
    args: ["TestToken", "TST", deployer, 0],
    log: true,
  });

  const timeLock = await ethers.getContract("TimeLock");
  const tokenContract = await ethers.getContractAt("Token", token.address);

  // const transferOwnerTx = await tokenContract.transferOwnership(
  //   timeLock.address
  // );

  // await transferOwnerTx.wait(1);
  log(`Token Contract at ${tokenContract.address}`);
};

export default deployToken;
