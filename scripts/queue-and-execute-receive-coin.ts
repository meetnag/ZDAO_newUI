import {
  developmentChains,
  MINT_ACCOUNT,
  MINT_TOKEN_VALUE,
  MINT_PROPOSAL_DESCRIPTION,
  MIN_DELAY,
  MINT_FUNC,
} from "../helper-hardhat-config";
// @ts-ignore
import { ethers, network } from "hardhat";
import { moveTime } from "../utils/move-time";
import { moveBlocks } from "../utils/move-blocks";
export async function queueAndExecute() {
  const token = await ethers.getContract("Token");

  const args = [MINT_ACCOUNT, MINT_TOKEN_VALUE];

  const encodedFunctionCall = token.interface.encodeFunctionData(
    MINT_FUNC,
    args
  );

  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(MINT_PROPOSAL_DESCRIPTION)
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

  const accountBalance = await token.balanceOf(MINT_ACCOUNT);
  console.log(`Account Balance: ${accountBalance.toString()}`);
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
