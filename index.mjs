import { AssetAmount } from '@sundaeswap/asset';
import { EContractVersion, ETxBuilderType, SundaeSDK } from '@sundaeswap/core';
import { Blockfrost, Lucid } from 'lucid-cardano';

const main = async () => {
  try {
    const API_KEY = 'key';
    const PRIVATE_KEY = 'key';

    console.log("Initializing Lucid...");
    const lucid = await Lucid.new(
      new Blockfrost('https://cardano-mainnet.blockfrost.io/api/v0', API_KEY),
      'Mainnet'
    );

    console.log("Selecting wallet...");
    lucid.selectWalletFromPrivateKey(PRIVATE_KEY);
    console.log('Wallet selected using private key.');

    console.log("Initializing SDK...");
    const sdk = await SundaeSDK.new({
      wallet: {
        name: 'eternl',
        network: 'Mainnet',
        builder: { lucid, type: ETxBuilderType.LUCID },
      },
    });

    const assetAId = 'b41713dca323868c8561ae40d8e3518c7487f12f828f71c6e371af22.444f4e47';
    const assetAAmount = '1000';
    const assetBAmount = '2000';

    console.log("Preparing transaction...");
    const transactionConfig = {
      assetA: new AssetAmount(100_000n, { 
        assetId: 'b41713dca323868c8561ae40d8e3518c7487f12f828f71c6e371af22.444f4e47',
        decimals: 6,
      }),
      assetB: new AssetAmount(2_000_000n, { 
        assetId: 'ada.lovelace',
        decimals: 6,
      }),
      fee: 3_000n,
      ownerAddress: await lucid.wallet.address(),
    };
    
    console.log('Transaction configuration:', transactionConfig);

    console.log("Building transaction...");
    const transaction = await sdk.builder(EContractVersion.V3, ETxBuilderType.LUCID)
      .mintPool({
        assetA: new AssetAmount(100_000n, { 
          assetId: 'b41713dca323868c8561ae40d8e3518c7487f12f828f71c6e371af22.444f4e47',
          decimals: 6,
        }),
        assetB: new AssetAmount(2_000_000n, { 
          assetId: 'ada.lovelace',
          decimals: 6,
        }),
        fees: {
          transactionFee: 3_000n,
        },
        ownerAddress: await lucid.wallet.address(),
        marketOpen: true,
        referralFee: null,
        donateToTreasury: false,
      });

    console.log("Signing transaction...");
    const { build } = transaction;
    const builtTx = await build();

    console.log("Signing the transaction...");
    const signedTx = await builtTx.sign();
    console.log('Transaction signed successfully.');

    console.log("Submitting transaction...");
    const txHash = await signedTx.submit();
    console.log('Transaction submitted successfully. TxHash:', txHash);
  } catch (error) {
    console.error('Error during transaction processing:', error);
  }
};

main();
