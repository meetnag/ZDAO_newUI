import * as fs from "fs";
import {
  developmentChains,
  proposalsFile,
  VOTING_PERIOD,
} from "../helper-hardhat-config";

//@ts-ignore
import { ethers, network } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";

const index = 2;

async function main(proposalIndex: number) {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  const proposalId = proposals[network.config.chainId!][proposalIndex];

  // 0 = Against, 1 = For, 2 = Abstain

  const voteWay = 1;
  const governor = await ethers.getContract("GovernorContract");
  const reason = "I like a do da cha cha";
  const voteTxResponse = await governor.castVoteWithReason(
    proposalId,
    voteWay,
    reason
  );
  console.log(1);
  await voteTxResponse.wait(1);

  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }

  console.log("Voted! Ready to go!");
}

main(index)
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
