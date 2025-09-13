import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
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

console.log("Creating NFT...");

const mint = generateSigner(umi);

const transaction = await createNft(umi, {
  mint,
  name: "SV Nft",
  uri: "https://raw.githubusercontent.com/saatvik-10/nft-solana/main/nft.json",
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionAddress,
    verified: false,
  },
});

await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log(
  `Created NFT's address is ${getExplorerLink("address", createdNft.mint.publicKey, "devnet")}`,
);
