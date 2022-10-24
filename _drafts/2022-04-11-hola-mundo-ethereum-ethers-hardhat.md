---
title: 'Hola Mundo en Ethereum con Hardhat y Ethers.js'
subtitle: 'Mandando nuestra primera transferencia de criptomonedas'
coverImage: '/assets/blog/ethereum.svg'
date: '2022-04-11'
collection: 'Explorando Ethereum'
---

### Contenido del Post

### Iniciando el proyecto

```bash
mkdir explorando-ethereum
cd explorando-ethereum
npm init
npm i hardhat
```

Configuramos Hardhat. Seleccionamos _Create an empty hardhat.config.js_:

´´´bash
npx hardhat
´´´

Iniciamos un nodo de nuestra blockchain local:

```bash
npx hardhat node
```

Veremos que se imprimen en pantalla 20 cuentas de prueba para poder jugar:

```bash
Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Account #3: 0x90f79bf6eb2c4f870365e785982e1f101e93b906 (10000 ETH)
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

Account #4: 0x15d34aaf54267db7d7c367839aaf71a00a2c6a65 (10000 ETH)
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
.
.
.
```

Instalamos ethers.js

```bash
npm i ethers
```

_transfer.js_

```js
// index.js

const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider();
const signer = provider.getSigner();

const from = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const to = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';

sendTransactionAndShowBalances();

async function sendTransactionAndShowBalances() {
  await signer.sendTransaction({
    from,
    to,
    value: ethers.utils.parseEther('10.0'),
  });

  let balance = await provider.getBalance(from);
  console.log('From account balance:', ethers.utils.formatEther(balance));

  balance = await provider.getBalance(to);
  console.log('To account balance:', ethers.utils.formatEther(balance));
}
```

```bash
node transfer.js
```

```bash
From account balance: 9989.999960625
To account balance: 10010.0
```

# Draft

Puedes hacerme cualquier pregunta o comentario por [dm en Twitter](https://twitter.com/albertobeiz).