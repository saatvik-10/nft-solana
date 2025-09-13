import {
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const user = await getKeypairFromFile();

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL,
);

console.log("User loaded", user.publicKey.toBase58());

const umi = createUmi(clusterApiUrl("devnet"));
umi.use(mplTokenMetadata()); //wants to talk to the mplTokenMetadata

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Setting up Umi instance of user");

const collectionAddress = publicKey(
  "579LxQj7yGsXRU8SxetEJTJusBoE2Mg25C9SBGUXwFVT",
);

const nftAddress = publicKey("FXg57xB52Ujpduz6zB6AmLceLaw8bS5orxLZDGZWNZbE");

const transaction = await verifyCollectionV1(umi, {
  metadata: findMetadataPda(umi, { mint: nftAddress }),
  collectionMint: collectionAddress,
  authority: umi.identity,
});

transaction.sendAndConfirm(umi);

console.log(
  `NFT ${nftAddress} verified for collection ${collectionAddress}. Explorer Link- ${getExplorerLink("address", nftAddress, "devnet")}`,
);
