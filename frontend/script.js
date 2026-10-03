const API_URL = "http://localhost:3000/api/expenses";
function showAlert(message, alertId = "alertMessage") {
  const alertMessage = document.getElementById(alertId);

  alertMessage.textContent = message;
  alertMessage.classList.remove("d-none");
}
function hideAlert(alertId = "alertMessage") {
  document.getElementById(alertId).classList.add("d-none");
}
function showSpinner() {
  document.getElementById("loadingSpinner").classList.remove("d-none");
}

function hideSpinner() {
  document.getElementById("loadingSpinner").classList.add("d-none");
}
function handleError(error) {
  if (error.message === "Failed to fetch") {
    showAlert(
      "Unable to connect to the server. Please make sure the server is running.",
    );
  } else {
    showAlert(error.message);
  }
}
async function getExpenses() {
  showSpinner();
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const error = await response.json();
      showAlert(error.message);
      return;
    }

    const expenses = await response.json();

    displayExpenses(expenses);
    updateSummary(expenses);
  } catch (error) {
    handleError(error);
  } finally {
    hideSpinner();
  }
}

function displayExpenses(expenses) {
  const tableBody = document.getElementById("expensesTableBody");

  tableBody.innerHTML = "";

  expenses.forEach((expense) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${expense.title}</td>
            <td>${expense.amount}</td>
            <td>
    <span class="badge ${
      expense.category === "Food"
        ? "text-bg-success"
        : expense.category === "Transport"
          ? "text-bg-primary"
          : expense.category === "Entertainment"
            ? "text-bg-warning"
            : expense.category === "Bills"
              ? "text-bg-danger"
              : "text-bg-secondary"
    } px-2 py-1">
        ${expense.category}
    </span>
</td>
            <td>${expense.date}</td>
            <td>
    <button type="button"
        class="btn btn-outline-success btn-sm edit-btn"
        data-bs-toggle="modal"
        data-bs-target="#editExpenseModal"
        onclick='editExpense(${JSON.stringify(expense)})'>
    Edit
</button>

    <button type="button" class="btn btn-outline-danger btn-sm  delete-btn"
    onclick='deleteExpense(${JSON.stringify(expense)})' >
        Delete
    </button>
</td>
        `;

    tableBody.appendChild(row);
  });
}
function editExpense(expense) {
  hideAlert("editAlertMessage");
  document.getElementById("editId").value = expense.id;
  document.getElementById("editTitle").value = expense.title;
  document.getElementById("editAmount").value = expense.amount;
  document.getElementById("editCategory").value = expense.category;
  document.getElementById("editDate").value = expense.date;
}
const editExpenseForm = document.getElementById("editExpenseForm");

editExpenseForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const id = document.getElementById("editId").value;
  const title = document.getElementById("editTitle").value;
  const amount = document.getElementById("editAmount").value;
  const category = document.getElementById("editCategory").value;
  const date = document.getElementById("editDate").value;
  if (title.trim() === "") {
    showAlert("Title is required", "editAlertMessage");
    return;
  }

  if (amount === "") {
    showAlert("Amount is required", "editAlertMessage");
    return;
  }

  if (Number(amount) <= 0) {
    showAlert("Amount must be greater than 0", "editAlertMessage");
    return;
  }

  if (category === "") {
    showAlert("Please choose a category", "editAlertMessage");
    return;
  }

  if (date === "") {
    showAlert("Date is required", "editAlertMessage");
    return;
  }
  const expense = {
    title: title,
    amount: Number(amount),
    category: category,
    date: date,
  };

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    });

    if (!response.ok) {
      const error = await response.json();
      showAlert(error.message, "editAlertMessage");
      return;
    }

    await response.json();
    hideAlert("editAlertMessage");

    await getExpenses();

    document.getElementById("closeEditModal").click();
  } catch (error) {
    showAlert(error.message, "editAlertMessage");
  }
});
async function deleteExpense(expense) {
  try {
    const response = await fetch(`${API_URL}/${expense.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      showAlert(error.message);
      return;
    }
    hideAlert();

    await getExpenses();
  } catch (error) {
    handleError(error);
  }
}
function updateSummary(expenses) {
  const totalAmount = document.getElementById("totalAmount");
  const expenseCount = document.getElementById("expenseCount");
  const highestAmount = document.getElementById("highestAmount");
  const highestTitle = document.getElementById("highestTitle");

  const total = expenses.reduce((sum, expense) => {
    return sum + Number(expense.amount);
  }, 0);

  expenseCount.textContent = expenses.length;

  totalAmount.textContent = total.toFixed(2);

  if (expenses.length === 0) {
    highestAmount.textContent = "0.00";
    highestTitle.textContent = "";
    return;
  }

  const highestExpense = expenses.reduce((highest, expense) => {
    return Number(expense.amount) > Number(highest.amount) ? expense : highest;
  });

  highestAmount.textContent = Number(highestExpense.amount).toFixed(2);
  highestTitle.textContent = highestExpense.title;
}

const filterCategory = document.getElementById("filterCategory");

filterCategory.addEventListener("change", async function () {
  const selectedCategory = filterCategory.value;
  showSpinner();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const error = await response.json();
      showAlert(error.message);
      return;
    }
    const expenses = await response.json();

    if (selectedCategory === "") {
      displayExpenses(expenses);
    } else {
      const filteredExpenses = expenses.filter((expense) => {
        return expense.category === selectedCategory;
      });

      displayExpenses(filteredExpenses);
    }

    updateSummary(expenses);
  } catch (error) {
    handleError(error);
  } finally {
    hideSpinner();
  }
});
const expenseForm = document.getElementById("expenseForm");

expenseForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = document.getElementById("title").value;
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  if (title.trim() === "") {
    showAlert("Title is required");
    return;
  }
  if (amount === "") {
    showAlert("Amount is required");
    return;
  }

  if (Number(amount) <= 0) {
    showAlert("Amount must be greater than 0");
    return;
  }

  if (category === "") {
    showAlert("Please choose a category");
    return;
  }

  if (date === "") {
    showAlert("Date is required");
    return;
  }

  const expense = {
    title: title,
    amount: Number(amount),
    category: category,
    date: date,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    });

    if (!response.ok) {
      const error = await response.json();
      showAlert(error.message);
      return;
    }

    await response.json();

    expenseForm.reset();
    hideAlert();

    await getExpenses();
  } catch (error) {
    handleError(error);
  }
});

getExpenses();
