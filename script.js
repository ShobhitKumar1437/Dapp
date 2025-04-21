let web3;
          let contract;
      
          const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";
          const abi =[
			{
				"inputs": [],
				"stateMutability": "nonpayable",
				"type": "constructor"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "voter",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "party",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "string",
						"name": "documentId",
						"type": "string"
					}
				],
				"name": "VoteCasted",
				"type": "event"
			},
			{
				"inputs": [],
				"name": "admin",
				"outputs": [
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "endVoting",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "getResults",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "user",
						"type": "address"
					}
				],
				"name": "hasVoted",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "",
						"type": "string"
					}
				],
				"name": "idUsed",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "documentId",
						"type": "string"
					}
				],
				"name": "isIDUsed",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "partyAVotes",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "partyBVotes",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "startVoting",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "documentId",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "party",
						"type": "uint256"
					}
				],
				"name": "vote",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					}
				],
				"name": "voters",
				"outputs": [
					{
						"internalType": "bool",
						"name": "voted",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "vote",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "votingEnded",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "votingStarted",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
				"type": "function"
			}
		];


		async function initWeb3() {
			if (window.ethereum) {
			  web3 = new Web3(window.ethereum);
			  await window.ethereum.request({ method: "eth_requestAccounts" }); // fixed extra space
			  contract = new web3.eth.Contract(abi, contractAddress);
			  fetchVoteCounts();
			  listenForVotes();
			  loadPastVotes();
			} else {
			  alert("Please install MetaMask!");
			}
		  }
		
		  async function voteForParty(party) {
			const documentId = document.getElementById("documentId").value.trim();
			const errorDiv = document.getElementById("error");
		
			if (!documentId) {
			  errorDiv.textContent = "❌ Document ID is required.";
			  return;
			}
		
			const accounts = await web3.eth.getAccounts();
			try {
			  await contract.methods.vote(documentId, party).send({ from: accounts[0] });
			  
			  errorDiv.textContent = "";
			} catch (error) {
			  errorDiv.textContent = "❌ Transaction failed. Check console for details.";
			  console.error(error);
			}
		  }
		
		  function getPartyName(party) {
			return party == 0 ? "Party A" : "Party B";
		  }
		
		  function addVoteToHistory(voter, party) {
			const row = document.createElement("tr");
			row.innerHTML = `<td>${voter}</td><td>${getPartyName(party)}</td>`;
			document.getElementById("txBody").prepend(row);
		  }
		
		  function listenForVotes() {
			contract.events.VoteCasted({}, (error, event) => {
			  if (!error && event) {
				const { voter, party } = event.returnValues;
				addVoteToHistory(voter, party);
				fetchVoteCounts();
			  } else {
				console.error("❌ Error in VoteCasted event:", error);
			  }
			});
		  }
		
		  async function fetchVoteCounts() {
			try {
			  const partyACount = await contract.methods.partyAVotes().call();
			  const partyBCount = await contract.methods.partyBVotes().call();
			  console.log(`📊 Current Vote Count - Party A: ${partyACount}, Party B: ${partyBCount}`);
		
			  document.getElementById("partyAButton").textContent = `✅ Vote for Party A (${partyACount})`;
			  document.getElementById("partyBButton").textContent = `✅ Vote for Party B (${partyBCount})`;
			} catch (err) {
			  console.error("❌ Error fetching vote counts:", err.message);
			}
		  }
		
		  async function loadPastVotes() {
			try {
			  const events = await contract.getPastEvents("VoteCasted", {
				fromBlock: 0,
				toBlock: "latest",
			  });
		
			  if (events.length === 0) {
				document.getElementById("txBody").innerHTML =
				  `<tr><td colspan="2" class="text-center text-warning">No votes yet.</td></tr>`;
			  } else {
				events.reverse().forEach((e) => {
				  const { voter, party } = e.returnValues;
				  addVoteToHistory(voter, party);
				});
			  }
			} catch (err) {
			  console.error("❌ Error loading past votes:", err.message);
			}
		  }
		
		  async function fetchCryptoPrices() {
			try {
			  const btcRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
			  const ethRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
		
			  const btc = await btcRes.json();
			  const eth = await ethRes.json();
		
			  document.getElementById("btc").textContent = `BTC: $${btc.bitcoin.usd}`;
			  document.getElementById("eth").textContent = `ETH: $${eth.ethereum.usd}`;
			} catch (err) {
			  document.getElementById("btc").textContent = "BTC: Error";
			  document.getElementById("eth").textContent = "ETH: Error";
			  console.error("❌ Error fetching crypto prices:", err.message);
			}
		  }
		
		  // Initialize everything
		  initWeb3();
		  fetchCryptoPrices();
		  setInterval(fetchCryptoPrices, 10000);