#![no_std]
use soroban_sdk::{contract, contractimpl, vec, Address, Env, IntoVal};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn run(env: Env, source: Address) -> bool {
        source.require_auth_for_args(vec![
            &env,
            env.prng().gen::<u64>().into_val(&env),
            u32::MAX.into_val(&env),
            u64::MAX.into_val(&env),
            u128::MAX.into_val(&env),
        ]);

        true
    }
}

mod test;
