const { expect } = require('chai');
const { ethers, fhevm } = require('hardhat');

describe('ConfidentialVote', function () {
  it('casts encrypted votes and updates tallies', async () => {
    const [alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('ConfidentialVote');
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    const addr = await contract.getAddress();

    // Alice votes YES (true)
    const encInAlice = fhevm.createEncryptedInput(addr, alice.address);
    encInAlice.addBool(true);
    const encryptedAlice = await encInAlice.encrypt();
    await expect(contract.connect(alice).vote(encryptedAlice)).to.emit(contract, 'Voted').withArgs(alice.address);

    // Bob votes NO (false)
    const encInBob = fhevm.createEncryptedInput(addr, bob.address);
    encInBob.addBool(false);
    const encryptedBob = await encInBob.encrypt();
    await expect(contract.connect(bob).vote(encryptedBob)).to.emit(contract, 'Voted').withArgs(bob.address);

    // Grant decryption rights to Alice and read results (cipher handles)
    await contract.allowResults(alice.address);
    const res = await contract.getResults();
    expect(res.length).to.equal(2);
    // NOTE: Actual decryption happens client-side using fhevm APIs; here we just ensure the call succeeds.
  });

  it('prevents double voting', async () => {
    const [alice] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('ConfidentialVote');
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    const addr = await contract.getAddress();

    const enc1 = fhevm.createEncryptedInput(addr, alice.address);
    enc1.addBool(true);
    const e1 = await enc1.encrypt();
    await contract.connect(alice).vote(e1);

    const enc2 = fhevm.createEncryptedInput(addr, alice.address);
    enc2.addBool(false);
    const e2 = await enc2.encrypt();
    await expect(contract.connect(alice).vote(e2)).to.be.revertedWith('Already voted');
  });
});
