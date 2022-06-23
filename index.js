const { ethers } = require("ethers");
const {
  ERC1155MockAddress,
  TokenAddress,
  HolderAddress,
  mockABI,
  tokenABI,
  holderABI,
  MintAccountAddress,
} = require("./constants");

const mintForm = document.querySelector("#mintForm");
const transferForm = document.querySelector("#transferForm");
const connectButton = document.querySelector("#connectButton");
const nftBalanceButton = document.querySelector("#getNFTBalanceButton");
const coinBalanceButton = document.querySelector("#getCoinBalanceButton");

const FROM_ADDRESS_REQUIRED = "Please enter to address";
const TO_ADDRESS_REQUIRED = "Please enter to address";
const SAME_FROM_ADDRESS = "Please enter different to address";
const TOKEN_ID_REQUIRED = "Please enter token id";
const TOKEN_VALUE_REQUIRED = "Please enter token value";
const INVALID_NUMBER = "Please enter number only";
const ACCOUNT_ADDRESS_REQUIRED = "Please enter account address";

(() => {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", accountsChanged);
    window.ethereum.on("chainChanged", chainChanged);
  }
})();

async function accountsChanged(newAccount) {
  try {
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [newAccount.toString(), "latest"],
    });
    console.log(balance);
    setAccount(newAccount.toString());
    setBalance(ethers.utils.formatEther(balance));
    setConnectionStatus("Connected");
  } catch (err) {
    console.error(err);
    showToast(err.message, "error");
  }
}

function chainChanged() {
  showToast("Chain Changed", "info");
  getAccounts();
}

async function getAccounts() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      await accountsChanged(accounts[0]);
      showToast("Connected Account Updated", "info");
    } catch (error) {
      console.log(error);
      showToast(error.message, "error");
    }
  } else {
    showToast("Please install MetaMask", "error");
  }
}

function setAccount(address) {
  document.getElementById("accAddress").innerHTML = address;
}

function setBalance(balance) {
  document.getElementById("accBalance").innerHTML = balance;
}

function setConnectionStatus(status) {
  document.getElementById("connectButton").innerHTML = status;
}

// show a message with a type of the input
function showMessage(input, message, type) {
  // get the small element and set the message
  const msg = input.parentNode.querySelector("small");
  msg.innerText = message;
  // update the class for the input
  input.className = type ? "success" : "error";
  return type;
}

function showError(input, message) {
  return showMessage(input, message, false);
}

function showSuccess(input) {
  return showMessage(input, "", true);
}

function hasValue(input, message) {
  if (input.value.trim() === "") {
    return showError(input, message);
  }
  return showSuccess(input);
}

function validateNumberFields(input, requiredMsg, invalidMsg) {
  // check if the value is not empty
  if (!hasValue(input, requiredMsg)) {
    return false;
  }
  // validate number format
  const numberRegex = /^\d+$/;

  const inputVal = input.value.trim();
  // if (!numberRegex.test(inputVal)) {
  //   return showError(input, invalidMsg);
  // }
  return true;
}

function showToast(toastMsg, toastClass, clickCallback = null) {
  Toastify({
    text: toastMsg,
    duration: 10000,
    //destination: "https://github.com/apvarun/toastify-js",
    newWindow: true,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    className: toastClass,
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
    // offset: {
    //   x: 50, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
    //   y: 10, // vertical axis - can be a number or a string indicating unity. eg: '2em'
    // },
    onClick: function () {
      if (clickCallback) {
        clickCallback();
      }
    }, // Callback after click
  }).showToast();
}

async function mintERC1155({ to, id, value }) {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(ERC1155MockAddress, mockABI, signer);

    try {
      const mintResponse = await contract.mint(to, id, value, []);
      console.log("mintResponse", mintResponse);
      showToast("Mint Transaction under process", "info");
    } catch (error) {
      console.log(error);
      showToast(error.message, "error");
    }
  } else {
    showToast("Please install MetaMask", "error");
  }
}

