import { Horizon, Keypair, Networks } from '@stellar/stellar-sdk'
import { $ } from 'bun'

await $`bun rimraf target/wasm32-unknown-unknown/release .env.local`
console.log('cleaned target')

const horizonUrl = 'http://localhost:8000'
const horizon = new Horizon.Server(horizonUrl, { allowHttp: true })

const keypair = Keypair.random()
const secret = keypair.secret()
const pubkey = keypair.publicKey()

try {
    await horizon.friendbot(pubkey).call()
} catch {
    throw new Error(`Issue with ${pubkey} account. Ensure you're running the \`./docker.sh\` network and have run \`bun run deploy.ts\` recently.`)
}
console.log('created account')

await $`soroban network add kalenet --rpc-url http://localhost:8000/soroban/rpc --network-passphrase ${Networks.STANDALONE}`
await $`soroban keys add kalecount --secret-key`.env({ ...process.env, SOROBAN_SECRET_KEY: secret })

await $`soroban contract build`
console.log('built contracts')

const contractId_1 = (await $`soroban contract deploy --wasm target/wasm32-unknown-unknown/release/soroban_authplore_1.wasm --network kalenet --source kalecount`.text()).replace(/\W/g, '')
const contractId_2 = (await $`soroban contract deploy --wasm target/wasm32-unknown-unknown/release/soroban_authplore_2.wasm --network kalenet --source kalecount`.text()).replace(/\W/g, '')
const contractId_3 = (await $`soroban contract deploy --wasm target/wasm32-unknown-unknown/release/soroban_authplore_3.wasm --network kalenet --source kalecount`.text()).replace(/\W/g, '')
const contractId_4 = (await $`soroban contract deploy --wasm target/wasm32-unknown-unknown/release/soroban_authplore_4.wasm --network kalenet --source kalecount`.text()).replace(/\W/g, '')
console.log('deployed contracts')

if (
    !contractId_1
    || !contractId_2
    || !contractId_3
    || !contractId_4
) throw new Error('Contracts not deployed')

let file = ``
file += `CONTRACT_ID_1=${contractId_1}\n`
file += `CONTRACT_ID_2=${contractId_2}\n`
file += `CONTRACT_ID_3=${contractId_3}\n`
file += `CONTRACT_ID_4=${contractId_4}\n`
file += `SECRET=${secret}`

await Bun.write('.env.local', file);
console.log('✅')