// @ts-check
const ethers = require('ethers');
const zlib = require('zlib');

const abi = [
    {
        type: 'function',
        name: 'execute',
        inputs: [
            {
                name: 'to',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'value',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'cd',
                type: 'bytes',
                internalType: 'bytes',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bytes',
                internalType: 'bytes',
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'executeDelegatecall',
        inputs: [
            {
                name: 'to',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'cd',
                type: 'bytes',
                internalType: 'bytes',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bytes',
                internalType: 'bytes',
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'owner',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'setOwner',
        inputs: [
            {
                name: 'new_owner',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
];

const deployedAddress = '0xc9560cc6b7a1d26E433833eFFBb72e87988f45C4';
const deployTx =
    '0x1970a6d559fc25e280352a681f2ec73fa8084e65e8c3fe452a98151fa016e976';
const activationTx =
    '0x1d9a91acc35e8a101938016be4c839720d9df9f584f00e07f540aa10f879f96f';

const provider = new ethers.JsonRpcProvider(
    'https://stylus-testnet.arbitrum.io/rpc'
);
const signer = new ethers.Wallet(process.env.PK, provider);

const walletContract = new ethers.Contract(deployedAddress, abi, signer);
const multicall3Interface = new ethers.Interface(abi);

const main = async () => {
    console.log('Wallet deployed at address: ' + deployedAddress);
    const currentOwner = await walletContract.owner();
    console.log('Current owner: ' + currentOwner);
    const newOwner = signer.address;
    const setOwnerTx = await walletContract.setOwner(newOwner);
    console.log('set owner tx: ' + setOwnerTx.hash);
    await setOwnerTx.wait();
    console.log('set owner tx confirmed');
    const newOwnerAfterSetOwner = await walletContract.owner();
    console.log('New owner: ' + newOwnerAfterSetOwner);

    const bigMulticall = "0x252dba42000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000002600000000000000000000000003dfb15e4eaa26581b8fcd46eb62308a541ff3292000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000241e83409a00000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000000000000000000000000000000000000000003dfb15e4eaa26581b8fcd46eb62308a541ff3292000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000241e83409a0000000000000000000000002f2a2543b76a4166549f7aab2e75bef0aefc5b0f000000000000000000000000000000000000000000000000000000000000000000000000000000003dfb15e4eaa26581b8fcd46eb62308a541ff3292000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000241e83409a000000000000000000000000f97f4df75117a78c1a5a0dbb814af92458539fb4000000000000000000000000000000000000000000000000000000000000000000000000000000003dfb15e4eaa26581b8fcd46eb62308a541ff3292000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000241e83409a000000000000000000000000fa7f8980b0f1e64a2062791cc3b0871572f1f7f000000000000000000000000000000000000000000000000000000000"
    console.log('uncompressed calldata length to send 4 tokens: ', bigMulticall.length - 2);

    const deflated = zlib.deflateSync(Buffer.from(bigMulticall.slice(2), 'hex'));
    const deflatedHexString = deflated.toString('hex');
    console.log('deflated calldata length: ', deflatedHexString.length);
    console.log({
        bigMulticall,
        deflatedHexString,
    });
};

main();
