const API_URL = "https://expense-tracker-jc4q.onrender.com/api/expenses";


// =========================
// Alert Functions
// =========================

function showAlert(message, alertId = "alertMessage") {
  const alertMessage = document.getElementById(alertId);
  alertMessage.textContent = message;
  alertMessage.classList.remove("d-none", "alert-success");
  alertMessage.classList.add("alert-danger");
}
function showAlertsuc(message, alertId = "alertMessage") {
  const alertMessage = document.getElementById(alertId);
  alertMessage.textContent = message;
  alertMessage.classList.remove("d-none", "alert-danger");
  alertMessage.classList.add("alert-success");
}
function hideAlert(alertId = "alertMessage") {
  document.getElementById(alertId).classList.add("d-none");
}

// =========================
// Loading Spinner Functions
// =========================

function showSpinner() {
  document.getElementById("loadingSpinner").classList.remove("d-none");
}

function hideSpinner() {
  document.getElementById("loadingSpinner").classList.add("d-none");
}

// =========================
// Error Handling
// =========================

function handleError(error, alertId = "alertMessage") {
  if (error.message === "Failed to fetch") {
    showAlert(
      "Unable to connect to the server. Please make sure the server is running.",
      alertId
    );
  } else {
    showAlert(error.message, alertId);
  }
}

// =========================
// Get Expenses
// =========================


async function getExpenses() {
  showSpinner();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const error = await response.json();
      showAlert(error.message);
      return false;
    }

    const expenses = await response.json();

    displayExpenses(expenses);
    updateSummary(expenses);

    return true;
  } catch (error) {
    handleError(error);
    return false;
  } finally {
    hideSpinner();
  }
}

// =========================
// Display Expenses
// =========================

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
        <button
          type="button"
          class="btn btn-outline-success btn-sm edit-btn"
          data-bs-toggle="modal"
          data-bs-target="#editExpenseModal"
          onclick='editExpense(${JSON.stringify(expense)})'>
          Edit
        </button>

        <button
          type="button"
          class="btn btn-outline-danger btn-sm delete-btn"
          onclick='confirmDeleteExpense(${JSON.stringify(expense)})'>
          Delete
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// =========================
// Edit Expense
// =========================

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


    showAlertsuc(
  "Expense updated successfully!",
  "editAlertMessage"
);

await getExpenses();

setTimeout(() => {
  document.getElementById("closeEditModal").click();
  hideAlert("editAlertMessage");
}, 1000);
  } catch (error) {
    handleError(error, "editAlertMessage");
  }
});

// =========================
// Delete Expense
// =========================


let expenseToDelete = null;

function confirmDeleteExpense(expense) {
  expenseToDelete = expense;

  document.getElementById("deleteExpenseTitle").textContent =
    expense.title;

  const modal = new bootstrap.Modal(
    document.getElementById("deleteExpenseModal")
  );

  modal.show();
}

async function deleteExpense() {
  if (!expenseToDelete) return;

  const id = expenseToDelete.id;

  const deleteModalElement = document.getElementById("deleteExpenseModal");
  const deleteModal = bootstrap.Modal.getInstance(deleteModalElement);

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      deleteModal.hide();
      showAlert(error.message);
      return;
    }

    deleteModal.hide();
    expenseToDelete = null;

    const success = await getExpenses();

    if (success) {
      showAlertsuc("Expense deleted successfully!");

      setTimeout(() => {
        hideAlert();
      }, 3000);
    }
  } catch (error) {
    deleteModal.hide();
    handleError(error);
  }
}

document
  .getElementById("confirmDeleteButton")
  .addEventListener("click", deleteExpense);


// =========================
// Update Summary
// =========================

function updateSummary(expenses) {
  const totalAmount = document.getElementById("totalAmount");
  const expenseCount = document.getElementById("expenseCount");
  const highestAmount = document.getElementById("highestAmount");
  const highestTitle = document.getElementById("highestTitle");
// const totalAmountfood=getElementById("totalAmountfood");
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
    return Number(expense.amount) > Number(highest.amount)
      ? expense
      : highest;
  });

  highestAmount.textContent = Number(highestExpense.amount).toFixed(2);
  highestTitle.textContent = highestExpense.title;

  
}

// =========================
// Category Filter
// =========================

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

// =========================
// Search by Title
// =========================

const searchTitle = document.getElementById("searchTitle");

searchTitle.addEventListener("input", async function () {
  const searchText = searchTitle.value.toLowerCase();

  showSpinner();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const error = await response.json();
      showAlert(error.message);
      return;
    }

    const expenses = await response.json();

    const filteredExpenses = expenses.filter((expense) => {
      return expense.title.toLowerCase().includes(searchText);
    });

    displayExpenses(filteredExpenses);
    updateSummary(expenses);
  } catch (error) {
    handleError(error);
  } finally {
    hideSpinner();
  }
});

// =========================
// Add Expense
// =========================

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
const success = await getExpenses();

if (success) {
  showAlertsuc("Expense added successfully!");

  setTimeout(() => {
    hideAlert();
  }, 2000);
}

  } catch (error) {
    handleError(error);
  }
});

// =========================
// Initial Load
// =========================

getExpenses();

// =========================
// Dark Mode
// =========================

const darkModeButton = document.getElementById("darkModeButton");

darkModeButton.addEventListener("click", function () {
  const html = document.documentElement;
  const icon = darkModeButton.querySelector("i");

  if (html.getAttribute("data-bs-theme") === "light") {
    html.setAttribute("data-bs-theme", "dark");
    icon.className = "bi bi-sun-fill";
  } else {
    html.setAttribute("data-bs-theme", "light");
    icon.className = "bi bi-moon-fill";
  }
});