import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
//@ts-ignore
import { ethers } from "hardhat";

const deployHolder: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("Deploying holder...");

  const mock = await ethers.getContract("ERC1155Mock");
  const token = await ethers.getContract("Token");

  const holder = await deploy("Holder", {
    from: deployer,
    args: [mock.address, token.address],
    log: true,
  });

  const timeLock = await ethers.getContract("TimeLock");
  const holderContract = await ethers.getContractAt("Holder", holder.address);

  // const transferOwnerTx = await holderContract.transferOwnership(
  //   timeLock.address
  // );

  // await transferOwnerTx.wait(1);
  log(`HolderContract at ${holderContract.address}`);
};

export default deployHolder;
