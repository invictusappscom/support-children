var SupportChildrenCollectable = artifacts.require("./SupportChildrenCollectable.sol");
var SupportChildren = artifacts.require("./SupportChildren.sol");

module.exports = function(deployer) {
<<<<<<< HEAD
  // deployer.deploy(
  //   SupportChildrenCollectable,
  //   truffleConfig.environments.forked.VRFCoordinator,
  //   truffleConfig.environments.forked.LinkToken,
  //   truffleConfig.environments.forked.KeyHash,
  //   truffleConfig.environments.forked.Fee
  // );
=======
  deployer.deploy(SupportChildrenCollectable);
>>>>>>> a8cdeb530f6cbc21dd2233c62feda4faf286be9e
  deployer.deploy(SupportChildren);
};
