// let request = fetch('https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
//     method : 'GET',
//     headers : {
//         'X-CMC_PRO_API_KEY': 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c',
//         'Accept': 'application/json',
//         'Accept-Encoding': 'deflate, gzip',
//     }
// });
let request = fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
    method : 'GET',
    headers : {
        'X-CMC_PRO_API_KEY': '5a69c6a9-66f7-45a9-8030-1b6d6e561cdf',
        'Accept': 'application/json',
        'Accept-Encoding': 'deflate, gzip',
    }
});

let cmcData;
let dataArray;
let cWallet;

const coinMap = new Map();

request.then(async (res) => {
    cmcData = await res.json();
    dataArray = cmcData.data;
    cWallet = getLocalCryptoWallet();

    dataArray.forEach( x => {
        let name = x.name;
        let price = x.quote.USD.price;

        coinMap.set(name, price);

        generateRow(name, price);
        generateOption(name, "buy");
        
        if (cWallet.includes(name)){
            generateOption(name, "sell");
        }
    })

    document.getElementById("walletTotal").innerHTML = getWalletTotal();

    console.log(getLocalCryptoWallet("Bitcoin"));
    displayCryptoWallet();
    getBuyPrice();
    getSellPrice();
    
    console.log(coinMap);
    
})

function getWalletTotal() {
    let walletTotal = window.localStorage.getItem("myWallet");
    // setWalletTotal(walletTotal);
    return Number(walletTotal);
}

function setWalletTotal(totalValue) {
    document.getElementById("walletTotal").innerHTML = totalValue;
    window.localStorage.setItem("myWallet", totalValue);
}

function generateRow(name, price) {
    let newRow = document.createElement("tr");
    let newCell1 = document.createElement("td");
    let newCell2 = document.createElement("td");

    newCell1.innerHTML = "<p>" + name + "</p>";
    newCell2.innerHTML = "<p>" + price + "</p>";

    newRow.appendChild(newCell1);
    newRow.appendChild(newCell2);

    document.getElementById("table").appendChild(newRow);
}

function generateOption(name, tradeType) {
    let newOption = document.createElement("option");
    newOption.innerHTML = name;
    document.getElementById(tradeType).appendChild(newOption);
}

function getBuyPrice() {
    let buyChoice = document.getElementById("buy");
    document.getElementById("buyPrice").setAttribute("value", coinMap.get(buyChoice.value));
}

function getSellPrice() {
    let sellChoice = document.getElementById("sell");
    document.getElementById("sellPrice").setAttribute("value", coinMap.get(sellChoice.value));
}

function addFunds() {
    let newWalletTotal = getWalletTotal() + 1000;

    setWalletTotal(newWalletTotal);
}

function buyCoin() {
    let coin = document.getElementById("buy").value;
    let price = document.getElementById("buyPrice").value;
    let quantity = document.getElementById("buyAmount").value;
    let cWallet = getLocalCryptoWallet();

    if(quantity){
        setWalletTotal(getWalletTotal() - (price * quantity));
        setLocalCryptoWallet(coin, quantity, "buy");
    } else {
        alert("Amount required");
    }
}

function sellCoin() {
    let coin = document.getElementById("sell").value;
    let price = document.getElementById("sellPrice").value;
    let quantity = document.getElementById("sellAmount").value;

    if(quantity) {
        setWalletTotal(getWalletTotal() + (price * quantity));
        setLocalCryptoWallet(coin, quantity, "sell");
    } else {
        alert("Amount required");
    }

    if(!getLocalCryptoWallet(coin)) {
        removeCoin();
    }
}

function displayCryptoWallet() {
    let cWallet = getLocalCryptoWallet();
    let cWalletArr = cWallet.split(",");

    document.getElementById("coinWallet").innerHTML = "";

    cWalletArr.forEach(x => {
        let coin = x.split(" ")[0];
        let quantity = x.split(" ")[1];

        let newRow = document.createElement("tr");
        let newCell1 = document.createElement("td");
        let newCell2 = document.createElement("td");

        newCell1.innerHTML = coin;
        newCell2.innerHTML = quantity;

        newRow.appendChild(newCell1);
        newRow.appendChild(newCell2);

        document.getElementById("coinWallet").appendChild(newRow);
    })
}

function getLocalCryptoWallet(myCoin) {
    //include a myCoin parameter to return the quantity of a certain coin instead of entire wallet
    let cWallet = window.localStorage.getItem("cryptoWallet");

    if (!cWallet) {
        window.localStorage.setItem("cryptoWallet", "coin quantity");
    }
    
    if(myCoin) {
        let cWalletArr = cWallet.split(",");
        let coinInWallet = cWalletArr.find(x => {
            return myCoin == x.slice(0, x.indexOf(" "));
        });
        let quantity = coinInWallet.split(" ")[1];

        return quantity;
    }

    return window.localStorage.getItem("cryptoWallet");
}

function setLocalCryptoWallet(coin, quantity, tradeType) {
    let cWallet = getLocalCryptoWallet();
    let cWalletArr = cWallet.split(",");
    let newEntry;

    if (cWallet.includes(coin)) {
        let entry = cWalletArr.find(x => {
            return coin == x.slice(0, x.indexOf(" ")); 
        });
        let oldAmount = entry.slice(entry.indexOf(" "));
        let newAmount;

        if (tradeType == "buy"){
            newAmount = Number(oldAmount) + Number(quantity);
        } else if (tradeType == "sell"){
            newAmount = Number(oldAmount) - Number(quantity);
        }
        
        newEntry = coin + " " + newAmount;

        cWalletArr[cWalletArr.indexOf(entry)] = newEntry;
    } else {
        newEntry = coin + " " + quantity;
        cWalletArr.push(newEntry);
    }

    cWallet = cWalletArr.join(",");
    window.localStorage.setItem("cryptoWallet", cWallet);
}

function removeCoin(coin) {
    let cWallet = getLocalCryptoWallet();
    let cWalletArr = cWallet.split(",");
    let entryToRemove = cWalletArr.find(x => {
        return coin == x.slice(0, x.indexOf(" "));
    })
    let indexOfEntry = cWalletArr.indexOf(entryToRemove);
    let newCWalletArr = cWalletArr.splice(indexOfEntry, 1);

    window.localStorage.setItem("cryptoWallet", newCWalletArr.join(","));
}