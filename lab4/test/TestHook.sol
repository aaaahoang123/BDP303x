// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "truffle/Assert.sol";

contract TestHooks {
    uint someValue;

    function beforeEach() public {
        someValue = 5;
    }

    function beforeEachAgain() public {
        someValue += 1;
    }

    function testSomeValueIsSix() public {
        uint expected = 6;

        Assert.equal(someValue, expected, "someValue should have been 6");
    }
}