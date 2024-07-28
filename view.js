function formatDate(dateString) {
    // Convert ISO date string to Date object
    const date = new Date(dateString);
    // Format the date to YYYY-MM-DD
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(undefined, options);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const resultTable = document.getElementById('expenseTable').getElementsByTagName('tbody')[0];
    const authMsg = document.getElementById('auth-msg');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = document.getElementById('userId').value;

        if (!userId) {
            authMsg.textContent = "User ID is required";
            return;
        }

        try {
            const response = await fetch(`http://localhost:5500/api/view?userId=${encodeURIComponent(userId)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                authMsg.textContent = data || "An error occurred";
                resultTable.innerHTML = ''; // Clear previous results
                return;
            }

            if (data.length === 0) {
                authMsg.textContent = "No expenses found for this user ID";
            } else {
                authMsg.textContent = ''; // Clear any previous messages
                resultTable.innerHTML = ''; // Clear previous results

                // Populate the table with fetched expenses
                data.forEach(expense => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${expense.category}</td>
                        <td>$${expense.amount}</td>
                        <td>${formatDate(expense.date)}</td>
                    `;
                    resultTable.appendChild(row);
                });
            }
        } catch (err) {
            authMsg.textContent = "An error occurred: " + err.message;
        }
    });
});
