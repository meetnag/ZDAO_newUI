import {
  MINT_ACCOUNT,
  MINT_TOKEN_ID,
  MINT_TOKEN_VALUE,
  MINT_FUNC,
  MINT_ERC1155_PROPOSAL_DESCRIPTION,
  developmentChains,
  VOTING_DELAY,
  proposalsFile,
} from "../helper-hardhat-config";

//@ts-ignore
import { ethers, network } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";
import * as fs from "fs";

export async function propose(
  args: any[],
  functionToCall: string,
  proposalDescription: string
) {
  const governor = await ethers.getContract("GovernorContract");

  const token = await ethers.getContract("ERC1155Mock");

  const holder = await ethers.getContract("Holder");

  args = [holder.address, MINT_TOKEN_ID, MINT_TOKEN_VALUE, Buffer.from("")];

  const encodedFunctionCall = token.interface.encodeFunctionData(
    functionToCall,
    args
  );

  console.log(
    `Proposal Description: \n ${proposalDescription} ${holder.address}`
  );

  const proposeTx = await governor.propose(
    [token.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  );

  const proposeReceipt = await proposeTx.wait(1);

  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }

  const proposalId = proposeReceipt.events[0].args.proposalId;

  let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));

  proposals[network.config.chainId!.toString()].push(proposalId.toString());

  fs.writeFileSync(proposalsFile, JSON.stringify(proposals));
}

//propose([MINT_ACCOUNT, MINT_TOKEN_VALUE], MINT_FUNC, MINT_PROPOSAL_DESCRIPTION)

propose([], MINT_FUNC, MINT_ERC1155_PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
