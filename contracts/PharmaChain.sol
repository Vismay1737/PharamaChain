// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PharmaChainRegistry
 * @dev Immutable ledger for drug batch registration, provenance tracking, and AI anomaly auditing.
 */
contract PharmaChainRegistry {
    address public owner;

    enum BatchStatus { Active, Flagged, Verified, Recalled }

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

    struct TransferEvent {
        string batchId;
        address from;
        address to;
        string location;
        uint256 timestamp;
        string notes;
    }

    struct AnomalyEvent {
        string batchId;
        string anomalyType;
        string severity;
        uint256 timestamp;
        string geminiAnalysis;
        address reportedBy;
    }

    mapping(string => DrugBatch) public batches;
    mapping(string => TransferEvent[]) public batchTransfers;
    mapping(string => AnomalyEvent[]) public batchAnomalies;
    
    mapping(address => bool) public authorizedManufacturers;
    mapping(address => bool) public authorizedInspectors;

    event BatchRegistered(string batchId, string drugName, address manufacturer, uint256 timestamp);
    event BatchTransferred(string batchId, address from, address to, uint256 timestamp);
    event AnomalyFlagged(string batchId, string anomalyType, string severity, uint256 timestamp);
    event BatchRecalled(string batchId, address recalledBy, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier onlyAuthorizedManufacturer() {
        require(authorizedManufacturers[msg.sender] || msg.sender == owner, "Unauthorized manufacturer");
        _;
    }

    modifier onlyAuthorizedInspector() {
        require(authorizedInspectors[msg.sender] || msg.sender == owner, "Unauthorized inspector");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedManufacturers[msg.sender] = true;
        authorizedInspectors[msg.sender] = true;
    }

    function authorizeManufacturer(address _manufacturer) public onlyOwner {
        authorizedManufacturers[_manufacturer] = true;
    }

    function authorizeInspector(address _inspector) public onlyOwner {
        authorizedInspectors[_inspector] = true;
    }

    function registerBatch(string memory _batchId, string memory _drugName, string memory _manufacturer) public onlyAuthorizedManufacturer {
        require(!batches[_batchId].isActive, "Batch already registered");

        batches[_batchId] = DrugBatch({
            batchId: _batchId,
            drugName: _drugName,
            manufacturer: _manufacturer,
            registrationTime: block.timestamp,
            currentHolder: msg.sender,
            status: BatchStatus.Active,
            anomalyCount: 0,
            isActive: true
        });

        emit BatchRegistered(_batchId, _drugName, msg.sender, block.timestamp);
    }

    function transferBatch(string memory _batchId, address _newHolder, string memory _location, string memory _notes) public {
        require(batches[_batchId].isActive, "Batch not found or inactive");
        require(batches[_batchId].currentHolder == msg.sender, "Caller is not current holder");

        address prevHolder = batches[_batchId].currentHolder;
        batches[_batchId].currentHolder = _newHolder;

        batchTransfers[_batchId].push(TransferEvent({
            batchId: _batchId,
            from: prevHolder,
            to: _newHolder,
            location: _location,
            timestamp: block.timestamp,
            notes: _notes
        }));

        emit BatchTransferred(_batchId, prevHolder, _newHolder, block.timestamp);
    }

    function flagAnomaly(string memory _batchId, string memory _anomalyType, string memory _severity, string memory _geminiAnalysis) public onlyAuthorizedInspector {
        require(batches[_batchId].isActive, "Batch not found");

        batches[_batchId].status = BatchStatus.Flagged;
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

    function verifyBatch(string memory _batchId) public onlyAuthorizedInspector {
        require(batches[_batchId].isActive, "Batch not found");
        batches[_batchId].status = BatchStatus.Verified;
    }

    function recallBatch(string memory _batchId) public onlyOwner {
        require(batches[_batchId].isActive, "Batch not found");
        batches[_batchId].status = BatchStatus.Recalled;
        batches[_batchId].isActive = false; // Stop further movements
        emit BatchRecalled(_batchId, msg.sender, block.timestamp);
    }

    function getBatchHistory(string memory _batchId) public view returns (TransferEvent[] memory) {
        return batchTransfers[_batchId];
    }

    function getBatchAnomalies(string memory _batchId) public view returns (AnomalyEvent[] memory) {
        return batchAnomalies[_batchId];
    }

    function verifyAuthenticity(string memory _batchId) public view returns (bool, string memory) {
        if (!batches[_batchId].isActive && batches[_batchId].status != BatchStatus.Recalled) {
            return (false, "Batch not registered");
        }
        if (batches[_batchId].status == BatchStatus.Recalled) {
            return (false, "Batch RECALLED");
        }
        if (batches[_batchId].status == BatchStatus.Flagged) {
            return (true, "Batch FLAGGED for investigation");
        }
        return (true, "Authentic");
    }
}
