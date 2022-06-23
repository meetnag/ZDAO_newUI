import {
  developmentChains,
  MINT_ACCOUNT,
  MINT_TOKEN_ID,
  MINT_TOKEN_VALUE,
  MINT_FUNC,
  MINT_ERC1155_PROPOSAL_DESCRIPTION,
  MIN_DELAY,
} from "../helper-hardhat-config";
// @ts-ignore
import { ethers, network } from "hardhat";
import { moveTime } from "../utils/move-time";
import { moveBlocks } from "../utils/move-blocks";
export async function queueAndExecute() {
  const holder = await ethers.getContract("Holder");
  const args = [
    holder.address,
    MINT_TOKEN_ID,
    MINT_TOKEN_VALUE,
    Buffer.from(""),
  ];
  const token = await ethers.getContract("ERC1155Mock");
  const encodedFunctionCall = token.interface.encodeFunctionData(
    MINT_FUNC,
    args
  );

  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(MINT_ERC1155_PROPOSAL_DESCRIPTION)
  );

  const governor = await ethers.getContract("GovernorContract");
  console.log("Queuing....");

  const queueTx = await governor.queue(
    [token.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );

  await queueTx.wait(1);

  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);
  }

  console.log("Executing...");

  const executeTx = await governor.execute(
    [token.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );

  await executeTx.wait(1);

  const coin = await ethers.getContract("Token");

  const accountBalance = await token.balanceOf(holder.address, MINT_TOKEN_ID);
  console.log(`Account Balance: ${accountBalance.toString()}`);

  const coinBalance = await coin.balanceOf(MINT_ACCOUNT);
  console.log(`Coin Minted to : ${await coin.getMintedAccount()}`);
  console.log(`Coin Balance: ${coinBalance.toString()}`);
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
