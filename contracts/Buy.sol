// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Buy{
    address[28] public clients;

    function buy(uint toyID) public payable returns (uint) {
        require(toyID >= 0 && toyID <= 27);

        clients[toyID] = msg.sender;
        
        return toyID;
    }

    function getClients() public view returns (address[28] memory) {
  return clients;
}

}