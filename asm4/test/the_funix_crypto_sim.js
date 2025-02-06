let TheFunixCryptoSim = artifacts.require("./TheFunixCryptoSim.sol");

let contractInstance;

function assertSimAttributeMatch(attr, expected) {
  assert.equal(attr.body, expected.body, `Body should be ${expected.body}`);
  assert.equal(attr.eye, expected.eye, `Eye should be ${expected.eye}`);
  assert.equal(attr.hairstyle, expected.hairstyle, `Hairstyle should be ${expected.hairstyle}`);
  assert.equal(attr.outfit, expected.outfit, `Outfit should be ${expected.outfit}`);
  assert.equal(attr.accessory, expected.accessory, `Accessory should be ${expected.accessory}`);
  assert.equal(attr.hiddenGenes, expected.hiddenGenes, `HiddenGenes should be ${expected.hiddenGenes}`);
  assert.equal(attr.generation, expected.generation, `Generation should be ${expected.generation}`);
}

contract('TheFunixCryptoSim', function (accounts) {
  describe('Contract information', () => {
    it("Contract deployment", function() {
      //Fetching the contract instance of our smart contract
      return TheFunixCryptoSim.deployed().then(function (instance) {
        //We save the instance in a gDlobal variable and all smart contract functions are called using this
        contractInstance = instance;
        assert(contractInstance !== undefined, 'The contract should be defined');
      });
    });

    it('should contract symbol correct', async () => {
      const symbol = await contractInstance.symbol();
      assert.equal(symbol, 'FCS', 'The contract symbol must be FCS');
    });

    it('should contract name correct', async () => {
      const name = await contractInstance.name();
      assert.equal(name, 'TheFunixCryptoSims', 'The contract name must be TheFunixCryptoSims');
    });

    // it('Initial rule with corrected startingPrice and minimumStep', function() {
    //   //Fetching the rule of Auction
    //   return auctionInstance.rule().then(function(rule) {
    //     //We save the instance in a global variable and all smart contract functions are called using this
    //     assert(rule !== undefined, 'Rule should be defined');
    //     assert.equal(rule.startingPrice, 50, 'Starting price should be 50');
    //     assert.equal(rule.minimumStep, 5, 'Minimum step should be 5');
    //   });
    // });
  });

  describe('Test the initial genesis info', () => {
    it('Should first sim information correct', async () => {
      const firstSimId = 0;
      try {
        await contractInstance.sims(firstSimId);
      } catch (e) {
        assert(false, 'Fetch the first sim failed: ' + e.message);
      }


      const firstSimAttribute = await contractInstance.showSimAttribute(firstSimId);
      assertSimAttributeMatch(firstSimAttribute, {
        body: 0,
        eye: 0,
        hairstyle: 0,
        outfit: 0,
        accessory: 0,
        hiddenGenes: 0,
        generation: 0,
      })
    });

    it('Should second sim information correct', async () => {
      const secondSim = await contractInstance.sims(1);
      assert(secondSim !== undefined, 'The second sim must be defined');

      const secondSimAttribute = await contractInstance.showSimAttribute(1);
      assertSimAttributeMatch(secondSimAttribute, {
        body: 3,
        eye: 7,
        hairstyle: 127,
        outfit: 31,
        accessory: 31,
        hiddenGenes: 0,
        generation: 0,
      });
    });
  });

  describe('Test create sim', () => {
    it('should hidden genes of new sim correct when hidden gene of matron and sire equals', async () => {
      await contractInstance.breedSim(0, 1, {from: accounts[2]});
      await contractInstance.breedSim(1, 0, {from: accounts[2]});
      await contractInstance.breedSim(2, 3, {from: accounts[2]});
      const newSim1Attribute = await contractInstance.showSimAttribute(2);

      assertSimAttributeMatch(newSim1Attribute, {
        body: 2, // (bm + bs + 3) % 4 = (0 + 3 + 3) % 4 = 2
        eye: 7, // hidden gene == 3, => eye = (em + es) % 8 = (0 + 7) % 8 = 7
        hairstyle: 127, // hidden gene == 3 => h = hs = 127
        outfit: 31, // (om + os) % 32 = (0 + 31) % 32 = 31
        accessory: 30, // (am + as + 31) % 32 = (0 + 31 + 31) % 32 = 30
        hiddenGenes: 3, // (0 * 0 + 3) % 4 = 3
        generation: 1, // max(0, 0) + 1
      });

      const newSim2Attribute = await contractInstance.showSimAttribute(3);
      assertSimAttributeMatch(newSim2Attribute, {
        body: 2,
        eye: 7, // x
        hairstyle: 0,  // hidden gene == 3 => h = hs = 0
        outfit: 31,
        accessory: 30,
        hiddenGenes: 3,
        generation: 1,
      });
      //
      const f2SimAttribute = await contractInstance.showSimAttribute(4);
      assertSimAttributeMatch(f2SimAttribute, {
        body: 3, // (2 + 2 + 3) % 4 = 3
        eye: 7, // x == 0 => e = es = 7
        hairstyle: 127,  // x == 0 => h = hm = 127
        outfit: 31, // x == 0 => o = (om + os + 1) % 32 = (31 + 31 + 1) % 32 = 31
        accessory: 28, // x == 0 => a = (am + as) % 32 = (30 + 30) % 32 = 28
        hiddenGenes: 0, // (3 * 3 + 3) % 4 = 0
        generation: 2,
      });
    });

    it('should hidden genes of new sim correct when hidden gene of matron and sire are difference', async () => {
      // Hidden gene 0 & hidden gene 3 -> select 3
      await contractInstance.breedSim(1, 2, {from: accounts[2]});
      // Hidden gene 3 & 0 -> select 3
      await contractInstance.breedSim(5, 0, {from: accounts[2]});

      const matron5Attribute = await contractInstance.showSimAttribute(1);
      const sire5Attribute = await contractInstance.showSimAttribute(2);
      const newSim5Attribute = await contractInstance.showSimAttribute(5);
      // Expect 3
      const hiddenGene = Math.max(matron5Attribute.hiddenGenes, sire5Attribute.hiddenGenes);
      const expected = {
        body: (Number(matron5Attribute.body) + Number(sire5Attribute.body) + 3) % 4,
        eye: (Number(matron5Attribute.eye) + Number(sire5Attribute.eye)) % 8, // x == 0 => e = es = 7
        hairstyle: Number(sire5Attribute.hairstyle),  // x == 0 => h = hm = 127
        outfit: (Number(matron5Attribute.outfit) + Number(sire5Attribute.outfit)) % 32, // x == 0 => o = (om + os + 1) % 32 = (31 + 31 + 1) % 32 = 31
        accessory: (Number(matron5Attribute.accessory) + Number(sire5Attribute.accessory) + 31) % 32, // x == 0 => a = (am + as) % 32 = (30 + 30) % 32 = 28
        hiddenGenes: hiddenGene,
        generation: 2,
      };
      assertSimAttributeMatch(newSim5Attribute, expected);

      const matron6Attribute = await contractInstance.showSimAttribute(5);
      const sire6Attribute = await contractInstance.showSimAttribute(0);
      const newSim6Attribute = await contractInstance.showSimAttribute(6);
      // Expect 3
      const hiddenGene6 = Math.max(matron6Attribute.hiddenGenes, sire6Attribute.hiddenGenes);
      const expected6 = {
        body: (Number(matron6Attribute.body) + Number(sire6Attribute.body) + 3) % 4,
        eye: (Number(matron6Attribute.eye) + Number(sire6Attribute.eye)) % 8, // x == 0 => e = es = 7
        hairstyle: Number(sire6Attribute.hairstyle),  // x == 0 => h = hm = 127
        outfit: (Number(matron6Attribute.outfit) + Number(sire6Attribute.outfit)) % 32, // x == 0 => o = (om + os + 1) % 32 = (31 + 31 + 1) % 32 = 31
        accessory: (Number(matron6Attribute.accessory) + Number(sire6Attribute.accessory) + 31) % 32, // x == 0 => a = (am + as) % 32 = (30 + 30) % 32 = 28
        hiddenGenes: hiddenGene6,
        generation: 3,
      };
      assertSimAttributeMatch(newSim6Attribute, expected6)
    });

    // TODO: The algorithm will not take more hidden gen value than 0 and 3, because when matron and sire has hidden gene 0, sim will has hidden gene is 3, when matron and sire is 3, sim is 0, if matron and sire is 0, and 3, select max value is 3. The value 1 and 2 will never appear
  });
});
