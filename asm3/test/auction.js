let Auction = artifacts.require("./Auction.sol");

let auctionInstance;

const STATE = {
  CREATED: 0, STARTED: 1, CLOSING: 2, CLOSED: 3
};

contract('AuctionContract', function (accounts) {
  describe('Contract deployment', () => {
    it("Contract deployment", function() {
      //Fetching the contract instance of our smart contract
      return Auction.deployed().then(function (instance) {
        //We save the instance in a gDlobal variable and all smart contract functions are called using this
        auctionInstance = instance;
        assert(auctionInstance !== undefined, 'Auction contract should be defined');
      });
    });

    it('Initial rule with corrected startingPrice and minimumStep', function() {
      //Fetching the rule of Auction
      return auctionInstance.rule().then(function(rule) {
        //We save the instance in a global variable and all smart contract functions are called using this
        assert(rule !== undefined, 'Rule should be defined');
        assert.equal(rule.startingPrice, 50, 'Starting price should be 50');
        assert.equal(rule.minimumStep, 5, 'Minimum step should be 5');
      });
    });
  });

  describe('Should register work correct', () => {
    it('Auctioneer be able to register when state is CREATED', async () => {
      await auctionInstance.register(accounts[1], 6, {from: accounts[0]});
      const bidder = await auctionInstance.bidders(accounts[1]);
      const token = bidder.token;
      expect(token.toNumber()).to.equal(6, 'The token should equals to the registered token');
    });

    it('Only Auctioneer be able to register', async () => {
      try {
        await auctionInstance.register(accounts[2], 6, {from: accounts[1]});
      } catch (e) {
        assert(e.reason === 'Only auctioneer can do this action', 'Only auctioneer can do this action, the revert error is: ' + e.reason);
      }
    });
  });

  describe('Should startSession work correct', () => {
    it('should not be able to start session by non-Auctioneer account', async () => {
      try {
        await auctionInstance.startSession({ from: accounts[1] });
      } catch (e) {
        assert.equal(e.reason, 'Only auctioneer can do this action', 'Only auctioneer can do this action, the revert error is: ' + e.reason)
      }
    });

    it('should start session by Auctioneer when state is CREATED', async () => {
      await auctionInstance.startSession({ from: accounts[0] });
      const state = await auctionInstance.state();
      assert.equal(state.toNumber(), STATE.STARTED, 'The state after start must be STARTED');
    });

    it('should not be able to start session when state is not CREATED', async () => {
      try {
        await auctionInstance.startSession({ from: accounts[0] });
      } catch (e) {
        assert.equal(e.reason, 'Current state is not created');
      }
    });

    it('Should not be able to register when state is not CREATED', async () => {
      try {
        await auctionInstance.register(accounts[2], 6, {from: accounts[0]});
      } catch (e) {
        assert(e.reason === 'Current state is not created', 'The revert error is: ' + e.reason);
      }
    });
  });

  describe('Should bid work correct', () => {
    let currentPrice = 50;
    let step = 5;
    const tokenForBidder = 200;

    before('Register some more bidders with a new auction instance', async () => {
      auctionInstance = await Auction.new(currentPrice, step);
      await auctionInstance.register(accounts[1], tokenForBidder, {from: accounts[0]});
      await auctionInstance.register(accounts[2], tokenForBidder, {from: accounts[0]});
      await auctionInstance.register(accounts[3], tokenForBidder, {from: accounts[0]});
      await auctionInstance.register(accounts[4], tokenForBidder, {from: accounts[0]});
      await auctionInstance.register(accounts[5], tokenForBidder, {from: accounts[0]});
    });

    it('should not bid by non-bidder', async () => {
      try {
        await auctionInstance.bid(100, { from: accounts[6] });
      } catch (e) {
        assert(e.reason === 'Only bidders with remain token can do this action', 'The revert error is: ' + e.reason);
      }
    });

    it('should not be able to bid by bidders when state is not STARTED', async () => {
      try {
        await auctionInstance.bid(100, { from: accounts[1] });
      } catch (e) {
        assert(e.reason === 'Current state is not started', 'The revert error is: ' + e.reason);
      }
    });

    it('Bidders can bid when state is STARTED', async () => {
      const bidPrice = 100;
      await auctionInstance.startSession({ from: accounts[0] });
      await auctionInstance.bid(bidPrice, { from: accounts[1] });

      const currentWinner = await auctionInstance.currentWinner();
      const currentPrice = await auctionInstance.currentPrice();
      const currentBidders = await auctionInstance.bidders(accounts[1]);
      assert.equal(currentWinner, accounts[1], 'The winner is the only bid bidder');
      assert.equal(currentPrice.toNumber(), bidPrice, 'The current price will be the first bid price');
      assert.equal(currentBidders.token.toNumber(), tokenForBidder - bidPrice, 'The remain token of bidder should be the total sub the bid price');
      assert.equal(currentBidders.deposit.toNumber(), bidPrice, 'The bidder must deposit the bid price if bid success');
    });

    it('should not bid when not enough token', async () => {
      const bidPrice = 201;
      try {
        await auctionInstance.bid(bidPrice, { from: accounts[1] });
      } catch (e) {
        assert(e.reason === 'Bidder do not have enough tokens', 'The revert error is: ' + e.reason);
      }

      try {
        await auctionInstance.bid(bidPrice, { from: accounts[2] });
      } catch (e) {
        assert(e.reason === 'Bidder do not have enough tokens', 'The revert error is: ' + e.reason);
      }
    });

    it('should not bid when the next price not enough by minumum step', async () => {
      const bidPrice = 101;
      try {
        await auctionInstance.bid(bidPrice, { from: accounts[1] });
      } catch (e) {
        assert(e.reason === 'Price must greater than current price and minimum step', 'The revert error is: ' + e.reason);
      }
    });

    it('Bidders can bid when state is STARTED and the price greater than the current price + minimum step', async () => {
      const bidPrice = 105;
      await auctionInstance.bid(bidPrice, { from: accounts[2] });

      const currentWinner = await auctionInstance.currentWinner();
      const currentPrice = await auctionInstance.currentPrice();
      const currentBidders = await auctionInstance.bidders(accounts[2]);
      assert.equal(currentWinner, accounts[2], 'The winner is the one with last successful bid');
      assert.equal(currentPrice.toNumber(), bidPrice, 'The current price will be the highest bid price');
      assert.equal(currentBidders.token.toNumber(), tokenForBidder - bidPrice, 'The remain token of bidder should be the total sub the bid price');
      assert.equal(currentBidders.deposit.toNumber(), bidPrice, 'The bidder must deposit the bid price if bid success');
    });
  });

  describe('Should announce work correct', () => {
    it('should not be announce by non-Auctioneer', async () => {
      try {
        await auctionInstance.announce({ from: accounts[1] });
      } catch (e) {
        assert(e.reason === 'Only auctioneer can do this action', 'The revert error is: ' + e.reason);
      }
    });

    it('should be able to announce by auctioneer when state is STARTED', async () => {
      await auctionInstance.announce({ from: accounts[0] });
      let announcementTimes = await auctionInstance.announcementTimes();
      assert.equal(announcementTimes.toNumber(), 1, 'Announcement the fist time');

      await auctionInstance.announce({ from: accounts[0] });
      announcementTimes = await auctionInstance.announcementTimes();
      assert.equal(announcementTimes.toNumber(), 2, 'Announcement the second time');

      await auctionInstance.announce({ from: accounts[0] });
      announcementTimes = await auctionInstance.announcementTimes();
      assert.equal(announcementTimes.toNumber(), 3, 'Announcement the third time');

      await auctionInstance.announce({ from: accounts[0] });
      const state = await auctionInstance.state();
      assert.equal(state.toNumber(), STATE.CLOSING, 'The state should be closing after announce 4 times');

      const bidder = await auctionInstance.bidders(accounts[2]);

      assert.equal(bidder.deposit.toNumber(), 0, 'The deposit of the winner must be 0, so he can not withdraw');

      try {
        await auctionInstance.announce({ from: accounts[0] });
      } catch (e) {
        assert(e.reason === 'Current state is not started', 'The revert error is: ' + e.reason);
      }
    });
  });

  describe('Announce from new contract', () => {
    let contract;
    before(async () => {
      contract = await Auction.new(50, 5, { from: accounts[0] });
    });

    it('should not announce when state is not started', async () => {
      try {
        await contract.announce({ from: accounts[0] });
        assert(false, 'Can not anounce when state is not started');
      } catch (e) {
        assert(e.reason === 'Current state is not started');
      }
    });

    it('should started', async () => {
      // Giả sử phần hàm start và register đã test bên trên bằng hàm này.
      await contract.register(accounts[1], 100, { from: accounts[0] });
      await contract.register(accounts[2], 100, { from: accounts[0] });
      await contract.register(accounts[3], 100, { from: accounts[0] });

      await contract.startSession();

      await contract.bid(55, {from: accounts[2]});
      await contract.bid(60, {from: accounts[3]});
    })

    it('should not announce by non-Auctioneer', async () => {
      try {
        await contract.announce({ from: accounts[2] });
        assert(false, 'should not announce by non-Auctioneer');
      } catch (e) {
        assert(e.reason === 'Only auctioneer can do this action');
      }
    });
    it('should announce 4 times by auctioneer', async () => {
      await contract.announce({ from: accounts[0] });
      await contract.announce({ from: accounts[0] });
      await contract.announce({ from: accounts[0] });
      await contract.announce({ from: accounts[0] });

      const status = await contract.state();
      const currentWinner = await contract.currentWinner();
      console.log(status, currentWinner);
      assert.equal(status.toNumber(), STATE.CLOSING);
      assert.equal(currentWinner, accounts[3]);
    });
    it('should not be announce when state changed to Closing', async () => {
      try {
        await contract.announce({ from: accounts[0] });
        assert(false, 'Can not anounce when state is not started');
      } catch (e) {
        assert(e.reason === 'Current state is not started');
      }
    });
  })

  describe('Non-winner bidders should able to getDeposit', () => {
    it('should not allow getDeposit by non-bidder', async () => {
      try {
        await auctionInstance.getDeposit({from: accounts[3]});
      } catch (e) {
        assert(e.reason === "Only get deposit when bidders's deposit greater than 0", 'The revert error is: ' + e.reason);
      }
    });

    it('should not allow getDeposit by winner', async () => {
      try {
        await auctionInstance.getDeposit({from: accounts[2]});
      } catch (e) {
        assert(e.reason === "Only get deposit when bidders's deposit greater than 0", 'The revert error is: ' + e.reason);
      }
    });

    it('should allow getDeposit by non-winner bidders when state is closing', async () => {
      await auctionInstance.getDeposit({from: accounts[1]});
      const bidder = await auctionInstance.bidders(accounts[1]);
      assert.equal(bidder.deposit.toNumber(), 0, 'The deposit of withdrawed account should be 0');

      const state = await auctionInstance.state();
      assert.equal(state.toNumber(), STATE.CLOSED, 'The state after withdraw all deposit token must be CLOSED');
    });

    it('should not allow get Deposit when state is not closing', async () => {
      try {
        await auctionInstance.getDeposit({from: accounts[1]});
      } catch (e) {
        assert(e.reason === "Current state is not closing", 'The revert error is: ' + e.reason);
      }
    });
  });

  //accounts[0] is the default account
  //Test case 1


  // //Sample Test Case
  // it("Should set bidders", function() {
  //   return auctionInstance.register({from:accounts[1]}).then(function(result) {
  //       return auctionInstance.getPersonDetails(0);
  //   }).then(function(result) {
  //     assert.equal(result[2], accounts[1], 'bidder address set');
  //   })
  // });
  //
  // //Test Case for checking if the bid is more than the token amount
  // it("Should NOT allow to bid more than remaining tokens", function() {
  //   /**********
  //   TASK 1:   Call bid method from accounts[1] of Auction.sol using auctionInstance and
  //   pass itemId=0, count=6 as arguments
  //   HINT:     To make a function call from account 1 use {from: accounts[1]} as an extra argument
  //   ***********/
  //   return auctionInstance.bid(0, 6, {from: accounts[1]})
  //     .then(function (result) {
  //       /*
  //       We are testing for a negative condition and hence this particular block will not have executed if our test case was correct. If this part is executed then we throw an error and catch the error to assert false
  //       */
  //       throw("Failed to check remaining tokens less than count");
  //     }).catch(function (e) {
  //       var a = e.toString();
  //       if(e === "Failed to check remaining tokens less than count") {
  //         /**********
  //         TASK 2: This is the error which we had thrown. Should you assert true or false?
  //         HINT:   Use assert(false) to assert false
  //                 Use assert(true) to assert true
  //         ***********/
  //         /*<CODE HERE>*/
  //         assert(false);
  //       } else {
  //         /**********
  //         TASK 3: assert the opposite here
  //         ***********/
  //         /*<CODE HERE>*/
  //         assert(true);
  //       }
  //     })
  // });
  //
  // // Modifier Checking
  // it("Should NOT allow non owner to reveal winners", function() {
  //   /**********
  //   TASK 4: Call revealWinners from account 1
  //   ***********/
  //    return auctionInstance.revealWinners({ from: accounts[1] })
  //      .then(function (instance) {
  //        /*
  //        We are testing for a negative condition and hence this particular block will not have executed if our test case was correct. If this part is executed then we throw an error and catch the error to assert false
  //        */
  //        throw("Failed to check owner in reveal winners");
  //      }).catch(function (e) {
  //        if(e === "Failed to check owner in reveal winners") {
  //          /**********
  //          TASK 5: This is the error which we had thrown. Should you assert true or false?
  //          HINT:   Use assert(false) to assert false
  //                  Use assert(true) to assert true
  //          ***********/
  //          /*<CODE HERE>*/
  //          assert(false);
  //        } else {
  //          /**********
  //          TASK 6: assert the opposite here
  //          ***********/
  //          /*<CODE HERE>*/
  //          assert(true);
  //        }
  //      })
  //  })
  // //
  // //
  // it("Should set winners", function() {
  //   /**********
  //   TASK 7: Call register function from account 2
  //   ***********/
  //   return auctionInstance.register({ from: accounts[2] })/*<CODE HERE>*/
  //   .then(function(result) {
  //     /**********
  //     TASK 8: Call register function from account 3
  //     ***********/
  //       return auctionInstance.register({ from: accounts[3] })
  //   }).then(function() {
  //     /**********
  //     TASK 9: Call register function from account 4
  //     ***********/
  //         return auctionInstance.register({ from: accounts[4] })
  //   }).then(function() {
  //     /**********
  //     TASK 10: Call bid method from accounts[2] of Auction.sol using auctionInstance and
  //     pass itemId=0, count=5 as arguments
  //     ***********/
  //       return auctionInstance.bid(0, 5, { from: accounts[2] });
  //   }).then(function() {
  //     /**********
  //     TASK 11: Call bid method from accounts[3] of Auction.sol using auctionInstance and
  //     pass itemId=1, count=5 as arguments
  //     ***********/
  //       return auctionInstance.bid(1, 5, { from: accounts[3] });
  //   }).then(function() {
  //     /**********
  //     TASK 12: Call bid method from accounts[4] of Auction.sol using auctionInstance and
  //     pass itemId=2, count=5 as arguments
  //     ***********/
  //       return auctionInstance.bid(2, 5, { from: accounts[4] });
  //   }).then(function() {
  //     /**********
  //     TASK 13: Call revealWinners function from accounts[0]
  //     ***********/
  //       return auctionInstance.revealWinners({ from: accounts[0] })
  //   }).then(function() {
  //     /**********
  //     TASK 14: call winners function from accounts[0] to get the winner of item id 0
  //     ***********/
  //       return auctionInstance.winners[0];
  //   }).then(function(result) {
  //     /**********
  //     TASK 15:  assert to see if the winner address is not the default address
  //     HINT:     Default address is '0x0000000000000000000000000000000000000000'
  //               Use notEqual method of assert
  //               Parameters for notEqual : (result, default address , message);
  //     ***********/
  //     /*<CODE HERE>*/
  //       assert.notEqual(result, '0x0000000000000000000000000000000000000000', 'The winner 0 should not be default address')
  //
  //     /**********
  //     TASK 16: call winners function from accounts[0] to get the winner of item id 1
  //     ***********/
  //         return auctionInstance.winners[1];
  //   }).then(function(result) {
  //     /**********
  //     TASK 17:  assert to see if the winner address is not the default address
  //     HINT:     Default address is '0x0000000000000000000000000000000000000000'
  //               Use notEqual method of assert
  //               Parameters for notEqual : (result, default address , message);
  //     ***********/
  //     /*<CODE HERE>*/
  //         assert.notEqual(result, '0x0000000000000000000000000000000000000000', 'The winner 1 should not be default address')
  //     /**********
  //     TASK 18: Call winners function from account 3 to get the winner of item id 2
  //     ***********/
  //         return auctionInstance.winners[2];
  //   }).then(function(result) {
  //     /**********
  //     TASK 19:  assert to see if the winner address is not the default address
  //     HINT:     Default address is '0x0000000000000000000000000000000000000000'
  //               Use notEqual method of assert
  //               Parameters for notEqual : (result, default address , message);
  //     ***********/
  //     /*<CODE HERE>*/
  //         assert.notEqual(result, '0x0000000000000000000000000000000000000000', 'The winner 2 should not be default address')
  //   })
  // });
});