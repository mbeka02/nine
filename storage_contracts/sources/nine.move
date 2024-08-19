//A smart contract for storing CIDs onchain
module nine::nine {
    use std::string;
    use std::vector;
    use std::signer;
    use aptos_framework::event::emit;
    use aptos_framework::timestamp;

    use aptos_framework::account::SignerCapability;
    use aptos_framework::account;
    #[test_only]
    use aptos_framework::event::emitted_events;
    #[test_only]
    use aptos_std::debug;

    const SEED: vector<u8> = b"nine";
    //error codes
    const ECID_EXISTS: u64 = 11;
    const ECID_FAILED_TO_STORE: u64 = 12;

    struct State has key {
        signer_capability: SignerCapability,
        cid_hid: u64
    }

    struct CidStored has key, store {
        cid: string::String,
    }

    struct CidArray has key, store {
        cids: vector<CidStored>,
    }

    #[event]
    struct CidStoredEvent has drop, store {
        cid: string::String,
        timestamp: u64,
        hid: u64,
    }

    fun init_module(account: &signer) {
        let (resource_signer, signer_capability) = account::create_resource_account(
            account, SEED
        );
        move_to(&resource_signer, State { signer_capability, cid_hid: 100 });
        let cid_array = CidArray { cids: vector::empty() };
        move_to(&resource_signer, cid_array);

    }

    public entry fun store_cid(admin: &signer, cid: string::String) acquires CidArray, State {
        let resource_address = account::create_resource_address(&@nine, SEED);
        let cid_array = borrow_global_mut<CidArray>(resource_address);
        let state = borrow_global_mut<State>(resource_address);
        let current_hid = state.cid_hid;

        state.cid_hid = state.cid_hid + 1;
        vector::push_back(&mut cid_array.cids, CidStored { cid: cid });
        emit({ CidStoredEvent { cid, timestamp: timestamp::now_microseconds(), hid: current_hid } })
    }

    #[test]
    fun test_store_cid() acquires CidArray, State {
        let admin = account::create_account_for_test(@nine);
        let aptos = account::create_account_for_test(@0x1);

        timestamp::set_time_has_started_for_testing(&aptos);

        init_module(&admin);
        store_cid(&admin, string::utf8(b"Some string"));
         store_cid(&admin, string::utf8(b"Some string"));
        let cids = emitted_events<CidStoredEvent>();

        debug::print<vector<CidStoredEvent>>(&cids);
    }
}
