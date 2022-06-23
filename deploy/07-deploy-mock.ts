import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
//@ts-ignore
import { ethers } from "hardhat";

const deployMock: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("Deploying Mock...");

  const mock = await deploy("ERC1155Mock", {
    from: deployer,
    args: ["www.google.com"],
    log: true,
  });

  const timeLock = await ethers.getContract("TimeLock");
  const mockContract = await ethers.getContractAt("ERC1155Mock", mock.address);

  // const transferOwnerTx = await mockContract.transferOwnership(
  //   timeLock.address
  // );

  // await transferOwnerTx.wait(1);
  log(`MockContract at ${mockContract.address}`);
};

export default deployMock;
