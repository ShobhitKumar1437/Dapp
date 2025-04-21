// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    address public admin;
    bool public votingStarted;
    bool public votingEnded;

    struct Voter {
        bool voted;
        uint vote; // 0 or 1 (for Party A or B)
    }

    mapping(address => Voter) public voters;
    mapping(string => bool) public idUsed;

    uint public partyAVotes;
    uint public partyBVotes;

    event VoteCasted(address indexed voter, uint party, string documentId);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function startVoting() public onlyAdmin {
        require(!votingStarted, "Voting already started");
        votingStarted = true;
        votingEnded = false;
    }

    function endVoting() public onlyAdmin {
        require(votingStarted, "Voting not started");
        votingEnded = true;
    }

    function vote(string memory documentId, uint party) public {
        require(votingStarted && !votingEnded, "Voting not active");
        require(!voters[msg.sender].voted, "Already voted");
        require(!idUsed[documentId], "Document ID already used");
        require(party == 0 || party == 1, "Invalid party selection");

        voters[msg.sender] = Voter(true, party);
        idUsed[documentId] = true;

        if (party == 0) {
            partyAVotes++;
        } else {
            partyBVotes++;
        }

        emit VoteCasted(msg.sender, party, documentId);
    }

    function getResults() public view returns (uint, uint) {
        return (partyAVotes, partyBVotes);
    }

    function hasVoted(address user) public view returns (bool) {
        return voters[user].voted;
    }

    function isIDUsed(string memory documentId) public view returns (bool) {
        return idUsed[documentId];
    }
}