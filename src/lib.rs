// Only run this as a WASM if the export-abi feature is not set.
#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

/// Initializes a custom, global allocator for Rust programs compiled to WASM.
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use std::io::Read;

/// Import the Stylus SDK along with alloy primitive types for use in our program.
use stylus_sdk::{
    abi::Bytes,
    alloy_primitives::{Address, U256},
    call, evm, msg,
    prelude::*,
};

sol_storage! {
    #[entrypoint]
    pub struct EfficientCallSmartWallet {
        address owner;
    }
}

#[external]
impl EfficientCallSmartWallet {
    /// Anyone can initialize if not already set, else only owner can hand over
    /// ownerrship
    pub fn set_owner(&mut self, new_owner: Address) -> Result<(), Vec<u8>> {
        if self.owner.is_zero() || self.owner.get() == msg::sender() {
            self.owner.set(new_owner);
        } else {
            return Err(b"Only the owner can change the owner".to_vec());
        }
        Ok(())
    }

    pub fn execute(
        &mut self,
        to: Address,
        value: U256,
        cd: Bytes,
    ) -> Result<(Bytes, Bytes), Vec<u8>> {
        self.only_owner()?;
        let mut calldata = vec![];
        flate2::read::DeflateDecoder::new(&cd.0[..])
            .read_to_end(&mut calldata)
            .map_err(|_| (b"Decompression failed".to_vec()))?;
        let raw_call = call::RawCall::new_with_value(value).call(to, &cd)?;
        Ok((Bytes(raw_call), Bytes(calldata)))
    }

    pub fn execute_delegatecall(&mut self, to: Address, calldata: Bytes) -> Result<Bytes, Vec<u8>> {
        self.only_owner()?;
        let mut cd = vec![];
        flate2::read::DeflateDecoder::new(&calldata.0[..])
            .read_to_end(&mut cd)
            .map_err(|_| (b"Decompression failed".to_vec()))?;
        let raw_call = call::RawCall::new_delegate().call(to, &cd)?;
        Ok(Bytes(raw_call))
    }

    pub fn owner(&self) -> Result<Address, Vec<u8>> {
        Ok(self.owner.get())
    }
}

impl EfficientCallSmartWallet {
    fn only_owner(&self) -> Result<(), Vec<u8>> {
        if self.owner.get() != msg::sender() {
            return Err(b"OnlyOwner".to_vec());
        }
        Ok(())
    }
}
