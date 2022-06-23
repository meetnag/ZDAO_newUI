import {
  developmentChains,
  MINT_ACCOUNT,
  MINT_TOKEN_ID,
  MINT_TOKEN_VALUE,
  TRANSFER_HOLDER_FUNC,
  TRANSFER_ERC1155_AND_MINT_ERC20_PROPOSAL_DESCRIPTION,
  MIN_DELAY,
} from "../helper-hardhat-config";
// @ts-ignore
import { ethers, network } from "hardhat";
import { moveTime } from "../utils/move-time";
import { moveBlocks } from "../utils/move-blocks";
export async function queueAndExecute() {
  const token = await ethers.getContract("ERC1155Mock");

  const holder = await ethers.getContract("Holder");

  const args = [
    MINT_ACCOUNT,
    holder.address,
    MINT_TOKEN_ID,
    MINT_TOKEN_VALUE,
    Buffer.from(""),
  ];

  const encodedFunctionCall = token.interface.encodeFunctionData(
    TRANSFER_HOLDER_FUNC,
    args
  );

  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      TRANSFER_ERC1155_AND_MINT_ERC20_PROPOSAL_DESCRIPTION
    )
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

  const accountBalance = await token.balanceOf(holder.address, MINT_TOKEN_ID);
  console.log(`Account Balance: ${accountBalance.toString()}`);
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