async function transferERC1155({ from, to, id, value }) {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(ERC1155MockAddress, mockABI, signer);

    try {
      const transferResponse = await contract.safeTransferFrom(
        from,
        to,
        id,
        value,
        []
      );
      console.log("transferResponse", transferResponse);
      showToast("Transfer transaction under processing", "info");
    } catch (error) {
      console.log(error);
      showToast(error.message, "error");
    }
  } else {
    showToast("Please install MetaMask", "error");
  }
}

mintForm.addEventListener("submit", async function (event) {
  // stop form submission
  event.preventDefault();

  const inputs = {
    to: mintForm.elements["to"].value,
    id: mintForm.elements["id"].value,
    value: mintForm.elements["value"].value,
  };

  console.log(inputs);

  // validate the form
  let toAddressRequired = hasValue(
    mintForm.elements["to"],
    TO_ADDRESS_REQUIRED
  );

  let idInputValid = validateNumberFields(
    mintForm.elements["id"],
    TOKEN_ID_REQUIRED,
    INVALID_NUMBER
  );

  let valueInputValid = validateNumberFields(
    mintForm.elements["value"],
    TOKEN_VALUE_REQUIRED,
    INVALID_NUMBER
  );

  // if valid, submit the form.
  if (toAddressRequired && idInputValid && valueInputValid) {
    await mintERC1155(inputs);
  }
});

transferForm.addEventListener("submit", async function (event) {
  // stop form submission
  event.preventDefault();

  const inputs = {
    from: transferForm.elements["from"].value,
    to: transferForm.elements["to"].value,
    id: transferForm.elements["id"].value,
    value: transferForm.elements["value"].value,
  };

  console.log(inputs);

  // validate the form

  let fromAddressRequired = hasValue(
    transferForm.elements["from"],
    FROM_ADDRESS_REQUIRED
  );

  let toAddressRequired = hasValue(
    transferForm.elements["to"],
    TO_ADDRESS_REQUIRED
  );

  let idInputValid = validateNumberFields(
    transferForm.elements["id"],
    TOKEN_ID_REQUIRED,
    INVALID_NUMBER
  );

  let valueInputValid = validateNumberFields(
    transferForm.elements["value"],
    TOKEN_VALUE_REQUIRED,
    INVALID_NUMBER
  );

  // if valid, submit the form.
  if (
    fromAddressRequired &&
    toAddressRequired &&
    idInputValid &&
    valueInputValid
  ) {
    await transferERC1155(inputs);
  }
});

connectButton.addEventListener("click", getAccounts);

nftBalanceButton.addEventListener("click", async function (event) {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(ERC1155MockAddress, mockABI, signer);

    const nftAddressInput = document.getElementById("nft_address");
    const nftIDInput = document.getElementById("nft_id");

    let nftAddressRequired = hasValue(
      nftAddressInput,
      ACCOUNT_ADDRESS_REQUIRED
    );

    let idInputValid = validateNumberFields(
      nftIDInput,
      TOKEN_ID_REQUIRED,
      INVALID_NUMBER
    );

    try {
      if (nftAddressRequired && idInputValid) {
        const balance = await contract.balanceOf(
          nftAddressInput.value,
          nftIDInput.value
        );
        document.getElementById("nft").innerHTML = balance;
      }
    } catch (error) {
      console.log(error);
      showToast(error.message, "error");
    }
  } else {
    showToast("Please install MetaMask", "error");
  }
});

coinBalanceButton.addEventListener("click", async function (event) {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(TokenAddress, tokenABI, signer);

    const coinAddressInput = document.getElementById("coin_address");

    let coinAddressRequired = hasValue(
      coinAddressInput,
      ACCOUNT_ADDRESS_REQUIRED
    );

    try {
      if (coinAddressRequired) {
        const balance = await contract.balanceOf(coinAddressInput.value);
        console.log("balance", balance);
        const decimals = await contract.decimals();
        console.log("dec", decimals);
        document.getElementById("coin").innerHTML = balance / 10 ** decimals;
      }
    } catch (error) {
      console.log(error);
      showToast(error.message, "error");
    }
  } else {
    showToast("Please install MetaMask", "error");
  }
});
