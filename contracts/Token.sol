pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(uint256 initialBalance) public ERC20("Reef", "REEF") {
        _mint(msg.sender, initialBalance);
    }
}

contract LotrToken is ERC20 {
    constructor(
        uint256 initialBalance
    ) public ERC20("lord of the rings", "LOTR") {
        _mint(msg.sender, initialBalance);
    }
}

contract SwToken is ERC20 {
    constructor(uint256 initialBalance) public ERC20("Swar wars", "SW") {
        _mint(msg.sender, initialBalance);
    }
}

contract Dolphin is ERC20 {
    constructor(uint256 initialBalance) ERC20("Dolphin", "DOLPHIN") {
        _mint(msg.sender, initialBalance);
    }
}

contract Shark is ERC20 {
    constructor(uint256 initialBalance) ERC20("Shark", "SHARK") {
        _mint(msg.sender, initialBalance);
    }
}

contract Jellyfish is ERC20 {
    constructor(uint256 initialBalance) ERC20("Jellyfish", "JELLY") {
        _mint(msg.sender, initialBalance);
    }
}

contract Turtle is ERC20 {
    constructor(uint256 initialBalance) ERC20("Turtle", "TURTLE") {
        _mint(msg.sender, initialBalance);
    }
}

contract FreeMint is ERC20 {
    constructor(uint256 initialBalance) ERC20("Free mint", "FREE") {
        _mint(msg.sender, initialBalance);
    }

    function mint(address to, uint256 amount) public {
        require(amount <= 1e32, "FreeMint: Max minting amount is 1e32");
        _mint(to, amount);
    }
}
