var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var SupportChildren = artifacts.require("./SupportChildren.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(SupportChildren);
};
