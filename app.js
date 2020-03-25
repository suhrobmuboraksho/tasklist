// Global vars
const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task");
const taskList = document.querySelector(".collection");
const clearBtn = document.querySelector(".clear-tasks");
const filter = document.querySelector("#filter");

loadEventListeners();

function loadEventListeners() {
    document.addEventListener("DOMContentLoaded", getTasks);
    form.addEventListener("submit", addTask);
    taskList.addEventListener("click", removeTask);
    clearBtn.addEventListener("click", clearTasks);
    filter.addEventListener("keyup", filterTasks);
}

function getTasks() {
    fetch('https://vjscript-tasklist.firebaseio.com/tasklist.json')
        .then(res => {
            return res.json();
            /*
                console.log(res);
                console.log(res.json());
                YOU CAN CONSUME RES.JSON() ONLY ONCE. IF YOU CONSUME IT MORE THAN ONCE THE ERROR HAPPENS (IE. COMMENTING OUT THE CONSOLE.LOG(RES.JSON())). THE MSG BODY GETS LOCKED
            */
        })
        .then(data => {
            addTaskToUI(data);
        })
        .catch(err => console.log(err));
}

function addTask(e) {
    if (taskInput.value === "") {
        alert("Add a task");
        e.preventDefault();
        return;
    }

    storeTaskInDatabase(taskInput.value);

    taskInput.value = "";
    e.preventDefault();
}

function storeTaskInDatabase(task) {
    fetch('https://vjscript-tasklist.firebaseio.com/tasklist.json', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(task)
    }).then(res => {
        return res.json();
    }).then(data => {
        let nt = {};//
        nt[data.name] = task;
        addTaskToUI(nt);
    })
        .catch(err => console.log(err));
}

function addTaskToUI(data) {
    let loaderElement = document.getElementById('tasklist-loader');
    loaderElement.innerHTML = "";
    loaderElement.classList.remove("lds-dual-ring");
    if (data) {
        for (let k in data) {
            const li = document.createElement("li");
            li.className = "collection-item";
            li.appendChild(document.createTextNode(data[k]));
            const link = document.createElement("a");
            link.className = "delete-item secondary-content";
            link.innerHTML = `<i class="fa fa-remove" data-id=${k}></li>`;
            li.appendChild(link);
            taskList.appendChild(li);
        }
    } else {
        loaderElement.innerHTML = "The list is empty";
    }
}

function removeTask(e) {
    if (e.target.parentElement.classList.contains("delete-item")) {
        if (confirm("Are you sure?")) {
            let itemID = e.target.dataset.id;
            // console.log(itemID);
            fetch(`https://vjscript-tasklist.firebaseio.com/tasklist/${itemID}.json`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json'
                }
                //body: JSON.stringify({ takslist: itemID })
            })
                .then(res => {
                    e.target.parentElement.parentElement.remove();
                    return res.json();
                })
                .then(data => resolve(data))
                .catch(err => console.log(err));
        }
    }
}

function clearTasks(e) {
    while (taskList.firstChild) {
        taskList.removeChild(taskList.firstChild);
    }

    clearTasksFromServer();
    e.preventDefault();
}

function clearTasksFromServer() {
    fetch(`https://vjscript-tasklist.firebaseio.com/tasklist.json`, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        }
        //body: JSON.stringify({ takslist: itemID })
    })
        .then(res => {
            return res.json();
        })
        .then(data => resolve(data))
        .catch(err => console.log(err));
}


function filterTasks(e) {
    const text = e.target.value.toLowerCase();
    document.querySelectorAll(".collection-item").forEach(function (task) {
        const item = task.firstChild.textContent;
        if (item.toLowerCase().indexOf(text) != -1) {
            task.style.display = "block";
        } else {
            task.style.display = "none";
        }
    });
}
