// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

contract MyContact{
    string private name;
    string private mobile;

    event NAME_CHANGED(string oldName, string newName);
    event USER_DETAILS_CHANGED(string oldName, string oldMobile, string newName, string newMobile);

    constructor(string memory _name, string memory _mobile) {
        name = _name;
        mobile = _mobile;
    }

    function setName(string memory _name) public {
        string memory oldName = name;
        name = _name;
        emit NAME_CHANGED(oldName, _name);
    }

    function setUserDetails(string memory _name, string memory _mobile) public {
        string memory oldName = name;
        string memory oldMobile = mobile;
        name = _name;
        mobile = _mobile;
        emit USER_DETAILS_CHANGED(oldName, oldMobile, _name, _mobile);
    }
    
    function getName() public view returns (string memory) {
        return name;
    }

    function getMobile() public view returns (string memory) {
        return mobile;
    }

    function getUserDetails() public view returns (string memory, string memory) {
        return (name, mobile);
    }
}
