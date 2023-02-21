let changes = [];
let myChart;

fetch("/api/change")
.then(response => {
    return response.json();
})
.then(data => {
    // save db data on global variable
    changes = data;

    populateTotal();
    populateTable();
    populateChart();
});

function populateTotal() {
    // reduce change amounts to a single total value
    let total = changes.reduce((total, c) => {
        return total + parseInt(c.value);
    }, 0);

    let totalEl = document.querySelector("#total");
    totalEl.textContent = total;
}

function populateTable() {
    let cbody = document.querySelector("#cbody");
    cbody.innerHTML = "";

    changes.forEach(change => {
        // create and populate a table row
        let ch = document.createElement("ch");
        ch.innerHTML = `
        <td>${change.name}</td>
        <td>${change.value}<td>
        `;

        cbody.appendChild(ch);
    });
}

function populateChart() {
    // copy array and reverse it
    let reversed = changes.slice().reverse();
    let sum = 0;

    // create date labels for chart
    let labels = reversed.map(c => {
        let date = new Date(t.date);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    });

    //create incremental values for chart
    let data = reversed.map(c => {
        sum += parseInt(c.value);
        return sum;
    });

    //remove old chart if exists
    if(myChart) {
        myChart.destroy();
    }

    let ctx = document.getElementById("myChart").getContext("2d");

    myChart = new CharacterData(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: "Total Over Time",
                fill: true,
                backgroundColor: "#5CCB58",
                data
            }]
        }
    });
}

function sendChange(isAdding) {
    let nameEl = document.querySelector("#c-name");
    let amountEl = document.querySelector("#c-amount");
    let errorEl = document.querySelector(".form .error");

    //validate form
    if (nameEl.value === "" || amountEl.value === "") {
        errorEl.textContent = "Missing Information";
        return;
    } else {
        errorEl.textContent = "";
    }

    //create record
    let change = {
        name: nameEl.value,
        value: amountEl.value,
        date: new Date().toISOString()
    };

    //if subtracting weight, convert amount to negative number but shouldnt occur
    if (!isAdding) {
        change.value *= -1;
    }

    //add to beginning of current array of data
    changes.unshift(change);

    // re-run logic to populate ui with new record
    populateChart();
    populateTable();
    populateTotal();

    //also send to server
    fetch("/api/change", {
        method: "POST",
        body: JSON.stringify(change),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        if (data.errors) {
            errorEl.textContent = "Missing Information";
        } else  {
            //clear form
            nameEl.value = "";
            amountEl.value = "";
        }
    })
    .catch(err => {
        //fetch failed, so save in indexeddb
        saveRecord(change);

        //clear form
        nameEl.value = "";
        amountEl.value = "";
    });
}

document.querySelector("#add-btn").onclick = function() {
    sendChange(true);
};

document.querySelector("#sub-btn").onclick = function() {
    sendChange(false);
};
