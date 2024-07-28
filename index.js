document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transactionForm')

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const category = document.getElementById('expense-name').value;
        const amount = document.getElementById('expense-amount').value;
        const date = document.getElementById('expense-date').value;
        const authMsg = document.getElementById('auth-msg');
        const expense =  document.getElementById('expense');
        const balance =  document.getElementById('balance');

        try{
            const response = await fetch('http://localhost:5500/api/index', {
                method: 'POST',
                headers:  {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ category, amount, date })
            });

            const data = await response.json();

            if(!response.ok) {
                authMsg.textContent = data
                expense.textContent  = amount
                balance.textContent = 600000 - amount
            } else {
                authMsg.textContent = data
                expense.textContent = amount
                balance.textContent = 600000 - amount
            }
        } catch (err) {
            authMsg.textContent = err
        }
    })

})
