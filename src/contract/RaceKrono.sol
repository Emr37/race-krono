// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract RaceKrono {
    string public eventName;
    string public sectionName;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    struct Time {
        string doorNumber;
        string finishTime;
    }

    Time[] public times;    

    mapping(address => bool) public registered;

    
    event UserRegistered(address indexed _user);
    event UserTakenTime(address indexed _user, string _doorNumber, string _finishTime);

    function takeTime(string memory _doorNumber, string memory _finishTime) public {
        Time memory time;
        time.doorNumber = _doorNumber;
        time.finishTime = _finishTime;
        times.push(time);

        emit UserTakenTime (owner, _doorNumber, _finishTime);              
    }

    function list() public view returns (Time[] memory) {
        return times;
    }

    function removeTime(uint256 index) public {
        for (uint256 i = index; i < times.length - 1; i++) {
            times[i] = times[i + 1];
        }
        times.pop();
    }

    function register() public {
        require(!isRegistered(), "User has already been registered.");
        registered[owner] = true;
        
        emit UserRegistered(owner);
    }

    function isRegistered() public view returns (bool) {
        return registered[owner];
    }

    function deleteRegistered() public {
        require(isRegistered(), "User is not registered.");
        delete (registered[owner]);
    }
   
}
