import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/MetaCoin.sol";

contract TestContract {
    // Truffle will send the TestContract one Ether after deploying the contract.
    uint public initialBalance = 1 ether;
    address[] public testAccounts;

    constructor(address[] memory _accounts) {
        testAccounts = _accounts;
    }

    function testInitialBalanceUsingDeployedContract() public {
        MetaCoin myContract = MetaCoin(DeployedAddresses.MetaCoin());

        // perform an action which sends value to myContract, then assert.
        myContract.sendCoin(testAccounts[1], 2);
    }

    function notRun() public {

        // This will NOT be executed when Ether is sent. \o/
    }
}