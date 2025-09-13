//nfts are unique....hv their own mint address. Collection binds them together (nfts of a particular owner)
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

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, {
  mint: collectionMint,
  name: "SV Collection",
  symbol: "SVM",
  uri: "https://raw.githubusercontent.com/saatvik-10/nft-solana/main/nftMetadata.json",
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
});

await transaction.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(
  umi,
  collectionMint.publicKey,
);

console.log(
  `Collection created at ${getExplorerLink("address", createdCollectionNft.mint.publicKey, "devnet")}`,
);
