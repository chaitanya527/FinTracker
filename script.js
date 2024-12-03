const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  signDisplay: "always",
});

const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

const ctx = document.getElementById("pieChart").getContext("2d");

const pieChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Food', 'Entertainment', 'Rent', 'Investment', 'EMI', 'Salary', 'Others'], // Category labels
    datasets: [{
      label: 'Category-wise Expenses & Income',
      data: [0, 0, 0, 0, 0, 0, 0], // Initially, all data values are 0
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40', '#E7E9ED', '#CCCCCC'
      ],
    }],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.label}: ₹${tooltipItem.raw.toFixed(2)}`;
          },
        },
      },
    },
  },
});

form.addEventListener("submit", addTransaction);

function updateTotal() {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);

  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total + trx.amount, 0);

  const balanceTotal = incomeTotal - expenseTotal;

  balance.textContent = formatter.format(balanceTotal).substring(1);
  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1);
}

function renderList() {
  list.innerHTML = "";

  status.textContent = "";
  if (transactions.length === 0) {
    status.textContent = "No transactions.";
    return;
  }

  transactions.forEach(({ id, name, amount, date, type, category }) => {
    const sign = "income" === type ? 1 : -1;

    const li = document.createElement("li");

    

    list.appendChild(li);
  });
}

function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id);
  transactions.splice(index, 1);

  updateTotal();
  saveTransactions();
  renderList();
  updatePieChart();
}

function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const type = formData.get("type") === "on" ? "income" : "expense";

  transactions.push({
    id: transactions.length + 1,
    name: formData.get("name"),
    amount: parseFloat(formData.get("amount")),
    date: new Date(formData.get("date")),
    type: type,
    category: formData.get("category"),
  });

  this.reset();

  updateTotal();
  saveTransactions();
  renderList();
  updatePieChart();
}

function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Function to update Pie Chart with category-wise data
function updatePieChart() {
  // Reset category-wise values
  const categoryData = {
    food: 0,
    entertainment: 0,
    rent: 0,
    investment: 0,
    emi: 0,
    salary: 0,
    others: 0,
  };

  transactions.forEach(({ amount, category, type }) => {
    const sign = type === "income" ? 1 : -1;
    categoryData[category] += amount * sign;
  });

  // Update chart data dynamically
  pieChart.data.datasets[0].data = Object.values(categoryData);
  pieChart.update();
}

updatePieChart();
renderList();
updateTotal();
