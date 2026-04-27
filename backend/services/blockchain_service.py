import os
import json
import logging
from web3 import Web3
from eth_account import Account
from flask import current_app

logger = logging.getLogger(__name__)

class BlockchainService:
    def __init__(self, app=None):
        try:
            self.app = app or current_app._get_current_object()
        except RuntimeError:
            # No Flask app context — running outside request (tests, CLI)
            logger.warning("No Flask context. BlockchainService running in offline mode.")
            self.w3 = None
            self.account = None
            self.contract = None
            self.abi = []
            return

        ganache_url = self.app.config.get('GANACHE_URL', 'http://127.0.0.1:7545')
        self.w3 = Web3(Web3.HTTPProvider(ganache_url))
        self.private_key = self.app.config.get('GANACHE_PRIVATE_KEY')
        self.contract_address = self.app.config.get('CONTRACT_ADDRESS')
        
        if self.private_key:
            try:
                self.account = self.w3.eth.account.from_key(self.private_key)
            except Exception:
                self.account = None
                logger.warning("Invalid GANACHE_PRIVATE_KEY.")
        else:
            self.account = None
            logger.warning("GANACHE_PRIVATE_KEY not found. Blockchain transactions will fail.")

        self.abi = self._get_abi()
        self.contract = None

        try:
            if self.contract_address and self.w3.is_connected():
                self.contract = self.w3.eth.contract(address=self.contract_address, abi=self.abi)
            elif self.w3.is_connected():
                logger.info("Contract address missing. Attempting auto-deployment...")
                self._auto_deploy()
        except Exception as e:
            logger.warning(f"Blockchain connection failed: {e}. Running in offline mode.")

    def _get_abi(self):
        # Full ABI for PharmaChainRegistry
        return json.loads("""[
            {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"batchId","type":"string"},{"indexed":false,"internalType":"string","name":"anomalyType","type":"string"},{"indexed":false,"internalType":"string","name":"severity","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"AnomalyFlagged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"batchId","type":"string"},{"indexed":false,"internalType":"address","name":"recalledBy","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"BatchRecalled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"batchId","type":"string"},{"indexed":false,"internalType":"string","name":"drugName","type":"string"},{"indexed":false,"internalType":"address","name":"manufacturer","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"BatchRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"batchId","type":"string"},{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"BatchTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"_inspector","type":"address"}],"name":"authorizeInspector","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_manufacturer","type":"address"}],"name":"authorizeManufacturer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"authorizedInspectors","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"authorizedManufacturers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"batchAnomalies","outputs":[{"internalType":"string","name":"batchId","type":"string"},{"internalType":"string","name":"anomalyType","type":"string"},{"internalType":"string","name":"severity","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"geminiAnalysis","type":"string"},{"internalType":"address","name":"reportedBy","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"batchTransfers","outputs":[{"internalType":"string","name":"batchId","type":"string"},{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"string","name":"location","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"notes","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"batches","outputs":[{"internalType":"string","name":"batchId","type":"string"},{"internalType":"string","name":"drugName","type":"string"},{"internalType":"string","name":"manufacturer","type":"string"},{"internalType":"uint256","name":"registrationTime","type":"uint256"},{"internalType":"address","name":"currentHolder","type":"address"},{"internalType":"enum PharmaChainRegistry.BatchStatus","name":"status","type":"uint8"},{"internalType":"uint256","name":"anomalyCount","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_batchId","type":"string"},{"internalType":"string","name":"_anomalyType","type":"string"},{"internalType":"string","name":"_severity","type":"string"},{"internalType":"string","name":"_geminiAnalysis","type":"string"}],"name":"flagAnomaly","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_batchId","type":"string"}],"name":"getBatchAnomalies","outputs":[{"components":[{"internalType":"string","name":"batchId","type":"string"},{"internalType":"string","name":"anomalyType","type":"string"},{"internalType":"string","name":"severity","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"geminiAnalysis","type":"string"},{"internalType":"address","name":"reportedBy","type":"address"}],"internalType":"struct PharmaChainRegistry.AnomalyEvent[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_batchId","type":"string"}],"name":"getBatchHistory","outputs":[{"components":[{"internalType":"string","name":"batchId","type":"string"},{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"string","name":"location","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"notes","type":"string"}],"internalType":"struct PharmaChainRegistry.TransferEvent[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_batchId","type":"string"}],"name":"recallBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_batchId","type":"string"},{"internalType":"string","name":"_drugName","type":"string"},{"internalType":"string","name":"_manufacturer","type":"string"}],"name":"registerBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_batchId","type":"string"},{"internalType":"address","name":"_newHolder","type":"address"},{"internalType":"string","name":"_location","type":"string"},{"internalType":"string","name":"_notes","type":"string"}],"name":"transferBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_batchId","type":"string"}],"name":"verifyAuthenticity","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_batchId","type":"string"}],"name":"verifyBatch","outputs":[],"stateMutability":"nonpayable","type":"function"}
        ]""")

    def _auto_deploy(self):
        # Simplified auto-deploy for dev mode
        # In a real scenario, we'd use the compiled bytecode
        # Since I cannot compile Solidity here easily without hardhat, I'll log a placeholder note
        logger.warning("Auto-deployment requires Bytecode. Please run 'npx hardhat run scripts/deploy.js --network ganache' and update .env with CONTRACT_ADDRESS.")

    def _send_transaction(self, func, *args):
        if not self.contract or not self.account:
            logger.error("Blockchain integration not correctly initialized.")
            return None
        
        try:
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            txn = func(*args).build_transaction({
                'chainId': 5777,
                'gas': 2000000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': nonce,
            })
            signed_txn = self.w3.eth.account.sign_transaction(txn, private_key=self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            logger.error(f"Blockchain transaction failed: {e}")
            return None

    def register_batch(self, batch_id, drug_name, manufacturer):
        if self.contract is None: return None
        return self._send_transaction(self.contract.functions.registerBatch, batch_id, drug_name, manufacturer)

    def record_anomaly(self, batch_id, anomaly_type, severity, gemini_analysis):
        if self.contract is None: return None
        return self._send_transaction(self.contract.functions.flagAnomaly, batch_id, anomaly_type, severity, gemini_analysis)

    def transfer_batch(self, batch_id, new_holder, location, notes=""):
        if self.contract is None: return None
        return self._send_transaction(self.contract.functions.transferBatch, batch_id, Web3.to_checksum_address(new_holder), location, notes)

    def verify_batch(self, batch_id):
        if self.contract is None: return None
        return self._send_transaction(self.contract.functions.verifyBatch, batch_id)

    def get_batch_history(self, batch_id):
        if not self.contract: return []
        try:
            return self.contract.functions.getBatchHistory(batch_id).call()
        except:
            return []

    def is_connected(self):
        return self.w3.is_connected()

    def load_contract(self, address, abi):
        self.contract = self.w3.eth.contract(address=address, abi=abi)

    def get_batch_info(self, batch_id):
        if not self.contract:
            return "Contract not loaded."
        return {"msg": f"Fetching info for {batch_id} from blockchain..."}

def get_blockchain_service():
    """Factory function — returns a BlockchainService using the current Flask app context."""
    return BlockchainService()
