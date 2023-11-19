import { Test } from "forge-std/Test.sol";
import { IEfficientCallSmartWallet } from "script/Actions.s.sol";

contract EfficientCallSmartWalletTest is Test {
    uint256 activationBlock = 614574;
    // uint ownerSetBlock = 614527;
    IEfficientCallSmartWallet wallet = IEfficientCallSmartWallet(0x416c9606D3de59040F1cdD494B3437ff5aA4aF57);
    uint256 activationFork;
    uint256 ownerSetFork;

    function setUp() external {
        activationFork = vm.createFork("https://stylus-testnet.arbitrum.io/rpc", activationBlock);
    }

    function test_setOwner() public {
        vm.selectFork(activationFork);
        address currentOwner = wallet.owner();
        assertEq(currentOwner, address(0));
    }
}
