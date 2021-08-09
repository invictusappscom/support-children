var SupportChildrenCollectable = artifacts.require("./SupportChildrenCollectable.sol");
var SupportChildren = artifacts.require("./SupportChildren.sol");

module.exports = function(deployer) {
  deployer.deploy(SupportChildrenCollectable);
  deployer.deploy(SupportChildren);
};
