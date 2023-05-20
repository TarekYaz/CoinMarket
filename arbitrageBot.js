/*-------------------SANDBOX REQUEST FOR TEST PURPOSES--------------------
let request = fetch('https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
    method : 'GET',
    headers : {
        'X-CMC_PRO_API_KEY': 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c',
        'Accept': 'application/json',
        'Accept-Encoding': 'deflate, gzip',
    }
});
*/

//-------------------API REQUEST - ACCOUNT PLAN LIMITS TO 10,000 A MONTH--------------------
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
    
    cWallet = getLocalCryptoWallet().join(','); //the users wallet but as a string - for populating the sell options (line: 43)
    cmcData = await res.json(); //storing all the JSON data in a variable
    dataArray = cmcData.data;   //storing the coin names and info in an array


    dataArray.forEach( x => {
        let name = x.name;
        let price = x.quote.USD.price;
        
        coinMap.set(name, price); //populate Map
        
        generateRow(name, price); //populate table of coins and current prices
        
        generateOption(name, "buy"); //populate buy options with all coins
        
        if (cWallet.includes(name)){ //populate the sell options only for coins owned by user
            generateOption(name, "sell");
        }
    })
    //populate fiat wallet value with locally stored data
    document.getElementById("walletTotal").innerHTML = getWalletTotal();

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
    let cWalletArr = getLocalCryptoWallet();

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
        //initialises a "cryptoWallet" in local storage if non existent
        window.localStorage.setItem("cryptoWallet", "coin quantity");
    }

    let cWalletArr = cWallet.split(",");

    
    if(myCoin) {
        
        let coinInWallet = cWalletArr.find(x => {
            return myCoin == x.slice(0, x.indexOf(" "));
        });
        let quantity = coinInWallet.split(" ")[1];

        return quantity;
    }

    return cWalletArr;
}

function setLocalCryptoWallet(coin, quantity, tradeType) {
    let cWalletArr = getLocalCryptoWallet();
    let oldEntry;
    let oldAmount;

    try {
        oldEntry = cWalletArr.find(x => {
            return coin == x.slice(0, x.indexOf(" ")); 
        });
        oldAmount = oldEntry.slice(oldEntry.indexOf(" "));
    } catch(err) {
        console.log("Adding new coin to cryptoWallet now.");
    }
    
    let newEntry;
    let newAmount;

    if (tradeType == "sell") {
        //we are selling a coin
        newAmount = Number(oldAmount) - Number(quantity);
    } else if (cWalletArr.join(',').includes(coin)) {
        //we are buying more of a coin we already own
        newAmount = Number(oldAmount) + Number(quantity)
    } else {
        //we are buying a coin we don't currently have
        newAmount = quantity
        newEntry = coin + " " + newAmount;
        cWalletArr.push(newEntry);

        return window.localStorage.setItem("cryptoWallet", cWalletArr.join(','));
    }

    newEntry = coin + " " + newAmount;
    cWalletArr[cWalletArr.indexOf(oldEntry)] = newEntry;
    
    return window.localStorage.setItem("cryptoWallet", cWalletArr.join(','));
}

function removeCoin(coin) {
    let cWalletArr = getLocalCryptoWallet();
    let entryToRemove = cWalletArr.find(x => {
        return coin == x.slice(0, x.indexOf(" "));
    })
    let indexOfEntry = cWalletArr.indexOf(entryToRemove);
    let newCWalletArr = cWalletArr.splice(indexOfEntry, 1);

    window.localStorage.setItem("cryptoWallet", newCWalletArr.join(","));
}