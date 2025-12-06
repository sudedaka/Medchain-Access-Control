import json
import hashlib
import datetime
from pathlib import Path

LEDGER_PATH = Path("data/ledger.json")


class Blockchain:
    def __init__(self):
        self.chain = self.load_chain()

    # Load chain from ledger.json
    def load_chain(self):
        if not LEDGER_PATH.exists():
            genesis = [{
                "index": 1,
                "timestamp": str(datetime.datetime.now()),
                "proof": 1,
                "previous_hash": "0",
                "hash": "genesis_hash",
                "data": {"type": "GENESIS"}
            }]
            with open(LEDGER_PATH, "w") as f:
                json.dump(genesis, f, indent=4)
            return genesis

        with open(LEDGER_PATH, "r") as f:
            return json.load(f)

    # Save ledger to JSON
    def save_chain(self):
        with open(LEDGER_PATH, "w") as f:
            json.dump(self.chain, f, indent=4)

    def print_previous_block(self):
        return self.chain[-1]

    # Proof of Work
    def proof_of_work(self, previous_proof):
        new_proof = 1
        while True:
            hash_val = hashlib.sha256(
                str(new_proof**2 - previous_proof**2).encode()
            ).hexdigest()
            if hash_val[:5] == "00000":
                return new_proof
            new_proof += 1

    # Hashing a block
    def hash(self, block):
        return hashlib.sha256(json.dumps(block, sort_keys=True).encode()).hexdigest()

    # Creating a new block
    def create_block(self, proof, previous_hash, data):
        block = {
            "index": len(self.chain) + 1,
            "timestamp": str(datetime.datetime.now()),
            "proof": proof,
            "previous_hash": previous_hash,
            "data": data
        }
        block["hash"] = self.hash(block)

        self.chain.append(block)
        self.save_chain()
        return block

    # Validating entire chain
    def chain_valid(self):
        for i in range(1, len(self.chain)):
            prev = self.chain[i - 1]
            curr = self.chain[i]

            if curr["previous_hash"] != self.hash(prev):
                return False

            prev_proof = prev["proof"]
            proof = curr["proof"]
            hash_check = hashlib.sha256(
                str(proof**2 - prev_proof**2).encode()
            ).hexdigest()

            if hash_check[:5] != "00000":
                return False

        return True
