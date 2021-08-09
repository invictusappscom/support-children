const truffleConfig = require("../truffle-config");
var SupportChildrenCollectable = artifacts.require("./SupportChildrenCollectible.sol");
var SupportChildren = artifacts.require("./SupportChildren.sol");

module.exports = function(deployer) {
  deployer.deploy(
    SupportChildrenCollectable,
    truffleConfig.environments.forked.VRFCoordinator,
    truffleConfig.environments.forked.LinkToken,
    truffleConfig.environments.forked.KeyHash,
    truffleConfig.environments.forked.Fee
  );
  deployer.deploy(SupportChildren);
};
