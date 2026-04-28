// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PharmaChainRegistry {
    enum BatchStatus { ACTIVE, IN_TRANSIT, DELIVERED, FLAGGED, RECALLED }

    struct AnomalyEvent {
        string batchId;
        string anomalyType;
        string severity;
        uint256 timestamp;
        string geminiAnalysis;
        address reportedBy;
    }

    struct TransferEvent {
        string batchId;
        address from;
        address to;
        string location;
        uint256 timestamp;
        string notes;
    }

    struct DrugBatch {
        string batchId;
        string drugName;
        string manufacturer;
        uint256 registrationTime;
        address currentHolder;
        BatchStatus status;
        uint256 anomalyCount;
        bool isActive;
    }

    mapping(string => DrugBatch) public batches;
    mapping(string => AnomalyEvent[]) public batchAnomalies;
    mapping(string => TransferEvent[]) public batchTransfers;

    address public owner;
    mapping(address => bool) public authorizedManufacturers;
    mapping(address => bool) public authorizedInspectors;

    event BatchRegistered(string batchId, string drugName, address manufacturer, uint256 timestamp);
    event BatchTransferred(string batchId, address from, address to, uint256 timestamp);
    event AnomalyFlagged(string batchId, string anomalyType, string severity, uint256 timestamp);
    event BatchRecalled(string batchId, address recalledBy, uint256 timestamp);

    constructor() {
        owner = msg.sender;
        authorizedManufacturers[msg.sender] = true;
    }

    modifier onlyAuthorizedManufacturer() {
        require(authorizedManufacturers[msg.sender], "Not authorized manufacturer");
        _;
    }

    function authorizeManufacturer(address _manufacturer) public {
        require(msg.sender == owner, "Only owner");
        authorizedManufacturers[_manufacturer] = true;
    }

    function registerBatch(string memory _batchId, string memory _drugName, string memory _manufacturer) public onlyAuthorizedManufacturer {
        require(!batches[_batchId].isActive, "Batch already exists");

        batches[_batchId] = DrugBatch({
            batchId: _batchId,
            drugName: _drugName,
            manufacturer: _manufacturer,
            registrationTime: block.timestamp,
            currentHolder: msg.sender,
            status: BatchStatus.ACTIVE,
            anomalyCount: 0,
            isActive: true
        });

        emit BatchRegistered(_batchId, _drugName, msg.sender, block.timestamp);
    }

    function transferBatch(string memory _batchId, address _newHolder, string memory _location, string memory _notes) public {
        require(batches[_batchId].isActive, "Batch does not exist");
        require(batches[_batchId].currentHolder == msg.sender, "Only current holder can transfer");

        batches[_batchId].currentHolder = _newHolder;
        batches[_batchId].status = BatchStatus.IN_TRANSIT;

        batchTransfers[_batchId].push(TransferEvent({
            batchId: _batchId,
            from: msg.sender,
            to: _newHolder,
            location: _location,
            timestamp: block.timestamp,
            notes: _notes
        }));

        emit BatchTransferred(_batchId, msg.sender, _newHolder, block.timestamp);
    }

    function flagAnomaly(string memory _batchId, string memory _anomalyType, string memory _severity, string memory _geminiAnalysis) public {
        require(batches[_batchId].isActive, "Batch does not exist");

        batches[_batchId].status = BatchStatus.FLAGGED;
        batches[_batchId].anomalyCount++;

        batchAnomalies[_batchId].push(AnomalyEvent({
            batchId: _batchId,
            anomalyType: _anomalyType,
            severity: _severity,
            timestamp: block.timestamp,
            geminiAnalysis: _geminiAnalysis,
            reportedBy: msg.sender
        }));

        emit AnomalyFlagged(_batchId, _anomalyType, _severity, block.timestamp);
    }

    function recallBatch(string memory _batchId) public onlyAuthorizedManufacturer {
        require(batches[_batchId].isActive, "Batch does not exist");
        batches[_batchId].status = BatchStatus.RECALLED;
        batches[_batchId].isActive = false;

        emit BatchRecalled(_batchId, msg.sender, block.timestamp);
    }

    function verifyBatch(string memory _batchId) public {
        require(batches[_batchId].isActive, "Batch does not exist");
        batches[_batchId].status = BatchStatus.ACTIVE;
    }

    function getBatchHistory(string memory _batchId) public view returns (TransferEvent[] memory) {
        return batchTransfers[_batchId];
    }

    function getBatchAnomalies(string memory _batchId) public view returns (AnomalyEvent[] memory) {
        return batchAnomalies[_batchId];
    }

    function verifyAuthenticity(string memory _batchId) public view returns (bool, string memory) {
        if (!batches[_batchId].isActive) return (false, "Batch not found or inactive");
        return (true, batches[_batchId].drugName);
    }
}
