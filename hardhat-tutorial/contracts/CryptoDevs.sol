// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    /**
     * @dev _baseTokenURI for computing {tokenURI}.
     * If set, the resulting URI for each token will be the concatenation of the `baseURI` and the `tokenId`.
     */
    string _baseTokenURI;

    // _price is the price of one CryptoDev NFT
    uint256 public _price = 0.01 ether;

    //_paused is used to pause the contract in case of emergency
    bool public _paused;

    // max number of CryptoDevs
    uint256 public maxTokenIds = 20;

    // total number of tokenIds minted
    uint256 public tokenIds;

    // Whitelist contract instance
    IWhitelist whitelist;

    // boolean to keep track of whether presale has started or not
    bool public presaleStarted;

    // timestamp for when the presale will end
    uint256 public presaleEnded;

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
    }

    /**
     * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
     * name in our case is `CryptoDevs` and symbol is `CD`.
     * Constructor for CryptoDevs takes in the baseURI to set _baseTokenURI for the collection.
     * It also initializes an instance of whitelist inheritance.    
     */
     constructor (string memory baseURI, address whitelistContract) ERC721("CryptoDevs", "CD") {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
     }

    /**
     * @dev startPresale starts a presale for the whitelisted addresses
     */
    function startPresale() public onlyOwner {
        presaleStarted = true;
        // Set the presaleEnded time as current timestamp + 5 minutes
        // Solidity has cool syntax for timestamps (seconds, minutes, hours, days, years)
        presaleEnded = block.timestamp + 5 minutes;
    }

    /**
     * @dev presaleMint allows a user to mint one NFT per transaction during the presale 
     */
    function presaleMint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp < presaleEnded, "Presale is not running");
        require(whitelist.whitelistedAddresses(msg.sender), "You are not whitelisted");
        require(tokenIds < maxTokenIds, "Exceeded max supply");
        require(msg.value >= _price, "Ether value sent is incorrect");
        tokenIds += 1;
        // _safeMint is a safer version of the _mint function as it ensures that
        // if the address being minted to is a contract, then it knows how to deal
        // with ERC721 contracts.
        // If the address being minted to is not a contract, it works the same as _mint.
        _safeMint(msg.sender, tokenIds);
    }

    /**
     * @dev _baseURI overrides OpenZeppelin's ERC721 implementation, which by default
     * returned an empty string for the baseURI.
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
     }

    /**
     * @dev setPaused makes the contract paused or unpaused
     */
    function setPaused(bool val) public onlyOwner {
        _paused = val;
     }

    /**
     * @dev withdraw sends all the ether in the contract
     * to the owner of the contract.
     */
    function withdraw() public onlyOwner {
            address _owner = owner();
            uint256 amount = address(this).balance;
            (bool sent, ) = _owner.call{value: amount}("");
            require(sent, "Failed to send Ether");
      }

    // Function to receive Ether. msg.data msu be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}